import axios from "axios";

/**
 * Send OTP via Gupshup WhatsApp only.
 *
 * India WABA: Authentication + Copy-code templates often get "submitted"
 * but FAIL on delivery. Use a UTILITY template (no Copy code button):
 *   Your GutTalks verification code is {{1}}. Valid for 10 minutes. Do not share this code with anyone.
 *
 * Env:
 *   GUPSHUP_TEMPLATE_ID   = approved template UUID
 *   GUPSHUP_OTP_PARAM_COUNT = 1 for Utility | 2 for Auth Copy-code
 */
export const sendWhatsAppOtp = async (destinationPhone, otp) => {
  const apiKey = process.env.GUPSHUP_API_KEY;
  const source = (process.env.GUPSHUP_SOURCE || "919888198900").replace(/\D/g, "");
  const appName = process.env.GUPSHUP_APP_NAME || "GutTalks";
  const templateId =
    process.env.GUPSHUP_TEMPLATE_ID || "b52395d5-8bf1-4cc6-a7a5-d502fd98f462";
  // Utility = 1, Auth Copy-code = 2
  const paramCount = Number(process.env.GUPSHUP_OTP_PARAM_COUNT || 1);

  if (!apiKey) {
    throw new Error("Missing GUPSHUP_API_KEY in env");
  }

  const destination = String(destinationPhone).replace(/\D/g, "");
  if (!destination || destination.length < 10) {
    throw new Error("Invalid destination phone number");
  }

  const otpStr = String(otp);
  const params = paramCount >= 2 ? [otpStr, otpStr] : [otpStr];

  const body = new URLSearchParams();
  body.append("channel", "whatsapp");
  body.append("source", source);
  body.append("destination", destination);
  body.append("src.name", appName);
  body.append(
    "template",
    JSON.stringify({
      id: templateId,
      params,
    })
  );

  const { data, status } = await axios.post(
    "https://api.gupshup.io/wa/api/v1/template/msg",
    body.toString(),
    {
      headers: {
        apikey: apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 20000,
    }
  );

  console.log("Gupshup OTP response:", status, JSON.stringify(data), {
    to: destination,
    templateId,
    paramsCount: params.length,
  });

  if (data?.status && data.status !== "submitted" && data.status !== "success") {
    throw new Error(data.message || `Gupshup status: ${data.status}`);
  }

  return data;
};
