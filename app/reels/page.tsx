import type { Metadata } from "next";
import ReelFeed from "@/components/ReelFeed";

export const metadata: Metadata = { title: "Reels — daryai" };

export default function ReelsPage() {
  return <ReelFeed />;
}
