import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { business } from "@/lib/business";

export const metadata: Metadata = { title: "About — daryai" };

export default function AboutPage() {
  return (
    <LegalPage title="About daryai">
      <p>
        {business.brand} is a clothing label that lives on Instagram first.
        Every piece you see on the site started as a reel — scroll the feed,
        find something you like, and check out without ever leaving the
        experience of browsing your favourite page.
      </p>
      <p>
        We keep the catalogue small and considered: what&apos;s posted is
        what&apos;s made, in limited quantities, so sizes and pieces do sell
        out.
      </p>
      <h2>Get in touch</h2>
      <p>
        Questions about an order, a piece, or anything else — see our{" "}
        <a href="/contact">Contact</a> page.
      </p>
    </LegalPage>
  );
}
