"use client";

import { useState } from 'react';
import { X, Search } from 'lucide-react';
import styles from './SearchModal.module.css';
import { API_URL, useGlobalContext } from '@/context/GlobalContext';

export default function SearchModal() {
    const { isSearchModalOpen, closeSearchModal } = useGlobalContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isSearchModalOpen) return null;

    return (
        <div className={styles.overlay} onClick={closeSearchModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Search</h2>
                    <X onClick={closeSearchModal} style={{ cursor: 'pointer' }} />
                </div>

                <div className={styles.searchBox}>
                    <Search size={20} color="#8e8e8e" />
                    <input
                        type="text"
                        placeholder="Search posts and comments..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className={styles.results}>
                    {loading && <div className={styles.loading}>Searching...</div>}

                    {!loading && results.length === 0 && searchQuery.length >= 2 && (
                        <div className={styles.noResults}>No results found</div>
                    )}

                    {!loading && results.map((result, index) => (
                        <div key={index} className={styles.resultItem}>
                            <div className={styles.resultTop}>
                                <span className={styles.username}>{result.username}</span>
                                <span className={styles.type}>{result.type === 'post' ? 'Post' : 'Comment'}</span>
                            </div>
                            <div className={styles.resultText}>
                                {result.text}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
