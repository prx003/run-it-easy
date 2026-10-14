import { describe, expect, it } from 'vitest';
import { validateMedia } from '@/lib/social-media';
import { emptyStory, updateStoryLayer } from '@/lib/story-design';
describe('Social creation media validation', () => {
  const photo = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
  const video = new File(['video'], 'video.mp4', { type: 'video/mp4' });
  it('accepts photo carousels and rejects videos in photo posts', () => {
    expect(validateMedia('Post', [photo, photo])).toBeNull();
    expect(validateMedia('Post', [video])).toBe('Choose image files.');
  });
  it('enforces the ten-photo limit without silently dropping files', () => {
    expect(validateMedia('Post', [photo], 10)).toContain('10');
  });
  it('accepts one video for reels and either media type for stories', () => {
    expect(validateMedia('Reel', [video])).toBeNull();
    expect(validateMedia('Reel', [photo])).toBe('Choose a video file.');
    expect(validateMedia('Story', [photo])).toBeNull();
    expect(validateMedia('Story', [video])).toBeNull();
    expect(validateMedia('Story', [photo, video])).toContain('1');
  });
  it('keeps story positions inside the canvas without mutating history', () => {
    const design = { layers: [{ id: 'text', text: 'My moment', x: 50, y: 50, size: 7, tone: 'light' as const, style: 'clean' as const }] };
    const next = updateStoryLayer(design, 'text', { x: -20, y: 120, text: 'New moment' });
    expect(next.layers[0]).toMatchObject({ x: 10, y: 90, text: 'New moment' });
    expect(design.layers[0]).toMatchObject({ x: 50, y: 50, text: 'My moment' });
    expect(emptyStory.layers).toEqual([]);
  });
});