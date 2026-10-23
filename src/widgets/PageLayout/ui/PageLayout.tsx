import React,{ useCallback,useMemo } from 'react';

import { Link,Outlet,useLocation,useNavigate } from 'react-router-dom';

import { useGetUserByIdQuery } from '@entities/User/api/rtkApi';
import { isDemoMode } from '@shared/config/data-source';
import { useCurrentUserId } from '@shared/lib/auth';
import { usePlayer } from '@shared/store/features/player';
import { DemoStatus } from '@shared/ui/DemoStatus';
import { MicroPlayer } from '@widgets/MicroPlayer';
import { TabBar } from '@widgets/TabBar';
import { TAB_ITEMS } from '@widgets/TabBar/lib/constants';
import type { TabId } from '@widgets/TabBar/model/types';

import styles from './PageLayout.module.css';

export const PageLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUserId = useCurrentUserId();
  const { data: currentUser } = useGetUserByIdQuery(currentUserId!, {
    skip: !currentUserId,
  });
  const { currentTrack } = usePlayer();

  // Hide navbar on chat pages
  const shouldHideNavbar = useMemo(() => {
    return location.pathname.startsWith('/chats');
  }, [location.pathname]);

  const profilePath = useMemo(() => {
    if (currentUser?.publicIdentifier) {
      return `/user/${currentUser.publicIdentifier}`;
    }
    return '/user/1'; // Fallback
  }, [currentUser?.publicIdentifier]);

  const handleTabChange = useCallback((tabId: TabId) => {
    const tab = TAB_ITEMS.find(item => item.id === tabId);
    if (tab) {
      const path = tab.id === 'user' ? profilePath : tab.path;
      navigate(path);
    }
  }, [navigate, profilePath]);

  const getActiveTab = (): TabId => {
    const currentPath = location.pathname;
    const activeTab = TAB_ITEMS.find(item => item.path === currentPath);
    return (activeTab?.id as TabId) || '';
  };

  return (
    <div className={styles.pageLayout}>
      <div className={`${styles.scrollableContent} ${currentTrack && !shouldHideNavbar ? styles.withPlayer : ''} ${shouldHideNavbar ? styles.noPadding : ''}`}>
        {isDemoMode && <aside className={styles.demoBanner}><DemoStatus />Demo · changes stay in this browser. <Link to="/settings">Reset / settings</Link> · <a href={`${import.meta.env.BASE_URL}media-credits.html`} target="_blank" rel="noreferrer">Music credits</a></aside>}
        <Outlet />
      </div>
      <div className={styles.fixedBottomBars}>
          {currentTrack && !shouldHideNavbar && (
              <MicroPlayer />
          )}
          {!shouldHideNavbar && (
              <div className={styles.navBlurWrapper}>
                <TabBar
                  defaultActiveTab={getActiveTab()}
                  onTabChange={handleTabChange}
                />
              </div>
          )}
      </div>
    </div>
  );
};
