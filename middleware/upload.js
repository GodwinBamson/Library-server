// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Log all paths for debugging
// console.log("\n========== UPLOAD CONFIGURATION ==========");
// console.log(" __dirname:", __dirname);
// console.log("Current working directory:", process.cwd());

// const uploadDir = path.join(__dirname, "../uploads/pdfs");
// console.log("Configured upload directory:", uploadDir);

// // Check if directory exists
// if (fs.existsSync(uploadDir)) {
//   console.log("Upload directory exists");

//   // Check if it's writable
//   try {
//     fs.accessSync(uploadDir, fs.constants.W_OK);
//     console.log("Upload directory is writable");

//     // Try to write a test file
//     const testFile = path.join(uploadDir, `test-${Date.now()}.txt`);
//     fs.writeFileSync(testFile, "test");
//     console.log("Successfully wrote test file:", testFile);
//     fs.unlinkSync(testFile);
//     console.log("Successfully deleted test file");
//   } catch (err) {
//     console.log("Upload directory is NOT writable:", err.message);
//   }
// } else {
//   console.log("Upload directory does NOT exist");
//   console.log("📁 Attempting to create directory...");

//   try {
//     fs.mkdirSync(uploadDir, { recursive: true });
//     console.log("Created upload directory successfully");
//   } catch (err) {
//     console.log("Failed to create upload directory:", err.message);
//   }
// }

// // List files in directory
// try {
//   const files = fs.readdirSync(uploadDir);
//   console.log(`Files in upload directory: ${files.length}`);
//   files.forEach((file) => console.log("   -", file));
// } catch (err) {
//   console.log("Could not read directory:", err.message);
// }

// console.log("=========================================\n");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     console.log("\n Multer destination callback START");
//     console.log("   Time:", new Date().toISOString());
//     console.log("   File field:", file.fieldname);
//     console.log("   Original name:", file.originalname);
//     console.log("   Mimetype:", file.mimetype);
//     console.log("   Destination path:", uploadDir);

//     // Verify destination exists before saving
//     if (!fs.existsSync(uploadDir)) {
//       console.log("   Destination does not exist, creating...");
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     cb(null, uploadDir);
//     console.log(" Multer destination callback END");
//   },
//   filename: (req, file, cb) => {
//     console.log("\n Multer filename callback START");
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const filename = "pdf-" + uniqueSuffix + path.extname(file.originalname);
//     console.log("   Generated filename:", filename);
//     console.log("   Full path:", path.join(uploadDir, filename));
//     console.log(" Multer filename callback END");
//     cb(null, filename);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   console.log("\n Multer fileFilter START");
//   console.log("   Field:", file.fieldname);
//   console.log("   Mimetype:", file.mimetype);
//   console.log("   Originalname:", file.originalname);

//   if (file.mimetype === "application/pdf") {
//     console.log("    PDF accepted");
//     console.log(" Multer fileFilter END - ACCEPTED");
//     cb(null, true);
//   } else {
//     console.log("    Not a PDF - rejecting");
//     console.log(" Multer fileFilter END - REJECTED");
//     cb(new Error("Only PDF files are allowed"), false);
//   }
// };

// // Create the multer instance
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 50 * 1024 * 1024, // 50MB
//   },
// });

// // Create the middleware with detailed logging
// export const uploadPDF = (req, res, next) => {
//   console.log("\n ===== uploadPDF MIDDLEWARE CALLED =====");
//   console.log("Time:", new Date().toISOString());
//   console.log("Request headers:", req.headers["content-type"]);
//   console.log("Request method:", req.method);
//   console.log("Request path:", req.path);

//   const singleUpload = upload.single("pdfFile");

//   singleUpload(req, res, (err) => {
//     if (err) {
//       console.error("\n MULTER ERROR:");
//       console.error("   Error:", err);
//       console.error("   Message:", err.message);
//       return res.status(400).json({ error: err.message });
//     }

