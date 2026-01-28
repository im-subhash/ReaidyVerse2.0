"use client";

import { API_URL } from '@/context/GlobalContext';
import { useState, useEffect } from 'react';
import { useGlobalContext, PostData } from '@/context/GlobalContext';
import { Settings, Grid, Bookmark, Tag } from 'lucide-react';
import PostDetailModal from '@/components/PostDetailModal';
import EditProfileModal from '@/components/EditProfileModal';

export default function ProfilePage() {
    const { openPostDetail, setCurrentUser } = useGlobalContext();
    const [posts, setPosts] = useState<PostData[]>([]);
    const [savedPosts, setSavedPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'POSTS' | 'SAVED' | 'TAGGED'>('POSTS');

    // Profile State
    const [currentUsername, setCurrentUsername] = useState("testuser");
    const [userData, setUserData] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Fetch Profile & Posts
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch User Profile
                const userRes = await fetch(`${API_URL}/users/${currentUsername}`);
                if (userRes.ok) {
                    const user = await userRes.json();
                    setUserData(user);

                    // RECOVERY: If we asked for 'testuser' but got someone else (because of backend recovery via email)
                    if (currentUsername === 'testuser' && user.username !== 'testuser') {
                        console.log("Recovered renamed session:", user.username);
                        setCurrentUsername(user.username);
                        setCurrentUser(user);
                    }
                } else {
                    console.error("Failed to fetch user");
                    // If we failed to find 'testuser', strictly try to fetch the Global Context user if available
                    // This handles cases where we refreshed the page and lost state
                }

                // 2. Fetch User Posts
                const postsRes = await fetch(`${API_URL}/posts/user/${currentUsername}`);
                if (postsRes.ok) {
                    const data = await postsRes.json();
                    setPosts(data);
                }

                // 3. Fetch Saved Posts
                const savedRes = await fetch(`${API_URL}/users/${currentUsername}/saved`);
                if (savedRes.ok) {
                    const savedData = await savedRes.json();
                    setSavedPosts(savedData);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUsername]);

    const handleUpdateSuccess = (updatedUser: any) => {
        setUserData(updatedUser);
        setCurrentUser(updatedUser); // <--- Update Global Context here
        if (updatedUser.username !== currentUsername) {
            setCurrentUsername(updatedUser.username);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>Loading...</div>;
    }

    if (!userData) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>User not found</div>;
    }

    return (
        <div style={{ maxWidth: '935px', margin: '0 auto', padding: '30px 20px', width: '100%' }}>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentUser={userData}
                onUpdateSuccess={handleUpdateSuccess}
            />

            {/* Header Section */}
            <header style={{ display: 'flex', marginBottom: '44px', alignItems: 'center' }}>
                <div style={{ flex: '0 0 290px', display: 'flex', justifyContent: 'center' }}>
                    <img
                        src={userData.avatar}
                        alt={userData.username}
                        style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 400, marginRight: '20px' }}>{userData.username}</h2>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            style={{
                                background: '#efefef',
                                border: 'none',
                                padding: '6px 16px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '14px',
                                marginRight: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            Edit profile
                        </button>
                        <Settings size={20} />
                    </div>

                    <div style={{ display: 'flex', marginBottom: '20px', gap: '40px' }}>
                        <span><strong>{posts.length}</strong> posts</span>
                        <span><strong>1250</strong> followers</span>
                        <span><strong>45</strong> following</span>
                    </div>

                    <div style={{ fontSize: '14px' }}>
                        <div style={{ fontWeight: 600 }}>{userData.fullName}</div>
                        <div style={{ whiteSpace: 'pre-line' }}>{userData.bio}</div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div style={{
                borderTop: '1px solid #dbdbdb',
                display: 'flex',
                justifyContent: 'center',
                gap: '60px',
                marginBottom: '20px'
            }}>
                <div
                    onClick={() => setActiveTab('POSTS')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        borderTop: activeTab === 'POSTS' ? '1px solid #262626' : 'none',
                        paddingTop: '15px',
                        marginTop: '-1px',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        color: activeTab === 'POSTS' ? '#262626' : '#8e8e8e',
                        cursor: 'pointer'
                    }}
                >
                    <Grid size={12} /> POSTS
                </div>
                <div
                    onClick={() => setActiveTab('SAVED')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        borderTop: activeTab === 'SAVED' ? '1px solid #262626' : 'none',
                        paddingTop: '15px',
                        marginTop: '-1px',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        color: activeTab === 'SAVED' ? '#262626' : '#8e8e8e',
                        cursor: 'pointer'
                    }}
                >
                    <Bookmark size={12} /> SAVED
                </div>
                <div
                    onClick={() => setActiveTab('TAGGED')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        borderTop: activeTab === 'TAGGED' ? '1px solid #262626' : 'none',
                        paddingTop: '15px',
                        marginTop: '-1px',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        color: activeTab === 'TAGGED' ? '#262626' : '#8e8e8e',
                        cursor: 'pointer'
                    }}
                >
                    <Tag size={12} /> TAGGED
                </div>
            </div>

            {/* Posts Grid - Conditional based on active tab */}
            {activeTab === 'POSTS' && (
                posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>No posts yet</div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '4px'
                    }}>
                        {posts.map(post => (
                            <div
                                key={post.id}
                                style={{
                                    position: 'relative',
                                    aspectRatio: '1/1',
                                    cursor: 'pointer',
                                    background: '#efefef'
                                }}
                                onClick={() => openPostDetail(post)}
                            >
                                {post.imageUrl ? (
                                    <img
                                        src={post.imageUrl}
                                        alt={post.caption || 'Post image'}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#efefef', color: '#8e8e8e' }}>
                                        No image
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Saved Posts Grid */}
            {activeTab === 'SAVED' && (
                savedPosts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>No saved posts yet</div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '4px'
                    }}>
                        {savedPosts.map(post => (
                            <div
                                key={post.id}
                                style={{
                                    position: 'relative',
                                    aspectRatio: '1/1',
                                    cursor: 'pointer',
                                    background: '#efefef'
                                }}
                                onClick={() => openPostDetail(post)}
                            >
                                {post.imageUrl ? (
                                    <img
                                        src={post.imageUrl}
                                        alt={post.caption || 'Saved post image'}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#efefef', color: '#8e8e8e' }}>
                                        No image
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Tagged Posts (placeholder) */}
            {activeTab === 'TAGGED' && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8e8e8e' }}>
                    No tagged posts
                </div>
            )}

            <PostDetailModal />
        </div>
    );
}
