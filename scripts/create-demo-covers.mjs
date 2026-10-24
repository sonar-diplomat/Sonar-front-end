// SPDX-License-Identifier: CC0-1.0
// Original procedural geometry; no external artwork, photographs or fonts.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { sha256 } from './media-lib.mjs';

export const coverIds = [101, 102, 103, 201, 202, 203, 204, 301, 302, 303, 304, 305, 401, 402];
export function coverSvg(id) {
  const hue = (id * 137) % 360;
  const lines = Array.from({ length: 7 }, (_, index) => {
    const y = 80 + index * 56;
    const offset = ((id + index) % 5) * 28;
    return `<path d="M-60 ${y} Q${90 + offset} ${y - 160} 256 ${y} T580 ${y}" fill="none" stroke="hsl(${(hue + index * 13) % 360} 84% 74%)" stroke-width="${7 + index * 2}" opacity="${0.25 + index * 0.1}"/>`;
  }).join('');
  const center = 170 + (id % 4) * 50;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>Sonar geometric cover ${id}</title><rect width="512" height="512" rx="32" fill="hsl(${hue} 45% 14%)"/><circle cx="${center}" cy="190" r="${75 + id % 70}" fill="hsl(${(hue + 48) % 360} 68% 57%)" opacity=".65"/>${lines}<circle cx="${512 - center}" cy="365" r="35" fill="hsl(${(hue + 180) % 360} 80% 80%)"/><path d="M56 450h400" stroke="white" stroke-width="3" opacity=".4"/></svg>\n`;
}
export async function createCovers(root = process.cwd()) {
  await mkdir(path.join(root, 'demo/images'), { recursive: true });
  const images = [];
  for (const id of coverIds) {
    const data = Buffer.from(coverSvg(id));
    await writeFile(path.join(root, `demo/images/${id}.svg`), data);
    images.push({ id, path: `images/${id}.svg`, mime: 'image/svg+xml', bytes: data.length, sha256: sha256(data), licenseId: 'original-covers' });
  }
  return images;
}