//     console.log("\n MULTER PROCESSING COMPLETE");
//     console.log("   req.file:", req.file ? "PRESENT" : "MISSING");

//     if (req.file) {
//       console.log("   File details:");
//       console.log("     - Original name:", req.file.originalname);
//       console.log("     - Saved as:", req.file.filename);
//       console.log("     - Path:", req.file.path);
//       console.log("     - Size:", req.file.size, "bytes");

//       // Verify file was actually saved
//       if (fs.existsSync(req.file.path)) {
//         console.log("    File exists on disk");
//       } else {
//         console.log("    File NOT found on disk!");
//       }
//     } else {
//       console.log("   req.body:", req.body);
//     }

//     console.log(" ===== uploadPDF MIDDLEWARE END =====\n");
//     next();
//   });
// };

// export default upload;


//working

// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";
// import { v2 as cloudinary } from 'cloudinary';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// import dotenv from 'dotenv';

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Configure Cloudinary for production
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // Determine storage based on environment
// let storage;

// if (process.env.NODE_ENV === 'production') {
//     // Cloudinary storage for production
//     storage = new CloudinaryStorage({
//         cloudinary: cloudinary,
//         params: {
//             folder: 'library-books',
//             resource_type: 'raw', // For PDF files
//             public_id: (req, file) => {
//                 const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//                 return 'pdf-' + uniqueSuffix;
//             },
//             format: async (req, file) => 'pdf',
//         },
//     });
//     console.log('☁️ Using Cloudinary storage for production');
// } else {
//     // Local storage for development
//     const uploadDir = path.join(__dirname, '../uploads/pdfs');
    
//     // Ensure directory exists
//     if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//         console.log('📁 Created local upload directory');
//     }

//     storage = multer.diskStorage({
//         destination: (req, file, cb) => {
//             console.log('📂 Destination callback - saving to:', uploadDir);
//             cb(null, uploadDir);
//         },
//         filename: (req, file, cb) => {
//             const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//             const filename = 'pdf-' + uniqueSuffix + path.extname(file.originalname);
//             console.log('📝 Filename callback - generated:', filename);
//             cb(null, filename);
//         },
//     });
    
//     console.log('💾 Using local storage for development');
// }

// // File filter - only accept PDFs
// const fileFilter = (req, file, cb) => {
//     console.log('🔍 File filter checking:', file.mimetype, file.originalname);
    
//     if (file.mimetype === 'application/pdf') {
//         console.log('✅ PDF accepted');
//         cb(null, true);
//     } else {
//         console.log('❌ Not a PDF - rejecting');
//         cb(new Error('Only PDF files are allowed'), false);
//     }
// };

// // Create multer instance
// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: {
//         fileSize: 50 * 1024 * 1024, // 50MB max
//     },
// });

// // Enhanced upload middleware with logging
// export const uploadPDF = (req, res, next) => {
//     console.log('\n========== UPLOAD MIDDLEWARE START ==========');
//     console.log(`📤 Uploading PDF in ${process.env.NODE_ENV || 'development'} mode...`);
//     console.log('Request headers:', req.headers['content-type']);
//     console.log('Request method:', req.method);
//     console.log('Request path:', req.path);
    
//     const singleUpload = upload.single('pdfFile');
    
//     singleUpload(req, res, (err) => {
//         if (err) {
//             console.error('❌ Upload error:', err.message);
//             console.log('========== UPLOAD MIDDLEWARE END (ERROR) ==========\n');
//             return res.status(400).json({ 
//                 message: err.message,
//                 error: 'File upload failed'
//             });
//         }
        
//         console.log('\n✅ Multer processing complete');
//         console.log('req.file:', req.file ? 'PRESENT' : 'MISSING');
        
//         if (req.file) {
//             console.log('📄 File details:');
//             console.log(`   - Original name: ${req.file.originalname}`);
//             console.log(`   - Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);
//             console.log(`   - Mime type: ${req.file.mimetype}`);
            
