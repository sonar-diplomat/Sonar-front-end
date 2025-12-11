import React, {useState, useMemo, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ActionMenu.module.css';
import { Modal } from '@shared/ui';
import { ShareIcon, WarningIcon, HeartIcon, PlusIcon, FolderCoverIcon } from '@shared/ui';
import { ShareComponent } from '@widgets/ShareComponent';
import type { ShareEntityType } from '@widgets/ShareComponent';
import { ReportComponent } from '@widgets/ReportComponent';
import { useToggleCollectionFavorite } from '@entities/Collection';
import {
  useGetFoldersQuery,
  useAddCollectionToFolderMutation,
  useRemoveCollectionFromFolderMutation
} from '@entities/Library/api/rtkApi';
import {
  useAddToQueueMutation,
  useDeleteFromQueueMutation
} from '@entities/UserState/api/rtkApi';
import { useNotifications } from '@shared/store/notificationStore';
import { usePlayer } from '@shared/store/features/player';

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
  removeFromQueue: (trackId: number) => void;
  toggleFavorite: (collectionType: string, collectionId: number) => Promise<void>;
  openFolderSelector: () => void;
  addToLibrary: () => void;
  isCollectionInLibrary: () => boolean;
  removeFromLibrary: () => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  closeMenu: () => void;
}

