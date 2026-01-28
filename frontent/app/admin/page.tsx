"use client";

import { API_URL } from '@/context/GlobalContext';
import { useState, useEffect } from 'react';

// ...



interface FlaggedComment {
    _id: string;
    text: string;
    moderationReason: string;
    author: { _id: string; username: string };
    post: { _id: string; imageUrl: string };
    createdAt: string;
}

export default function AdminPage() {
    const [comments, setComments] = useState<FlaggedComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFlaggedComments = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/flagged`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFlaggedComments();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            await fetch(`${API_URL}/admin/comments/${id}`, { method: 'DELETE' });
            setComments(prev => prev.filter(c => c._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await fetch(`${API_URL}/admin/comments/${id}/approve`, { method: 'PUT' });
            setComments(prev => prev.filter(c => c._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Admin Dashboard</h1>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Flagged Comments</h2>

            {isLoading ? (
                <p>Loading...</p>
            ) : comments.length === 0 ? (
                <p>No flagged comments found.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #dbdbdb' }}>
                            <th style={{ padding: '12px' }}>User</th>
                            <th style={{ padding: '12px' }}>Content</th>
                            <th style={{ padding: '12px' }}>Reason</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.map(comment => (
                            <tr key={comment._id} style={{ borderBottom: '1px solid #dbdbdb' }}>
                                <td style={{ padding: '12px' }}>{comment.author?.username || 'Unknown'}</td>
                                <td style={{ padding: '12px' }}>"{comment.text}"</td>
                                <td style={{ padding: '12px', color: '#ed4956' }}>{comment.moderationReason}</td>
                                <td style={{ padding: '12px' }}>
                                    <button
                                        onClick={() => handleApprove(comment._id)}
                                        style={{ marginRight: '10px', color: '#0095f6', fontWeight: 600 }}
                                    >
                                        Keep
                                    </button>
                                    <button
                                        onClick={() => handleDelete(comment._id)}
                                        style={{ color: '#ed4956', fontWeight: 600 }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
