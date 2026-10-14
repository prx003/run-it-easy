import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, MapPin, SlidersHorizontal, Trash2, Upload, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAccount } from '@/lib/account';
import { supabase } from '@/integrations/supabase/client';
import { filterValues, mediaLimits, preparePhoto, validateMedia, type MediaFilter, type SocialKind } from '@/lib/social-media';
import { StoryEditor, StoryLayers, useStoryEditor } from './StoryEditor';

type Media = { file: File; url: string; filter: MediaFilter };
export function SocialComposer({ kind, onClose, onBack }: { kind: SocialKind; onClose: () => void; onBack: () => void }) {
  const { user, profile } = useAccount(); const queries = useQueryClient();
  const [media, setMedia] = useState<Media[]>([]); const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0); const [ratio, setRatio] = useState(kind === 'Story' ? 'story' : 'square');
  const [caption, setCaption] = useState(''); const [location, setLocation] = useState('');
  const storyEditor = useStoryEditor(); const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [tagged, setTagged] = useState(''); const [alt, setAlt] = useState(''); const [audience, setAudience] = useState('everyone');
  const [comments, setComments] = useState(true); const [hideLikes, setHideLikes] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [dragging, setDragging] = useState(false);
  const picker = useRef<HTMLInputElement>(null); const urls = useRef(new Set<string>());
  useEffect(() => () => urls.current.forEach(url => URL.revokeObjectURL(url)), []);
  const active = media[index]; const video = active?.file.type.startsWith('video/');
  const pick = (files: File[]) => {
    if (!files.length) return;
    const message = validateMedia(kind, files, kind === 'Post' ? media.length : 0);
    if (message) { setError(message); return; }
    const next = files.map(file => { const url = URL.createObjectURL(file); urls.current.add(url); return { file, url, filter: 'original' as MediaFilter }; });
    setMedia(kind === 'Post' ? [...media, ...next] : next); setError(''); setStep(1); setIndex(kind === 'Post' ? media.length : 0);
  };
  const remove = () => { setMedia(media.filter((_, i) => i !== index)); setIndex(Math.max(0, index - 1)); if (media.length === 1) setStep(0); };
  const move = (direction: number) => { const target = index + direction; if (target < 0 || target >= media.length) return; const next = [...media]; const item = next[index]; const other = next[target]; if (!item || !other) return; next[index] = other; next[target] = item; setMedia(next); setIndex(target); };
  const share = async () => {
    if (!user || !media.length || busy) return;
    setBusy(true); setProgress(0); setError(''); const paths: string[] = [];
    try {
      for (const item of media) {
        const isVideo = item.file.type.startsWith('video/');
        const data = isVideo ? item.file : await preparePhoto(item.file, ratio, item.filter, '', kind === 'Story' ? storyEditor.design : undefined);
        const extension = isVideo ? item.file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'mp4' : 'jpg';
        const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const upload = await supabase.storage.from('community-media').upload(path, data, { contentType: data.type });
        if (upload.error) throw upload.error; paths.push(path); setProgress(Math.round(paths.length / media.length * 90));
      }
      const result = await supabase.from('community_content').insert({ user_id: user.id, kind: kind.toLowerCase(), caption: caption.trim(), media: paths, details: { location: location.trim(), tagged: tagged.trim(), alt: alt.trim(), audience, allow_comments: comments, hide_likes: hideLikes, tags: caption.match(/#[\p{L}\p{N}_]+/gu)?.map(tag => tag.slice(1)) ?? [], ...(kind === 'Story' ? { duration_h: 24 } : {}) } });
      if (result.error) throw result.error;
      await queries.invalidateQueries({ queryKey: ['community-content'] });
      setProgress(100); toast.success(`${kind} shared`); onClose();
    } catch (failure) {
      if (paths.length) await supabase.storage.from('community-media').remove(paths);
      setError(failure && typeof failure === 'object' && 'message' in failure ? String(failure.message) : 'Could not share. Please try again.');
    } finally { setBusy(false); }
  };
  return <div className={`social-composer ${kind === 'Story' ? 'is-story' : ''}`}>
    <header className="social-composer-header">
      <Button variant="ghost" size="icon" aria-label="Back" disabled={busy} onClick={() => step ? setStep(step - 1) : onBack()}><ArrowLeft /></Button>
      <div className="text-center"><h2 className="text-base font-semibold">New {kind.toLowerCase()}</h2><p className="text-xs text-muted-foreground">{['Choose media', 'Edit media', 'Ready to share'][step]}</p></div>
      {step === 2 ? <Button onClick={share} disabled={busy}>{busy ? <LoaderCircle className="animate-spin" /> : <Check />}{busy ? 'Sharing' : 'Share'}</Button> : <Button onClick={() => setStep(step + 1)} disabled={!media.length}>Next<ArrowRight /></Button>}
    </header>
    <nav className="social-progress-nav" aria-label="Creation steps">{['Media', 'Edit', 'Share'].map((label, value) => <Button key={label} variant="ghost" className={value === step ? 'is-active' : ''} disabled={busy || value > step} aria-current={value === step ? 'step' : undefined} onClick={() => setStep(value)}><span>{value < step ? <Check /> : `0${value + 1}`}</span>{label}</Button>)}</nav>
    <input ref={picker} type="file" className="sr-only" aria-label={`Upload ${kind.toLowerCase()} media`} accept={kind === 'Post' ? 'image/*' : kind === 'Reel' ? 'video/*' : 'image/*,video/*'} multiple={kind === 'Post'} onChange={e => { pick(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
    {step === 0 ? <div className={`social-dropzone ${dragging ? 'is-dragging' : ''}`} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); pick(Array.from(e.dataTransfer.files)); }}>
      <span className="social-upload-icon"><ImagePlus /></span><h3 className="text-xl font-semibold">{kind === 'Reel' ? 'Your next reel starts here' : kind === 'Story' ? 'A moment worth sharing' : 'Make it a moment'}</h3>
      <p className="text-sm text-muted-foreground">{kind === 'Post' ? 'Photos · up to 10' : kind === 'Reel' ? 'One video' : 'One photo or video'} · 50 MB each</p>
      <Button size="lg" onClick={() => picker.current?.click()}><Upload />Choose {kind === 'Reel' ? 'video' : 'media'}</Button>
    </div> : <div className="social-composer-body" key={step}>
      <div className="social-media-column">
        <div className={`social-preview ratio-${video ? 'story' : ratio} filter-${active?.filter ?? 'original'}`}>
          {active && (video ? <video src={active.url} controls playsInline className="social-preview-media" /> : <img src={active.url} alt={alt || 'Media preview'} className="social-preview-media" />)}
          {kind === 'Story' && !video && <StoryLayers editor={storyEditor} selected={selectedLayer} onSelect={setSelectedLayer} editable={step === 1} />}
          {media.length > 1 && <><Button size="icon" variant="secondary" className="social-prev" aria-label="Previous photo" disabled={index === 0} onClick={() => setIndex(index - 1)}><ChevronLeft /></Button><Button size="icon" variant="secondary" className="social-next" aria-label="Next photo" disabled={index === media.length - 1} onClick={() => setIndex(index + 1)}><ChevronRight /></Button><span className="social-counter">{index + 1} / {media.length}</span></>}
        </div>
        <div className="social-thumbnails">{media.map((item, i) => <Button key={item.url} variant="ghost" className={`social-thumbnail ${index === i ? 'is-active' : ''}`} aria-label={`Photo ${i + 1}`} aria-pressed={index === i} onClick={() => setIndex(i)}>{item.file.type.startsWith('video/') ? <span>Video</span> : <img src={item.url} alt="" />}</Button>)}{media.length < mediaLimits[kind].max && <Button variant="outline" size="icon" aria-label="Add photos" onClick={() => picker.current?.click()}><ImagePlus /></Button>}</div>
      </div>
      <div className="social-settings-column">
        {step === 1 ? <>
          <div className="flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal />Make it yours</div>
          {!video && <><fieldset><legend className="social-label">Crop</legend><div className="flex flex-wrap gap-2">{(kind === 'Story' ? ['story', 'original'] : ['square', 'portrait', 'original']).map(value => <Button key={value} variant={ratio === value ? 'secondary' : 'outline'} size="sm" aria-pressed={ratio === value} onClick={() => setRatio(value)}>{value === 'square' ? '1:1' : value === 'portrait' ? '4:5' : value === 'story' ? '9:16' : 'Original'}</Button>)}</div></fieldset>
          <fieldset><legend className="social-label">Look</legend><div className="social-filters">{(Object.keys(filterValues) as MediaFilter[]).map(value => <Button key={value} variant="ghost" className={`social-filter ${active?.filter === value ? 'is-active' : ''}`} aria-pressed={active?.filter === value} onClick={() => setMedia(media.map((item, i) => i === index ? { ...item, filter: value } : item))}><img className={`filter-${value}`} src={active?.url} alt="" /><span>{value}</span></Button>)}</div></fieldset></>}
          {kind === 'Story' && !video && <StoryEditor editor={storyEditor} selected={selectedLayer} onSelect={setSelectedLayer} />}
          <div className="flex gap-2">{media.length > 1 && <><Button variant="outline" size="icon" title="Move earlier" aria-label="Move earlier" disabled={index === 0} onClick={() => move(-1)}><ChevronLeft /></Button><Button variant="outline" size="icon" title="Move later" aria-label="Move later" disabled={index === media.length - 1} onClick={() => move(1)}><ChevronRight /></Button></>}<Button variant="outline" onClick={remove}><Trash2 />Remove</Button><Button variant="ghost" onClick={() => picker.current?.click()}>{kind === 'Post' ? 'Add photos' : 'Replace'}</Button></div>
        </> : <>
          <div className="flex items-center gap-3"><span className="social-user-icon"><Users /></span><div className="min-w-0"><p className="truncate text-sm font-semibold">{profile?.full_name || 'You'}</p><p className="text-xs text-muted-foreground">{kind === 'Story' ? 'Your story · 24 hours' : `Your ${kind.toLowerCase()}`}</p></div></div>
          <label><span className="social-label">Caption</span><Textarea value={caption} onChange={e => setCaption(e.target.value)} maxLength={2200} rows={4} placeholder="Write a caption… #yourmoment" aria-label="Caption" /><span className="mt-1 block text-right text-xs text-muted-foreground">{caption.length}/2200</span></label>
          <label><span className="social-label flex items-center gap-2"><MapPin className="size-4" />Location</span><Input value={location} onChange={e => setLocation(e.target.value)} maxLength={80} placeholder="Add a location" /></label>
          {kind === 'Post' && <><label><span className="social-label">Tag people</span><Input value={tagged} onChange={e => setTagged(e.target.value)} maxLength={200} placeholder="@name, @name" /></label><label><span className="social-label">Alt text</span><Input value={alt} onChange={e => setAlt(e.target.value)} maxLength={300} placeholder="Describe your photos" /></label></>}
          <fieldset><legend className="social-label">Audience</legend><div className="flex gap-2">{['everyone', 'private'].map(value => <Button key={value} variant={audience === value ? 'secondary' : 'outline'} size="sm" aria-pressed={audience === value} onClick={() => setAudience(value)}>{value === 'everyone' ? 'Community' : 'Only me'}</Button>)}</div></fieldset>
          <div className="social-toggle-row"><label htmlFor="social-comments">Allow comments</label><Switch id="social-comments" checked={comments} onCheckedChange={setComments} /></div>
          {kind !== 'Story' && <div className="social-toggle-row"><label htmlFor="social-likes">Hide like count</label><Switch id="social-likes" checked={hideLikes} onCheckedChange={setHideLikes} /></div>}
        </>}
      </div>
    </div>}
    {error && <p role="alert" className="border-t border-border px-5 py-3 text-sm text-destructive">{error}</p>}
    <footer className="social-composer-footer"><span className="text-xs text-muted-foreground" role="status">{busy ? `Sharing · ${progress}%` : media.length ? `${media.length} ${video ? 'video' : media.length === 1 ? 'photo' : 'photos'}${kind === 'Story' ? ' · 24 hours' : ''}` : kind === 'Story' ? 'Your story · 24 hours' : 'New ' + kind.toLowerCase()}</span><Button variant="ghost" size="sm" onClick={onClose} disabled={busy}><X />Cancel</Button></footer>
  </div>;
}