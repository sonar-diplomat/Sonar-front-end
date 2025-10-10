import React from 'react';
import type { TabItem as TabItemType } from '../model/types';
import styles from './TabBar.module.css';

interface TabItemProps {
  tab: TabItemType;
  isActive: boolean;
  onClick: () => void;
}

export const TabItem: React.FC<TabItemProps> = ({ tab, isActive, onClick }) => {
  const Icon = tab.icon;

  return (
    <button
      className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
      onClick={onClick}
      aria-label={tab.label}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className={styles.tabIcon} />
      {isActive && <span className={styles.tabLabel}>{tab.label}</span>}
    </button>
  );
};