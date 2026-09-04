import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { business, fullAddress } from "@/lib/business";

export const metadata: Metadata = { title: "Return & Refund Policy — daryai" };

export default function ReturnsPage() {
  return (
    <LegalPage title="Return & Refund Policy" updated="September 2026">
      <p>
        We want you to love what you order. Please read this policy carefully
        before you buy, since it&apos;s more limited than most stores.
      </p>

      <h2>No returns or exchanges</h2>
      <p>
        All sales are final. We do not accept returns or exchanges for
        reasons such as change of mind, sizing, or fit. Please check the size
        chart and product details carefully before ordering.
      </p>

      <h2>Exception: damage in transit</h2>
      <p>
        The only exception is if your order arrives damaged or shows wear and
        tear from shipping. In that case:
      </p>
      <ul>
        <li>
          Email{" "}
          <a href={`mailto:${business.supportEmail}`}>
            {business.supportEmail}
          </a>{" "}
          within <strong>24 hours of delivery</strong>. Claims reported after
          24 hours will not be accepted.
        </li>
        <li>
          Include your order number, and photos or a short video clearly
          showing the damage and the shipping packaging.
        </li>
        <li>
          Once we review and confirm the damage, we&apos;ll arrange a
          replacement where available, or a refund.
        </li>
      </ul>

      <h2>Refunds</h2>
      <p>
        Approved refunds are processed to your original payment method
        through Razorpay. Depending on your bank, it can take a few business
        days after we initiate it to reflect in your account.
      </p>

      <h2>Where returns (if approved) are sent</h2>
      <p>{fullAddress}</p>

      <h2>Questions</h2>
      <p>
        Call us at{" "}
        <a href={`tel:${business.supportPhoneHref}`}>
          {business.supportPhoneDisplay}
        </a>{" "}
        or see our <a href="/contact">Contact</a> page.
      </p>
    </LegalPage>
  );
}
