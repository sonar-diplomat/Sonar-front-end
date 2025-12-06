const STICKER_PATTERN = /^:sticker:(\d+):$/;

export function isStickerMessage(text: string): boolean {
  return STICKER_PATTERN.test(text.trim());
}

export function extractStickerId(text: string): number | null {
  const match = text.trim().match(STICKER_PATTERN);
  return match ? parseInt(match[1], 10) : null;
}