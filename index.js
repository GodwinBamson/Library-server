import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import borrowRoutes from "./routes/borrowRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

// --------------------
// CORS configuration - FIXED
// --------------------
const allowedOrigins = [
  "https://frontend-libraryapp.onrender.com",
  "http://localhost:5173",
  "http://localhost:5000",
  "https://library-server-5rpq.onrender.com",
];

// More permissive CORS for production
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman)
      if (!origin) return callback(null, true);

      // Check if origin is allowed
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV === "development"
      ) {
        callback(null, true);
      } else {
        console.log(" CORS blocked origin:", origin);
        callback(null, true); // Temporarily allow all origins for debugging
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    exposedHeaders: ["Content-Disposition"],
  }),
);

// Handle preflight requests
app.options("*", cors());

// --------------------
// Body parsers
// --------------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// --------------------
// Request logging
// --------------------
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Origin:", req.headers.origin);
  console.log(
    "Auth Header:",
    req.headers.authorization ? "Present" : "Missing",
  );
  next();
});

// --------------------
// Development uploads directory
// --------------------
if (process.env.NODE_ENV === "development") {
  const uploadDir = path.join(__dirname, "uploads/pdfs");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(" Created uploads directory for development");
  }

  try {
    const testFile = path.join(uploadDir, `test-${Date.now()}.txt`);
    fs.writeFileSync(testFile, "test");
    console.log(" Upload directory is writable");
    fs.unlinkSync(testFile);
  } catch (err) {
    console.error(" Upload directory is NOT writable:", err.message);
  }

  // Serve static files
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}

// --------------------
// Routes
// --------------------
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrow", borrowRoutes);

// --------------------
// Health check
// --------------------
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    message: "Server is running",
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working!",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// --------------------
// Error handling
// --------------------
app.use(notFound);
app.use(errorHandler);

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("\n========== SERVER STARTED ==========");
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🔗 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
  );
  console.log(` Allowed origins:`, allowedOrigins);
  if (process.env.NODE_ENV === "development") {
    console.log(` Upload directory: ${path.join(__dirname, "uploads/pdfs")}`);
  }
  console.log("====================================\n");
});
