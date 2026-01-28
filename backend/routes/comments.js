const router = require('express').Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { moderateText } = require('../services/aiService');

// Add Comment
router.post('/:postId', async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.postId;

        // Mock User (same logic as posts.js)
        // In real app: req.user.id
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

        // 1. AI Moderation Check
        const moderationResult = await moderateText(text);

        const newComment = new Comment({
            text: text,
            author: user._id,
            post: postId,
            isFlagged: moderationResult.flagged,
            moderationReason: moderationResult.reason
        });

        const savedComment = await newComment.save();

        // 2. Add to Post
        await Post.findByIdAndUpdate(postId, {
            $push: { comments: savedComment._id }
        });

        res.status(200).json({
            id: savedComment._id,
            username: user.username,
            text: savedComment.isFlagged ? '[Content Hidden by AI - Pending Review]' : savedComment.text,
            isFlagged: savedComment.isFlagged // Frontend can use this to show warning
        });

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

module.exports = router;
