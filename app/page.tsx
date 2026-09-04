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
    </div>
  );
}
