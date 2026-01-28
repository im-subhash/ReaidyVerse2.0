"use client";

import { useState, useEffect, useRef } from "react";
import { API_URL } from "@/context/GlobalContext";
import { X, Camera } from "lucide-react";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: any;
    onUpdateSuccess: (updatedUser: any) => void;
}

export default function EditProfileModal({ isOpen, onClose, currentUser, onUpdateSuccess }: EditProfileModalProps) {
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [avatarPreview, setAvatarPreview] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentUser) {
            setFullName(currentUser.fullName || "");
            setUsername(currentUser.username || "");
            setBio(currentUser.bio || "");
            setAvatarPreview(currentUser.avatar || "");
        }
    }, [currentUser, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('fullName', fullName);
            formData.append('username', username);
            formData.append('bio', bio);
            if (selectedFile) {
                formData.append('avatar', selectedFile);
            }

            // Using the OLD username for the URL param to find the record
            const res = await fetch(`${API_URL}/users/${currentUser.username}`, {
                method: 'PUT',
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to update profile');
            }

            const updatedUser = await res.json();
            onUpdateSuccess(updatedUser);
            onClose();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '400px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #dbdbdb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 600,
                    fontSize: '16px'
                }}>
                    <span>Edit Profile</span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ padding: '24px', overflowY: 'auto' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Avatar Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    position: 'relative',
                                    width: '80px',
                                    height: '80px',
                                    cursor: 'pointer'
                                }}
                            >
                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '1px solid #dbdbdb'
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    background: '#0095f6',
                                    color: 'white',
                                    borderRadius: '50%',
                                    padding: '4px',
                                    display: 'flex'
                                }}>
                                    <Camera size={14} />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#0095f6',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Change profile photo
                            </button>
                        </div>

                        {/* Fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: '#8e8e8e', marginBottom: '4px' }}>Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Name"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #dbdbdb',
                                        borderRadius: '3px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: '#8e8e8e', marginBottom: '4px' }}>Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Username"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #dbdbdb',
                                        borderRadius: '3px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: '#8e8e8e', marginBottom: '4px' }}>Bio</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Bio"
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #dbdbdb',
                                        borderRadius: '3px',
                                        fontSize: '14px',
                                        resize: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                backgroundColor: '#0095f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '10px',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                marginTop: '10px'
                            }}
                        >
                            {loading ? "Saving..." : "Submit"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}
