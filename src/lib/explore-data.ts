import catSportsPointer from "@/assets/cat-sports.jpg.asset.json";
const catSports = catSportsPointer.url;
import catGamingPointer from "@/assets/cat-gaming.jpg.asset.json";
const catGaming = catGamingPointer.url;
import catArtsPointer from "@/assets/cat-arts.jpg.asset.json";
const catArts = catArtsPointer.url;
import catFestivalsPointer from "@/assets/cat-festivals.jpg.asset.json";
const catFestivals = catFestivalsPointer.url;
import evAthleticsPointer from "@/assets/ev-athletics.jpg.asset.json";
const evAthletics = evAthleticsPointer.url;
import evKochiPointer from "@/assets/ev-kochi.jpg.asset.json";
const evKochi = evKochiPointer.url;
import evMumbaiPointer from "@/assets/ev-mumbai.jpg.asset.json";
const evMumbai = evMumbaiPointer.url;
import evEsportsPointer from "@/assets/ev-esports.jpg.asset.json";
const evEsports = evEsportsPointer.url;
import liveFootballPointer from "@/assets/live-football.jpg.asset.json";
const liveFootball = liveFootballPointer.url;
import liveDiwaliPointer from "@/assets/live-diwali.jpg.asset.json";
const liveDiwali = liveDiwaliPointer.url;
import liveKabaddiPointer from "@/assets/live-kabaddi.jpg.asset.json";
const liveKabaddi = liveKabaddiPointer.url;
import storyGalleryPointer from "@/assets/story-gallery.jpg.asset.json";
const storyGallery = storyGalleryPointer.url;
import storyChessPointer from "@/assets/story-chess.jpg.asset.json";
const storyChess = storyChessPointer.url;
import athBoxerPointer from "@/assets/ath-boxer.jpg.asset.json";
const athBoxer = athBoxerPointer.url;
import artSitarPointer from "@/assets/art-sitar.jpg.asset.json";
const artSitar = artSitarPointer.url;
import clubSkatePointer from "@/assets/club-skate.jpg.asset.json";
const clubSkate = clubSkatePointer.url;
import storyCollegePointer from "@/assets/story-college.jpg.asset.json";
const storyCollege = storyCollegePointer.url;
import av1Pointer from "@/assets/avatars/a1.jpg.asset.json";
const av1 = av1Pointer.url;
import av2Pointer from "@/assets/avatars/a2.jpg.asset.json";
const av2 = av2Pointer.url;
import av3Pointer from "@/assets/avatars/a3.jpg.asset.json";
const av3 = av3Pointer.url;
import av4Pointer from "@/assets/avatars/a4.jpg.asset.json";
const av4 = av4Pointer.url;
import av5Pointer from "@/assets/avatars/a5.jpg.asset.json";
const av5 = av5Pointer.url;
import av8Pointer from "@/assets/avatars/a8.jpg.asset.json";
const av8 = av8Pointer.url;

// Placeholder Explore content — shaped to be swapped for backend data later.
export type ExploreComment = { id: string; author: string; text: string };
export type ExploreItem = {
  id: string;
  kind: "reel" | "post";
  tag: "Sports" | "Arts" | "Culture" | "Gaming" | "Festivals" | "Events" | "Community";
  img: string;
  /** Optional reel video URL — autoplays muted when active. */
  video?: string;
  creator: string;
  handle: string;
  caption: string;
  likes: number;
  featured?: boolean;
  comments: ExploreComment[];
  // --- Added for the Instagram-style feed (all optional so old data still type-checks) ---
  images?: string[]; // carousel slides (first is the cover)
  text?: { headline: string; bg: number }; // text/graphic post
  audio?: string; // reels
  location?: string; // posts
  verified?: boolean;
  ageH?: number; // hours since posted (mock "created_at")
  event?: { slug: string; name: string; date: string; city: string; price: number };
};

