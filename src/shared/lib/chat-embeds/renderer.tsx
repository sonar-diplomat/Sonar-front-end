import React from 'react';
import { splitTextWithEmbeds, shouldShowEmbed } from './parser';
import { TrackEmbed } from './widgets/TrackEmbed';
import { CollectionEmbed } from './widgets/CollectionEmbed';
import type { EmbedMatch } from './types';
import styles from './MessageContent.module.css';

export interface MessageContentRendererProps {
  text: string;
}

export const MessageContentRenderer: React.FC<MessageContentRendererProps> = ({ text }) => {
  const showEmbed = shouldShowEmbed(text);
  const segments = splitTextWithEmbeds(text);

  if (showEmbed) {
    return (
      <div className={styles.container}>
        {segments.map((segment, index) => {
          if (segment.type === 'embed' && segment.embed) {
            return <EmbedComponent key={index} embed={segment.embed} url={segment.content} />;
          }
          return null;
        })}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return (
            <span key={index} className={styles.text}>
              {segment.content}
            </span>
          );
        }

        return (
          <a
            key={index}
            href={segment.content}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            {segment.content}
          </a>
        );
      })}
    </div>
  );
};

function EmbedComponent({ embed, url }: { embed: EmbedMatch; url: string }) {
  switch (embed.type) {
    case 'track':
      return <TrackEmbed trackId={embed.id} url={url} />;
    case 'album':
      return <CollectionEmbed collectionId={embed.id} url={url} />;
    case 'playlist':
      return <CollectionEmbed collectionId={embed.id} url={url} />;
    default:
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={styles.link}>
          {url}
        </a>
      );
  }
}

