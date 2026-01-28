"use client";

import Link from 'next/link';
import { Home, Search, PlusSquare, User } from 'lucide-react';
import { useGlobalContext } from '@/context/GlobalContext';
import styles from './MobileNav.module.css';

export default function MobileNav() {
    const { openCreateModal } = useGlobalContext();

    return (
        <div className={styles.mobileNav}>
            <Link href="/" className={styles.navItem}>
                <Home />
            </Link>

            <div className={styles.navItem}>
                <Search />
            </div>

            <div className={styles.navItem} onClick={openCreateModal}>
                <PlusSquare />
            </div>



            <Link href="/profile" className={styles.navItem}>
                <User />
            </Link>
        </div>
    );
}
