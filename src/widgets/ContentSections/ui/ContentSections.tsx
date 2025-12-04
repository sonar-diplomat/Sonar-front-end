import React from 'react';

import {ItemCardContainer} from "@shared/ui";

import styles from './ContentSections.module.css';

export interface ContentSection<T = unknown> {
    id: string;
    title: string;
    countLabel: string;
    shouldShow: boolean;
    items: T[];
    renderItem: (item: T) => React.ReactNode;
}

interface ContentSectionsProps {
    sections: ContentSection<any>[];
}

export const ContentSections: React.FC<ContentSectionsProps> = ({sections}) => {
    return (
        <div className={styles.sectionsContainer}>
            {sections
                .filter((section) => section.shouldShow)
                .map((section) => (
                    <ItemCardContainer
                        key={section.id}
                        title={section.title}
                        count={section.items.length}
                        countLabel={section.countLabel}
                    >
                        {section.items.map((item) => section.renderItem(item))}
                    </ItemCardContainer>
                ))}
        </div>
    );
};
