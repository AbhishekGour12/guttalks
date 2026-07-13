import jwt from "jsonwebtoken";

/* ===============================
   COMMON AUTH (USER / ASTROLOGER / ADMIN)
================================ */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
   

    // ✅ FIXED CONDITION
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
    // Validate decoded.id format to avoid Mongoose CastError across protected routes
    if (!decoded.id || typeof decoded.id !== "string" || !/^[0-9a-fA-F]{24}$/.test(decoded.id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload structure",
      });
    }

    req.user = decoded;

    next(); // ✅ this will now work properly
  } catch (err) {
    console.log("JWT Error:", err.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/* ===============================
   ROLE BASED GUARDS
================================ */



