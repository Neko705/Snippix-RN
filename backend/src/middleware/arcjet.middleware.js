import e from "express";
import { aj } from "../config/arcjet.js";

// Arcjet middleware to apply security rules
export const arcjetMiddleware = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, {
            requested: 1, // each request counts as 1
        });
        // handle denied requests
        if (decision.isDenied) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ error: "Too many requests", message: "You have exceeded the rate limit. Please try again later." });
            }else if (decision.reason.isBot()) {
                return res.status(403).json({ error: "Access denied for bots.", message: "Your request was blocked as it appears to be from a bot." });
            }else {
                return res.status(403).json({ error: "Access denied", message: "Your request was blocked due to security rules." });
            }
        }
        // check for spoofed bots
        if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
            return res.status(403).json({ error: "Access denied for spoofed bots.", message: "Your request was blocked as it appears to be from a spoofed bot." });
        }
        next(); // proceed to the next middleware or route handler
    } catch (error) {
        console.error("Arcjet middleware error:", error);
        next(); // allow the request to proceed even if Arcjet fails
    }
}