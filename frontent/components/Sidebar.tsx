"use client";

import Link from 'next/link';
import { Home, Search, PlusSquare, User, Shield } from 'lucide-react';
import { useGlobalContext } from '@/context/GlobalContext';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const { openCreateModal, openSearchModal, currentUser } = useGlobalContext();

    return (
        <div className={styles.sidebar}>
            <Link href="/" className={styles.logo}>
                ReaidyVerse
            </Link>

            <nav className={styles.navItems}>
                <Link href="/" className={styles.navItem}>
                    <Home className={styles.navIcon} />
                    <span className={styles.navLabel}>Home</span>
                </Link>

                <div className={styles.navItem} onClick={openSearchModal}>
                    <Search className={styles.navIcon} />
                    <span className={styles.navLabel}>Search</span>
                </div>



                <div className={styles.navItem} onClick={openCreateModal}>
                    <PlusSquare className={styles.navIcon} />
                    <span className={styles.navLabel}>Create</span>
                </div>

                <Link href="/profile" className={styles.navItem}>
                    {/* Dynamic Avatar for Profile Link */}
                    {currentUser?.avatar ? (
                        <div style={{ padding: '2px', display: 'flex' }}>
                            <img
                                src={currentUser.avatar}
                                alt="Profile"
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                    ) : (
                        <User className={styles.navIcon} />
                    )}
                    <span className={styles.navLabel}>Profile</span>
                </Link>

                <Link href="/admin" className={styles.navItem} style={{ marginTop: 'auto' }}>
                    <Shield className={styles.navIcon} />
                    <span className={styles.navLabel}>Admin</span>
                </Link>
            </nav>
        </div>
    );
}
