import { Button } from "@/components/ui/button";
import { useAccount, signOutAccount } from "@/lib/account";
import { MyAvatar } from "@/components/site/MyAvatar";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Settings } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Explore-only header: brand, account avatar, settings, log in/out. No site navigation.
export function Header() {
  const account = useAccount();
  const onExplore = useRouterState({ select: (s) => s.location.pathname === "/explore" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 bg-background/95 text-foreground shadow-[0_1px_0_var(--color-border)] backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1480px] items-center gap-3 px-4 md:px-8">
        <Link to="/" className="shrink-0 whitespace-nowrap font-display text-base tracking-wide min-[360px]:text-lg sm:text-xl md:text-2xl">
          SAC <span className="text-primary">COMMUNITY</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {account.user ? (
            <>
              <span aria-label="Explore" aria-current={onExplore ? "page" : undefined} className="grid h-10 w-10 place-items-center">
                <span aria-hidden className="grid rounded-full ring-1 ring-foreground/15">
                  <MyAvatar size={32} />
                </span>
              </span>
              <Button asChild variant="ghost" size="icon">
                <Link to="/settings" aria-label="Settings" title="Settings"><Settings /></Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Log out"
                title="Log out"
                onClick={async () => {
                  await signOutAccount(queryClient);
                  void navigate({ to: "/login", replace: true });
                }}
              >
                <LogOut />
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Log in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