//             if (process.env.NODE_ENV === 'production') {
//                 console.log(`   - Cloudinary URL: ${req.file.path}`);
//                 req.file.cloudinaryUrl = req.file.path;
//             } else {
//                 console.log(`   - Saved as: ${req.file.filename}`);
//                 console.log(`   - Full path: ${req.file.path}`);
                
//                 // Verify file was saved
//                 if (fs.existsSync(req.file.path)) {
//                     console.log('   ✅ File exists on disk');
//                 } else {
//                     console.log('   ❌ File NOT found on disk!');
//                 }
//             }
//         } else {
//             console.log('⚠️ No file uploaded - check frontend FormData');
//             console.log('req.body:', req.body);
//         }
        
//         console.log('========== UPLOAD MIDDLEWARE END ==========\n');
//         next();
//     });
// };

// export default upload;



import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary for production
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Determine storage based on environment
let storage;

if (process.env.NODE_ENV === 'production') {
    // Cloudinary storage for production
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'library-books',
            resource_type: 'raw', // For PDF files
            public_id: (req, file) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                return 'pdf-' + uniqueSuffix;
            },
            format: async (req, file) => 'pdf',
            access_mode: 'public', // Make files publicly accessible
            use_filename: true,
            unique_filename: true
        },
    });
    console.log('☁️ Using Cloudinary storage for production with public access');
} else {
    // Local storage for development
    const uploadDir = path.join(__dirname, '../uploads/pdfs');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('📁 Created local upload directory');
    }

    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            console.log('📂 Destination callback - saving to:', uploadDir);
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = 'pdf-' + uniqueSuffix + path.extname(file.originalname);
            console.log('📝 Filename callback - generated:', filename);
            cb(null, filename);
        },
    });
    
    console.log('💾 Using local storage for development');
}

// File filter - only accept PDFs
const fileFilter = (req, file, cb) => {
    console.log('🔍 File filter checking:', file.mimetype, file.originalname);
    
    if (file.mimetype === 'application/pdf') {
        console.log('✅ PDF accepted');
        cb(null, true);
    } else {
        console.log('❌ Not a PDF - rejecting');
        cb(new Error('Only PDF files are allowed'), false);
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
    console.log('\n========== UPLOAD MIDDLEWARE START ==========');
    console.log(`📤 Uploading PDF in ${process.env.NODE_ENV || 'development'} mode...`);
    console.log('Request headers:', req.headers['content-type']);
    console.log('Request method:', req.method);
    console.log('Request path:', req.path);
    
    const singleUpload = upload.single('pdfFile');
    
    singleUpload(req, res, (err) => {
        if (err) {
            console.error('❌ Upload error:', err.message);
            console.log('========== UPLOAD MIDDLEWARE END (ERROR) ==========\n');
            return res.status(400).json({ 
                message: err.message,
                error: 'File upload failed'
            });
        }
        
        console.log('\n✅ Multer processing complete');
        console.log('req.file:', req.file ? 'PRESENT' : 'MISSING');
        
        if (req.file) {
            console.log('📄 File details:');
            console.log(`   - Original name: ${req.file.originalname}`);
            console.log(`   - Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   - Mime type: ${req.file.mimetype}`);
            
            if (process.env.NODE_ENV === 'production') {
                console.log(`   - Cloudinary URL: ${req.file.path}`);
                req.file.cloudinaryUrl = req.file.path;
            } else {
                console.log(`   - Saved as: ${req.file.filename}`);
                console.log(`   - Full path: ${req.file.path}`);
                
                // Verify file was saved
                if (fs.existsSync(req.file.path)) {
                    console.log('   ✅ File exists on disk');
                } else {
                    console.log('   ❌ File NOT found on disk!');
                }
            }
        } else {
            console.log('⚠️ No file uploaded - check frontend FormData');
            console.log('req.body:', req.body);
        }
        
        console.log('========== UPLOAD MIDDLEWARE END ==========\n');
        next();
    });
};

export default upload;