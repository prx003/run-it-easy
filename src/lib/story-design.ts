export type StoryLayer = { id: string; text: string; x: number; y: number; size: number; tone: 'light' | 'red' | 'gold'; style: 'clean' | 'label' | 'type' };
export type StoryDesign = { layers: StoryLayer[] };
export const emptyStory: StoryDesign = { layers: [] };
export const storyStickers = ['❤️', '🔥', '✨', '🙌', '🎉', '📍', '🏆', '🎵'];
export function updateStoryLayer(design: StoryDesign, id: string, patch: Partial<StoryLayer>): StoryDesign {
  return { layers: design.layers.map(layer => layer.id === id ? { ...layer, ...patch, x: Math.min(90, Math.max(10, patch.x ?? layer.x)), y: Math.min(90, Math.max(10, patch.y ?? layer.y)) } : layer) };
}
export function drawStoryLayers(context: CanvasRenderingContext2D, width: number, height: number, design: StoryDesign) {
  const tokens = getComputedStyle(document.documentElement);
  context.filter = 'none'; context.textAlign = 'center'; context.textBaseline = 'middle';
  for (const layer of design.layers) {
    const font = width * layer.size / 100;
    context.font = `${layer.style === 'type' ? 500 : 700} ${font}px ${layer.style === 'type' ? 'monospace' : tokens.getPropertyValue('--font-sans').trim() || 'sans-serif'}`;
    const lines: string[] = []; let line = '';
    for (const word of layer.text.split(/\s+/)) {
      const next = `${line} ${word}`.trim();
      if (context.measureText(next).width > width * .8 && line) { lines.push(line); line = word; } else line = next;
    }
    if (line) lines.push(line);
    const x = width * layer.x / 100; const y = height * layer.y / 100;
    const shown = lines.slice(0, 6);
    shown.forEach((text, i) => {
      const cy = y + (i - (shown.length - 1) / 2) * font * 1.2;
      if (layer.style === 'label') {
        context.fillStyle = tokens.getPropertyValue('--story-label').trim();
        context.fillRect(x - Math.min(context.measureText(text).width, width * .8) / 2 - font * .3, cy - font * .65, Math.min(context.measureText(text).width, width * .8) + font * .6, font * 1.3);
      }
      context.fillStyle = tokens.getPropertyValue(`--story-${layer.tone}`).trim();
      context.shadowColor = tokens.getPropertyValue('--ink').trim(); context.shadowBlur = layer.style === 'label' ? 0 : width / 80;
      context.fillText(text, x, cy, width * .8); context.shadowBlur = 0;
    });
  }
}