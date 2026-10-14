import { CalendarDays, MapPin, MessageCircle, MoreHorizontal, Ticket, Heart, Newspaper } from 'lucide-react';
import type { CreateKind } from '@/lib/account-rules';

export function ContentPreview({ kind, values, text, image, name }: { kind: CreateKind; values: Record<string, string>; text: string; image?: string; name: string }) {
  return <aside className="content-preview-column">
    <div className="studio-section-heading"><span>Live preview</span><span className="studio-preview-badge">{kind}</span></div>
    <article className={`content-live-preview preview-${kind.toLowerCase()}`}>
      <header><span className="studio-avatar">{name.slice(0, 1).toUpperCase()}</span><div><strong>{name}</strong><small>{kind === 'News' ? values.author || 'Community newsroom' : 'Just now · Community'}</small></div><MoreHorizontal className="size-4 text-muted-foreground" /></header>
      {image ? <img src={image} alt={`${kind} cover preview`} className="content-preview-image" /> : kind !== 'Tweet' && <div className="content-preview-placeholder">{kind === 'Ticket' ? <Ticket /> : kind === 'Event' ? <CalendarDays /> : <Newspaper />}</div>}
      <div className="content-preview-copy">
        {(values.category || values.tier) && <small className="text-primary">{values.category || values.tier}</small>}
        {kind !== 'Tweet' && <h3>{values.title || (kind === 'Ticket' ? 'Your ticket name' : kind === 'Event' ? 'Your event name' : 'Your headline')}</h3>}
        {values.subheading && <p className="text-muted-foreground">{values.subheading}</p>}
        <p className="preview-body-text">{text || (kind === 'Tweet' ? 'What’s happening in your world?' : 'Your story starts here…')}</p>
        {kind === 'Event' && <div className="preview-event-meta"><span><CalendarDays className="size-4" />{values.start ? new Date(values.start).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date & time'}</span><span><MapPin className="size-4" />{[values.venue, values.city].filter(Boolean).join(', ') || 'Venue & city'}</span></div>}
        {kind === 'Ticket' && <div className="preview-ticket-price"><strong>₹{values.price || '0'}</strong><span>{values.quantity || '—'} available</span></div>}
      </div>
      {kind !== 'Ticket' && <footer><Heart className="size-4" /><MessageCircle className="size-4" /><span>Community</span></footer>}
    </article>
  </aside>;
}