/** The four categories that get a badge. Festivals, Events and Community have no badge. */
export type BadgeCategory = "Sports" | "Arts" | "Culture" | "Gaming";
export type ExploreProfile = { id: string; username: string; fullName: string; verified: boolean; type: "Organizer" | "Athlete" | "Artist" | "Club" | "College"; followers: number; following: boolean; /** Up to two. Empty or missing means no badge. */ categories?: BadgeCategory[]; /** Full-profile details (optional). */ city?: string; about?: string; achievements?: string[]; eventSlugs?: string[] };
export type ExploreStory = { id: string; profileId: string; media: string[]; expiresAt: number };

// MOCK: short public sample clip so autoplay can be tested. Replace with real media later.
const SAMPLE_VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const c = (id: string, author: string, text: string): ExploreComment => ({ id, author, text });

/** Sample tweets used to top every post up so each card always shows a full conversation. */
const TWEET_POOL: [string, string][] = [
  ["arjun.k", "This is exactly what I needed today."],
  ["maya_r", "Saving this for the weekend."],
  ["neha.s", "The colours here are unreal."],
  ["rhea.art", "Adding this to my list right now."],
  ["dev.music", "Great framing, the light is perfect."],
  ["kabir.m", "Count me in for the next one."],
  ["ananya.s", "Been waiting for this all week."],
  ["vikram_r", "Shared this with my whole squad."],
  ["ishita.k", "The energy in this is everything."],
  ["rohan_d", "Any idea when the next one is?"],
  ["sana.q", "This made my whole day."],
  ["arav.m", "Need to be there next time."],
];

/** Fill a post's tweets up to `min` so the feed never shows a near-empty conversation. */
function withMinComments(item: ExploreItem, min = 5): ExploreItem {
  if (item.comments.length >= min) return item;
  const start = [...item.id].reduce((a, ch) => a + ch.charCodeAt(0), 0) % TWEET_POOL.length;
  const filler = Array.from({ length: min - item.comments.length }, (_, i) => {
    const [author = "", text = ""] = TWEET_POOL[(start + i * 5) % TWEET_POOL.length] ?? [];
    return c(`${item.id}-t${i}`, author, text);
  });
  return { ...item, comments: [...item.comments, ...filler] };
}


export const exploreItems: ExploreItem[] = [
  { id: "x1", kind: "reel", featured: true, tag: "Sports", img: liveFootball, creator: "Kolkata Terrace Crew", handle: "terracecrew", caption: "Derby night from the stands. Flares, drums and ninety minutes of noise.", likes: 412, comments: [c("c1", "arjun.k", "That second-half chant gave me chills."), c("c2", "maya_r", "Next derby I'm going.")] },
  { id: "x2", kind: "post", tag: "Festivals", img: liveDiwali, creator: "Jaipur Lights Walk", handle: "jaipurlights", caption: "Johari Bazaar lit up for Deepotsav. Every lane, every lamp.", likes: 268, comments: [c("c3", "neha.s", "Beautiful framing.")] },
  { id: "x3", kind: "reel", tag: "Gaming", img: evEsports, creator: "Deccan Esports", handle: "deccanesports", caption: "Grand finals walkout at HITEX. Lights down, crowd up.", likes: 189, comments: [] },
  { id: "x4", kind: "post", tag: "Arts", img: storyGallery, creator: "Open Wall Studio", handle: "openwall", caption: "Opening night of the new group show. Twelve artists, one long wall.", likes: 97, comments: [c("c4", "rhea.art", "The third piece is stunning.")] },
  { id: "x5", kind: "reel", tag: "Sports", img: liveKabaddi, creator: "Pune Raiders Fan Club", handle: "puneraiders", caption: "That super raid in the final minute. Watch the bench react.", likes: 233, comments: [] },
  { id: "x6", kind: "post", tag: "Culture", img: evKochi, creator: "Kochi Heritage Collective", handle: "kochiheritage", caption: "Chenda melam rehearsal before the parade. Fort Kochi, golden hour.", likes: 151, comments: [] },
  { id: "x7", kind: "reel", featured: true, tag: "Arts", img: artSitar, creator: "Raag Room Sessions", handle: "raagroom", caption: "A late evening alaap, recorded live in one take.", likes: 204, comments: [c("c5", "dev.music", "Need the full set please.")] },
  { id: "x8", kind: "post", tag: "Community", img: clubSkate, creator: "Indiranagar Skaters", handle: "indiranagarsk8", caption: "Sunday session. Beginners welcome, boards to borrow.", likes: 88, comments: [] },
  { id: "x9", kind: "post", tag: "Gaming", img: storyChess, creator: "Chennai Chess Circle", handle: "chesscircle", caption: "Rapid tournament, round four. Silence you could hear.", likes: 64, comments: [] },
  { id: "x10", kind: "reel", tag: "Sports", img: athBoxer, creator: "Bhiwani Boxing Club", handle: "bhiwanibox", caption: "Morning pad work. Same drills, every day.", likes: 176, comments: [] },
  { id: "x11", kind: "post", tag: "Events", img: evAthletics, creator: "Track Circuit India", handle: "trackcircuit", caption: "Lane check before the 400m heats at Kalinga Stadium.", likes: 121, comments: [] },
  { id: "x12", kind: "reel", tag: "Festivals", img: catFestivals, creator: "Colour Run Collective", handle: "colourrun", caption: "Slow-motion colour throw. Wash your phone after.", likes: 158, comments: [] },
  { id: "x13", kind: "post", tag: "Community", img: storyCollege, creator: "Campus Fest Network", handle: "campusfest", caption: "Setting up the main stage the night before fest week.", likes: 73, comments: [] },
  { id: "x14", kind: "post", tag: "Arts", img: catArts, creator: "Mural Lab", handle: "murallab", caption: "Day three of the community mural. Neighbours kept adding colour.", likes: 92, comments: [] },
  { id: "x15", kind: "reel", tag: "Gaming", img: catGaming, creator: "LAN Night Hyderabad", handle: "lannight", caption: "Forty setups, one power strip prayer.", likes: 110, comments: [] },
  { id: "x16", kind: "post", tag: "Sports", img: catSports, creator: "Weekend League", handle: "weekendleague", caption: "Floodlights on, final whistle soon.", likes: 85, comments: [] },
];

