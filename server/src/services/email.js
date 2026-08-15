import nodemailer from "nodemailer";

const createTransporter = (port, secure) => {
  return nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER || "help@guttalks.in",
      pass: process.env.EMAIL_PASS || "Vansh*8586",
    },
    family: 4, // Force IPv4 to prevent production server IPv6 connection timeouts
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

const transporter465 = createTransporter(465, true);
const transporter587 = createTransporter(587, false);

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: '"GutTalks" <help@guttalks.in>',
    to,
    subject,
    html,
  };

  try {
    // Try primary Port 465 (SSL) with IPv4
    await transporter465.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to} (Port 465)`);
  } catch (error465) {
    console.warn(`⚠️ Port 465 failed (${error465.message}). Retrying with Port 587...`);
    try {
      // Fallback to Port 587 (TLS/STARTTLS) with IPv4
      await transporter587.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to} (Port 587)`);
    } catch (error587) {
      console.error("❌ Failed to send email on both Port 465 & 587:", error587.message);
      throw new Error(`Failed to send email: ${error587.message}`);
    }
  }
};

export default sendEmail;