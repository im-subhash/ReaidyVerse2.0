const router = require('express').Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Search posts and comments
router.get('/', async (req, res) => {
    try {
        const query = req.query.q;

        if (!query || query.trim().length < 2) {
            return res.json([]);
        }

        const searchRegex = new RegExp(query, 'i'); // Case-insensitive search

        // Search in posts
        const posts = await Post.find({
            $or: [
                { caption: searchRegex },
            ],
            isFlagged: false // Don't show flagged content in search
        })
            .populate('author', 'username')
            .limit(10)
            .sort({ createdAt: -1 });

        // Search in comments
        const comments = await Comment.find({
            text: searchRegex,
            isFlagged: false
        })
            .populate('author', 'username')
            .populate('post', '_id')
            .limit(10)
            .sort({ createdAt: -1 });

        // Format results
        const postResults = posts.map(post => ({
            type: 'post',
            username: post.author?.username || 'Unknown',
            text: post.caption,
            id: post._id
        }));

        const commentResults = comments.map(comment => ({
            type: 'comment',
            username: comment.author?.username || 'Unknown',
            text: comment.text,
            id: comment._id,
            postId: comment.post?._id
        }));

        // Combine and return results
        const allResults = [...postResults, ...commentResults];
        res.json(allResults);

    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;