// ---- Mock enrichment: verified flags, audio/location, events, ages, extra carousel/text posts ----
const extra: Record<string, Partial<ExploreItem>> = {
  x1: { verified: true, audio: "Original audio", ageH: 2, video: SAMPLE_VIDEO, event: { slug: "isl-derby-night", name: "Kolkata Derby Night", date: "Today", city: "Kolkata", price: 349 } },
  x2: { verified: true, location: "Johari Bazaar, Jaipur", ageH: 5, images: [liveDiwali, catFestivals, evKochi], event: { slug: "deepotsav-street-festival", name: "Deepotsav Street Festival", date: "Tonight", city: "Jaipur", price: 0 } },
  x3: { verified: true, audio: "Arena crowd · Original audio", ageH: 9, event: { slug: "hyderabad-esports-open", name: "Hyderabad Esports Open", date: "15 Nov", city: "Hyderabad", price: 299 } },
  x4: { verified: true, location: "Open Wall Studio, Delhi", ageH: 20, images: [storyGallery, catArts] },
  x5: { audio: "Kabaddi chants · Original audio", ageH: 26, video: SAMPLE_VIDEO },
  x6: { verified: true, location: "Fort Kochi", ageH: 30, event: { slug: "kochi-cultural-festival", name: "Kochi Cultural Festival", date: "02 Nov", city: "Kochi", price: 0 } },
  x7: { verified: true, audio: "Raag Yaman · Original audio", ageH: 40 },
  x8: { location: "Indiranagar, Bengaluru", ageH: 50 },
  x9: { location: "Chennai", ageH: 60 },
  x10: { verified: true, audio: "Original audio", ageH: 70, video: SAMPLE_VIDEO },
  x11: { verified: true, location: "Kalinga Stadium, Bhubaneswar", ageH: 80, event: { slug: "national-athletics-championship", name: "National Athletics Championship", date: "12 Oct", city: "Bhubaneswar", price: 199 } },
  x12: { audio: "Holi beats · Original audio", ageH: 95 },
  x13: { location: "Pune", ageH: 110 },
  x14: { verified: true, location: "Mumbai", ageH: 130, images: [catArts, evMumbai, storyGallery] },
  x15: { audio: "Original audio", ageH: 150 },
  x16: { location: "Weekend League Ground", ageH: 170 },
};
const more: ExploreItem[] = [
  { id: "x17", kind: "post", tag: "Sports", img: liveFootball, creator: "Kolkata Terrace Crew", handle: "terracecrew", verified: true, caption: "Swipe for the tifo reveal, the flares and the final whistle.", likes: 530, ageH: 6, images: [liveFootball, liveKabaddi, catSports, athBoxer], comments: [] },
  { id: "x18", kind: "post", tag: "Community", img: catFestivals, creator: "SAC Newsroom", handle: "sacnews", verified: true, caption: "Registrations are open for 14 colleges this month.", likes: 740, ageH: 12, text: { headline: "Inter-college athletics opens in Mangaluru", bg: 1 }, comments: [] },
  { id: "x19", kind: "post", tag: "Gaming", img: evEsports, creator: "Deccan Esports", handle: "deccanesports", verified: true, caption: "Squads of five, one substitute. Free entry.", likes: 310, ageH: 18, text: { headline: "Open qualifier: 5v5. Closes 30 Oct.", bg: 2 }, comments: [] },
  { id: "x20", kind: "reel", tag: "Culture", img: evKochi, creator: "Kochi Heritage Collective", handle: "kochiheritage", verified: true, audio: "Chenda melam · Original audio", caption: "Parade morning. Listen for the second round of chenda.", likes: 365, ageH: 33, video: SAMPLE_VIDEO, comments: [] },
];
export const exploreCatalog: ExploreItem[] = [
  ...exploreItems.map((i) => withMinComments({ verified: false, ageH: 24, ...i, ...(extra[i.id] ?? {}) })),
  ...more.map((i) => withMinComments(i)),
];

