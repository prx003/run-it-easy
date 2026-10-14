import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, CalendarDays, Clapperboard, CircleDashed, Grid3x3, MessageSquare, Newspaper, Ticket } from 'lucide-react';
import postPhoto from '@/assets/story-gallery.jpg.asset.json';
import reelPhoto from '@/assets/ev-athletics.jpg.asset.json';
import storyPhoto from '@/assets/story-college.jpg.asset.json';
import { ResponsiveOverlay } from '@/components/explore/shared';
import { Button } from '@/components/ui/button';
import { Composer } from './ContentComposer';
import { SocialComposer } from './SocialComposer';
import { useAccount } from '@/lib/account';
import { createOptions, type CreateKind } from '@/lib/account-rules';
import { supabase } from '@/integrations/supabase/client';
const icons={Post:Grid3x3,Reel:Clapperboard,Story:CircleDashed,Tweet:MessageSquare,News:Newspaper,Event:CalendarDays,Ticket};
const covers = { Post: postPhoto.url, Reel: reelPhoto.url, Story: storyPhoto.url };
export function CreateContent({open,onClose,options,onStory}:{open:boolean;onClose:()=>void;options?:CreateKind[];onStory?:()=>void}) {
  const {user,accountType}=useAccount();const queries=useQueryClient();
  const [kind,setKind]=useState<CreateKind|null>(null);const [switching,setSwitching]=useState(false);
  const close=()=>{setKind(null);onClose();};
  const switchType=async()=>{setSwitching(true);const next=accountType==='business'?'personal':'business';const {error}=await supabase.rpc('set_account_type',{account_type:next});if(!error)await queries.invalidateQueries({queryKey:['account-type']});setSwitching(false);};
  const available=createOptions(accountType).filter(k=>!options||options.includes(k));
  const title=kind?`New ${kind.toLowerCase()}`:onStory?'Add':'Create';
  const social = kind === 'Post' || kind === 'Reel' || kind === 'Story';
  return <ResponsiveOverlay open={open} onOpenChange={o=>{if(!o)close();}} title={title} wide={social || !kind}>
    {user && social ? <SocialComposer key={kind} kind={kind} onClose={close} onBack={()=>setKind(null)}/> : <div className="create-studio max-h-[75dvh] overflow-y-auto">
      <div className="create-studio-heading"><span className="create-studio-eyebrow">YOUR CREATIVE SPACE</span><h2>{kind ? title : 'What’s your next moment?'}</h2></div>
      {!user?<Button asChild className="w-full"><Link to="/login">Log in to create</Link></Button>:kind?<Composer kind={kind} onClose={close}/>:<><div className="create-studio-options">{available.filter((k): k is 'Post' | 'Reel' | 'Story'=>k==='Post'||k==='Reel'||k==='Story').map(k=>{const Icon=icons[k];return <Button key={k} variant="outline" className={`create-studio-option create-option-${k.toLowerCase()}`} onClick={()=>setKind(k)}><span className="create-option-visual"><img src={covers[k]} alt=""/><span className="create-option-symbol"><Icon/></span><ArrowUpRight className="create-option-arrow"/></span><span className="create-option-copy"><span>{k}</span><small>{k==='Post'?'Photos & carousels':k==='Reel'?'Video moments':'Your day, in 24 hours'}</small></span></Button>;})}</div>{available.some(k=>!['Post','Reel','Story'].includes(k))&&<div className="create-studio-other">{available.filter(k=>!['Post','Reel','Story'].includes(k)).map(k=>{const Icon=icons[k];return <Button key={k} variant="ghost" className="h-12 justify-start" onClick={()=>setKind(k)}><Icon/>{k}<ArrowUpRight className="ml-auto size-4 text-muted-foreground"/></Button>;})}</div>}{!options&&<div className="create-account-row"><p className="text-ink-muted capitalize">{accountType} account</p><Button variant="link" disabled={switching} onClick={switchType}>{switching?'Switching…':accountType==='business'?'Switch to personal':'Switch to business'}</Button></div>}</>}
    </div>}
  </ResponsiveOverlay>;
}
