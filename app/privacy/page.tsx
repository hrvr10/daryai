import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { business, fullAddress } from "@/lib/business";

export const metadata: Metadata = { title: "Privacy Policy — daryai" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 2026">
      <p>
        This explains what information we collect on {business.domain} and
        how we use it.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Order information</strong> — name, email, phone number, and
          shipping address, when you check out.
        </li>
        <li>
          <strong>Payment information</strong> — payments are handled
          entirely by Razorpay. We never see or store your card, UPI, or bank
          details; Razorpay processes and secures that data under its own
          policies.
        </li>
        <li>
          <strong>Cart data</strong> — what&apos;s in your cart is stored in
          your browser (localStorage), not on our servers, until you check
          out.
        </li>
        <li>
          <strong>Contact messages</strong> — anything you email or call us
          with.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        Solely to process and deliver your order, contact you about it (e.g.
        shipping updates or a damage claim under our{" "}
        <a href="/returns">Return &amp; Refund Policy</a>), and respond to
        questions you send us. We don&apos;t use your data for anything else.
      </p>

      <h2>Sharing</h2>
      <p>
        We share order details with our payment processor (Razorpay) and
        courier partners only as needed to complete your order. We don&apos;t
        sell your personal information to anyone.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep order records for as long as needed for accounting, tax, and
        customer-service purposes.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us what information we hold about you, or ask us to
        correct or delete it, by emailing{" "}
        <a href={`mailto:${business.supportEmail}`}>
          {business.supportEmail}
        </a>
        .
      </p>

      <h2>Contact</h2>
      <p>
        {business.brand}, {fullAddress} —{" "}
        <a href={`mailto:${business.supportEmail}`}>
          {business.supportEmail}
        </a>{" "}
        —{" "}
        <a href={`tel:${business.supportPhoneHref}`}>
          {business.supportPhoneDisplay}
        </a>
      </p>
    </LegalPage>
  );
}
