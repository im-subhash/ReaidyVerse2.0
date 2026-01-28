const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Multer Setup for Avatar Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'avatar-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// GET User Profile
router.get('/:username', async (req, res) => {
    try {
        let user = await User.findOne({ username: req.params.username });

        if (!user) {
            // If main "testuser" doesn't exist (maybe renamed?), try to find by static email
            if (req.params.username === 'testuser') {
                const existingByEmail = await User.findOne({ email: 'test@example.com' });

                if (existingByEmail) {
                    // Found them! They must have renamed themselves. Return this user.
                    return res.json(existingByEmail);
                }

                // If truly gone, create new one
                const newUser = new User({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'demo', // Plaintext for demo
                    fullName: 'Test User',
                    bio: 'AI-Powered Social Media 🤖 | Built with Next.js'
                });
                await newUser.save();
                return res.json(newUser);
            }
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE User Profile
router.put('/:username', upload.single('avatar'), async (req, res) => {
    try {
        const { fullName, bio, username: newUsername } = req.body;
        const updateData = {};

        if (fullName) updateData.fullName = fullName;
        if (bio) updateData.bio = bio;

        // Handle Avatar Upload
        if (req.file) {
            // If using local uploads
            updateData.avatar = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

            // TODO: Add Cloudinary logic here if needed, but local is fine for "deployed" if persistent disk
        }

        // Handle Username Change (Check uniqueness)
        if (newUsername && newUsername !== req.params.username) {
            const existing = await User.findOne({ username: newUsername });
            if (existing) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            updateData.username = newUsername;
        }

        const updatedUser = await User.findOneAndUpdate(
            { username: req.params.username }, // Find by OLD username
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Save Post
router.post('/save/:postId', async (req, res) => {
    try {
        // Using testuser for demo
        const user = await User.findOne({ email: 'test@example.com' });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already saved
        if (user.savedPosts.includes(req.params.postId)) {
            return res.status(400).json({ message: 'Post already saved' });
        }

        user.savedPosts.push(req.params.postId);
        await user.save();

        res.json({ message: 'Post saved successfully', savedPosts: user.savedPosts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Unsave Post
router.delete('/unsave/:postId', async (req, res) => {
    try {
        // Using testuser for demo
        const user = await User.findOne({ email: 'test@example.com' });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.savedPosts = user.savedPosts.filter(id => id.toString() !== req.params.postId);
        await user.save();

        res.json({ message: 'Post unsaved successfully', savedPosts: user.savedPosts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Saved Posts
router.get('/:username/saved', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .populate({
                path: 'savedPosts',
                populate: { path: 'author', select: 'username avatar' }
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Transform saved posts to match frontend format
        const formattedPosts = (user.savedPosts || []).map(post => ({
            id: post._id.toString(),
            username: post.author?.username || 'Unknown',
            userAvatar: post.author?.avatar || '',
            imageUrl: post.imageUrl || '',
            caption: post.caption || '',
            initialLikes: post.likes?.length || 0,
            timestamp: post.createdAt,
            comments: [],
            isLiked: false,
            isFlagged: post.isFlagged || false,
            moderationReason: post.moderationReason || ''
        }));

        res.json(formattedPosts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
