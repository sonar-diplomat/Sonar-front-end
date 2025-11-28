import React, { useState, useRef, useEffect } from 'react';
import styles from './TabSlider.module.css';

export interface TabOption {
  value: string;
  label: string;
}

export interface TabSliderProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export const TabSlider: React.FC<TabSliderProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
    if (activeIndex !== -1 && tabRefs.current[activeIndex]) {
      const activeTabElement = tabRefs.current[activeIndex];
      if (activeTabElement) {
        setIndicatorStyle({
          left: `${activeTabElement.offsetLeft}px`,
          width: `${activeTabElement.offsetWidth}px`,
        });
      }
    }
  }, [activeTab, tabs]);

  const handleTabClick = (value: string) => {
    onChange(value);
  };

  return (
    <div className={`${styles.tabSlider} ${className}`}>
      <div className={styles.tabList}>
        {tabs.map((tab, index) => (
          <button
            key={tab.value}
            ref={(el) => (tabRefs.current[index] = el)}
            className={`${styles.tab} ${activeTab === tab.value ? styles.active : ''}`}
            onClick={() => handleTabClick(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.indicator} style={indicatorStyle} />
    </div>
  );
};