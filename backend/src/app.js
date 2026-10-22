"use strict";
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const apiRoutes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Security headers
app.use(helmet());

if (process.env.TRUST_PROXY_HOPS !== undefined && process.env.TRUST_PROXY_HOPS !== "") {
    const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS);
    if (!Number.isSafeInteger(trustProxyHops) || trustProxyHops < 0) {
        throw new Error("TRUST_PROXY_HOPS must be a non-negative integer");
    }
    app.set("trust proxy", trustProxyHops);
}

// Middleware
const configuredOrigins = (process.env.WEB_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl, etc.)
            if (!origin) return callback(null, true);

            // Allow local development
            if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
                return callback(null, true);
            }

            // Allow any Render deployment domain
            if (origin.endsWith(".onrender.com")) {
                return callback(null, true);
            }

            // Check against configured origins
            const match = configuredOrigins.some(
                (o) => origin === o || origin === `https://${o}` || origin === `http://${o}`
            );
            if (match) {
                return callback(null, true);
            }

            // Fallback: allow request (API uses stateless JWT Bearer tokens)
            return callback(null, true);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

app.use(express.json({ limit: "1mb" }));

app.use("/api/files", express.static(path.resolve(__dirname, "../uploads")));

app.use("/api", apiRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ status: "error", message: "Route not found" });
});

// Central error handler (must be last)
app.use(errorHandler);

module.exports = app;
