import { useRef, useState, type PointerEvent } from 'react';
import { AlignCenter, MapPin, Plus, Redo2, Smile, Trash2, Type, Undo2, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { emptyStory, storyStickers, updateStoryLayer, type StoryDesign, type StoryLayer } from '@/lib/story-design';

export function useStoryEditor() {
  const [history, setHistory] = useState<StoryDesign[]>([emptyStory]); const [cursor, setCursor] = useState(0);
  const design = history[cursor] ?? emptyStory;
  const change = (next: StoryDesign) => { setHistory([...history.slice(0, cursor + 1), next].slice(-40)); setCursor(Math.min(cursor + 1, 39)); };
  return { design, change, undo: () => setCursor(Math.max(0, cursor - 1)), redo: () => setCursor(Math.min(history.length - 1, cursor + 1)), canUndo: cursor > 0, canRedo: cursor < history.length - 1 };
}
export type StoryEditorState = ReturnType<typeof useStoryEditor>;
export function StoryLayers({ editor, selected, onSelect, editable }: { editor: StoryEditorState; selected: string | null; onSelect: (id: string) => void; editable: boolean }) {
  const drag = useRef<{ id: string; x: number; y: number } | null>(null);
  const [position, setPosition] = useState<{ id: string; x: number; y: number } | null>(null);
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const bounds = event.currentTarget.parentElement?.getBoundingClientRect(); if (!bounds) return;
    setPosition({ id: drag.current.id, x: Math.max(10, Math.min(90, (event.clientX - bounds.left) / bounds.width * 100)), y: Math.max(10, Math.min(90, (event.clientY - bounds.top) / bounds.height * 100)) });
  };
  return <div className="story-layer-stage">{editor.design.layers.map(layer => {
    const point = position?.id === layer.id ? position : layer;
    return <div key={layer.id} role={editable ? 'button' : undefined} tabIndex={editable ? 0 : undefined} aria-label={editable ? `Edit sticker: ${layer.text}` : undefined} className={`story-layer story-tone-${layer.tone} story-style-${layer.style} ${editable && selected === layer.id ? 'is-selected' : ''}`} style={{ left: `${point.x}%`, top: `${point.y}%`, fontSize: `${layer.size}cqw` }}
      onPointerDown={event => { if (!editable) return; event.preventDefault(); onSelect(layer.id); drag.current = { id: layer.id, x: layer.x, y: layer.y }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={move}
      onPointerUp={() => { if (position) editor.change(updateStoryLayer(editor.design, layer.id, position)); setPosition(null); drag.current = null; }} onPointerCancel={() => { setPosition(null); drag.current = null; }}
      onKeyDown={event => { if (!editable) return; const delta: Record<string, [number, number]> = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }; const offset = delta[event.key]; if (offset) { event.preventDefault(); editor.change(updateStoryLayer(editor.design, layer.id, { x: layer.x + offset[0], y: layer.y + offset[1] })); } else if (event.key === 'Enter') onSelect(layer.id); }}>
      {layer.text}
    </div>;
  })}</div>;
}
export function StoryEditor({ editor, selected, onSelect }: { editor: StoryEditorState; selected: string | null; onSelect: (id: string | null) => void }) {
  const [tool, setTool] = useState<'text' | 'stickers' | 'location' | 'mention'>('text'); const [value, setValue] = useState('');
  const layer = editor.design.layers.find(item => item.id === selected);
  const update = (patch: Partial<StoryLayer>) => { if (layer) editor.change(updateStoryLayer(editor.design, layer.id, patch)); };
  const add = (text: string, style: StoryLayer['style'] = 'clean') => { if (!text.trim() || editor.design.layers.length >= 8) return; const id = crypto.randomUUID(); editor.change({ layers: [...editor.design.layers, { id, text: text.trim(), x: 50, y: 35 + editor.design.layers.length * 6, size: 7, tone: 'light', style }] }); onSelect(id); setValue(''); };
  return <section className="story-editor">
    <div className="flex items-center justify-between"><span className="social-label mb-0">Story studio</span><div className="flex gap-1"><Button size="icon" variant="ghost" title="Undo" aria-label="Undo story edit" disabled={!editor.canUndo} onClick={editor.undo}><Undo2 /></Button><Button size="icon" variant="ghost" title="Redo" aria-label="Redo story edit" disabled={!editor.canRedo} onClick={editor.redo}><Redo2 /></Button></div></div>
    <div className="story-tools">{([{ id: 'text', icon: Type, label: 'Text' }, { id: 'stickers', icon: Smile, label: 'Stickers' }, { id: 'location', icon: MapPin, label: 'Location' }, { id: 'mention', icon: AtSign, label: 'Mention' }] as const).map(({ id, icon: Icon, label }) => <Button key={id} variant={tool === id ? 'secondary' : 'ghost'} aria-pressed={tool === id} onClick={() => { setTool(id); onSelect(null); setValue(''); }}><Icon /><span>{label}</span></Button>)}</div>
    {tool === 'stickers' ? <div className="story-stickers">{storyStickers.map(sticker => <Button key={sticker} variant="outline" aria-label={`Add ${sticker} sticker`} disabled={editor.design.layers.length >= 8} onClick={() => add(sticker)}>{sticker}</Button>)}</div> : <div className="space-y-2"><label className="social-label" htmlFor="story-new-layer">{tool === 'text' ? 'Add text' : tool === 'mention' ? 'Mention label' : 'Location label'}</label>{tool === 'text' ? <Textarea id="story-new-layer" placeholder="Your moment, your words…" maxLength={150} value={value} onChange={event => setValue(event.target.value)} /> : <Input id="story-new-layer" placeholder={tool === 'mention' ? '@name' : 'Where are you?'} maxLength={60} value={value} onChange={event => setValue(event.target.value)} />}<Button variant="outline" size="sm" disabled={!value.trim() || editor.design.layers.length >= 8} onClick={() => add(tool === 'location' ? `📍 ${value}` : tool === 'mention' ? `@${value.replace(/^@/, '')}` : value, tool === 'text' ? 'clean' : 'label')}><Plus />Add {tool === 'text' ? 'text' : 'label'}</Button></div>}
    {layer && <div className="story-layer-settings space-y-4">
      <div className="flex items-center justify-between"><span className="social-label mb-0">Selected layer</span><Button size="icon" variant="ghost" title="Delete layer" aria-label="Delete story layer" onClick={() => { editor.change({ layers: editor.design.layers.filter(item => item.id !== layer.id) }); onSelect(null); }}><Trash2 /></Button></div>
      <Textarea aria-label="Selected story text" maxLength={150} value={layer.text} onChange={event => update({ text: event.target.value })} />
      <div className="flex flex-wrap items-center gap-2">{(['clean', 'label', 'type'] as const).map(style => <Button key={style} variant={layer.style === style ? 'secondary' : 'outline'} size="sm" aria-pressed={layer.style === style} onClick={() => update({ style })}>{style === 'clean' ? 'Bold' : style === 'label' ? 'Label' : 'Type'}</Button>)}<Button variant="ghost" size="icon" aria-label="Center layer" title="Center layer" onClick={() => update({ x: 50, y: 50 })}><AlignCenter /></Button></div>
      <div className="flex gap-3">{(['light', 'red', 'gold'] as const).map(tone => <Button key={tone} size="icon" variant="outline" className={`story-swatch story-tone-${tone}`} aria-label={`${tone} text`} title={`${tone} text`} aria-pressed={layer.tone === tone} onClick={() => update({ tone })}><span /></Button>)}</div>
      <label className="block space-y-3"><span className="social-label">Size</span><Slider aria-label="Story text size" min={4} max={12} step={.5} value={[layer.size]} onValueChange={([size]) => { if (size !== undefined) update({ size }); }} /></label>
      <div className="grid grid-cols-2 gap-4">{(['x', 'y'] as const).map(axis => <label key={axis} className="space-y-3"><span className="social-label">{axis === 'x' ? 'Horizontal' : 'Vertical'}</span><Slider aria-label={`${axis === 'x' ? 'Horizontal' : 'Vertical'} position`} min={10} max={90} step={1} value={[layer[axis]]} onValueChange={([point]) => { if (point !== undefined) update({ [axis]: point }); }} /></label>)}</div>
    </div>}
  </section>;
}