"use client";

import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { PostData, useGlobalContext, Comment } from '@/context/GlobalContext';
import styles from './Post.module.css';

export default function Post({
    id,
    username,
    userAvatar,
    imageUrl,
    caption,
    initialLikes,
    timestamp,
    comments,
    isLiked,
    isFlagged,
    moderationReason
}: PostData) {
    const { toggleLike, addComment, openPostDetail, toggleSave, savedPosts } = useGlobalContext();
    const [commentText, setCommentText] = useState('');
    const isSaved = savedPosts.includes(id);

    const handleLike = () => {
        toggleLike(id);
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim()) {
            await addComment(id, commentText);
            setCommentText('');
        }
    };

    return (
        <article className={styles.post}>
            <div className={styles.header}>
                {userAvatar ? (
                    <img src={userAvatar} alt={username} className={styles.avatar} />
                ) : (
                    <div className={styles.avatar} />
                )}
                <span className={styles.username}>{username}</span>
            </div>

            {imageUrl ? (
                /* IMAGE POST LAYOUT */
                <>
                    {/* Flagged Content Warning using inline styles for simplicity */}
                    {isFlagged ? (
                        <div className={styles.hiddenContent}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#262626' }}>Content Hidden</h3>
                            <p style={{ color: '#666', fontSize: '14px' }}>
                                This post has been flagged by AI for: <br />
                                <strong>{moderationReason || 'Sensitive Content'}</strong>
                            </p>
                        </div>
                    ) : (
                        <div className={styles.imageContainer}>
                            <img src={imageUrl} alt="Post content" className={styles.postImage} />
                        </div>
                    )}

                    <div className={styles.footer}>
                        <div className={styles.actions}>
                            <div onClick={handleLike} className={styles.actionIcon}>
                                <Heart
                                    size={24}
                                    fill={isLiked ? "#ed4956" : "none"}
                                    color={isLiked ? "#ed4956" : "currentColor"}
                                />
                            </div>
                            <div
                                className={styles.actionIcon}
                                onClick={() => !isFlagged && openPostDetail({
                                    id, username, userAvatar, imageUrl, caption,
                                    initialLikes, timestamp, comments, isLiked
                                } as PostData)}
                                style={{ cursor: isFlagged ? 'not-allowed' : 'pointer', opacity: isFlagged ? 0.5 : 1 }}
                            >
                                <MessageCircle size={24} />
                            </div>
                            <div className={styles.actionIcon}>
                                <Send size={24} />
                            </div>
                            <div style={{ marginLeft: 'auto' }} className={styles.actionIcon} onClick={() => toggleSave(id)}>
                                <Bookmark size={24} fill={isSaved ? 'currentColor' : 'none'} />
                            </div>
                        </div>

                        <div className={styles.likes}>
                            {initialLikes.toLocaleString()} likes
                        </div>

                        <div className={styles.caption}>
                            <span className={styles.captionUsername}>{username}</span>
                            {/* Hide caption if flagged too? Usually yes if the whole post is toxic */}
                            {isFlagged ? <span style={{ color: '#888', fontStyle: 'italic' }}>[Caption Hidden]</span> : caption}
                        </div>

                        {comments && comments.length > 0 && !isFlagged && (
                            <div
                                className={styles.viewComments}
                                onClick={() => openPostDetail({
                                    id, username, userAvatar, imageUrl, caption,
                                    initialLikes, timestamp, comments, isLiked
                                } as PostData)}
                            >
                                View all {comments.length} comments
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* TEXT POST LAYOUT (LinkedIn Style) */
                <>
                    {isFlagged ? (
                        <div className={styles.hiddenContent}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#262626' }}>Content Hidden</h3>
                            <p style={{ color: '#666', fontSize: '14px' }}>
                                This post has been flagged by AI for: <br />
                                <strong>{moderationReason || 'Sensitive Content'}</strong>
                            </p>
                        </div>
                    ) : (
                        <div className={styles.textBody}>
                            {caption}
                        </div>
                    )}

                    <div className={styles.footer}>
                        {/* Likes Count Top of Footer */}
                        <div className={styles.likes} style={{ marginBottom: '12px', borderBottom: '1px solid #efefef', paddingBottom: '8px' }}>
                            {initialLikes.toLocaleString()} likes
                        </div>

                        {/* Actions Below Text */}
                        <div className={styles.actions} style={{ justifyContent: 'space-between', padding: '0 4px' }}>
                            {/* Group Like/Comment/Share */}
                            <div style={{ display: 'flex', gap: '24px' }}>
                                <div onClick={handleLike} className={styles.actionIcon} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Heart
                                        size={24}
                                        fill={isLiked ? "#ed4956" : "none"}
                                        color={isLiked ? "#ed4956" : "currentColor"}
                                    />
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Like</span>
                                </div>
                                <div
                                    className={styles.actionIcon}
                                    onClick={() => !isFlagged && openPostDetail({
                                        id, username, userAvatar, imageUrl, caption,
                                        initialLikes, timestamp, comments, isLiked
                                    } as PostData)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: isFlagged ? 'not-allowed' : 'pointer', opacity: isFlagged ? 0.5 : 1 }}
                                >
                                    <MessageCircle size={24} />
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Comment</span>
                                </div>
                                <div className={styles.actionIcon} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Send size={24} />
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Share</span>
                                </div>
                            </div>

                            <div className={styles.actionIcon} onClick={() => toggleSave(id)}>
                                <Bookmark size={24} fill={isSaved ? 'currentColor' : 'none'} />
                            </div>
                        </div>

                        {comments && comments.length > 0 && !isFlagged && (
                            <div
                                className={styles.viewComments}
                                style={{ marginTop: '12px' }}
                                onClick={() => openPostDetail({
                                    id, username, userAvatar, imageUrl, caption,
                                    initialLikes, timestamp, comments, isLiked
                                } as PostData)}
                            >
                                View all {comments.length} comments
                            </div>
                        )}
                    </div>
                </>
            )}

            <div className={styles.footer}>
                {/* Footer shared elements like timestamp, comment form */}
                <div className={styles.timestamp}>
                    {timestamp}
                </div>

                <form className={styles.commentForm} onSubmit={handlePostComment}>
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        className={styles.commentInput}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button
                        type="submit"
                        className={styles.postButton}
                        disabled={!commentText.trim()}
                    >
                        Post
                    </button>
                </form>
            </div>
        </article>
    );
}