const p = (id: string, username: string, fullName: string, verified: boolean, type: ExploreProfile["type"], followers: number, following = false, categories: BadgeCategory[] = []): ExploreProfile => ({ id, username, fullName, verified, type, followers, following, categories });
export const exploreProfiles: ExploreProfile[] = [
  p("terracecrew", "terracecrew", "Kolkata Terrace Crew", true, "Club", 48200, true, ["Sports"]),
  p("sacnews", "sacnews", "SAC Newsroom", true, "Organizer", 120400, true),
  p("deccanesports", "deccanesports", "Deccan Esports League", true, "Organizer", 33900, false, ["Gaming"]),
  p("openwall", "openwall", "Open Wall Studio", true, "Artist", 8100, false, ["Arts"]),
  p("kochiheritage", "kochiheritage", "Kochi Heritage Collective", true, "Organizer", 15600, false, ["Arts", "Culture"]),
  p("bhiwanibox", "bhiwanibox", "Bhiwani Boxing Club", true, "Club", 21800, false, ["Sports"]),
  p("raagroom", "raagroom", "Raag Room Sessions", false, "Artist", 6400, false, ["Arts", "Culture"]),
  p("puneraiders", "puneraiders", "Pune Raiders Fan Club", false, "Club", 9700, false, ["Sports"]),
  p("campusfest", "campusfest", "Campus Fest Network", false, "College", 5200),
  { ...p("trackcircuit", "trackcircuit", "Track Circuit India", true, "Organizer", 12900, false, ["Sports"]), city: "Bhubaneswar", about: "Demo organizer: Track Circuit India runs athletics meets across the country, from district trials to national championships.", eventSlugs: ["national-athletics-championship"] },
  p("jaipurlights", "jaipurlights", "Jaipur Lights Walk", false, "Organizer", 4300, false, ["Culture"]),
  p("murallab", "murallab", "Mural Lab", false, "Artist", 3900, false, ["Arts"]),
  // DEMO athlete profile for testing the Community → full profile flow.
  { ...p("demo.athlete", "demo.athlete", "Aarav Menon (Demo)", true, "Athlete", 2400, false, ["Sports"]), city: "Bengaluru", about: "Demo athlete: 400m sprinter training in Bengaluru. This is sample information for testing.", achievements: ["Gold, 400m — State Athletics Meet 2025 (demo)", "Silver, 4x400m relay — South Zone Championship 2024 (demo)"], eventSlugs: ["national-athletics-championship"] },
];

