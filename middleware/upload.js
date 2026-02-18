// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";
// import { v2 as cloudinary } from "cloudinary";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import dotenv from "dotenv";

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Configure Cloudinary for production
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Determine storage based on environment
// let storage;

// if (process.env.NODE_ENV === "production") {
//   // Cloudinary storage for production
//   storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//       folder: "library-books",
//       resource_type: "raw", // For PDF files
//       public_id: (req, file) => {
//         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//         return "pdf-" + uniqueSuffix;
//       },
//       format: async (req, file) => "pdf",
//       access_mode: "public", // Make files publicly accessible
//       use_filename: true,
//       unique_filename: true,
//     },
//   });
//   console.log(" Using Cloudinary storage for production with public access");
// } else {
//   // Local storage for development
//   const uploadDir = path.join(__dirname, "../uploads/pdfs");

//   // Ensure directory exists
//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//     console.log(" Created local upload directory");
//   }

//   storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       console.log(" Destination callback - saving to:", uploadDir);
//       cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//       const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       const filename = "pdf-" + uniqueSuffix + path.extname(file.originalname);
//       console.log(" Filename callback - generated:", filename);
//       cb(null, filename);
//     },
//   });

//   console.log(" Using local storage for development");
// }

// // File filter - only accept PDFs
// const fileFilter = (req, file, cb) => {
//   console.log(" File filter checking:", file.mimetype, file.originalname);

//   if (file.mimetype === "application/pdf") {
//     console.log(" PDF accepted");
//     cb(null, true);
//   } else {
//     console.log(" Not a PDF - rejecting");
//     cb(new Error("Only PDF files are allowed"), false);
//   }
// };

// // Create multer instance
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 50 * 1024 * 1024, // 50MB max
//   },
// });

// // Enhanced upload middleware with logging
// export const uploadPDF = (req, res, next) => {
//   console.log("\n========== UPLOAD MIDDLEWARE START ==========");
//   console.log(
//     `📤 Uploading PDF in ${process.env.NODE_ENV || "development"} mode...`,
//   );
//   console.log("Request headers:", req.headers["content-type"]);
//   console.log("Request method:", req.method);
//   console.log("Request path:", req.path);

//   const singleUpload = upload.single("pdfFile");

//   singleUpload(req, res, (err) => {
//     if (err) {
//       console.error(" Upload error:", err.message);
//       console.log("========== UPLOAD MIDDLEWARE END (ERROR) ==========\n");
//       return res.status(400).json({
//         message: err.message,
//         error: "File upload failed",
//       });
//     }

//     console.log("\n Multer processing complete");
//     console.log("req.file:", req.file ? "PRESENT" : "MISSING");

//     if (req.file) {
//       console.log(" File details:");
//       console.log(`   - Original name: ${req.file.originalname}`);
//       console.log(`   - Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);
//       console.log(`   - Mime type: ${req.file.mimetype}`);

//       if (process.env.NODE_ENV === "production") {
//         console.log(`   - Cloudinary URL: ${req.file.path}`);
//         req.file.cloudinaryUrl = req.file.path;
//       } else {
//         console.log(`   - Saved as: ${req.file.filename}`);
//         console.log(`   - Full path: ${req.file.path}`);

//         // Verify file was saved
//         if (fs.existsSync(req.file.path)) {
//           console.log("    File exists on disk");
//         } else {
//           console.log("    File NOT found on disk!");
//         }
//       }
//     } else {
//       console.log(" No file uploaded - check frontend FormData");
//       console.log("req.body:", req.body);
//     }

//     console.log("========== UPLOAD MIDDLEWARE END ==========\n");
//     next();
//   });
// };

// export default upload;





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

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("\n========== UPLOAD CONFIGURATION ==========");
console.log("Raw NODE_ENV:", process.env.NODE_ENV);
console.log("NODE_ENV type:", typeof process.env.NODE_ENV);
console.log("NODE_ENV === 'production':", process.env.NODE_ENV === "production");

// Force production detection for Render
const isRender = process.env.RENDER === "true" || 
                 (process.env.HOSTNAME && process.env.HOSTNAME.includes('render.com')) ||
                 (process.env.RENDER_EXTERNAL_URL) ||
                 (process.env.RENDER_INTERNAL_URL);

