import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-4 py-16 text-center sm:px-0">
      <h1 className="text-xl font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-neutral-500">
        That page or product doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-black px-5 py-3 text-sm font-medium text-white"
      >
        Back to feed
      </Link>
    </div>
  );
}
