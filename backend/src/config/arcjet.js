import arcjet, { tokenBucket, shield, detectBot } from '@arcjet/node';
import { ENV } from './env.js';

// Initialize Arcjet with security rules
export const aj = arcjet({
    key: ENV.ARCJET_KEY,
    characteristics: ["ip.src"],
    rules:[
        // shield protects your app from common attacks eg: SQL injection, XSS, etc.
        shield({mode: "LIVE"}),

        // bot detection - blocks all bots except search engine bots
        detectBot({
            mode: "LIVE",
            allow: [
                "CATEGORY:SEARCH_ENGINE"
            ]
        }),

        // rate limiting with token bucket algorithm
        tokenBucket({
            mode: "LIVE",
            refillRate: 10, // 10 requests per second
            interval: 10, // interval in 10 seconds
            capacity: 15, // 15 requests burst capacity
        }),
    ],
});