const router = require('express').Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Get Flagged Content
router.get('/flagged', async (req, res) => {
    try {
        const flaggedComments = await Comment.find({ isFlagged: true })
            .populate('author', 'username')
            .populate('post', 'imageUrl')
            .sort({ createdAt: -1 });

        const flaggedPosts = await Post.find({ isFlagged: true })
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        res.json({
            comments: flaggedComments,
            posts: flaggedPosts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// Delete Comment
router.delete('/comments/:id', async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.id);
        res.status(200).json("Comment deleted");
    } catch (err) {
        res.status(500).json(err);
    }
});

// Approve Comment (Unflag)
router.put('/comments/:id/approve', async (req, res) => {
    try {
        await Comment.findByIdAndUpdate(req.params.id, {
            isFlagged: false,
            moderationReason: null
        });
        res.status(200).json("Comment approved");
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete Post (Admin)
router.delete('/posts/:id', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        // Ideally should delete comments too, but MongoDB might cascade if configured or left orphan
        res.status(200).json("Post deleted");
    } catch (err) {
        res.status(500).json(err);
    }
});

// Approve Post (Unflag)
router.put('/posts/:id/approve', async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            isFlagged: false,
            moderationReason: null
        });
        res.status(200).json("Post approved");
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
