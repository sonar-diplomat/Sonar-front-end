import React, { useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TabBar } from '@widgets/TabBar';
import type { TabId } from '@widgets/TabBar/model/types';
import { TAB_ITEMS } from '@widgets/TabBar/lib/constants';
import styles from './PageLayout.module.css';

export const PageLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { currentTrack, isPlaying, currentTime, duration } = useAppSelector((state) => );
  // const { handlePlayPause, handleNext, handleSeek } = null;

  const handleTabChange = useCallback((tabId: TabId) => {
    const tab = TAB_ITEMS.find(item => item.id === tabId);
    if (tab) {
      navigate(tab.path);
    }
  }, [navigate]);

  const getActiveTab = (): TabId => {
    const currentPath = location.pathname;
    const activeTab = TAB_ITEMS.find(item => item.path === currentPath);
    return (activeTab?.id as TabId) || '';
  };

  return (
    <div className={styles.pageLayout}>
      <div className={styles.scrollableContent}>
        <Outlet />
      </div>
      <div className={styles.fixedBottomBars}>
          {/*<MicroPlayer*/}
          {/*    duration={duration}*/}
          {/*    currentTime={currentTime}*/}
          {/*    isPlaying={isPlaying}*/}
          {/*    currentTrack={currentTrack}*/}
          {/*    onPlayPause={handlePlayPause}*/}
          {/*    onNext={handleNext}*/}
          {/*    onSeek={handleSeek}*/}
          {/*/>*/}
          <div className={styles.navBlurWrapper}>
            <TabBar
              defaultActiveTab={getActiveTab()}
              onTabChange={handleTabChange}
            />
          </div>
      </div>
    </div>
  );
};