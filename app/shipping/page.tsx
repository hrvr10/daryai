import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { business, fullAddress } from "@/lib/business";

export const metadata: Metadata = { title: "Shipping Policy — daryai" };

export default function ShippingPage() {
  return (
    <LegalPage title="Shipping Policy" updated="September 2026">
      <p>
        This policy explains how we ship orders placed on {business.domain}.
      </p>

      <h2>Where we ship from</h2>
      <p>All orders are dispatched from our facility at:</p>
      <p>{fullAddress}</p>

      <h2>Where we ship to</h2>
      <p>
        We currently ship across India. If you need delivery outside India,
        write to us at{" "}
        <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a>{" "}
        before ordering and we&apos;ll let you know if it&apos;s possible.
      </p>

      <h2>Processing &amp; delivery time</h2>
      <p>
        Orders are processed and handed to our courier partner after payment
        is confirmed. Delivery timelines depend on your location and the
        courier&apos;s serviceability; you&apos;ll receive tracking details by
        email once your order ships. Delays can occasionally happen due to
        courier delays, weather, or regional restrictions — we&apos;ll keep
        you posted if that happens on your order.
      </p>

      <h2>Shipping charges</h2>
      <p>
        Any shipping charges applicable to your order are shown at checkout
        before you pay — the amount you&apos;re charged there is final.
      </p>

      <h2>Order tracking</h2>
      <p>
        Once your order is shipped, you&apos;ll get a tracking link by email.
        If you haven&apos;t received one within a reasonable time, contact us
        at{" "}
        <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a>{" "}
        or call{" "}
        <a href={`tel:${business.supportPhoneHref}`}>
          {business.supportPhoneDisplay}
        </a>
        .
      </p>

      <h2>Questions</h2>
      <p>
        Reach out any time — see our <a href="/contact">Contact</a> page.
      </p>
    </LegalPage>
  );
}
