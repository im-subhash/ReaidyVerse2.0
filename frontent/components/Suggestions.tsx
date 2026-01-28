"use client";

import styles from './Suggestions.module.css';

import { useGlobalContext } from '@/context/GlobalContext';

export default function Suggestions() {
    const { currentUser } = useGlobalContext();

    const suggestions = [
        {
            id: 1,
            username: 'Beyond the Arrival',
            subtitle: 'Followed by glenn_1203',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
        },
        {
            id: 2,
            username: 'besttfrndss',
            subtitle: 'Followed by glenn_1203 +',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
        },
        {
            id: 3,
            username: 'Tanushree Parida',
            subtitle: 'Followed by kalpana12_99',
            avatar: null
        },
        {
            id: 4,
            username: 'Harshita Sehrawat',
            subtitle: 'Followed by kush_barai + 2',
            isVerified: false,
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        {
            id: 5,
            username: '3blue1brown',
            subtitle: 'Followed by shreyashuklaC',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
    ];

    return (
        <div className={styles.container}>
            {/* Current User */}
            {currentUser && (
                <div className={styles.userProfile}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                            <img
                                src={currentUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                                alt="Profile"
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                        <div>
                            <div className={styles.username}>{currentUser.username}</div>
                            <div className={styles.fullName}>{currentUser.fullName}</div>
                        </div>
                    </div>
                    <div className={styles.switchAction}>Switch</div>
                </div>
            )}

            {/* Header */}
            <div className={styles.suggestionsHeader}>
                <div className={styles.headerTitle}>Suggested for you</div>
                <div className={styles.seeAll}>See All</div>
            </div>

            {/* List */}
            {suggestions.map(s => (
                <div key={s.id} className={styles.suggestionItem}>
                    <div className={styles.suggestionInfo}>
                        <div className={styles.suggestionAvatar}>
                            {s.avatar ? (
                                <img src={s.avatar} alt={s.username} />
                            ) : (
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="#888">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <div className={styles.suggestionUsername}>
                                {s.username}
                                {s.isVerified && (
                                    <span className={styles.verified}>✓</span>
                                )}
                            </div>
                            <div className={styles.suggestionMeta}>
                                <span className={styles.metaAvatar}></span>
                                {s.subtitle}
                            </div>
                        </div>
                    </div>
                    <div className={styles.followAction}>Follow</div>
                </div>
            ))}

            {/* Footer */}
            <div className={styles.footer}>
                <div>
                    {['About', 'Help', 'Press', 'API', 'Jobs', 'Privacy', 'Terms', 'Locations', 'Language', 'Meta Verified'].map(link => (
                        <span key={link} className={styles.footerLink}>{link} · </span>
                    ))}
                </div>
                <div className={styles.copyright}>
                    © 2026 REAIDYVERSE FROM META
                </div>
            </div>
        </div>
    );
}
