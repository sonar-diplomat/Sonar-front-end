import { FRONTEND_BASE_URL } from '@shared/config';
import type { EmbedMatch, EmbedRule } from './types';

/**
 * Normalizes domain for comparison (removes www, protocol, trailing slashes)
 */
function normalizeDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    // If URL parsing fails, try to extract domain manually
    const match = url.match(/https?:\/\/(?:www\.)?([^\/]+)/i);
    return match ? match[1].toLowerCase() : '';
  }
}

/**
 * Gets the normalized domain from FRONTEND_BASE_URL
 */
function getFrontendDomain(): string {
  try {
    return normalizeDomain(FRONTEND_BASE_URL);
  } catch {
    return 'sonar-dev.pp.ua';
  }
}

/**
 * Embed rules registry
 */
const EMBED_RULES: EmbedRule[] = [
  {
    type: 'track',
    pattern: /^\/track\/(\d+)/,
    extractId: (url) => {
      const match = url.pathname.match(/^\/track\/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    },
  },
  {
    type: 'album',
    pattern: /^\/album\/(\d+)/,
    extractId: (url) => {
      const match = url.pathname.match(/^\/album\/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    },
  },
  {
    type: 'playlist',
    pattern: /^\/playlist\/(\d+)/,
    extractId: (url) => {
      const match = url.pathname.match(/^\/playlist\/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    },
  },
];

/**
 * Detects all embed matches in a text string
 */
export function detectEmbedsFromMessage(text: string): EmbedMatch[] {
  const matches: EmbedMatch[] = [];
  const frontendDomain = getFrontendDomain();

  // Regex to find URLs in text
  const urlRegex = /https?:\/\/[^\s]+/gi;
  let urlMatch;

  while ((urlMatch = urlRegex.exec(text)) !== null) {
    const urlString = urlMatch[0];
    let url: URL;

    try {
      url = new URL(urlString);
    } catch {
      continue;
    }

    // Check if domain matches our frontend domain
    const urlDomain = normalizeDomain(urlString);
    if (urlDomain !== frontendDomain) {
      continue;
    }

    // Try each embed rule
    for (const rule of EMBED_RULES) {
      if (rule.pattern.test(url.pathname)) {
        const id = rule.extractId(url);
        if (id !== null) {
          matches.push({
            type: rule.type,
            id,
            url: urlString,
            startIndex: urlMatch.index,
            endIndex: urlMatch.index + urlMatch[0].length,
          });
          break; // Only match first rule that matches
        }
      }
    }
  }

  // Sort by start index
  return matches.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Splits text into segments (text and embed)
 */
export function splitTextWithEmbeds(text: string): Array<{ type: 'text' | 'embed'; content: string; embed?: EmbedMatch }> {
  const embeds = detectEmbedsFromMessage(text);
  const segments: Array<{ type: 'text' | 'embed'; content: string; embed?: EmbedMatch }> = [];

  if (embeds.length === 0) {
    return [{ type: 'text', content: text }];
  }

  let lastIndex = 0;

  for (const embed of embeds) {
    // Add text before embed
    if (embed.startIndex > lastIndex) {
      segments.push({
        type: 'text',
        content: text.substring(lastIndex, embed.startIndex),
      });
    }

    // Add embed
    segments.push({
      type: 'embed',
      content: embed.url,
      embed,
    });

    lastIndex = embed.endIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  return segments;
}

/**
 * Checks if message should show embed (only link, no other text)
 */
export function shouldShowEmbed(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const embeds = detectEmbedsFromMessage(trimmed);
  if (embeds.length === 0) return false;

  // Check if the entire message is just the embed URL(s)
  const textWithoutEmbeds = embeds
    .reduce((acc, embed) => {
      return acc.replace(embed.url, '').trim();
    }, trimmed)
    .trim();

  return textWithoutEmbeds.length === 0;
}

