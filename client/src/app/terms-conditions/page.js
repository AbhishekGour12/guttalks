import LegalPageLayout from "../components/LegalPageLayout";
import { CONTACT } from "../lib/guttalksContent";

export default function TermsConditions() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="August 9, 2026">
      <p>By using GutTalks services, you agree to:</p>
      <ul>
        <li>Provide accurate information.</li>
        <li>Use our services responsibly.</li>
        <li>Follow recommendations at your discretion.</li>
        <li>Understand that individual results may vary.</li>
      </ul>

      <h2>Services</h2>
      <p>
        GutTalks provides personalized gut health guidance including Root Rx consultations, GutMap Complete™ microbiome testing, The Gut Blueprint restoration program, RychBiome personalized probiotics, and The Gut Rebalance Journey nutrition programs. Consultations are educational and wellness-focused and do not replace medical diagnosis or emergency care.
      </p>

      <h2>Booking & Payment</h2>
      <p>
        Services are booked through our website. Payment is collected at booking via our payment partner. Prices are shown on each product or program page and may be updated with notice.
      </p>

      <h2>Cancellation & Refunds</h2>
      <p>
        Please refer to our Refund & Cancellation Policy for consultation and personalized program rules.
      </p>

      <h2>Medical Disclaimer</h2>
      <p>
        Information and recommendations from GutTalks do not diagnose, treat, cure, or prevent medical conditions. Always seek advice from a qualified healthcare professional for medical concerns.
      </p>

      <h2>Updates</h2>
      <p>
        GutTalks reserves the right to update its services, policies, and terms as needed. Continued use of the platform after changes constitutes acceptance of the updated terms.
      </p>

      <h2>Our Promise</h2>
      <p>
        At GutTalks, you&apos;re more than a customer—you&apos;re part of our wellness community. We are committed to personalized guidance, science-backed nutrition support, and compassionate care to help you achieve lasting gut health.
      </p>

      <h2>Contact</h2>
      <p>
        <strong>{CONTACT.address}</strong><br />
        {CONTACT.hours}<br />
        <strong>{CONTACT.email}</strong>
      </p>
    </LegalPageLayout>
  );
}
