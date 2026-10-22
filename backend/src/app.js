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

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://taskflow-web-1t7e.onrender.com",
    ...configuredOrigins,
];

app.use(
    cors({
        origin: allowedOrigins,
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