const isProduction = process.env.NODE_ENV === "production" || isRender;

console.log("Is Render?", isRender);
console.log("Is Production?", isProduction);

// Determine storage based on environment
let storage;

if (isProduction) {
  console.log("✅ USING CLOUDINARY STORAGE FOR PRODUCTION");
  
  // Verify Cloudinary credentials
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("❌ ERROR: Cloudinary credentials missing!");
    console.error("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "✓" : "✗");
    console.error("API Key:", process.env.CLOUDINARY_API_KEY ? "✓" : "✗");
    console.error("API Secret:", process.env.CLOUDINARY_API_SECRET ? "✓" : "✗");
  } else {
    console.log("✓ Cloudinary credentials verified");
  }

  // Cloudinary storage for production
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "library-books",
      resource_type: "raw", // For PDF files
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const publicId = "pdf-" + uniqueSuffix;
        console.log(`Generated public_id: ${publicId}`);
        return publicId;
      },
      format: async (req, file) => {
        console.log("Setting format to pdf");
        return "pdf";
      },
      access_mode: "public",
      use_filename: true,
      unique_filename: true,
    },
  });
  console.log("✓ Cloudinary storage configured with public access");
} else {
  console.log("⚠️ USING LOCAL STORAGE FOR DEVELOPMENT");
  
  // Local storage for development
  const uploadDir = path.join(__dirname, "../uploads/pdfs");

  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("✓ Created local upload directory");
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      console.log("Saving to local directory:", uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = "pdf-" + uniqueSuffix + path.extname(file.originalname);
      console.log("Generated local filename:", filename);
      cb(null, filename);
    },
  });
}

console.log("==========================================\n");

// File filter - only accept PDFs
const fileFilter = (req, file, cb) => {
  console.log("File filter checking:", file.mimetype, file.originalname);

  if (file.mimetype === "application/pdf") {
    console.log("✓ PDF accepted");
    cb(null, true);
  } else {
    console.log("✗ Not a PDF - rejecting");
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

// Enhanced upload middleware with logging
export const uploadPDF = (req, res, next) => {
  console.log("\n========== UPLOAD MIDDLEWARE START ==========");
  console.log(`📤 Uploading PDF in ${process.env.NODE_ENV || "development"} mode...`);
  console.log("Is production:", isProduction);
  console.log("Request headers:", req.headers["content-type"]);
  console.log("Request method:", req.method);
  console.log("Request path:", req.path);

  const singleUpload = upload.single("pdfFile");

  singleUpload(req, res, (err) => {
    if (err) {
      console.error("❌ Upload error:", err.message);
      console.error("Error details:", {
        name: err.name,
        code: err.code,
        stack: err.stack
      });
      
      return res.status(400).json({
        message: err.message,
        error: "File upload failed",
      });
    }

    console.log("\n✅ Multer processing complete");
    console.log("req.file:", req.file ? "PRESENT" : "MISSING");

    if (req.file) {
      console.log("📄 File details:");
      console.log(`   - Original name: ${req.file.originalname}`);
      console.log(`   - Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   - Mime type: ${req.file.mimetype}`);

      if (isProduction) {
        console.log(`   - Cloudinary URL: ${req.file.path}`);
        console.log(`   - Valid Cloudinary URL? ${req.file.path?.includes('cloudinary.com')}`);
        
        if (!req.file.path || !req.file.path.includes('cloudinary.com')) {
          console.error("❌ CRITICAL ERROR: Upload did not return a Cloudinary URL!");
        } else {
          console.log("✅ Successfully uploaded to Cloudinary");
        }
      } else {
        console.log(`   - Saved as: ${req.file.filename}`);
        console.log(`   - Full path: ${req.file.path}`);

        if (fs.existsSync(req.file.path)) {
          console.log("✅ File exists on disk");
        } else {
          console.log("❌ File NOT found on disk!");
        }
      }
    } else {
      console.log("⚠️ No file uploaded - check frontend FormData");
      console.log("req.body:", req.body);
    }

    console.log("========== UPLOAD MIDDLEWARE END ==========\n");
    next();
  });
};

export default upload;