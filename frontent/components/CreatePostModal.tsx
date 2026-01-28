"use client";

import { useState, useRef } from 'react';
import { useGlobalContext, API_URL } from '@/context/GlobalContext';
import { Image as ImageIcon, X } from 'lucide-react';
import styles from './CreatePostModal.module.css';

export default function CreatePostModal() {
    const { isCreateModalOpen, closeCreateModal, addPost, currentUser } = useGlobalContext();
    const [mode, setMode] = useState<'image' | 'text'>('image');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isCreateModalOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleShare = async () => {
        if (mode === 'image' && !selectedFile) return;
        if (mode === 'text' && !caption.trim()) return;

        try {
            const formData = new FormData();
            if (mode === 'image' && selectedFile) {
                formData.append('image', selectedFile);
            }
            formData.append('caption', caption);

            // Pass username if we have it, although backend logic handles recovery too
            if (currentUser && currentUser.username) {
                formData.append('username', currentUser.username);
            }

            // IMPORTANT: Ensure this URL matches your backend
            const res = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const newPost = await res.json();

            // Format for frontend
            const formattedPost: any = {
                id: newPost._id,
                username: currentUser?.username || 'testuser',
                userAvatar: currentUser?.avatar || null,
                imageUrl: newPost.imageUrl,
                caption: newPost.caption,
                initialLikes: 0,
                timestamp: 'JUST NOW',
                comments: [],
                isFlagged: newPost.isFlagged,
                moderationReason: newPost.moderationReason
            };

            addPost(formattedPost);
            handleClose();
        } catch (err: any) {
            console.error(err);
            alert(`Failed to upload post: ${err.message}`);
        }
    };

    const handleClose = () => {
        setMode('image');
        setSelectedFile(null);
        setPreviewUrl(null);
        setCaption('');
        closeCreateModal();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <button onClick={handleClose} className={styles.closeButton}>
                        <X />
                    </button>
                    <span className={styles.title}>Create new post</span>
                    <button
                        className={styles.shareButton}
                        onClick={handleShare}
                        disabled={(mode === 'image' && !selectedFile) || (mode === 'text' && !caption.trim())}
                    >
                        Share
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #dbdbdb' }}>
                    <div
                        style={{ flex: 1, textAlign: 'center', padding: '10px', cursor: 'pointer', fontWeight: mode === 'image' ? 'bold' : 'normal', borderBottom: mode === 'image' ? '2px solid black' : 'none' }}
                        onClick={() => setMode('image')}
                    >
                        Image Post
                    </div>
                    <div
                        style={{ flex: 1, textAlign: 'center', padding: '10px', cursor: 'pointer', fontWeight: mode === 'text' ? 'bold' : 'normal', borderBottom: mode === 'text' ? '2px solid black' : 'none' }}
                        onClick={() => setMode('text')}
                    >
                        Text Post
                    </div>
                </div>

                <div className={styles.body}>
                    {mode === 'image' ? (
                        !selectedFile ? (
                            <div className={styles.uploadArea}>
                                <ImageIcon size={64} />
                                <p>Drag photos and videos here</p>
                                <button
                                    className={styles.selectButton}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Select from computer
                                </button>
                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                />
                            </div>
                        ) : (
                            <div className={styles.previewContainer}>
                                <img src={previewUrl!} alt="Preview" className={styles.previewImage} />
                                <textarea
                                    className={styles.captionInput}
                                    placeholder="Write a caption..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                />
                            </div>
                        )
                    ) : (
                        // Text Mode
                        <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <textarea
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    resize: 'none',
                                    fontSize: '16px',
                                    fontFamily: 'inherit',
                                    outline: 'none'
                                }}
                                placeholder="What's on your mind?"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
