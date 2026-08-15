import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const emailUser = 'help@guttalks.in';
const emailPass = process.env.EMAIL_PASS || 'Vansh*8586';

async function testConfig(port, secure) {
  console.log(`\nTesting SMTP hostinger on port ${port} (secure: ${secure})...`);
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port,
    secure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  try {
    await transporter.verify();
    console.log(`✅ Port ${port} (secure: ${secure}) Authentication SUCCESS!`);
  } catch (err) {
    console.log(`❌ Port ${port} failed: ${err.message}`);
  }
}

async function run() {
  await testConfig(465, true);
  await testConfig(587, false);
}

run();
