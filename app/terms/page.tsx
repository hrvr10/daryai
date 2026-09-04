import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { business, fullAddress } from "@/lib/business";

export const metadata: Metadata = { title: "Terms & Conditions — daryai" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="September 2026">
      <p>
        These terms govern your use of {business.domain} (&quot;the
        site&quot;, &quot;we&quot;, &quot;us&quot;) and any purchase you make
        through it. By using the site or placing an order, you agree to them.
      </p>

      <h2>Products &amp; availability</h2>
      <p>
        Products are shown as they appear in our Instagram reels, priced in
        Indian Rupees (INR). We list pieces in limited quantities; an item can
        sell out or be taken down at any time, including after you&apos;ve
        added it to your cart but before you&apos;ve paid.
      </p>

      <h2>Orders &amp; payment</h2>
      <p>
        An order is confirmed only once payment is successfully completed via
        Razorpay. We reserve the right to cancel or refuse any order — for
        example if an item turns out to be out of stock, if there&apos;s a
        pricing error, or if we suspect fraud — in which case we&apos;ll
        refund any payment already made.
      </p>

      <h2>Pricing</h2>
      <p>
        We try to keep prices accurate, but errors can happen. If we find a
        pricing error on an order you&apos;ve placed, we&apos;ll contact you
        before proceeding, and you can choose to continue at the correct
        price or cancel for a full refund.
      </p>

      <h2>Shipping &amp; returns</h2>
      <p>
        See our <a href="/shipping">Shipping Policy</a> and{" "}
        <a href="/returns">Return &amp; Refund Policy</a> for details on
        delivery and our (limited) returns exception.
      </p>

      <h2>Intellectual property</h2>
      <p>
        All content on this site — including photos, reels, product designs,
        and the {business.brand} name and logo — belongs to us and may not be
        copied or reused without permission.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        We&apos;re not liable for indirect or incidental losses arising from
        your use of the site or a product you&apos;ve bought, beyond the
        value of your order, except where the law doesn&apos;t allow that
        limitation.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time; the current version is
        always the one posted here.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of India, and courts in New
        Delhi will have jurisdiction over any dispute.
      </p>

      <h2>Contact</h2>
      <p>
        {business.brand}, {fullAddress} —{" "}
        <a href={`mailto:${business.supportEmail}`}>
          {business.supportEmail}
        </a>
        .
      </p>
    </LegalPage>
  );
}