// TODO: Implement actual handlers for each action
const contextualActions: ActionConfig[] = [
  {
    id: 'add-track-to-library',
    label: 'Add to Library',
    icon: <HeartIcon />,
    handler: async (context, helpers) => {
      try {
        await helpers.toggleFavorite(context.type, context.entityId);
        helpers.showSuccess('Library updated');
        helpers.closeMenu();
      } catch (error) {
        helpers.showError('Failed to update library');
      }
    },
  },
  {
    id: 'add-collection-to-library',
    label: 'Add to Library',
    icon: <HeartIcon />,
    handler: (_context, helpers) => {
      if (helpers.isCollectionInLibrary()) {
        helpers.removeFromLibrary();
      } else {
        helpers.addToLibrary();
      }
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

// 0 - add track to library
// 1 - add collection to library
// 2 - add to queue

const TRACK_ACTIONS: ActionConfig[] = [
  contextualActions[0], contextualActions[2]
];

const COLLECTION_ACTIONS: ActionConfig[] = [
  contextualActions[1]
];

const ARTIST_ACTIONS: ActionConfig[] = [

];

const USER_ACTIONS: ActionConfig[] = [

];

const ACTION_CONFIGS: Record<ActionMenuContextType, ActionConfig[]> = {
  track: TRACK_ACTIONS,
  album: COLLECTION_ACTIONS,
  playlist: COLLECTION_ACTIONS,
  artist: ARTIST_ACTIONS,
  user: USER_ACTIONS,
};

export const ActionMenu: React.FC<ActionMenuProps> = ({ isOpen, onClose, context, customActions = [] }) => {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFolderSelector, setShowFolderSelector] = useState(false);

  const { mutate: toggleCollectionFavorite } = useToggleCollectionFavorite();
  const [addCollectionToFolder, { isLoading: addingToFolder }] = useAddCollectionToFolderMutation();
  const [removeCollectionFromFolder] = useRemoveCollectionFromFolderMutation();
  const [addToQueueMutation] = useAddToQueueMutation();
  const [deleteFromQueueMutation] = useDeleteFromQueueMutation();
  const { data: folders } = useGetFoldersQuery();
  const { showSuccess, showError } = useNotifications();

  const { favoriteTrackIds } = usePlayer();

  const isInLibrary = useMemo(() => {
    if (context.type === 'track') {
      return favoriteTrackIds.includes(context.entityId);
    }
    return false;
  }, [favoriteTrackIds, context]);

  const collectionFolderInfo = useMemo<{ isInLibrary: boolean; folderId?: number; folderName?: string }>(() => {
    if (context.type !== 'album' && context.type !== 'playlist') {
      return { isInLibrary: false };
    }

    if (!folders || folders.length === 0) {
      return { isInLibrary: false };
    }

    for (const folder of folders) {
      const collectionInFolder = folder.collections.find(
        (col) => col.id === context.entityId
      );
      if (collectionInFolder) {
        return {
          isInLibrary: true,
          folderId: folder.id,
          folderName: folder.name,
        };
      }
    }

    return { isInLibrary: false };
  }, [folders, context]);

  const handleOpenFolderSelector = useCallback(() => {
    setShowFolderSelector(true);
  }, []);

  const handleCloseFolderSelector = useCallback(() => {
    setShowFolderSelector(false);
  }, []);

  const handleAddToFolder = useCallback(async (folderId: number) => {
    try {
      await addCollectionToFolder({ folderId, collectionId: context.entityId }).unwrap();
      showSuccess('Added to library successfully');
      setShowFolderSelector(false);
      onClose();
    } catch (error) {
      showError('Failed to add to library');
    }
  }, [addCollectionToFolder, context.entityId, showSuccess, showError, onClose]);

  const handleAddToLibrary = useCallback(() => {
    const nonProtectedFolders = folders?.filter(f => !f.isProtected) || [];

    if (nonProtectedFolders.length === 0) {
      showError('No folders available. Create a folder first in your Library.');
      return;
    }

    setShowFolderSelector(true);
  }, [folders, showError]);

  const handleRemoveFromLibrary = useCallback(async () => {
    if (!collectionFolderInfo.folderId) return;

    try {
      await removeCollectionFromFolder({ folderId: collectionFolderInfo.folderId, collectionId: context.entityId }).unwrap();
      showSuccess('Removed from library successfully');
      onClose();
    } catch (error) {
      showError('Failed to remove from library');
    }
  }, [removeCollectionFromFolder, collectionFolderInfo.folderId, context.entityId, showSuccess, showError, onClose]);

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

  const handleAddToQueue = useCallback(async (trackId: number) => {
    try {
      await addToQueueMutation(trackId).unwrap();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/Track/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const trackData = result.data;

        if (trackData) {
          const { store } = await import('@shared/store');
          const { addToQueue: addToQueueAction } = await import('@shared/store/features/player');
          store.dispatch(addToQueueAction(trackData));
        }
      }
      showSuccess('Added to queue');
      onClose();
    } catch (error) {
      console.error('Failed to add to queue:', error);
      showError('Failed to add to queue');
    }
  }, [addToQueueMutation, showSuccess, showError, onClose]);

  const handleRemoveFromQueue = useCallback(async (trackId: number) => {
    try {
      const { store } = await import('@shared/store');
      const state = store.getState();
      const queueIndex = state.player.queue.findIndex((track: any) => track.id === trackId);

      if (queueIndex !== -1) {
        const { removeFromQueue: removeFromQueueAction } = await import('@shared/store/features/player');
        store.dispatch(removeFromQueueAction(queueIndex));
      }

      await deleteFromQueueMutation(trackId).unwrap();
      showSuccess('Removed from queue');
      onClose();
    } catch (error) {
      console.error('Failed to remove from queue:', error);
      showError('Failed to remove from queue');
    }
  }, [deleteFromQueueMutation, showSuccess, showError, onClose]);

  const toggleFavorite = useCallback(async (collectionType: string, collectionId: number) => {
    await toggleCollectionFavorite(collectionType, collectionId);
  }, [toggleCollectionFavorite]);

  const helpers: ActionHelpers = useMemo(() => ({
    navigate,
    addToQueue: handleAddToQueue,
    removeFromQueue: handleRemoveFromQueue,
    toggleFavorite,
    openFolderSelector: handleOpenFolderSelector,
    addToLibrary: handleAddToLibrary,
    isCollectionInLibrary: () => collectionFolderInfo.isInLibrary,
    removeFromLibrary: handleRemoveFromLibrary,
    showSuccess,
    showError,
    closeMenu: onClose,
  }), [navigate, handleAddToQueue, handleRemoveFromQueue, toggleFavorite, handleOpenFolderSelector, handleAddToLibrary, collectionFolderInfo.isInLibrary, handleRemoveFromLibrary, showSuccess, showError, onClose]);

  const contextActions = useMemo((): ActionMenuItem[] => {
    const configs = ACTION_CONFIGS[context.type] || [];
    return configs.map(config => {
      if (config.id === 'add-track-to-library') {
        return {
          id: config.id,
          label: isInLibrary ? 'Remove from Library' : 'Add to Library',
          icon: config.icon,
          onClick: () => config.handler(context, helpers),
        };
      }

      if (config.id === 'add-collection-to-library') {
        return {
          id: config.id,
          label: collectionFolderInfo.isInLibrary ? 'Remove from Library' : 'Add to Library',
          icon: config.icon,
          onClick: () => config.handler(context, helpers),
        };
      }

      return {
        id: config.id,
        label: config.label,
        icon: config.icon,
        onClick: () => config.handler(context, helpers),
      };
    });
  }, [context, helpers, isInLibrary, collectionFolderInfo.isInLibrary]);

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

  if (showFolderSelector) {
    const nonProtectedFolders = folders?.filter(f => !f.isProtected) || [];

    return (
      <Modal isOpen={true} onClose={handleCloseFolderSelector} title="Add to Folder">
        <div className={styles.folderSelector}>
          {nonProtectedFolders.length > 0 ? (
            <div className={styles.folderList}>
              {nonProtectedFolders.map((folder) => (
                <button
                  key={folder.id}
                  className={styles.folderItem}
                  onClick={() => handleAddToFolder(folder.id)}
                  disabled={addingToFolder}
                >
                  <FolderCoverIcon className={styles.folderItemIcon} color="var(--folder-icon-color)" />
                  <span className={styles.folderItemLabel}>{folder.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No folders available. Create a folder first in your Library.</p>
            </div>
          )}
        </div>
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
