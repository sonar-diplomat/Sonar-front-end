import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ActionMenu.module.css';
import { Modal } from '@shared/ui';
import { ShareIcon, WarningIcon, HeartIcon, PlusIcon, ProfileIcon, LibraryIcon } from '@shared/ui';
import { ShareComponent } from '@widgets/ShareComponent';
import type { ShareEntityType } from '@widgets/ShareComponent';
import { ReportComponent } from '@widgets/ReportComponent';
import { useToggleCollectionFavorite } from '@entities/Collection';
import { useNotifications } from '@shared/store/notificationStore';

export type ActionMenuContextType = 'track' | 'album' | 'playlist' | 'artist' | 'user';

export interface ActionMenuContext {
  type: ActionMenuContextType;
  entityId: number;
  entityName?: string;
  additionalData?: {};
}

export interface ActionMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isDanger?: boolean;
  disabled?: boolean;
}

export interface ActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  context: ActionMenuContext;
  customActions?: ActionMenuItem[];
}

// TODO: Retrieve these IDs from the API (properly seed them)
const REPORT_ENTITY_TYPE_IDS: Record<ActionMenuContextType, number> = {
  track: 1,
  album: 2,
  playlist: 3,
  artist: 4,
  user: 5,
};

const SHARE_ENTITY_TYPE_MAP: Record<ActionMenuContextType, ShareEntityType> = {
  track: 'Track',
  album: 'Album',
  playlist: 'Playlist',
  artist: 'Artist',
  user: 'User',
};

interface ActionConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  handler: (context: ActionMenuContext, helpers: ActionHelpers) => void;
}

interface ActionHelpers {
  navigate: ReturnType<typeof useNavigate>;
  addToQueue: (trackId: number) => void;
  toggleFavorite: (collectionType: string, collectionId: number) => Promise<void>;

  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  closeMenu: () => void;
}

// TODO: Implement actual handlers for each action
const contextualActions: ActionConfig[] = [
  {
    id: 'add-to-library',
    label: 'Add to Library',
    icon: <HeartIcon />,
    handler: async (context, helpers) => {
      try {
        await helpers.toggleFavorite(context.type, context.entityId);
        helpers.showSuccess('Collection added to library');
        helpers.closeMenu();
      } catch (error) {
        helpers.showError('Failed to add collection to library');
      }
    },
  },
  {
    id: 'add-to-playlist',
    label: 'Add to Playlist',
    icon: <PlusIcon />,
    handler: (context, helpers) => {
      // TODO: Open collection selector modal
      helpers.closeMenu();
    },
  },
  {
    id: 'add-to-queue',
    label: 'Add to Queue',
    icon: <PlusIcon />,
    handler: (context, helpers) => {
      helpers.addToQueue(context.entityId);
      helpers.showSuccess('Added to queue');
      helpers.closeMenu();
    },
  },
];

// 0 - add to library
// 1 - add to playlist
// 2 - add to queue

const MUSIC_ACTIONS: ActionConfig[] = [
  contextualActions[0], contextualActions[1], contextualActions[2]
];

const ARTIST_ACTIONS: ActionConfig[] = [

];

const USER_ACTIONS: ActionConfig[] = [

];

const ACTION_CONFIGS: Record<ActionMenuContextType, ActionConfig[]> = {
  track: MUSIC_ACTIONS,
  album: MUSIC_ACTIONS,
  playlist: MUSIC_ACTIONS,
  artist: ARTIST_ACTIONS,
  user: USER_ACTIONS,
};

export const ActionMenu: React.FC<ActionMenuProps> = ({ isOpen, onClose, context, customActions = [] }) => {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const { mutate: toggleCollectionFavorite } = useToggleCollectionFavorite();
  const { showSuccess, showError } = useNotifications();

  const handleShare = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const handleReport = useCallback(() => {
    setShowReportModal(true);
  }, []);

  const handleCloseShare = useCallback(() => {
    setShowShareModal(false);
  }, []);

  const handleCloseReport = useCallback(() => {
    setShowReportModal(false);
    onClose();
  }, [onClose]);

  const handleReportSuccess = useCallback(() => {
    setShowReportModal(false);
    onClose();
  }, [onClose]);

  const addToQueue = useCallback((_trackId: number) => {
    // TODO: Implement adding track to player queue
    showSuccess('Track added to queue');
  }, [showSuccess]);

  const toggleFavorite = useCallback(async (collectionType: string, collectionId: number) => {
    await toggleCollectionFavorite(collectionType, collectionId);
  }, [toggleCollectionFavorite]);

  const helpers: ActionHelpers = useMemo(() => ({
    navigate,
    addToQueue,
    toggleFavorite,
    showSuccess,
    showError,
    closeMenu: onClose,
  }), [navigate, addToQueue, toggleFavorite, showSuccess, showError, onClose]);

  const contextActions = useMemo((): ActionMenuItem[] => {
    const configs = ACTION_CONFIGS[context.type] || [];
    return configs.map(config => ({
      id: config.id,
      label: config.label,
      icon: config.icon,
      onClick: () => config.handler(context, helpers),
    }));
  }, [context, helpers]);

  const commonActions = useMemo((): ActionMenuItem[] => [
    {
      id: 'share',
      label: 'Share',
      icon: <ShareIcon />,
      onClick: handleShare,
    },
    {
      id: 'report',
      label: 'Report',
      icon: <WarningIcon />,
      onClick: handleReport,
      isDanger: true,
    },
  ], [handleShare, handleReport]);

  const allActions = useMemo(() => {
    return [...contextActions, ...customActions, ...commonActions];
  }, [contextActions, customActions, commonActions]);

  if (showShareModal) {
    return (
      <ShareComponent
        isOpen={true}
        onClose={handleCloseShare}
        entityType={SHARE_ENTITY_TYPE_MAP[context.type]}
        entityId={context.entityId}
        title={`Share ${context.entityName || context.type}`}
      />
    );
  }

  if (showReportModal) {
    return (
      <Modal isOpen={true} onClose={handleCloseReport} title="Report">
        <ReportComponent
          entityId={context.entityId}
          entityTypeId={REPORT_ENTITY_TYPE_IDS[context.type]}
          onSuccess={handleReportSuccess}
          onCancel={handleCloseReport}
        />
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={context.entityName || 'Options'}>
      <div className={styles.actionMenu}>
        <div className={styles.actionList}>
          {allActions.map((action) => (
            <button
              key={action.id}
              className={`${styles.actionItem} ${action.isDanger ? styles.danger : ''}`}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              <span className={styles.actionIcon}>{action.icon}</span>
              <span className={styles.actionLabel}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};
