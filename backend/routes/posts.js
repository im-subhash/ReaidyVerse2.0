const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const { moderateText, moderateImage } = require('../services/aiService');

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'username avatar')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username' }
                // In a real app we might paginate comments or limit them
            });

        // Transform for frontend
        const formattedPosts = posts.map(post => ({
            id: post._id,
            username: post.author ? post.author.username : 'Unknown', // Fallback
            userAvatar: post.author ? post.author.avatar : null,
            imageUrl: post.imageUrl,
            caption: post.caption,
            initialLikes: post.likesCount || 0,
            timestamp: new Date(post.createdAt).toLocaleDateString(),
            comments: post.comments.map(c => ({
                id: c._id,
                username: c.author ? c.author.username : 'Unknown',
                text: c.isFlagged ? '[Content Hidden by AI]' : c.text
            })),
            isLiked: false, // Placeholder as we don't have auth context yet
            isFlagged: post.isFlagged || false,
            moderationReason: post.moderationReason || null
        }));

        res.json(formattedPosts);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get posts by user
router.get('/user/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json("User not found");

        const posts = await Post.find({ author: user._id })
            .sort({ createdAt: -1 })
            .populate('author', 'username avatar')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username' }
            });

        const formattedPosts = posts.map(post => ({
            id: post._id,
            username: post.author ? post.author.username : 'Unknown',
            userAvatar: post.author ? post.author.avatar : null,
            imageUrl: post.imageUrl,
            caption: post.caption,
            initialLikes: post.likesCount || 0,
            timestamp: new Date(post.createdAt).toLocaleDateString(),
            comments: post.comments.map(c => ({
                id: c._id,
                username: c.author ? c.author.username : 'Unknown',
                text: c.isFlagged ? '[Content Hidden by AI]' : c.text
            })),
            isLiked: false,
            isFlagged: post.isFlagged || false,
            moderationReason: post.moderationReason || null
        }));

        res.json(formattedPosts);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Create post
router.post('/', upload, async (req, res) => {
    try {
        // Mock User for now if not sent
        // In real app: req.user.id
        // We will create a default user if none exists for testing
        // Try to find the default "testuser" or the user associated with that email
        // Logic: 
        // 1. Try finding by username 'testuser'
        // 2. If fail, try finding by email 'test@example.com' (maybe they renamed their user)
        // 3. If both fail, create new
        let user = await User.findOne({ username: 'testuser' });

        if (!user) {
            user = await User.findOne({ email: 'test@example.com' });
        }

        if (!user) {
            user = await new User({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password',
                fullName: 'Test User',
                bio: 'AI-Powered Social Media'
            }).save();
        }

        let imageUrl = '';

        console.log('File received:', req.file ? 'Yes' : 'No');
        if (req.file) console.log('File path:', req.file.path);

        if (req.file) {
            // Cloudinary Upload (REQUIRED for production)
            if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === '...') {
                return res.status(500).json({ error: "Cloudinary not configured. Image upload requires Cloudinary in production." });
            }

            try {
                const result = await cloudinary.uploader.upload(req.file.path);
                imageUrl = result.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary upload failed:", uploadError);
                return res.status(500).json({ error: "Image upload failed. Please try again." });
            }
        } else if (!req.body.caption) {
            return res.status(400).json("Image or Text required");
        }

        // --- AI MODERATION STEP ---
        let isFlagged = false;
        let moderationReason = null;

        // 1. Check Text
        if (req.body.caption) {
            const textResult = await moderateText(req.body.caption);
            if (textResult.flagged) {
                isFlagged = true;
                moderationReason = `Text: ${textResult.reason}`;
            }
        }

        // 2. Check Image (only if not already flagged to save API calls)
        if (!isFlagged && imageUrl) {
            const imageResult = await moderateImage(imageUrl);
            if (imageResult.flagged) {
                isFlagged = true;
                moderationReason = `Image: ${imageResult.reason}`;
            }
        }

        const newPost = new Post({
            caption: req.body.caption,
            imageUrl: imageUrl,
            author: user._id,
            isFlagged: isFlagged,
            moderationReason: moderationReason
        });

        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        console.error("Create Post Error:", err);
        res.status(500).json({ message: err.message || "Internal Server Error" });
    }
});

// Join User (Like)
router.put('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json("Post not found");

        // Mock functionality: just increment
        // In real app verify if user liked
        post.likesCount += 1;
        await post.save();

        res.status(200).json("The post has been liked");
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete Post
router.delete('/:id', async (req, res) => {
    try {
        console.log(`[DELETE] Request for post: ${req.params.id}`);
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json("Post not found");
        }

        await Post.findByIdAndDelete(req.params.id);
        console.log(`[DELETE] Deleted successfully`);
        res.status(200).json("Post has been deleted");
    } catch (err) {
        console.error(`[DELETE] Error: ${err.message}`);
        res.status(500).json(err);
    }
});

module.exports = router;
