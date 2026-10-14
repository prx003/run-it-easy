import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X, Send, LoaderCircle, ImagePlus, Plus, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { ContentPreview } from './ContentPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAccount } from '@/lib/account';
import { createOptions, type CreateKind } from '@/lib/account-rules';
import { useCommunityContent } from '@/lib/community-content';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

const selectCls = 'mt-1 h-10 w-full rounded-md border border-ink-border bg-ink px-2 text-sm';
const DOMAINS = ['Sports', 'Arts', 'Culture', 'Gaming', 'Music', 'Festival'];
const NEWS_CATS = ['Announcement', 'Results', 'Interview', 'Feature', 'Opinion', 'Breaking'];

function Field({ label, hint, children, wide }: { label: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return <label className={`studio-field block text-sm ${wide ? 'sm:col-span-2' : ''}`}>
    <span className="font-medium">{label}</span>{children}
    {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
  </label>;
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return <fieldset className="studio-form-section">
    <legend className="studio-section-heading">{title}</legend>
    <div className="grid gap-3 sm:grid-cols-2">{children}</div>
  </fieldset>;
}
function Toggle({ name, label, defaultChecked = true }: { name: string; label: string; defaultChecked?: boolean }) {
  return <label className="social-toggle-row">{label}<Switch name={name} defaultChecked={defaultChecked} /></label>;
}

const mediaRule: Partial<Record<CreateKind, { accept: string; multiple: boolean; required: boolean; max: number; label: string }>> = {
  Post: { accept: 'image/*', multiple: true, required: true, max: 10, label: 'Photos (up to 10)' },
  Reel: { accept: 'video/*', multiple: false, required: true, max: 1, label: 'Video' },
  Story: { accept: 'image/*,video/*', multiple: false, required: true, max: 1, label: 'Photo or video' },
  News: { accept: 'image/*', multiple: false, required: false, max: 1, label: 'Cover image (optional)' },
  Event: { accept: 'image/*', multiple: true, required: true, max: 5, label: 'Event images (up to 5)' },
};
const MAX_MB = 50;

export function Composer({ kind, onClose }: { kind: CreateKind; onClose: () => void }) {
  const { user, accountType, profile } = useAccount(); const queries = useQueryClient(); const content = useCommunityContent();
  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [text, setText] = useState(''); const [paid, setPaid] = useState(false); const [poll, setPoll] = useState<string[]>([]);
  const rule = mediaRule[kind];
  const previews = useMemo(() => files.map(f => ({ url: URL.createObjectURL(f), video: f.type.startsWith('video/') })), [files]);
  useEffect(() => () => previews.forEach(p => URL.revokeObjectURL(p.url)), [previews]);
  const ownEvents = content.data?.filter(r => r.kind === 'event' && r.user_id === user?.id) ?? [];
  const textMax = kind === 'Tweet' ? 280 : kind === 'Story' ? 150 : kind === 'News' ? 5000 : 2200;

  const pickFiles = (list: File[]) => {
    if (!rule) return;
    const typeOk = (f: File) => rule.accept.split(',').some(a => f.type.startsWith(a.replace('*', '')));
    if (list.some(f => !typeOk(f))) return setError('Choose the correct media type.');
    if (list.some(f => f.size > MAX_MB * 1024 * 1024)) return setError(`Each file must be under ${MAX_MB} MB.`);
    const next = rule.multiple ? [...files, ...list].slice(0, rule.max) : list.slice(0, 1);
    setError(''); setFiles(next);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); if (!user || !createOptions(accountType).includes(kind)) return;
    const f = new FormData(e.currentTarget); const s = (k: string) => String(f.get(k) ?? '').trim();
    const on = (k: string) => f.get(k) === 'on'; const n = (k: string) => (s(k) ? Number(s(k)) : null);
    const tags = s('tags').split(/[,\s]+/).map(t => t.replace(/^#/, '')).filter(Boolean).slice(0, 20);
    setBusy(true); setError(''); const paths: string[] = [];
    try {
      if (rule?.required && !files.length) throw new Error('Add media before publishing.');
      if (kind === 'Event' && s('end') && s('start') && new Date(s('end')) <= new Date(s('start'))) throw new Error('End time must be after start time.');
      const pollOpts = poll.map(p => p.trim()).filter(Boolean);
      if (kind === 'Tweet' && poll.length && pollOpts.length < 2) throw new Error('A poll needs at least 2 options.');
      const details: Record<string, Json> = { tags, allow_comments: on('comments'), hide_likes: on('hide_likes') };
      if (kind === 'Post') Object.assign(details, { location: s('location'), alt: s('alt'), tagged: s('tagged') });
      if (kind === 'Reel') Object.assign(details, { location: s('location'), audio: s('audio'), allow_remix: on('remix') });
      if (kind === 'Story') Object.assign(details, { link: s('link'), audience: s('audience'), duration_h: 24 });
      if (kind === 'Tweet') Object.assign(details, { poll: pollOpts, poll_hours: n('poll_hours'), reply: s('reply') });
      if (kind === 'News') Object.assign(details, { subheading: s('subheading'), category: s('category'), source: s('source'), author: s('author') });
      if (kind === 'Event') Object.assign(details, { domain: s('domain'), category: s('category'), venue: s('venue'), state: s('state'), end: s('end') ? new Date(s('end')).toISOString() : null, capacity: n('capacity'), age: s('age'), registration_link: s('reglink'), contact_email: s('email'), contact_phone: s('phone'), paid });
      if (kind === 'Ticket') Object.assign(details, { tier: s('tier'), quantity: n('quantity'), per_person: n('per_person'), sale_ends: s('sale_ends') ? new Date(s('sale_ends')).toISOString() : null, perks: s('perks'), refundable: on('refundable') });
      for (const file of files) {
        const path = `${user.id}/${crypto.randomUUID()}.${file.name.split('.').pop()}`;
        const { error } = await supabase.storage.from('community-media').upload(path, file); if (error) throw error; paths.push(path);
      }
      const start = s('start');
      const { error } = await supabase.from('community_content').insert({
        user_id: user.id, kind: kind.toLowerCase(), title: s('title'), caption: text.trim(), media: paths,
        city: s('city'), event_date: start ? new Date(start).toISOString() : null,
        price: kind === 'Event' && !paid ? 0 : Number(f.get('price') ?? 0), event_id: kind === 'Ticket' ? s('event') : null, details,
      });
      if (error) throw error;
      await queries.invalidateQueries({ queryKey: ['community-content'] }); toast.success(`${kind} published`); onClose();
    } catch (err) {
      if (paths.length) await supabase.storage.from('community-media').remove(paths);
      setError(err instanceof Error ? err.message : 'Could not publish. Please try again.');
    } finally { setBusy(false); }
  };

  const captionLabel = { Post: 'Caption', Reel: 'Caption', Story: 'Text on story', Tweet: "What's happening?", News: 'Full story', Event: 'Description', Ticket: 'Ticket description' }[kind];
  const textRequired = kind === 'Tweet' || kind === 'News' || kind === 'Event';

  return <form onSubmit={submit} onChange={e => { const data = new FormData(e.currentTarget); setValues(Object.fromEntries(Array.from(data.entries()).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))); }} className="domain-composer">
    <div className="domain-form-column">
    {rule && <Section title="Media">
      <Field label={rule.label} hint={`Max ${MAX_MB} MB per file`} wide>
        <span className="domain-media-picker"><ImagePlus className="size-6 text-primary"/><Input type="file" aria-label={rule.label} accept={rule.accept} multiple={rule.multiple} className="mt-1" onChange={e => { pickFiles(Array.from(e.target.files ?? [])); e.target.value = ''; }} /></span>
      </Field>
      {!!previews.length && <div className="flex gap-2 overflow-x-auto sm:col-span-2">{previews.map((p, i) =>
        <div key={p.url} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-ink">
          {p.video ? <video src={p.url} className="h-full w-full object-cover" muted /> : <img src={p.url} alt="" className="h-full w-full object-cover" />}
          <Button type="button" size="icon" variant="secondary" aria-label={`Remove image ${i + 1}`} onClick={() => setFiles(files.filter((_, j) => j !== i))} className="absolute right-1 top-1 size-6"><X className="h-3 w-3" /></Button>
        </div>)}</div>}
      {kind === 'Post' && <Field label="Alt text" hint="Describe photos for people using screen readers" wide><Input name="alt" maxLength={200} className="mt-1" /></Field>}
    </Section>}

    <Section title="Details">
      {kind === 'Event' && <Field label="Event name" wide><Input name="title" required maxLength={120} className="mt-1" /></Field>}
      {kind === 'News' && <><Field label="Headline" wide><Input name="title" required maxLength={140} className="mt-1" /></Field>
        <Field label="Subheading" wide><Input name="subheading" maxLength={200} className="mt-1" /></Field>
        <Field label="Category"><select name="category" required defaultValue="" className={selectCls}><option value="" disabled>Select</option>{NEWS_CATS.map(c => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Author / byline"><Input name="author" maxLength={80} className="mt-1" /></Field></>}
      {kind === 'Ticket' && <><Field label="Event" wide><select name="event" required defaultValue="" className={selectCls}><option value="" disabled>Select your event</option>{ownEvents.map(r => <option value={r.id} key={r.id}>{r.title}</option>)}</select>{!ownEvents.length && <span className="mt-1 block text-xs text-ink-muted">Create an event first.</span>}</Field>
        <Field label="Ticket name"><Input name="title" required maxLength={80} placeholder="e.g. Early bird" className="mt-1" /></Field>
        <Field label="Tier"><select name="tier" className={selectCls}>{['General', 'VIP', 'Student', 'Group', 'Backstage'].map(t => <option key={t}>{t}</option>)}</select></Field></>}
      {kind === 'Event' && <><Field label="Domain"><select name="domain" required defaultValue="" className={selectCls}><option value="" disabled>Select</option>{DOMAINS.map(d => <option key={d}>{d}</option>)}</select></Field>
        <Field label="Category"><Input name="category" maxLength={60} placeholder="e.g. Football, Esports" className="mt-1" /></Field></>}
      <Field label={captionLabel} hint={`${text.length}/${textMax}`} wide>
        <Textarea value={text} onChange={e => setText(e.target.value)} placeholder={kind === 'Tweet' ? 'What’s happening?' : kind === 'News' ? 'Tell the full story…' : kind === 'Event' ? 'What makes this event special?' : 'What’s included in this experience?'} required={textRequired} maxLength={textMax} rows={kind === 'News' ? 8 : 4} className="mt-1" />
      </Field>
      {kind === 'Tweet' && <div className="sm:col-span-2 space-y-2">
        {poll.map((p, i) => <div key={i} className="flex gap-2"><Input aria-label={`Poll option ${i + 1}`} value={p} maxLength={25} placeholder={`Option ${i + 1}`} onChange={e => setPoll(poll.map((x, j) => j === i ? e.target.value : x))} /><Button type="button" size="icon" variant="ghost" aria-label={`Remove poll option ${i + 1}`} onClick={() => setPoll(poll.filter((_, j) => j !== i))}><X /></Button></div>)}
        {poll.length < 4 && <Button type="button" variant="outline" size="sm" onClick={() => setPoll(poll.length ? [...poll, ''] : ['', ''])}>{poll.length ? <Plus/> : <BarChart3/>}{poll.length ? 'Add option' : 'Add a poll'}</Button>}
        {!!poll.length && <Field label="Poll length"><select name="poll_hours" className={selectCls}><option value="24">1 day</option><option value="72">3 days</option><option value="168">7 days</option></select></Field>}
      </div>}
      {(kind === 'Post' || kind === 'Reel') && <Field label="Location"><Input name="location" maxLength={80} className="mt-1" /></Field>}
      {kind === 'Reel' && <Field label="Audio / song"><Input name="audio" maxLength={80} placeholder="Original audio" className="mt-1" /></Field>}
      {kind === 'Post' && <Field label="Tag people"><Input name="tagged" maxLength={200} placeholder="@name, @name" className="mt-1" /></Field>}
      {kind === 'Story' && <><Field label="Link sticker (optional)"><Input name="link" type="url" maxLength={500} placeholder="https://" className="mt-1" /></Field>
        <Field label="Who can see"><select name="audience" className={selectCls}><option value="everyone">Everyone</option><option value="followers">Followers</option><option value="close">Close friends</option></select></Field></>}
      {kind === 'News' && <Field label="Source link (optional)" wide><Input name="source" type="url" maxLength={500} placeholder="https://" className="mt-1" /></Field>}
      {kind !== 'Ticket' && <Field label="Hashtags" hint="Separate with commas or spaces" wide><Input name="tags" maxLength={300} placeholder="#cricket #mumbai" className="mt-1" /></Field>}
    </Section>

    {kind === 'Event' && <Section title="Date & location">
      <Field label="Starts"><Input name="start" type="datetime-local" required className="mt-1" /></Field>
      <Field label="Ends"><Input name="end" type="datetime-local" className="mt-1" /></Field>
      <Field label="Venue" wide><Input name="venue" required maxLength={120} className="mt-1" /></Field>
      <Field label="City"><Input name="city" required maxLength={60} className="mt-1" /></Field>
      <Field label="State"><Input name="state" maxLength={60} className="mt-1" /></Field>
    </Section>}

    {kind === 'Event' && <Section title="Entry & contact">
      <div className="flex gap-2 sm:col-span-2">{[false, true].map(v => <Button key={String(v)} type="button" variant={paid === v ? 'default' : 'outline'} className="flex-1" onClick={() => setPaid(v)}>{v ? 'Paid' : 'Free'}</Button>)}</div>
      {paid && <Field label="Starting price (₹)"><Input name="price" type="number" min="1" step="0.01" required className="mt-1" /></Field>}
      <Field label="Capacity"><Input name="capacity" type="number" min="1" className="mt-1" /></Field>
      <Field label="Age limit"><select name="age" className={selectCls}><option>All ages</option><option>13+</option><option>18+</option><option>21+</option></select></Field>
      <Field label="Registration link"><Input name="reglink" type="url" maxLength={500} placeholder="https://" className="mt-1" /></Field>
      <Field label="Contact email"><Input name="email" type="email" maxLength={255} className="mt-1" /></Field>
      <Field label="Contact phone"><Input name="phone" type="tel" maxLength={20} pattern="[0-9+\s\-]{7,20}" className="mt-1" /></Field>
    </Section>}

    {kind === 'Ticket' && <Section title="Pricing & availability">
      <Field label="Price (₹)" hint="Use 0 for free"><Input name="price" type="number" min="0" step="0.01" defaultValue="0" required className="mt-1" /></Field>
      <Field label="Tickets available"><Input name="quantity" type="number" min="1" required className="mt-1" /></Field>
      <Field label="Max per person"><Input name="per_person" type="number" min="1" max="20" defaultValue="4" className="mt-1" /></Field>
      <Field label="Sales end"><Input name="sale_ends" type="datetime-local" className="mt-1" /></Field>
      <Field label="Perks / what's included" wide><Input name="perks" maxLength={200} placeholder="Front row, free drink, merch" className="mt-1" /></Field>
      <Toggle name="refundable" label="Refundable" defaultChecked={false} />
    </Section>}

    {kind !== 'Ticket' && <Section title="Settings">
      <Toggle name="comments" label="Allow comments" />
      <Toggle name="hide_likes" label="Hide like count" defaultChecked={false} />
      {kind === 'Reel' && <Toggle name="remix" label="Allow remixes" />}
      {kind === 'Tweet' && <Field label="Who can reply"><select name="reply" className={selectCls}><option value="everyone">Everyone</option><option value="following">People you follow</option><option value="mentioned">Only mentioned</option></select></Field>}
    </Section>}

    </div>
    <ContentPreview kind={kind} values={values} text={text} image={previews[0]?.url} name={profile?.full_name || 'You'}/>
    <footer className="domain-composer-footer">{error ? <p role="alert" className="text-sm text-destructive">{error}</p> : <span className="text-xs text-muted-foreground">{kind === 'Ticket' ? 'Ticket details' : 'Publishing to your community'}</span>}<Button type="submit" disabled={busy || (kind === 'Ticket' && !ownEvents.length)}>{busy ? <LoaderCircle className="animate-spin"/> : <Send/>}{busy ? 'Publishing…' : `Publish ${kind.toLowerCase()}`}</Button></footer>
  </form>;
}
