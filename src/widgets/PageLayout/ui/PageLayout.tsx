import React, { useCallback, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TabBar } from '@widgets/TabBar';
import { MicroPlayer } from '@widgets/MicroPlayer';
import { usePlayer } from '@shared/store/features/player';
import { useCurrentUserId } from '@shared/lib/auth';
import { useGetUserByIdQuery } from '@entities/User/api/rtkApi';
import type { TabId } from '@widgets/TabBar/model/types';
import { TAB_ITEMS } from '@widgets/TabBar/lib/constants';
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