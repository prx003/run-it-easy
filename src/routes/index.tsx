import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

// The app is Explore-only: "/" sends signed-in users to Explore and everyone else to Log in.
export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "SAC Community — Your Explore Feed" },
      { name: "description", content: "Sign in to explore SAC Community posts, reels, and event moments." },
      { property: "og:title", content: "SAC Community — Your Explore Feed" },
      { property: "og:description", content: "Sign in to explore SAC Community posts, reels, and event moments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    throw redirect({ to: data.user ? "/explore" : "/login" });
  },
});
