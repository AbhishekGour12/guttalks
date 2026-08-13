import LegalPageLayout from "../components/LegalPageLayout";
import { CONTACT } from "../lib/guttalksContent";

export default function RefundPolicy() {
  return (
    <LegalPageLayout title="Refund & Cancellation Policy" lastUpdated="August 9, 2026">
      <h2>Consultations</h2>
      <ul>
        <li>Cancellations made before the scheduled appointment are eligible for a refund or rescheduling.</li>
        <li>Completed consultations are non-refundable.</li>
      </ul>

      <h2>Programs & Personalized Services</h2>
      <p>
        Due to their customized nature, personalized nutrition plans, microbiome reports, and custom products cannot be refunded once processing has begun.
      </p>
      <p>Approved refunds will be processed within the applicable timeframe.</p>

      <h2>Disclaimer</h2>
      <p>
        GutTalks provides evidence-based nutrition and gut wellness guidance. Our services do not diagnose, treat, cure, or prevent medical conditions. Individual results may vary depending on health status, lifestyle, and adherence to recommendations.
      </p>
      <p>
        For medical emergencies or serious health concerns, please consult a qualified healthcare professional.
      </p>

      <h2>Contact</h2>
      <p>
        Email <strong>{CONTACT.email}</strong> or visit <strong>{CONTACT.address}</strong> ({CONTACT.hours}).
      </p>
    </LegalPageLayout>
  );
}
