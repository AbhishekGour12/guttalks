import LegalPageLayout from "../components/LegalPageLayout";
import Link from "next/link";

export default function CancellationPolicy() {
  return (
    <LegalPageLayout title="Cancellation Policy" lastUpdated="August 9, 2026">
      <p>
        This page summarizes how cancellations work at GutTalks. For full details, see our{" "}
        <Link href="/refund-policy" className="text-[#18606D] font-semibold underline">
          Refund & Cancellation Policy
        </Link>
        .
      </p>

      <h2>Consultations</h2>
      <ul>
        <li>Cancel before your scheduled appointment to request a refund or reschedule.</li>
        <li>Completed consultations are non-refundable.</li>
        <li>Please notify us as early as possible if you cannot attend.</li>
      </ul>

      <h2>Programs & Personalized Products</h2>
      <p>
        Once processing has begun for personalized nutrition plans, microbiome reports, or custom products, cancellations and refunds are generally not available due to their customized nature.
      </p>

      <h2>Need Help?</h2>
      <p>
        Email <strong>hello@guttalks.com</strong> or visit <strong>274-275, Bombay Nagar, Jalandhar</strong> (10 AM – 9 PM IST, all days).
      </p>
    </LegalPageLayout>
  );
}
