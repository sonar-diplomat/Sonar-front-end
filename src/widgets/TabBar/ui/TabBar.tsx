import React, { useState, useEffect } from 'react';

import { TAB_ITEMS } from '../lib/constants';
import type { TabId } from '../model/types';

import styles from './TabBar.module.css';
import { TabItem } from './TabItem';

interface TabBarProps {
  defaultActiveTab?: TabId;
  onTabChange?: (tabId: TabId) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  defaultActiveTab = 'home',
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>(defaultActiveTab);

  useEffect(() => setActiveTab(defaultActiveTab), [defaultActiveTab]);

  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <nav className={styles.tabBar} role="navigation" aria-label="Main navigation">
      {TAB_ITEMS.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onClick={() => handleTabClick(tab.id as TabId)}
        />
      ))}
    </nav>
  );
};
