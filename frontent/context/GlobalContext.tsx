"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface PostData {
    id: string;
    username: string;
    userAvatar?: string;
    imageUrl: string;
    caption: string;
    initialLikes: number;
    timestamp: string;
    comments: Comment[];
    isLiked?: boolean;
    isFlagged?: boolean;
    moderationReason?: string;
}

export interface Comment {
    id: string;
    username: string;
    text: string;
    isFlagged?: boolean; // Added for frontend awareness
}

interface GlobalContextType {
    isCreateModalOpen: boolean;
    openCreateModal: () => void;
    closeCreateModal: () => void;
    isSearchModalOpen: boolean;
    openSearchModal: () => void;
    closeSearchModal: () => void;
    posts: PostData[];
    addPost: (post: PostData) => void;
    toggleLike: (postId: string) => void;
    toggleSave: (postId: string) => void;
    addComment: (postId: string, text: string) => Promise<void>;
    refreshFeed: () => void;
    selectedPost: PostData | null;
    openPostDetail: (post: PostData) => void;
    closePostDetail: () => void;
    deletePost: (postId: string) => void;

    // User State
    currentUser: any;
    setCurrentUser: (user: any) => void;
    refreshUser: () => void;
    savedPosts: string[];
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// API URL Configuration
// CRITICAL: In production, NEXT_PUBLIC_API_URL MUST be set in Vercel/Netlify environment variables
const getApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // Development fallback
    if (process.env.NODE_ENV === 'development') {
        return 'http://127.0.0.1:5003/api';
    }

    // Production without API URL set - this will cause issues
    console.error('CRITICAL: NEXT_PUBLIC_API_URL not set in production!');
    throw new Error('API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
};

export const API_URL = getApiUrl();

export function GlobalProvider({ children }: { children: ReactNode }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [posts, setPosts] = useState<PostData[]>([]);
    const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [savedPosts, setSavedPosts] = useState<string[]>([]);

    useEffect(() => {
        fetchPosts();
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            // For now, hardcode to 'testuser' until we have real auth
            const res = await fetch(`${API_URL}/users/testuser`);
            if (res.ok) {
                const data = await res.json();
                setCurrentUser(data);
                setSavedPosts(data.savedPosts || []);
            }
        } catch (err) {
            console.error('Failed to fetch user:', err);
        }
    };

    const refreshUser = () => fetchUser();

    const fetchPosts = async () => {
        try {
            const res = await fetch(`${API_URL}/posts`);
            if (!res.ok) throw new Error('Failed to fetch posts');
            const data = await res.json();
            setPosts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => setIsCreateModalOpen(false);

    const openSearchModal = () => setIsSearchModalOpen(true);
    const closeSearchModal = () => setIsSearchModalOpen(false);

    const openPostDetail = (post: PostData) => setSelectedPost(post);
    const closePostDetail = () => setSelectedPost(null);

    const refreshFeed = () => fetchPosts();

    const addPost = (post: PostData) => {
        setPosts(prev => [post, ...prev]);
    };

    const toggleLike = async (postId: string) => {
        try {
            // Optimistic update
            setPosts(prev => prev.map(post => {
                if (post.id === postId) {
                    const newIsLiked = !post.isLiked;
                    const updatedPost = {
                        ...post,
                        isLiked: newIsLiked,
                        initialLikes: newIsLiked ? (post.initialLikes || 0) + 1 : (post.initialLikes || 1) - 1
                    };

                    // Sync selected post if open
                    if (selectedPost && selectedPost.id === postId) {
                        setSelectedPost(updatedPost);
                    }
                    return updatedPost;
                }
                return post;
            }));

            await fetch(`${API_URL}/posts/${postId}/like`, { method: 'PUT' });
        } catch (err) {
            console.error(err);
            fetchPosts();
        }
    };

    const addComment = async (postId: string, commentText: string) => {
        try {
            const res = await fetch(`${API_URL}/comments/${postId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: commentText })
            });

            if (!res.ok) throw new Error('Failed to comment');
            const newComment = await res.json();

            setPosts(prev => prev.map(post => {
                if (post.id === postId) {
                    const updatedPost = {
                        ...post,
                        comments: [...post.comments, newComment]
                    };

                    // Sync selected post
                    if (selectedPost && selectedPost.id === postId) {
                        setSelectedPost(updatedPost);
                    }
                    return updatedPost;
                }
                return post;
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleSave = async (postId: string) => {
        try {
            const isSaved = savedPosts.includes(postId);

            // Optimistic update
            if (isSaved) {
                setSavedPosts(prev => prev.filter(id => id !== postId));
                await fetch(`${API_URL}/users/unsave/${postId}`, { method: 'DELETE' });
            } else {
                setSavedPosts(prev => [...prev, postId]);
                await fetch(`${API_URL}/users/save/${postId}`, { method: 'POST' });
            }
        } catch (err) {
            console.error('Failed to toggle save:', err);
            // Revert on error
            fetchUser();
        }
    };

    const deletePost = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            // Optimistic update
            setPosts(prev => prev.filter(p => p.id !== postId));
            if (selectedPost && selectedPost.id === postId) {
                closePostDetail();
            }

            await fetch(`${API_URL}/posts/${postId}`, { method: 'DELETE' });
        } catch (err) {
            console.error(err);
            fetchPosts(); // Revert
        }
    };

    return (
        <GlobalContext.Provider value={{
            isCreateModalOpen,
            openCreateModal,
            closeCreateModal,
            isSearchModalOpen,
            openSearchModal,
            closeSearchModal,
            posts,
            addPost,
            toggleLike,
            toggleSave,
            addComment,
            refreshFeed,
            selectedPost,
            openPostDetail,
            closePostDetail,
            deletePost,
            currentUser,
            setCurrentUser,
            refreshUser,
            savedPosts
        }}>
            {children}
        </GlobalContext.Provider>
    );
}

export function useGlobalContext() {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobalContext must be used within a GlobalProvider');
    }
    return context;
}
