import Link from "next/link";
import Feed from "@/components/Feed";

export default function HomePage() {
  return (
    <div className="pb-6">
      <div className="px-4 py-6 sm:px-0 sm:py-10">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          New in
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Scroll the grid. Tap anything you like.
        </p>
      </div>
      <Feed />

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
