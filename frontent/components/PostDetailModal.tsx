"use client";

import { useGlobalContext, Comment } from '@/context/GlobalContext';
import { Heart, MessageCircle, Send, Bookmark, X, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import styles from './PostDetailModal.module.css';

export default function PostDetailModal() {
    const { selectedPost, closePostDetail, toggleLike, addComment, deletePost } = useGlobalContext();
    const [commentText, setCommentText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of comments when new one adds
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedPost?.comments]);

    if (!selectedPost) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closePostDetail();
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim()) {
            await addComment(selectedPost.id, commentText);
            setCommentText('');
        }
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <button
                onClick={closePostDetail}
                className="absolute top-4 right-4 text-white hover:opacity-75 z-[2100]"
                style={{ position: 'absolute', top: '20px', right: '20px', color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}
            >
                <X size={32} />
            </button>

            <div className={styles.modal}>
                {/* Left: Image */}
                {/* Left: Image (Conditional) */}
                {selectedPost.imageUrl && (
                    <div className={styles.imageContainer}>
                        <img src={selectedPost.imageUrl} alt="Post" className={styles.image} />
                    </div>
                )}

                {/* Right: Content (Adjust width if no image) */}
                <div className={styles.content} style={{ width: selectedPost.imageUrl ? '50%' : '100%', maxWidth: selectedPost.imageUrl ? 'none' : '600px', margin: selectedPost.imageUrl ? '0' : '0 auto' }}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img
                                src={selectedPost.userAvatar || 'https://ui-avatars.com/api/?name=User+Profile&background=random'}
                                alt={selectedPost.username}
                                className={styles.userAvatar}
                            />
                            <span className={styles.username}>{selectedPost.username}</span>
                        </div>

                        <div
                            onClick={() => deletePost(selectedPost.id)}
                            style={{ marginLeft: 'auto', cursor: 'pointer', color: '#ed4956' }}
                            title="Delete Post"
                        >
                            <Trash2 size={20} />
                        </div>
                    </div>

                    {/* Scrollable Comments */}
                    <div className={styles.scrollArea} ref={scrollRef}>
                        {/* Post Caption as first "comment" */}
                        <div className={styles.commentRow}>
                            <img
                                src={selectedPost.userAvatar || 'https://ui-avatars.com/api/?background=random'}
                                alt={selectedPost.username}
                                className={styles.userAvatar}
                            />
                            <div className={styles.commentContent}>
                                <span className={styles.commentUsername}>{selectedPost.username}</span>
                                {selectedPost.caption}
                            </div>
                        </div>

                        {/* Comments List */}
                        {selectedPost.comments?.map((comment: Comment) => (
                            <div key={comment.id} className={styles.commentRow}>
                                <div className={styles.userAvatar} style={{ background: '#eee', minWidth: '32px' }} />
                                <div className={styles.commentContent}>
                                    <span className={styles.commentUsername}>{comment.username}</span>
                                    {comment.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <div className={styles.footer}>
                        <div className={styles.actions}>
                            <div onClick={() => toggleLike(selectedPost.id)} style={{ cursor: 'pointer' }}>
                                <Heart
                                    size={24}
                                    fill={selectedPost.isLiked ? "#ed4956" : "none"}
                                    color={selectedPost.isLiked ? "#ed4956" : "currentColor"}
                                />
                            </div>
                            <MessageCircle size={24} />
                            <Send size={24} />
                            <div style={{ marginLeft: 'auto' }}>
                                <Bookmark size={24} />
                            </div>
                        </div>

                        <div className={styles.likes}>
                            {selectedPost.initialLikes.toLocaleString()} likes
                        </div>
                        <div className={styles.timestamp}>
                            {selectedPost.timestamp}
                        </div>

                        {/* Comment Input */}
                        <form className={styles.commentForm} onSubmit={handlePostComment}>
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                className={styles.input}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <button
                                type="submit"
                                className={styles.postBtn}
                                disabled={!commentText.trim()}
                            >
                                Post
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