const H = 3600e3;
export const exploreStories: ExploreStory[] = [
  { id: "s1", profileId: "terracecrew", media: [liveFootball, catSports], expiresAt: 20 * H },
  { id: "s2", profileId: "sacnews", media: [storyCollege, evAthletics, catFestivals], expiresAt: 14 * H },
  { id: "s3", profileId: "deccanesports", media: [evEsports, storyChess], expiresAt: 9 * H },
  { id: "s4", profileId: "openwall", media: [storyGallery], expiresAt: 22 * H },
  { id: "s5", profileId: "kochiheritage", media: [evKochi, liveDiwali], expiresAt: 6 * H },
  { id: "s6", profileId: "bhiwanibox", media: [athBoxer], expiresAt: 11 * H },
  { id: "s7", profileId: "raagroom", media: [artSitar], expiresAt: 3 * H },
];

/** The signed-in mock user. No categories, so no badge. */
export const YOU: ExploreProfile = { id: "you", username: "you", fullName: "You", verified: false, type: "Athlete", followers: 0, following: false, categories: [] };

/**
 * Profile images for every demo profile, looked up by handle, full name or
 * comment-author name (all lowercase). Profiles without a dedicated portrait
 * reuse their own post or story imagery.
 */
const avatarMap: Record<string, string> = {
  terracecrew: liveFootball, "kolkata terrace crew": liveFootball,
  sacnews: storyCollege, "sac newsroom": storyCollege,
  deccanesports: evEsports, "deccan esports": evEsports, "deccan esports league": evEsports,
  openwall: storyGallery, "open wall studio": storyGallery,
  kochiheritage: evKochi, "kochi heritage collective": evKochi,
  bhiwanibox: athBoxer, "bhiwani boxing club": athBoxer,
  raagroom: av2, "raag room sessions": av2,
  puneraiders: liveKabaddi, "pune raiders fan club": liveKabaddi,
  campusfest: storyCollege, "campus fest network": storyCollege,
  trackcircuit: evAthletics, "track circuit india": evAthletics,
  jaipurlights: liveDiwali, "jaipur lights walk": liveDiwali,
  murallab: av3, "mural lab": av3,
  "demo.athlete": av1, "aarav menon (demo)": av1,
  indiranagarsk8: clubSkate, "indiranagar skaters": clubSkate,
  chesscircle: storyChess, "chennai chess circle": storyChess,
  colourrun: catFestivals, "colour run collective": catFestivals,
  lannight: catGaming, "lan night hyderabad": catGaming,
  weekendleague: catSports, "weekend league": catSports,
  "arjun.k": av4, "maya_r": av5, "neha.s": av8, "rhea.art": av3, "dev.music": av2,
  "kabir.m": av1, "ananya.s": av2, "vikram_r": av3, "ishita.k": av4, "rohan_d": av5, "sana.q": av8, "arav.m": av1,
};

/** Demo profile image for a handle, full name or author name. Null when unknown. */
export function avatarFor(name: string): string | null {
  return avatarMap[name.trim().toLowerCase()] ?? null;
}

/** Only verified profiles with supported categories carry a marker. */
export function categoriesOf(handle: string): BadgeCategory[] {
  const prof = exploreProfiles.find((x) => x.id === handle);
  return prof?.verified ? (prof.categories ?? []).filter((category) => ["Sports", "Arts", "Culture", "Gaming"].includes(category)) : [];
}

/**
 * Resolve a profile by handle. Accounts that post on Explore but have no
 * listed profile entry are built from their own published posts, so every
 * handle linked from a post or reel opens a real profile.
 */
export function findProfile(handle: string): ExploreProfile | undefined {
  const key = handle.trim().toLowerCase();
  const listed = exploreProfiles.find((x) => x.id.toLowerCase() === key || x.username.toLowerCase() === key);
  if (listed) return listed;
  const item = exploreCatalog.find((i) => i.handle.toLowerCase() === key);
  if (!item) return undefined;
  return { id: item.handle, username: item.handle, fullName: item.creator, verified: false, type: "Club", followers: 0, following: false, categories: [] };
}
