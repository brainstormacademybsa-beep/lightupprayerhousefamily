/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeeklyTheme, ProgramItem } from '../types';

export const DEFAULT_THEME_FLYERS = [
  { label: 'Divine Assignment', url: '/theme_assignment.jpg' },
  { label: 'Chosen for Greatness', url: '/theme_greatness.jpg' },
  { label: 'Let Fire Fall', url: '/theme_fire.jpg' },
  { label: 'Presence of God', url: '/theme_presence.jpg' }
];

export const DEFAULT_PROGRAM_FLYERS = [
  { label: 'Lagos Revival Rally', url: '/flyer_lagos.jpg' },
  { label: 'Edo State Crusade', url: '/flyer_edo.jpg' },
  { label: 'Asaba Prophetic Encounter', url: '/flyer_asaba.jpg' }
];

/**
 * Safely resolves the flyer/image URL for a weekly theme, falling back to bundled default
 */
export function getThemeFlyerUrl(theme?: Partial<WeeklyTheme> | null): string {
  if (!theme) return '/theme_assignment.jpg';
  const candidate = theme.imageUrl || theme.flyerUrl || (theme as any).flyer_url || (theme as any).image_url;
  if (candidate && typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate.trim();
  }
  return '/theme_assignment.jpg';
}

/**
 * Safely resolves the flyer/image URL for a program rally
 */
export function getProgramFlyerUrl(program?: Partial<ProgramItem> | null): string {
  if (!program) return '/flyer_lagos.jpg';
  const candidate = program.imageUrl || (program as any).flyerUrl || (program as any).flyer_url || (program as any).image_url;
  if (candidate && typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate.trim();
  }
  return '/flyer_lagos.jpg';
}

/**
 * Compresses an image file from a camera or photo library to a lightweight Web-safe JPEG DataURL
 * Keeps document size well within Firestore's 1MB limit (~100KB - 250KB)
 */
export function compressImageFile(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG or tiny GIF, read directly
    if (file.type === 'image/svg+xml' || (file.size < 60 * 1024 && !file.type.includes('heic'))) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Clean white background in case of transparent PNG/WebP conversion
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        // Fallback to raw data url if Image object decoding fails
        resolve(event.target?.result as string);
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
