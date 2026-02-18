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
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Cloudinary Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);

// FORCE PRODUCTION MODE FOR RENDER
const isProduction = true; // Force to true for Render

console.log("Using production mode:", isProduction);

let storage;

if (isProduction) {
  console.log("✅ CONFIGURING CLOUDINARY STORAGE");
  
  // Custom storage to ensure proper URL and extension
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      // Generate unique filename WITH .pdf extension
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const publicId = `pdf-${uniqueSuffix}`;
      
      console.log("📤 Uploading to Cloudinary:");
      console.log("  - Original name:", file.originalname);
      console.log("  - Public ID:", publicId);
      
      return {
        folder: "library-books",
        resource_type: "raw",
        public_id: publicId,
        access_mode: "public",
        use_filename: false,
        unique_filename: true,
        format: "pdf", // Force PDF extension
      };
    },
  });
  
  console.log("✅ Cloudinary storage configured");
  
} else {
  console.log("⚠️ USING LOCAL STORAGE");
  
  // Local storage for development
  const uploadDir = path.join(__dirname, "../uploads/pdfs");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = "pdf-" + uniqueSuffix + ".pdf"; // Ensure .pdf extension
      cb(null, filename);
    },
  });
}

console.log("==========================================\n");

// File filter
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
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Upload middleware
export const uploadPDF = (req, res, next) => {
  console.log("\n========== UPLOAD MIDDLEWARE ==========");
  
  const singleUpload = upload.single("pdfFile");

  singleUpload(req, res, async (err) => {
    if (err) {
      console.error("❌ Upload error:", err);
      return res.status(400).json({ message: err.message });
    }

    if (req.file) {
      console.log("✅ File uploaded successfully");
      console.log("  - Original name:", req.file.originalname);
      console.log("  - Size:", (req.file.size / 1024 / 1024).toFixed(2), "MB");
      console.log("  - Filename:", req.file.filename);
      console.log("  - Path from Cloudinary:", req.file.path);
      
      // FOR PRODUCTION: Construct the FULL Cloudinary URL
      if (isProduction) {
        // Get the filename (ensure it has .pdf extension)
        let filename = req.file.filename;
        if (!filename.endsWith('.pdf')) {
          filename = filename + '.pdf';
        }
        
        // Construct the full URL
        const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${filename}`;
        
        console.log("  🔧 Original path:", req.file.path);
        console.log("  🔧 Constructed URL:", cloudinaryUrl);
        
        // Override with full URL
        req.file.path = cloudinaryUrl;
        req.file.cloudinaryUrl = cloudinaryUrl;
        
        console.log("  ✅ Final URL stored:", req.file.path);
      }
    } else {
      console.log("⚠️ No file uploaded");
    }

    next();
  });
};

export default upload;