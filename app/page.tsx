import Link from "next/link";
import Feed from "@/components/Feed";
import { listProducts } from "@/lib/db";

// Was a client-only fetch on mount — first paint showed an empty grid
// until the browser finished hydrating AND round-tripped to Firestore.
// Fetching the first page here bakes it straight into the served HTML,
// so a cold visit shows real product tiles immediately.
export const revalidate = 30;

export default async function HomePage() {
  const { items, nextCursor } = await listProducts({ limit: 12 });

  return (
    <div className="pb-6">
      <Feed initialItems={items} initialCursor={nextCursor} />

      {/* Mobile-only entry into the full-screen, swipeable reel view. */}
      <Link
        href="/reels"
        aria-label="Watch reels"
        className="fixed bottom-5 right-4 z-30 flex items-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-medium text-white shadow-lg sm:hidden"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="4"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M10 8.5v7l6-3.5Z" fill="currentColor" />
        </svg>
        Reels
      </Link>
    </div>
  );
}
