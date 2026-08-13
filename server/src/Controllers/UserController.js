import User from "../Models/User.js";
import jwt from "jsonwebtoken";
import { sendWhatsAppOtp } from "../services/otpDelivery.js";

const otpStore = new Map();
const otpRateLimitStore = new Map();


const Login = async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });
    }

    try {
        // 1. Verify OTP from your Map store
        const record = otpStore.get(phone);

        if (!record) {
            return res.status(400).json({ success: false, message: "OTP expired or not found" });
        }

        if (Date.now() > record.expiresAt) {
            otpStore.delete(phone);
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        if (record.otp.toString() !== otp.toString()) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // OTP is valid, remove it
        otpStore.delete(phone);

        // 2. Find or Create User
        // If user doesn't exist, this is their "Signup"
        let user = await User.findOne({ phone: phone });

        if (!user) {
            user = new User({
                phone: phone,
                isProfileComplete: false // They will fill name/details later
            });
            await user.save();
        }

        // 3. Generate JWT
        const token = jwt.sign(
            { id: user._id, role: "user" },
            process.env.JWT_SECRET
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: user
        });

    } catch (error) {
        console.error("Auth Error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

const requestotp = async (req, res) => {
    // + in URL may arrive encoded; normalize to digits with country code
    let phone = decodeURIComponent(req.params.phone || "").replace(/\s/g, "");
    if (phone && !phone.startsWith("+")) {
        phone = phone.startsWith("91") && phone.length >= 12 ? `+${phone}` : `+91${phone}`;
    }

    console.log("========== requestotp HIT ==========", phone);

    try {
        if (!phone || phone.replace(/\D/g, "").length < 10) {
            return res.status(400).json({ success: false, message: 'Invalid phone number format. Must be E.164 (+CCNNNNNNNNN).' });
        }

        const now = Date.now();
        const lastRequest = otpRateLimitStore.get(phone);
        if (lastRequest && now - lastRequest < 60000) {
            return res.status(429).json({ success: false, message: "Too many OTP requests. Please wait 1 minute." });
        }
        otpRateLimitStore.set(phone, now);

        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStore.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

        console.log("Sending WhatsApp OTP via Gupshup to", phone);
        const gupshupRes = await sendWhatsAppOtp(phone, otp);
        console.log("Gupshup OTP response:", JSON.stringify(gupshupRes));

        return res.status(200).json({
            success: true,
            message: "OTP sent on WhatsApp.",
            channel: "whatsapp",
        });
    } catch (err) {
        const details = err?.response?.data || err.message;
        console.error("requestotp WhatsApp error:", details);
        res.status(500).json({
            success: false,
            message: "Failed to send WhatsApp OTP. Please try again.",
            error: typeof details === "string" ? details : details?.message || "Gupshup error",
        });
    }
};

const userProfile = async (req, res) => {
    try {
        const token = req.params.token;
        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        // Validate decoded.id format to avoid Mongoose CastError (e.g. from local storage collisions)
        if (!decoded.id || typeof decoded.id !== "string" || !/^[0-9a-fA-F]{24}$/.test(decoded.id)) {
            return res.status(401).json({ message: "Invalid token payload structure" });
        }

        const result = await User.findById(decoded.id);

        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User profile retrieved successfully", data: result });
    } catch (error) {
        console.error("Error retrieving user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


const deleteUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const user = async (req, res) => {
    const phone = req.params.phone;

    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;


    try {
        const existingUser = await User.findOne({ phone: formattedPhone });

        if (!existingUser) {
            return res.status(200).json({ success: false, message: "User not found with this contact" });
        }
        else {
            return res.status(200).json({ success: true, message: "User not found with this contact" });

        }

    } catch (err) {
        console.error("Error finding user:", err);
        res.status(500).json({ message: "Internal server error" });
    }

}
export { Login, requestotp, userProfile, deleteUser, user };