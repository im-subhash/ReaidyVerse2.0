"use client";

import { API_URL } from '@/context/GlobalContext';
import { useState, useEffect } from 'react';


import { useGlobalContext, PostData } from '@/context/GlobalContext';
import { Settings, Grid, Bookmark, Tag } from 'lucide-react';
import PostDetailModal from '@/components/PostDetailModal';

export default function ProfilePage() {
    const { openPostDetail } = useGlobalContext();
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock User Data (since we don't have full Auth yet)
    const user = {
        username: "testuser",
        fullName: "Test User",
        bio: "AI-Powered Social Media 🤖 | Built with Next.js & Gemini",
        avatar: "https://ui-avatars.com/api/?name=Test+User&background=random&size=150",
        stats: {
            posts: posts.length,
            followers: 1250,
            following: 45
        }
    };

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                // Fetching posts for 'testuser' specifically
                const res = await fetch(`${API_URL}/posts/user/testuser`);
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, []);

    return (
        <div style={{ maxWidth: '935px', margin: '0 auto', padding: '30px 20px', width: '100%' }}>

            {/* Header Section */}
            <header style={{ display: 'flex', marginBottom: '44px', alignItems: 'center' }}>
                <div style={{ flex: '0 0 290px', display: 'flex', justifyContent: 'center' }}>
                    <img
                        src={user.avatar}
                        alt={user.username}
                        style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 400, marginRight: '20px' }}>{user.username}</h2>
                        <button style={{
                            background: '#efefef',
                            border: 'none',
                            padding: '6px 16px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '14px',
                            marginRight: '10px',
                            cursor: 'pointer'
                        }}>
                            Edit profile
                        </button>
                        <Settings size={20} />
                    </div>

                    <div style={{ display: 'flex', marginBottom: '20px', gap: '40px' }}>
                        <span><strong>{posts.length}</strong> posts</span>
                        <span><strong>{user.stats.followers}</strong> followers</span>
                        <span><strong>{user.stats.following}</strong> following</span>
                    </div>

                    <div style={{ fontSize: '14px' }}>
                        <div style={{ fontWeight: 600 }}>{user.fullName}</div>
                        <div style={{ whiteSpace: 'pre-line' }}>{user.bio}</div>
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
                <div style={{ display: 'flex', alignItems: 'center', borderTop: '1px solid #262626', paddingTop: '15px', marginTop: '-1px', gap: '6px', fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>
                    <Grid size={12} /> POSTS
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#8e8e8e', paddingTop: '15px', gap: '6px', fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>
                    <Bookmark size={12} /> SAVED
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#8e8e8e', paddingTop: '15px', gap: '6px', fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>
                    <Tag size={12} /> TAGGED
                </div>
            </div>

            {/* Posts Grid */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>Loading...</div>
            ) : posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>No posts yet</div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '4px' // Instagram style tight gap
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
                            <img
                                src={post.imageUrl}
                                alt={post.caption}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {/* Hover overlay could go here */}
                        </div>
                    ))}
                </div>
            )}

            <PostDetailModal />
        </div>
    );
}
