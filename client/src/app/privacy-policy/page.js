import LegalPageLayout from "../components/LegalPageLayout";
import { CONTACT } from "../lib/guttalksContent";

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="August 9, 2026">
      <p>
        At GutTalks, we value your privacy and are committed to protecting your personal and health information.
      </p>

      <h2>Information We Collect</h2>
      <ul>
        <li>Personal details (name, email, phone number)</li>
        <li>Health information shared during consultations</li>
        <li>Test reports and microbiome data (if applicable)</li>
        <li>Payment and transaction details</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide personalized gut health services</li>
        <li>Schedule consultations and communicate updates</li>
        <li>Develop nutrition and wellness recommendations</li>
        <li>Improve our services</li>
      </ul>
      <p>
        Your personal information is securely stored and is never sold to third parties for marketing purposes.
      </p>

      <h2>Consultation Policy</h2>
      <p>Our consultations are designed to provide personalized nutrition and gut health guidance.</p>
      <ul>
        <li>Consultations are conducted online by appointment.</li>
        <li>Please provide accurate health information for the best recommendations.</li>
        <li>Join your appointment on time or notify us in advance if you need to reschedule.</li>
      </ul>
      <p>
        <strong>Please Note:</strong> GutTalks consultations are educational and wellness-focused and do not replace medical diagnosis or emergency healthcare.
      </p>

      <h2>Product & Supplement Policy</h2>
      <p>Our supplements and wellness products are developed with quality and safety in mind.</p>
      <ul>
        <li>Use products as directed.</li>
        <li>Inform us of any allergies, medical conditions, or medications before use.</li>
        <li>Results may vary based on individual health, lifestyle, and consistency.</li>
      </ul>

      <h2>Customer Support</h2>
      <p>Our team is here to help with:</p>
      <ul>
        <li>Consultation bookings</li>
        <li>Program guidance</li>
        <li>Product-related queries</li>
        <li>Technical assistance</li>
        <li>General customer support</li>
      </ul>
      <p>We strive to respond promptly and provide a supportive experience.</p>

      <h2>Disclaimer</h2>
      <p>
        GutTalks provides evidence-based nutrition and gut wellness guidance. Our services do not diagnose, treat, cure, or prevent medical conditions. Individual results may vary depending on health status, lifestyle, and adherence to recommendations.
      </p>
      <p>
        For medical emergencies or serious health concerns, please consult a qualified healthcare professional.
      </p>

      <h2>Our Promise</h2>
      <p>
        At GutTalks, you&apos;re more than a customer—you&apos;re part of our wellness community. We are committed to providing personalized guidance, science-backed nutrition support, and compassionate care to help you achieve lasting gut health.
      </p>

      <h2>Contact Us</h2>
      <p>
        Visit: <strong>{CONTACT.address}</strong><br />
        Hours: <strong>{CONTACT.hours}</strong><br />
        Email: <strong>{CONTACT.email}</strong>
      </p>
    </LegalPageLayout>
  );
}
