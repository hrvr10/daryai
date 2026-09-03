import Feed from "@/components/Feed";

export default function HomePage() {
  return (
    <div className="pb-6">
      <div className="px-4 py-5 sm:px-0">
        <h1 className="text-xl font-semibold tracking-tight">New in</h1>
        <p className="text-sm text-neutral-500">
          Scroll the grid. Tap anything you like.
        </p>
      </div>
      <Feed />
    </div>
  );
}
