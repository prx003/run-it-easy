import { drawStoryLayers, type StoryDesign } from './story-design';
export type SocialKind = 'Post' | 'Reel' | 'Story';
export type MediaFilter = 'original' | 'mono' | 'vivid' | 'warm';
export const filterValues: Record<MediaFilter, string> = {
  original: 'none', mono: 'grayscale(1)', vivid: 'saturate(1.5) contrast(1.08)', warm: 'sepia(.25) saturate(1.2)',
};
export const mediaLimits: Record<SocialKind, { accept: string; max: number }> = {
  Post: { accept: 'image/', max: 10 }, Reel: { accept: 'video/', max: 1 }, Story: { accept: 'image/,video/', max: 1 },
};
export function validateMedia(kind: SocialKind, files: File[], existing = 0): string | null {
  const rule = mediaLimits[kind];
  if (existing + files.length > rule.max) return `Choose up to ${rule.max} ${kind === 'Post' ? 'photos' : 'file'}.`;
  if (files.some(file => !rule.accept.split(',').some(prefix => file.type.startsWith(prefix)))) return kind === 'Reel' ? 'Choose a video file.' : kind === 'Post' ? 'Choose image files.' : 'Choose a photo or video.';
  if (files.some(file => file.size > 50 * 1024 * 1024)) return 'Each file must be under 50 MB.';
  return null;
}
export async function preparePhoto(file: File, ratio: string, filter: MediaFilter, overlay: string, story?: StoryDesign): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const target = ratio === 'original' ? bitmap.width / bitmap.height : ratio === 'portrait' ? 4 / 5 : ratio === 'story' ? 9 / 16 : 1;
    const width = Math.min(bitmap.width, bitmap.height * target);
    const height = width / target;
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(1600, Math.round(width)); canvas.height = Math.round(canvas.width / target);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Photo editing is unavailable.');
    context.filter = filterValues[filter];
    context.drawImage(bitmap, (bitmap.width - width) / 2, (bitmap.height - height) / 2, width, height, 0, 0, canvas.width, canvas.height);
    if (overlay.trim()) {
      context.filter = 'none'; context.textAlign = 'center';
      // Canvas text is baked into exported media, not a UI color.
      context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-foreground').trim();
      context.shadowColor = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
      context.shadowBlur = 8;
      const fontSize = Math.max(18, Math.round(canvas.width / 17));
      context.font = `700 ${fontSize}px sans-serif`;
      const words = overlay.trim().split(/\s+/); const lines: string[] = []; let line = '';
      for (const word of words) { const next = `${line} ${word}`.trim(); if (context.measureText(next).width > canvas.width * .82 && line) { lines.push(line); line = word; } else line = next; }
      if (line) lines.push(line);
      lines.slice(0, 6).forEach((text, i) => context.fillText(text, canvas.width / 2, canvas.height * .65 + i * fontSize * 1.2, canvas.width * .82));
    }
    if (story) drawStoryLayers(context, canvas.width, canvas.height, story);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not export photo.')), 'image/jpeg', .9));
  } finally { bitmap.close(); }
}