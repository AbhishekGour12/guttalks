import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || "help@guttalks.in",
    pass: process.env.EMAIL_PASS || "Vanshika@2824#"
  }
});


const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: "help@guttalks.in",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.log('Error sending email:', error);
    throw new Error('Failed to send email');
  };
}

export default sendEmail;