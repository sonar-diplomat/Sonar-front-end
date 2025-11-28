import React from 'react';
import styles from './SectionHeader.module.css';
import type { SectionHeaderProps } from './SectionHeader.types';

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    className = ''
}) => {
    const wrapperClasses = [
        styles.sectionHeader,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            <div className={styles.container}>
                <div className={styles.titleWrapper}>
                    <p className={styles.title}>{title}</p>
                </div>
                {subtitle && (
                    <div className={styles.subtitleWrapper}>
                        <p className={styles.subtitle}>{subtitle}</p>
                    </div>
                )}
            </div>
        </div>
    );
};