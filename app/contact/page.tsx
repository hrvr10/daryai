import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { business, fullAddress } from "@/lib/business";

export const metadata: Metadata = { title: "Contact — daryai" };

export default function ContactPage() {
  return (
    <LegalPage title="Contact us">
      <p>
        For order queries, sizing questions, or anything else, reach us at:
      </p>
      <h2>Email</h2>
      <p>
        <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a>
      </p>
      <h2>Phone</h2>
      <p>
        <a href={`tel:${business.supportPhoneHref}`}>
          {business.supportPhoneDisplay}
        </a>
      </p>
      <h2>Address</h2>
      <p>{fullAddress}</p>
    </LegalPage>
  );
}
