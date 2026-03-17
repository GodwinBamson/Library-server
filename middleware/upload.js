import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary for production
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("\n========== UPLOAD CONFIGURATION ==========");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Cloudinary Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);

// FORCE PRODUCTION MODE FOR RENDER
const isProduction = process.env.NODE_ENV === "production" || true;

// Determine storage based on environment
let storage;

if (isProduction) {
  console.log("✅ USING CLOUDINARY STORAGE FOR PRODUCTION");

  // Cloudinary storage for production
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "library-books",
      resource_type: "raw", // For PDF files
      public_id: (req, file) => {
        // Use original filename but make it URL-safe
        const originalName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension
        const safeName = originalName.replace(/[^a-zA-Z0-9]/g, "_");
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        return `${safeName}-${uniqueSuffix}`;
      },
      format: "pdf", // Force PDF format
      access_mode: "public", // Make files publicly accessible
    },
  });
} else {
  console.log("⚠️ USING LOCAL STORAGE FOR DEVELOPMENT");

  // Local storage for development
  const uploadDir = path.join(__dirname, "../uploads/pdfs");

  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(" Created local upload directory");
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = "pdf-" + uniqueSuffix + ".pdf";
      cb(null, filename);
    },
  });
}

console.log("==========================================\n");

// File filter - only accept PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

// Enhanced upload middleware with logging - THIS IS THE KEY FIX
export const uploadPDF = (req, res, next) => {
  console.log("\n========== UPLOAD MIDDLEWARE START ==========");
  console.log(
    `📤 Uploading PDF in ${process.env.NODE_ENV || "development"} mode...`,
  );

  const singleUpload = upload.single("pdfFile");

  singleUpload(req, res, async (err) => {
    if (err) {
      console.error("❌ Upload error:", err.message);
      return res.status(400).json({
        message: err.message,
        error: "File upload failed",
      });
    }

    console.log("\n✅ Multer processing complete");

    if (req.file) {
      console.log("📄 File details:");
      console.log(`   - Original name: ${req.file.originalname}`);
      console.log(`   - Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

      // ========== CRITICAL FIX FOR PRODUCTION ==========
      if (isProduction) {
        console.log(`   - Raw path from Cloudinary: ${req.file.path}`);

        // CloudinaryStorage returns the URL in req.file.path, but sometimes it's incomplete
        // Let's construct the full URL manually to be safe
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

        // Get the filename from either:
        // 1. req.file.filename (if available)
        // 2. Extract from req.file.path
        // 3. Generate from original name

        let filename;

        if (req.file.filename) {
          // req.file.filename usually has the format: folder/public_id.format
          // Extract just the public_id.format part
          const parts = req.file.filename.split("/");
          filename = parts[parts.length - 1];
        } else if (req.file.path) {
          // Extract from path
          const parts = req.file.path.split("/");
          filename = parts[parts.length - 1];
        } else {
          // Generate from original name
          const originalName = req.file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension
          const safeName = originalName.replace(/[^a-zA-Z0-9]/g, "_");
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          filename = `${safeName}-${uniqueSuffix}.pdf`;
        }

        // Ensure filename has .pdf extension
        if (!filename.toLowerCase().endsWith(".pdf")) {
          filename = filename + ".pdf";
        }

        // Clean the filename - remove any invalid characters for URL
        filename = encodeURIComponent(filename);

        // Construct the FULL Cloudinary URL
        const fullUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/library-books/${filename}`;

        console.log(`   🔧 Constructed FULL URL: ${fullUrl}`);

        // OVERRIDE the path with the full URL
        req.file.path = fullUrl;
        req.file.cloudinaryUrl = fullUrl;

        // IMPORTANT: Also store the original filename for reference
        req.file.originalFilename = req.file.originalname;

        console.log(`   ✅ Final URL that will be saved: ${req.file.path}`);
      } else {
        console.log(`   - Saved locally as: ${req.file.filename}`);
        console.log(`   - Full path: ${req.file.path}`);
      }
    } else {
      console.log("⚠️ No file uploaded");
    }

    console.log("========== UPLOAD MIDDLEWARE END ==========\n");
    next();
  });
};

export default upload;
