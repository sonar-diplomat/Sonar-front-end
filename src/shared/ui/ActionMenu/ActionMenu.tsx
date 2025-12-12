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
  useAddCollectionToFolderMutation,
  useRemoveCollectionFromFolderMutation
} from '@entities/Library/api/rtkApi';
import {
  useAddToQueueMutation,
  useDeleteFromQueueMutation
} from '@entities/UserState/api/rtkApi';
import { musicApi, useToggleTrackFavoriteMutation } from '@entities/Music/api/rtkApi';
import { useAddTrackToPlaylistMutation } from '@entities/Playlist/api/rtkApi';
import { useNotifications } from '@shared/store/notificationStore';
import { usePlayer } from '@shared/store/features/player';
import { useAppDispatch } from '@shared/store/hooks';
import { useFolders } from '@shared/store/features/library/useLibrary';
import type { FolderDTO, CollectionSummaryDTO } from '@entities/Library/model/types';

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
  toggleFavoriteTrack: (trackId: number) => Promise<void>;
  openFolderSelector: () => void;
  openPlaylistSelector: () => void;
  addToLibrary: () => void;
  addToLibraryRoot: () => void;
  isCollectionInLibrary: () => boolean;
  removeFromLibrary: () => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  closeMenu: () => void;
}

const contextualActions: ActionConfig[] = [
  {
    id: 'add-track-to-playlist',
    label: 'Add to Playlist',
    icon: <PlusIcon />,
    handler: (_context, helpers) => {
      helpers.openPlaylistSelector();
    },
  },
  {
    id: 'add-collection-to-library',
    label: 'Add to Library',
    icon: <HeartIcon />,
    handler: async (_context, helpers) => {
      if (helpers.isCollectionInLibrary()) {
        helpers.removeFromLibrary();
      } else {
        helpers.addToLibraryRoot();
      }
    },
  },
  {
    id: 'add-to-folder',
    label: 'Add to Folder',
    icon: <FolderCoverIcon />,
    handler: (_context, helpers) => {
      helpers.openFolderSelector();
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
  {
    id: 'add-track-to-favorite',
    label: 'Add to Favorite',
    icon: <HeartIcon />,
    handler: async (context, helpers) => {
      try {
        await helpers.toggleFavoriteTrack(context.entityId);
        helpers.showSuccess('Added to favorites');
        helpers.closeMenu();
      } catch (error) {
        helpers.showError('Failed to add to favorites');
      }
    },
  },
];

// 0 - add track to playlist
// 1 - add collection to library
// 2 - add to folder
// 3 - add to queue
// 4 - add track to favorite

const TRACK_ACTIONS: ActionConfig[] = [
  contextualActions[4], // Add to Favorite (first)
  contextualActions[0], // Add to Playlist (second)
  contextualActions[3]  // Add to Queue (third)
];

const COLLECTION_ACTIONS: ActionConfig[] = [
  contextualActions[1], // Add to Library
  contextualActions[2]  // Add to Folder
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
  const dispatch = useAppDispatch();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [navigationPath, setNavigationPath] = useState<Array<{ id: number; name: string }>>([]);

  const { mutate: toggleCollectionFavorite } = useToggleCollectionFavorite();
  const [addCollectionToFolder, { isLoading: addingToFolder }] = useAddCollectionToFolderMutation();
  const [removeCollectionFromFolder] = useRemoveCollectionFromFolderMutation();
  const [addToQueueMutation] = useAddToQueueMutation();
  const [deleteFromQueueMutation] = useDeleteFromQueueMutation();
  const [addTrackToPlaylist, { isLoading: addingToPlaylist }] = useAddTrackToPlaylistMutation();

  const { showSuccess, showError } = useNotifications();
  const { favoriteTrackIds, queue, addToQueue: addToQueueLocal, removeFromQueue: removeFromQueueLocal, toggleFavoriteTrackLocal } = usePlayer();
  const [toggleTrackFavoriteMutation] = useToggleTrackFavoriteMutation();

  const { folders: foldersList } = useFolders();

  const allFolders = useMemo(() => {
    if (!foldersList || !Array.isArray(foldersList)) {
      return [];
    }

    const flatList: FolderDTO[] = [];

    const flattenFolders = (folders: FolderDTO[]) => {
      for (const folder of folders) {
        flatList.push(folder);

        if (folder.subFolders && Array.isArray(folder.subFolders) && folder.subFolders.length > 0) {
          const firstSub = folder.subFolders[0] as any;
          if (firstSub && 'collections' in firstSub) {
            flattenFolders(folder.subFolders as any);
          }
        }
      }
    };

    flattenFolders(foldersList);
    return flatList;
  }, [foldersList]);


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

    if (!allFolders || allFolders.length === 0) {
      return { isInLibrary: false };
    }

    for (const folder of allFolders) {
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
  }, [allFolders, context]);

  const handleOpenFolderSelector = useCallback(() => {
    setShowFolderSelector(true);
  }, []);

  const handleCloseFolderSelector = useCallback(() => {
    setShowFolderSelector(false);
    setCurrentFolderId(null);
    setNavigationPath([]);
  }, []);

  const handleOpenPlaylistSelector = useCallback(() => {
    setShowPlaylistSelector(true);
  }, []);

  const handleClosePlaylistSelector = useCallback(() => {
    setShowPlaylistSelector(false);
    setCurrentFolderId(null);
    setNavigationPath([]);
  }, []);

  const handleNavigateToFolder = useCallback((folderId: number, folderName: string) => {
    setCurrentFolderId(folderId);
    setNavigationPath(prev => [...prev, { id: folderId, name: folderName }]);
  }, []);

  const handleNavigateToRoot = useCallback(() => {
    setCurrentFolderId(null);
    setNavigationPath([]);
  }, []);

  const handleAddToFolder = useCallback(async (folderId: number) => {
    try {
      await addCollectionToFolder({ folderId, collectionId: context.entityId }).unwrap();
      showSuccess('Added to library successfully');
      setShowFolderSelector(false);
      setCurrentFolderId(null);
      setNavigationPath([]);
      onClose();
    } catch (error) {
      showError('Failed to add to library');
    }
  }, [addCollectionToFolder, context.entityId, showSuccess, showError, onClose]);

  const handleAddTrackToPlaylist = useCallback(async (playlistId: number) => {
    try {
      await addTrackToPlaylist({ playlistId, trackId: context.entityId }).unwrap();
      showSuccess('Added to playlist successfully');
      setShowPlaylistSelector(false);
      setCurrentFolderId(null);
      setNavigationPath([]);
      onClose();
    } catch (error) {
      showError('Failed to add to playlist');
    }
  }, [addTrackToPlaylist, context.entityId, showSuccess, showError, onClose]);

  const handleAddToLibrary = useCallback(() => {
    setShowFolderSelector(true);
  }, []);

  const handleAddToLibraryRoot = useCallback(async () => {
    try {
      const rootFolder = allFolders?.find(f => f.parentFolderId === null);

      if (!rootFolder) {
        showError('Root folder not found');
        return;
      }

      await addCollectionToFolder({ folderId: rootFolder.id, collectionId: context.entityId }).unwrap();
      showSuccess('Added to library successfully');
      onClose();
    } catch (error) {
      showError('Failed to add to library');
    }
  }, [allFolders, addCollectionToFolder, context.entityId, showSuccess, showError, onClose]);

  const handleRemoveFromLibrary = useCallback(async () => {
    if (!collectionFolderInfo.folderId) return;

    try {
      removeCollectionFromFolder({ folderId: collectionFolderInfo.folderId, collectionId: context.entityId });
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
      const { data: result } = await dispatch(musicApi.endpoints.getTrack.initiate(trackId, {
        subscribe: false,
        forceRefetch: false,
      }));

      if (result && result.id) {
        addToQueueLocal(result);

        addToQueueMutation(trackId).unwrap().catch(err => {
          console.error('Failed to sync queue with backend:', err);
        });

        onClose();
      } else {
        throw new Error('Track data not found');
      }
    } catch (error) {
      console.error('Failed to add to queue:', error);
      showError('Failed to add to queue');
    }
  }, [dispatch, addToQueueMutation, addToQueueLocal, showSuccess, showError, onClose]);

  const handleRemoveFromQueue = useCallback(async (trackId: number) => {
    try {
      const queueIndex = queue.findIndex((track) => track.id === trackId);

      if (queueIndex !== -1) {
        removeFromQueueLocal(queueIndex);
        showSuccess('Removed from queue');
      }

      await deleteFromQueueMutation(trackId).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to remove from queue:', error);
      showError('Failed to remove from queue');
    }
  }, [queue, removeFromQueueLocal, deleteFromQueueMutation, showSuccess, showError, onClose]);

  const toggleFavorite = useCallback(async (collectionType: string, collectionId: number) => {
    await toggleCollectionFavorite(collectionType, collectionId);
  }, [toggleCollectionFavorite]);

  const handleToggleFavoriteTrack = useCallback(async (trackId: number) => {
    try {
      toggleFavoriteTrackLocal(trackId);

      await toggleTrackFavoriteMutation(trackId).unwrap();
    } catch (error) {
      toggleFavoriteTrackLocal(trackId);
      throw error;
    }
  }, [toggleTrackFavoriteMutation, toggleFavoriteTrackLocal]);

  const helpers: ActionHelpers = useMemo(() => ({
    navigate,
    addToQueue: handleAddToQueue,
    removeFromQueue: handleRemoveFromQueue,
    toggleFavorite,
    toggleFavoriteTrack: handleToggleFavoriteTrack,
    openFolderSelector: handleOpenFolderSelector,
    openPlaylistSelector: handleOpenPlaylistSelector,
    addToLibrary: handleAddToLibrary,
    addToLibraryRoot: handleAddToLibraryRoot,
    isCollectionInLibrary: () => collectionFolderInfo.isInLibrary,
    removeFromLibrary: handleRemoveFromLibrary,
    showSuccess,
    showError,
    closeMenu: onClose,
  }), [navigate, handleAddToQueue, handleRemoveFromQueue, toggleFavorite, handleToggleFavoriteTrack, handleOpenFolderSelector, handleOpenPlaylistSelector, handleAddToLibrary, handleAddToLibraryRoot, collectionFolderInfo.isInLibrary, handleRemoveFromLibrary, showSuccess, showError, onClose]);

  const contextActions = useMemo((): ActionMenuItem[] => {
    const configs = ACTION_CONFIGS[context.type] || [];
    return configs.map(config => {

      if (config.id === 'add-track-to-favorite') {
        return {
          id: config.id,
          label: isInLibrary ? 'Remove from Favorite' : 'Add to Favorite',
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
    let displayFolders: FolderDTO[] = [];
    let currentFolder: FolderDTO | null = null;

    if (currentFolderId !== null) {
      currentFolder = allFolders.find(f => f.id === currentFolderId) || null;

      if (currentFolder && currentFolder.subFolders && currentFolder.subFolders.length > 0) {
        const subfolderIds = currentFolder.subFolders.map(sf => sf.id);
        displayFolders = allFolders.filter(f =>
          subfolderIds.includes(f.id)
        );
      }
    } else {
      const rootFolder = allFolders.find(f => f.parentFolderId === null);
      if (rootFolder) {
        const firstLevelIds = rootFolder.subFolders?.map(sf => sf.id) || [];
        displayFolders = allFolders.filter(f =>
          firstLevelIds.includes(f.id)
        );
      }
    }

    const canAddHere = currentFolder;

    return (
      <Modal isOpen={true} onClose={handleCloseFolderSelector} title="Add to Folder">
        <div className={styles.folderSelector}>
          {navigationPath.length > 0 && (
            <div className={styles.breadcrumb}>
              <button
                onClick={handleNavigateToRoot}
                className={styles.breadcrumbItem}
              >
                Library
              </button>
              {navigationPath.map((path, index) => (
                <React.Fragment key={path.id}>
                  <span className={styles.breadcrumbSeparator}>/</span>
                  <button
                    onClick={() => {
                      const newPath = navigationPath.slice(0, index + 1);
                      setNavigationPath(newPath);
                      setCurrentFolderId(path.id);
                    }}
                    className={styles.breadcrumbItem}
                  >
                    {path.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}

          {canAddHere && (
            <button
              className={styles.addHereButton}
              onClick={() => handleAddToFolder(currentFolderId!)}
              disabled={addingToFolder}
            >
              <PlusIcon className={styles.addHereIcon} />
              <span>Add to "{currentFolder?.name}"</span>
            </button>
          )}

          {displayFolders.length > 0 ? (
            <div className={styles.folderList}>
              {displayFolders.map((folder) => {
                const hasSubfolders = folder.subFolders && folder.subFolders.length > 0;

                return (
                  <button
                    key={folder.id}
                    className={styles.folderItem}
                    onClick={() => {
                      if (hasSubfolders) {
                        handleNavigateToFolder(folder.id, folder.name);
                      } else {
                        handleAddToFolder(folder.id);
                      }
                    }}
                    disabled={addingToFolder}
                  >
                    <FolderCoverIcon className={styles.folderItemIcon} />
                    <span className={styles.folderItemLabel}>{folder.name}</span>
                    {hasSubfolders && <span className={styles.folderItemArrow}>›</span>}
                  </button>
                );
              })}
            </div>
          ) : !canAddHere ? (
            <div className={styles.emptyState}>
              <p>No folders available. Create a folder first in your Library.</p>
            </div>
          ) : null}
        </div>
      </Modal>
    );
  }

  if (showPlaylistSelector) {
    const folderHasPlaylists = (folderId: number | null): boolean => {
      if (folderId === null) {
        const rootFolder = allFolders.find(f => f.parentFolderId === null);
        if (!rootFolder) return false;

        if (rootFolder.collections.some(c => c.type === 'Playlist')) return true;

        if (rootFolder.subFolders && rootFolder.subFolders.length > 0) {
          return rootFolder.subFolders.some(sf => folderHasPlaylists(sf.id));
        }
        return false;
      }

      const folder = allFolders.find(f => f.id === folderId);
      if (!folder) return false;

      if (folder.collections.some(c => c.type === 'Playlist')) return true;

      if (folder.subFolders && folder.subFolders.length > 0) {
        return folder.subFolders.some(sf => folderHasPlaylists(sf.id));
      }

      return false;
    };

    const getPlaylistIdsInSubfolders = (folderId: number): Set<number> => {
      const playlistIds = new Set<number>();
      const folder = allFolders.find(f => f.id === folderId);

      if (!folder || !folder.subFolders) return playlistIds;

      for (const subfolder of folder.subFolders) {
        const subfolderData = allFolders.find(f => f.id === subfolder.id);
        if (subfolderData) {
          subfolderData.collections
            .filter(c => c.type === 'Playlist')
            .forEach(p => playlistIds.add(p.id));

          const nestedIds = getPlaylistIdsInSubfolders(subfolder.id);
          nestedIds.forEach(id => playlistIds.add(id));
        }
      }

      return playlistIds;
    };

    let displayFolders: FolderDTO[] = [];
    let displayPlaylists: CollectionSummaryDTO[] = [];
    let currentFolder: FolderDTO | null = null;

    if (currentFolderId !== null) {
      currentFolder = allFolders.find(f => f.id === currentFolderId) || null;

      if (currentFolder) {
        const subfolderPlaylistIds = getPlaylistIdsInSubfolders(currentFolderId);

        displayPlaylists = currentFolder.collections.filter(
          c => c.type === 'Playlist' && !subfolderPlaylistIds.has(c.id)
        );

        if (currentFolder.subFolders && currentFolder.subFolders.length > 0) {
          const subfolderIds = currentFolder.subFolders
            .filter(sf => folderHasPlaylists(sf.id))
            .map(sf => sf.id);
          displayFolders = allFolders.filter(f => subfolderIds.includes(f.id));
        }
      }
    } else {
      const rootFolder = allFolders.find(f => f.parentFolderId === null || f.parentFolderId === undefined);
      if (rootFolder) {
        const subfolderPlaylistIds = getPlaylistIdsInSubfolders(rootFolder.id);

        displayPlaylists = rootFolder.collections.filter(
          c => c.type === 'Playlist' && !subfolderPlaylistIds.has(c.id)
        );

        const firstLevelIds = rootFolder.subFolders
          ?.filter(sf => folderHasPlaylists(sf.id))
          .map(sf => sf.id) || [];
        displayFolders = allFolders.filter(f => firstLevelIds.includes(f.id));
      }
    }

    return (
      <Modal isOpen={true} onClose={handleClosePlaylistSelector} title="Add to Playlist">
        <div className={styles.folderSelector}>
          {navigationPath.length > 0 && (
            <div className={styles.breadcrumb}>
              <button
                onClick={handleNavigateToRoot}
                className={styles.breadcrumbItem}
              >
                Library
              </button>
              {navigationPath.map((path, index) => (
                <React.Fragment key={path.id}>
                  <span className={styles.breadcrumbSeparator}>/</span>
                  <button
                    onClick={() => {
                      const newPath = navigationPath.slice(0, index + 1);
                      setNavigationPath(newPath);
                      setCurrentFolderId(path.id);
                    }}
                    className={styles.breadcrumbItem}
                  >
                    {path.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}

          {(displayFolders.length > 0 || displayPlaylists.length > 0) ? (
            <div className={styles.folderList}>
              {/* Render folders first */}
              {displayFolders.map((folder) => (
                <button
                  key={`folder-${folder.id}`}
                  className={styles.folderItem}
                  onClick={() => handleNavigateToFolder(folder.id, folder.name)}
                  disabled={addingToPlaylist}
                >
                  <FolderCoverIcon className={styles.folderItemIcon} />
                  <span className={styles.folderItemLabel}>{folder.name}</span>
                  <span className={styles.folderItemArrow}>›</span>
                </button>
              ))}

              {/* Render playlists below folders */}
              {displayPlaylists.map((playlist) => (
                <button
                  key={`playlist-${playlist.id}`}
                  className={styles.folderItem}
                  onClick={() => handleAddTrackToPlaylist(playlist.id)}
                  disabled={addingToPlaylist}
                >
                  <PlusIcon className={styles.folderItemIcon} />
                  <span className={styles.folderItemLabel}>{playlist.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No playlists available. Create a playlist first in your Library.</p>
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
