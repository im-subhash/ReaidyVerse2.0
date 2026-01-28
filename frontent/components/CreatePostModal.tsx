"use client";

import { useState, useRef } from 'react';
import { useGlobalContext, API_URL } from '@/context/GlobalContext';
import { Image as ImageIcon, X } from 'lucide-react';
import styles from './CreatePostModal.module.css';

export default function CreatePostModal() {
    const { isCreateModalOpen, closeCreateModal, addPost } = useGlobalContext();
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
        if (selectedFile) {
            try {
                const formData = new FormData();
                formData.append('image', selectedFile);
                formData.append('caption', caption);
                // Defaulting author for now since we don't have auth
                // In a real app, the token would handle it

                // IMPORTANT: Ensure this URL matches your backend
                //...
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

                // Format for frontend if response structure differs or just pass it
                // Our backend returns the exact structure matching PostData essentially
                const formattedPost: any = {
                    id: newPost._id,
                    username: 'testuser', // We know the backend defaults to this
                    imageUrl: newPost.imageUrl,
                    caption: newPost.caption,
                    initialLikes: 0,
                    timestamp: 'JUST NOW',
                    comments: []
                };

                addPost(formattedPost);
                handleClose();
            } catch (err: any) {
                console.error(err);
                alert(`Failed to upload post: ${err.message}`);
            }
        }
    };

    const handleClose = () => {
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
                        disabled={!selectedFile}
                    >
                        Share
                    </button>
                </div>

                <div className={styles.body}>
                    {!selectedFile ? (
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
                    )}
                </div>
            </div>
        </div>
    );
}
