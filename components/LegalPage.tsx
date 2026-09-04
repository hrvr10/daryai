import Link from "next/link";
import type { ReactNode } from "react";

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="px-4 py-8 sm:px-0">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-neutral-500 hover:text-black"
        >
          ← Back to shop
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {updated && (
          <p className="mt-1 text-xs text-neutral-400">Last updated {updated}</p>
        )}
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-neutral-600 [&_a]:text-black [&_a]:underline [&_h2]:pt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-black [&_li]:ml-5 [&_li]:list-disc [&_p]:text-sm [&_ul]:space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
}
