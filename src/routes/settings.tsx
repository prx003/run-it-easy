import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, KeyRound, LogOut, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAccount, signOutAccount } from "@/lib/account";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings — SAC Community" },
    { name: "description", content: "Manage your SAC Community password, advertising preferences and sign-in." },
    { property: "og:title", content: "Settings — SAC Community" },
    { property: "og:description", content: "Your password, ad preferences and account settings." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, loading } = useAccount();
  const queries = useQueryClient();
  const navigate = Route.useNavigate();
  const [panel, setPanel] = useState<"password" | "ads" | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [personalized, setPersonalized] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const storageKey = user ? `sac-ad-preferences:${user.id}` : null;
  useEffect(() => {
    setPersonalized(false); setTopics([]);
    if (!storageKey) return;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
      setPersonalized(saved.personalized === true);
      setTopics(Array.isArray(saved.topics) ? saved.topics.filter((t: unknown) => typeof t === "string") : []);
    } catch { /* Keep safe defaults if storage is unavailable. */ }
  }, [storageKey]);
  const saveAds = (nextPersonalized: boolean, nextTopics: string[]) => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ personalized: nextPersonalized, topics: nextTopics }));
      setPersonalized(nextPersonalized); setTopics(nextTopics); setMessage("Ad preferences saved on this device.");
    } catch { setMessage("Couldn't save preferences on this device."); }
  };
  return (
    <div className="min-h-screen bg-ink px-4 pb-20 pt-24 text-ink-foreground">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <Button asChild variant="ghost" size="icon"><Link to="/u/$handle" params={{ handle: "you" }} aria-label="Back to profile"><ArrowLeft /></Link></Button>
          <h1 className="font-display text-3xl">Settings</h1>
        </div>
        {loading ? <p className="text-ink-muted">Loading…</p> : !user ? <Button asChild><Link to="/login">Log in to manage settings</Link></Button> : <>
          <h2 className="mb-2 text-xs font-semibold uppercase text-ink-muted">Account</h2>
          <div className="divide-y divide-ink-border border-y border-ink-border">
            <Button variant="ghost" className="h-14 w-full justify-start rounded-none px-2" onClick={() => { setPanel(panel === "password" ? null : "password"); setMessage(""); }} aria-expanded={panel === "password"}><KeyRound /> Password and security<ChevronRight className="ml-auto" /></Button>
            {panel === "password" && <form className="space-y-4 px-2 py-5" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const data = new FormData(form);
              const password = String(data.get("password") ?? "");
              if (password !== data.get("confirm")) { setMessage("New passwords don't match."); return; }
              if (password === data.get("current")) { setMessage("Choose a different new password."); return; }
              setBusy(true); setMessage("");
              try {
                const { error } = await supabase.auth.updateUser({ password, current_password: String(data.get("current") ?? "") });
                if (error) throw error;
                form.reset(); setMessage("Password updated.");
              } catch (error) { setMessage(error instanceof Error ? error.message : "Couldn't update password."); }
              finally { setBusy(false); }
            }}>
              <label className="block text-sm">Current password<Input name="current" type="password" autoComplete="current-password" required className="mt-2" /></label>
              <label className="block text-sm">New password<Input name="password" type="password" autoComplete="new-password" required minLength={8} className="mt-2" /></label>
              <label className="block text-sm">Confirm new password<Input name="confirm" type="password" autoComplete="new-password" required minLength={8} className="mt-2" /></label>
              <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Change password"}</Button>
            </form>}
            <Button variant="ghost" className="h-14 w-full justify-start rounded-none px-2" onClick={() => { setPanel(panel === "ads" ? null : "ads"); setMessage(""); }} aria-expanded={panel === "ads"}><Megaphone /> Ad preferences<ChevronRight className="ml-auto" /></Button>
            {panel === "ads" && <div className="space-y-5 px-2 py-5">
              <label className="flex items-center justify-between gap-4 text-sm">Personalized ads<Switch checked={personalized} onCheckedChange={(checked) => saveAds(checked, topics)} /></label>
              <h3 className="text-sm font-semibold">Ad topics · See less</h3>
              <div className="divide-y divide-ink-border">{["Sports", "Arts", "Gaming", "Festivals", "Music"].map(topic => <label key={topic} className="flex min-h-12 items-center justify-between gap-4 text-sm">{topic}<Switch aria-label={`See fewer ${topic.toLowerCase()} ads`} checked={topics.includes(topic)} onCheckedChange={checked => saveAds(personalized, checked ? [...topics, topic] : topics.filter(t => t !== topic))} /></label>)}</div>
              <p className="text-xs text-ink-muted">Saved on this device. SAC isn't serving personalized ads yet.</p>
            </div>}
          </div>
          <Button variant="ghost" disabled={busy} className="mt-6 h-12 w-full justify-start px-2 text-primary" onClick={async () => {
            setBusy(true); setMessage("");
            try { await signOutAccount(queries); await navigate({ to: "/login", replace: true }); }
            catch { setMessage("Couldn't log out. Please try again."); setBusy(false); }
          }}><LogOut /> Log out</Button>
          {message && <p role="status" className="mt-4 text-sm text-ink-muted">{message}</p>}
        </>}
      </div>
    </div>
  );
}