import React, { useState } from 'react';
import { ShareComponent, type ShareEntityType } from '@widgets/ShareComponent';
import { Button, MoreIcon } from '@shared/ui';

export const SimpleShareExample = () => {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setShareOpen(true)}>
        Share
      </Button>

      <ShareComponent
        entityType="Track"
        entityId={1}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
};

export const ThreeDotMenuExample = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleShareClick = () => {
    setMenuOpen(false);
    setShareOpen(true);
  };

  return (
    <>
      <Button
        icon={<MoreIcon />}
        iconOnly
        onClick={() => setMenuOpen(true)}
        aria-label="More options"
      />

      {menuOpen && (
        <div className="options-modal">
          <button onClick={handleShareClick}>Share</button>
          <button onClick={() => setMenuOpen(false)}>Report</button>
        </div>
      )}

      <ShareComponent
        entityType="Track"
        entityId={1}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
};

interface DynamicShareExampleProps {
  entityType: ShareEntityType;
  entityId: number;
  entityName: string;
}

export const DynamicShareExample: React.FC<DynamicShareExampleProps> = ({
  entityType,
  entityId,
  entityName,
}) => {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setShareOpen(true)}>
        Share {entityName}
      </Button>

      <ShareComponent
        entityType={entityType}
        entityId={entityId}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`Share ${entityName}`}
      />
    </>
  );
};

interface AlbumPageExampleProps {
  albumId: number;
  albumName: string;
}

export const AlbumPageExample: React.FC<AlbumPageExampleProps> = ({
  albumId,
  albumName,
}) => {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="album-page">
      <div className="album-header">
        <h1>{albumName}</h1>
        <Button
          icon={<MoreIcon />}
          onClick={() => setShareOpen(true)}
        >
          Share
        </Button>
      </div>

      <ShareComponent
        entityType="Album"
        entityId={albumId}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`Share "${albumName}"`}
      />
    </div>
  );
};

interface SearchResultTrackProps {
  trackId: number;
  trackName: string;
  artistName: string;
}

export const SearchResultTrack: React.FC<SearchResultTrackProps> = ({
  trackId,
  trackName,
  artistName,
}) => {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="track-item">
      <div className="track-info">
        <span className="track-name">{trackName}</span>
        <span className="artist-name">{artistName}</span>
      </div>
      
      <Button
        iconOnly
        icon={<MoreIcon />}
        size="small"
        onClick={() => setShareOpen(true)}
      />

      <ShareComponent
        entityType="Track"
        entityId={trackId}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
};

