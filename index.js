// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";
// import { v2 as cloudinary } from "cloudinary";

// import connectDB from "./config/db.js";
// import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
// import authRoutes from "./routes/authRoutes.js";
// import bookRoutes from "./routes/bookRoutes.js";
// import borrowRoutes from "./routes/borrowRoutes.js";
// // IMPORT THE UPLOAD MIDDLEWARE
// import { uploadPDF } from "./middleware/upload.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config();
// connectDB();

// const app = express();

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // --------------------
// // CORS configuration
// // --------------------
// const allowedOrigins = [
//   "https://frontend-libraryapp.onrender.com",
//   "http://localhost:5173",
//   "http://localhost:5000",
//   "https://library-server-5rpq.onrender.com",
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps, Postman)
//       if (!origin) return callback(null, true);

//       // Check if origin is allowed
//       if (allowedOrigins.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         console.log("❌ CORS blocked origin:", origin);
//         console.log("✅ Allowed origins:", allowedOrigins);
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     optionsSuccessStatus: 200,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: [
//       "Content-Type",
//       "Authorization",
//       "X-Requested-With",
//       "Accept",
//     ],
//     exposedHeaders: ["Content-Disposition"],
//   }),
// );

// // Handle preflight requests
// app.options("*", cors());

// // --------------------
// // Body parsers
// // --------------------
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// // --------------------
// // Request logging
// // --------------------
// app.use((req, res, next) => {
//   console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
//   console.log("Origin:", req.headers.origin);
//   console.log(
//     "Auth Header:",
//     req.headers.authorization ? "Present" : "Missing",
//   );
//   next();
// });

// // --------------------
// // Development uploads directory
// // --------------------
// if (process.env.NODE_ENV === "development") {
//   const uploadDir = path.join(__dirname, "uploads/pdfs");

//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//     console.log(" Created uploads directory for development");
//   }

//   try {
//     const testFile = path.join(uploadDir, `test-${Date.now()}.txt`);
//     fs.writeFileSync(testFile, "test");
//     console.log(" Upload directory is writable");
//     fs.unlinkSync(testFile);
//   } catch (err) {
//     console.error(" Upload directory is NOT writable:", err.message);
//   }

//   // Serve static files
//   app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// }

// // --------------------
// // DEBUG ROUTES
// // --------------------

// // Debug environment variables
// app.get("/api/debug-env", (req, res) => {
//   res.json({
//     NODE_ENV: process.env.NODE_ENV,
//     isProduction: process.env.NODE_ENV === "production",
//     isRender: process.env.RENDER === "true",
//     clientUrl: process.env.CLIENT_URL,
//     cloudinary_config: {
//       cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing",
//       api_key: process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing",
//       api_secret: process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing",
//     },
//   });
// });

// // Test Cloudinary connection
// app.get("/api/test-cloudinary", async (req, res) => {
//   try {
//     console.log("🔍 Testing Cloudinary configuration...");

//     const pingResult = await cloudinary.api.ping();
//     console.log("Cloudinary ping:", pingResult);

//     // Try a small test upload
//     const testFile = "data:application/pdf;base64,JVBERi0xLg==";
//     const uploadResult = await cloudinary.uploader.upload(testFile, {
//       folder: "library-books-test",
//       resource_type: "raw",
//       public_id: "test-" + Date.now(),
//     });

//     console.log("✅ Test upload successful:", uploadResult.secure_url);

//     res.json({
//       success: true,
//       message: "Cloudinary is working!",
//       ping: pingResult,
//       test_url: uploadResult.secure_url,
//       config: {
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//         environment: process.env.NODE_ENV,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Cloudinary test failed:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       config: {
//         cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
//         api_key: !!process.env.CLOUDINARY_API_KEY,
//         api_secret: !!process.env.CLOUDINARY_API_SECRET,
//       },
//     });
//   }
// });

// // Test upload endpoint
// app.post("/api/test-upload", uploadPDF, (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     res.json({
//       success: true,
//       message: "Upload test successful",
//       environment: process.env.NODE_ENV,
//       file: {
//         originalname: req.file.originalname,
//         path: req.file.path,
//         isCloudinary: req.file.path?.includes("cloudinary.com"),
//         size: req.file.size,
//         mimetype: req.file.mimetype,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Debug single book
// app.get("/api/debug-book/:id", async (req, res) => {
//   try {
//     const Book = (await import("./models/Book.js")).default;
//     const book = await Book.findById(req.params.id);

//     if (!book) {
//       return res.status(404).json({ error: "Book not found" });
//     }

//     res.json({
//       id: book._id,
//       title: book.title,
//       author: book.author,
//       pdfFile: book.pdfFile,
//       pdfFilename: book.pdfFilename,
//       pdfFileType: typeof book.pdfFile,
//       isCloudinaryUrl: book.pdfFile?.includes("cloudinary.com"),
//       isLocalFile: book.pdfFile && !book.pdfFile.includes("cloudinary.com"),
//       needsFixing: book.pdfFile && !book.pdfFile.includes("cloudinary.com"),
//       isTruncated:
//         book.pdfFile?.includes("library-...") ||
//         book.pdfFile?.endsWith("library-"),
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // =============================================
// // FIX TRUNCATED PDF URLS - ADD THIS ENDPOINT
// // =============================================
// app.get("/api/fix-truncated-pdfs", async (req, res) => {
//   try {
//     const Book = (await import("./models/Book.js")).default;
//     const books = await Book.find({});

//     const results = [];
//     let fixed = 0;
//     let skipped = 0;

//     for (const book of books) {
//       if (book.pdfFile && book.pdfFile.includes("cloudinary.com")) {
//         // Check if URL is truncated (ends with "library-..." or similar)
//         if (
//           book.pdfFile.includes("library-...") ||
//           book.pdfFile.endsWith("library-")
//         ) {
//           console.log(`🔧 Fixing truncated URL for book: ${book.title}`);
//           console.log(`   Current URL: ${book.pdfFile}`);

//           // Extract the filename from the pdfFilename field
//           let filename = book.pdfFilename;

//           if (filename) {
//             // Clean the filename - remove any invalid characters
//             filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");

//             // Ensure it ends with .pdf
//             if (!filename.toLowerCase().endsWith(".pdf")) {
//               filename = filename + ".pdf";
//             }

//             // Construct the correct Cloudinary URL
//             const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

//             console.log(`   New URL: ${correctUrl}`);

//             // Update the book
//             book.pdfFile = correctUrl;
//             await book.save();

//             results.push({
//               id: book._id,
//               title: book.title,
//               old: book.pdfFile,
//               new: correctUrl,
//               filename: filename,
//             });
//             fixed++;
//           } else {
//             // No filename available, try to extract from the URL
//             console.log(
//               `⚠️ No pdfFilename for book: ${book.title}, trying to extract from URL...`,
//             );

//             // Try to extract from the truncated URL
//             const urlParts = book.pdfFile.split("/");
//             const lastPart = urlParts[urlParts.length - 1];

//             if (lastPart && lastPart !== "library-...") {
//               const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${lastPart}`;

//               book.pdfFile = correctUrl;
//               await book.save();

//               results.push({
//                 id: book._id,
//                 title: book.title,
//                 old: book.pdfFile,
//                 new: correctUrl,
//                 note: "Recovered from URL",
//               });
//               fixed++;
//             } else {
//               results.push({
//                 id: book._id,
//                 title: book.title,
//                 error: "Cannot determine filename",
//                 pdfFile: book.pdfFile,
//               });
//               skipped++;
//             }
//           }
//         } else {
//           skipped++;
//         }
//       } else {
//         skipped++;
//       }
//     }

//     res.json({
//       success: true,
//       message: `Fixed ${fixed} truncated PDF URLs, skipped ${skipped} books`,
//       totalProcessed: books.length,
//       fixed: fixed,
//       skipped: skipped,
//       books: results,
//     });
//   } catch (error) {
//     console.error("❌ Fix error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// });

// // =============================================
// // FIX THE SPECIFIC BOOK YOU MENTIONED
// // =============================================
// app.get("/api/fix-paul-book", async (req, res) => {
//   try {
//     const Book = (await import("./models/Book.js")).default;

//     // Find the book with id: 6995acba7dbadada4f13a584
//     const book = await Book.findById("6995acba7dbadada4f13a584");

//     if (!book) {
//       return res.status(404).json({ error: "Book not found" });
//     }

//     console.log("📚 Found book:", book.title);
//     console.log("Current pdfFile:", book.pdfFile);
//     console.log("pdfFilename:", book.pdfFilename);

//     // Extract filename from pdfFilename
//     let filename = book.pdfFilename;

//     if (!filename) {
//       return res.json({
//         error: "No pdfFilename found",
//         book: book,
//       });
//     }

//     // Clean the filename
//     filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");

//     // Ensure .pdf extension
//     if (!filename.toLowerCase().endsWith(".pdf")) {
//       filename = filename + ".pdf";
//     }

//     // Construct correct URL
//     const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

//     // Save the fix
//     const oldValue = book.pdfFile;
//     book.pdfFile = correctUrl;
//     await book.save();

//     // Test if URL works
//     let urlWorks = false;
//     try {
//       const testResponse = await fetch(correctUrl, { method: "HEAD" });
//       urlWorks = testResponse.ok;
//     } catch (e) {
//       console.log("URL test failed:", e.message);
//     }

//     res.json({
//       success: true,
//       message: "Book PDF URL fixed",
//       bookId: book._id,
//       title: book.title,
//       oldValue: oldValue,
//       newValue: correctUrl,
//       filename: filename,
//       urlWorks: urlWorks,
//       testUrl: `${correctUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`,
//       note: urlWorks
//         ? "✅ PDF should now load"
//         : "❌ URL doesn't work - file may not exist on Cloudinary",
//     });
//   } catch (error) {
//     console.error("❌ Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Fix PDFs endpoint - List all problematic books
// app.get("/api/admin/fix-pdfs", async (req, res) => {
//   try {
//     const Book = (await import("./models/Book.js")).default;
//     const books = await Book.find({});

//     const problematicBooks = [];

//     for (const book of books) {
//       if (book.pdfFile && !book.pdfFile.includes("cloudinary.com")) {
//         problematicBooks.push({
//           id: book._id,
//           title: book.title,
//           pdfFile: book.pdfFile,
//           pdfFilename: book.pdfFilename,
//           created: book.createdAt,
//         });
//       } else if (
//         book.pdfFile &&
//         (book.pdfFile.includes("library-...") ||
//           book.pdfFile.endsWith("library-"))
//       ) {
//         problematicBooks.push({
//           id: book._id,
//           title: book.title,
//           pdfFile: book.pdfFile,
//           pdfFilename: book.pdfFilename,
//           created: book.createdAt,
//           issue: "truncated_url",
//         });
//       }
//     }

//     res.json({
//       totalBooks: books.length,
//       problematicBooks: problematicBooks.length,
//       books: problematicBooks,
//       message:
//         "Use /api/fix-book-now/:id to fix individual books, /api/fix-truncated-pdfs to fix all truncated URLs, or /api/fix-all-pdfs-now to fix all at once",
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // TEMPORARY FIX ENDPOINT - Fix a single book
// app.get("/api/fix-book-now/:id", async (req, res) => {
//   try {
//     const Book = (await import("./models/Book.js")).default;
//     const book = await Book.findById(req.params.id);

//     if (!book) {
//       return res.status(404).json({ error: "Book not found" });
//     }

//     console.log("🔧 Fixing book:", book.title);
//     console.log("Current pdfFile:", book.pdfFile);

//     if (
//       book.pdfFile.includes("cloudinary.com") &&
//       !book.pdfFile.includes("library-...") &&
//       !book.pdfFile.endsWith("library-")
//     ) {
//       return res.json({
//         success: true,
//         message: "Book already has valid Cloudinary URL",
//         pdfFile: book.pdfFile,
//       });
//     }

//     // Get the filename from pdfFilename or current pdfFile
//     let filename = book.pdfFilename;

//     if (!filename && book.pdfFile) {
//       if (book.pdfFile.includes("/")) {
//         filename = book.pdfFile.split("/").pop();
//       } else {
//         filename = book.pdfFile;
//       }
//     }

//     if (!filename) {
//       return res.json({
//         error: "Cannot determine filename for this book",
//         book: book,
//       });
//     }

//     // Clean filename
//     filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");

//     // Ensure filename has .pdf extension
//     if (!filename.endsWith(".pdf")) {
//       filename = filename + ".pdf";
//     }

//     // Construct the correct Cloudinary URL
//     const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

//     // Test if URL works
//     let urlWorks = false;
//     try {
//       const testResponse = await fetch(correctUrl, { method: "HEAD" });
//       urlWorks = testResponse.ok;
//     } catch (e) {
//       console.log("URL test failed:", e.message);
//     }

//     // Save the corrected URL
//     const oldValue = book.pdfFile;
//     book.pdfFile = correctUrl;
//     await book.save();

//     res.json({
//       success: true,
//       message: "Book PDF URL fixed",
//       oldValue: oldValue,
//       newValue: correctUrl,
//       urlWorks: urlWorks,
//       testUrl: `${correctUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`,
//       note: urlWorks
//         ? "✅ PDF should now load"
//         : "❌ URL doesn't work - file may not exist on Cloudinary",
//     });
//   } catch (error) {
//     console.error("❌ Fix error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // =============================================
// // ULTIMATE FIX for all existing books
// // =============================================
// app.get("/api/fix-all-pdfs-now", async (req, res) => {
//   try {
//     const Book = (await import("./models/Book.js")).default;
//     const books = await Book.find({});

//     const results = [];
//     let fixed = 0;
//     let skipped = 0;

//     for (const book of books) {
//       if (book.pdfFile) {
//         // Check if URL is invalid (truncated or not Cloudinary)
//         if (
//           !book.pdfFile.includes("cloudinary.com") ||
//           book.pdfFile.includes("library-...") ||
//           book.pdfFile.endsWith("library-")
//         ) {
//           // Extract filename from pdfFilename or current pdfFile
//           let filename = book.pdfFilename;

//           if (!filename && book.pdfFile) {
//             if (book.pdfFile.includes("/")) {
//               filename = book.pdfFile.split("/").pop();
//             } else {
//               filename = book.pdfFile;
//             }
//           }

//           if (filename) {
//             // Clean filename - remove any invalid characters
//             filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");

//             // Ensure .pdf extension
//             if (!filename.toLowerCase().endsWith(".pdf")) {
//               filename = filename + ".pdf";
//             }

//             // Construct correct Cloudinary URL
//             const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

//             console.log(`📚 Fixing book: ${book.title}`);
//             console.log(`   Old: ${book.pdfFile}`);
//             console.log(`   New: ${correctUrl}`);

//             // Update the book
//             book.pdfFile = correctUrl;
//             await book.save();

//             results.push({
//               id: book._id,
//               title: book.title,
//               old: book.pdfFile,
//               new: correctUrl,
//             });
//             fixed++;
//           } else {
//             results.push({
//               id: book._id,
//               title: book.title,
//               error: "No filename found",
//             });
//             skipped++;
//           }
//         } else {
//           skipped++;
//         }
//       } else {
//         skipped++;
//       }
//     }

//     res.json({
//       success: true,
//       message: `Fixed ${fixed} books, skipped ${skipped} books`,
//       totalProcessed: books.length,
//       fixed: fixed,
//       skipped: skipped,
//       books: results,
//     });
//   } catch (error) {
//     console.error("❌ Fix all error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// });

// // Alternative simpler fix without version
// app.get("/api/fix-book-simple/:id", async (req, res) => {
//   try {
//     const Book = (await import("./models/Book.js")).default;
//     const book = await Book.findById(req.params.id);

//     if (!book) {
//       return res.status(404).json({ error: "Book not found" });
//     }

//     if (
//       book.pdfFile.includes("cloudinary.com") &&
//       !book.pdfFile.includes("library-...") &&
//       !book.pdfFile.endsWith("library-")
//     ) {
//       return res.json({
//         success: true,
//         message: "Book already has valid Cloudinary URL",
//       });
//     }

//     // Get the filename
//     let filename = book.pdfFilename;
//     if (!filename && book.pdfFile) {
//       if (book.pdfFile.includes("/")) {
//         filename = book.pdfFile.split("/").pop();
//       } else {
//         filename = book.pdfFile;
//       }
//     }

//     if (!filename) {
//       return res.json({
//         error: "Cannot determine filename",
//       });
//     }

//     // Clean filename
//     filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");

//     // Simple URL without version
//     const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

//     const oldValue = book.pdfFile;
//     book.pdfFile = correctUrl;
//     await book.save();

//     res.json({
//       success: true,
//       message: "Book PDF URL fixed (simple)",
//       oldValue: oldValue,
//       newValue: correctUrl,
//       testUrl: `${correctUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Bulk fix all books (legacy endpoint)
// app.get("/api/fix-all-books", async (req, res) => {
//   try {
//     const Book = (await import("./models/Book.js")).default;
//     const books = await Book.find({});

//     const results = [];

//     for (const book of books) {
//       if (book.pdfFile && !book.pdfFile.includes("cloudinary.com")) {
//         let filename = book.pdfFile;
//         if (filename.includes("/")) {
//           filename = filename.split("/").pop();
//         }
//         const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${filename}`;

//         results.push({
//           id: book._id,
//           title: book.title,
//           old: book.pdfFile,
//           new: correctUrl,
//         });

//         book.pdfFile = correctUrl;
//         await book.save();
//       }
//     }

//     res.json({
//       message: `Fixed ${results.length} books`,
//       books: results,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // =============================================
// // MAIN ROUTES
// // =============================================
// app.use("/api/auth", authRoutes);
// app.use("/api/books", bookRoutes);
// app.use("/api/borrow", borrowRoutes);

// // --------------------
// // Health check
// // --------------------
// app.get("/health", (req, res) => {
//   res.status(200).json({
//     status: "OK",
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV,
//     message: "Server is running",
//     clientUrl: process.env.CLIENT_URL,
//   });
// });

// // Test endpoint
// app.get("/api/test", (req, res) => {
//   res.json({
//     message: "API is working!",
//     environment: process.env.NODE_ENV,
//     timestamp: new Date().toISOString(),
//     clientUrl: process.env.CLIENT_URL,
//   });
// });

// // --------------------
// // Error handling
// // --------------------
// app.use(notFound);
// app.use(errorHandler);

// // --------------------
// // Start server
// // --------------------
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log("\n========== SERVER STARTED ==========");
//   console.log(` Server running on port ${PORT}`);
//   console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
//   console.log(` Is Production: ${process.env.NODE_ENV === "production"}`);
//   console.log(
//     ` Cloudinary Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME ? "✅" : "❌"}`,
//   );
//   console.log(
//     ` Cloudinary API Key: ${process.env.CLOUDINARY_API_KEY ? "✅" : "❌"}`,
//   );
//   console.log(
//     ` Cloudinary API Secret: ${process.env.CLOUDINARY_API_SECRET ? "✅" : "❌"}`,
//   );
//   console.log(
//     `🔗 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
//   );
//   console.log(` Allowed origins:`, allowedOrigins);
//   if (process.env.NODE_ENV === "development") {
//     console.log(` Upload directory: ${path.join(__dirname, "uploads/pdfs")}`);
//   }
//   console.log("====================================\n");
// });




// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";
// import { v2 as cloudinary } from "cloudinary";
// import { createServer } from "http"; // ADD THIS

// import connectDB from "./config/db.js";
// import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
// import authRoutes from "./routes/authRoutes.js";
// import bookRoutes from "./routes/bookRoutes.js";
// import borrowRoutes from "./routes/borrowRoutes.js";
// import { uploadPDF } from "./middleware/upload.js";
// import { setupSocketIO } from "./server/socket.js"; // ADD THIS

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config();
// connectDB();

// const app = express();
// const httpServer = createServer(app); // ADD THIS

// // Setup Socket.IO
// const io = setupSocketIO(httpServer); // ADD THIS
// app.set("io", io); // ADD THIS

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // --------------------
// // CORS configuration
// // --------------------
// const allowedOrigins = [
//   "https://frontend-libraryapp.onrender.com",
//   "http://localhost:5173",
//   "http://localhost:5000",
//   "https://library-server-5rpq.onrender.com",
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps, Postman)
//       if (!origin) return callback(null, true);

//       // Check if origin is allowed
//       if (allowedOrigins.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         console.log("❌ CORS blocked origin:", origin);
//         console.log("✅ Allowed origins:", allowedOrigins);
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     optionsSuccessStatus: 200,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: [
//       "Content-Type",
//       "Authorization",
//       "X-Requested-With",
//       "Accept",
//     ],
//     exposedHeaders: ["Content-Disposition"],
//   }),
// );

// // Handle preflight requests
// app.options("*", cors());

// // --------------------
// // Body parsers
// // --------------------
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// // --------------------
// // Request logging
// // --------------------
// app.use((req, res, next) => {
//   console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
//   console.log("Origin:", req.headers.origin);
//   console.log(
//     "Auth Header:",
//     req.headers.authorization ? "Present" : "Missing",
//   );
//   next();
// });

// // --------------------
// // Development uploads directory
// // --------------------
// if (process.env.NODE_ENV === "development") {
//   const uploadDir = path.join(__dirname, "uploads/pdfs");

//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//     console.log(" Created uploads directory for development");
//   }

//   try {
//     const testFile = path.join(uploadDir, `test-${Date.now()}.txt`);
//     fs.writeFileSync(testFile, "test");
//     console.log(" Upload directory is writable");
//     fs.unlinkSync(testFile);
//   } catch (err) {
//     console.error(" Upload directory is NOT writable:", err.message);
//   }

//   // Serve static files
//   app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// }

// // --------------------
// // DEBUG ROUTES
// // --------------------

// // Debug environment variables
// app.get("/api/debug-env", (req, res) => {
//   res.json({
//     NODE_ENV: process.env.NODE_ENV,
//     isProduction: process.env.NODE_ENV === "production",
//     isRender: process.env.RENDER === "true",
//     clientUrl: process.env.CLIENT_URL,
//     cloudinary_config: {
//       cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing",
//       api_key: process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing",
//       api_secret: process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing",
//     },
//   });
// });

// // Test Cloudinary connection
// app.get("/api/test-cloudinary", async (req, res) => {
//   try {
//     console.log("🔍 Testing Cloudinary configuration...");

//     const pingResult = await cloudinary.api.ping();
//     console.log("Cloudinary ping:", pingResult);

//     // Try a small test upload
//     const testFile = "data:application/pdf;base64,JVBERi0xLg==";
//     const uploadResult = await cloudinary.uploader.upload(testFile, {
//       folder: "library-books-test",
//       resource_type: "raw",
//       public_id: "test-" + Date.now(),
//     });

//     console.log("✅ Test upload successful:", uploadResult.secure_url);

//     res.json({
//       success: true,
//       message: "Cloudinary is working!",
//       ping: pingResult,
//       test_url: uploadResult.secure_url,
//       config: {
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//         environment: process.env.NODE_ENV,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Cloudinary test failed:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       config: {
//         cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
//         api_key: !!process.env.CLOUDINARY_API_KEY,
//         api_secret: !!process.env.CLOUDINARY_API_SECRET,
//       },
//     });
//   }
// });

// // Test upload endpoint
// app.post("/api/test-upload", uploadPDF, (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     res.json({
//       success: true,
//       message: "Upload test successful",
//       environment: process.env.NODE_ENV,
//       file: {
//         originalname: req.file.originalname,
//         path: req.file.path,
//         isCloudinary: req.file.path?.includes("cloudinary.com"),
//         size: req.file.size,
//         mimetype: req.file.mimetype,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Debug single book
// app.get("/api/debug-book/:id", async (req, res) => {
//   try {
//     const Book = (await import("./models/Book.js")).default;
//     const book = await Book.findById(req.params.id);

//     if (!book) {
//       return res.status(404).json({ error: "Book not found" });
//     }

//     res.json({
//       id: book._id,
//       title: book.title,
//       author: book.author,
//       pdfFile: book.pdfFile,
//       pdfFilename: book.pdfFilename,
//       pdfFileType: typeof book.pdfFile,
//       isCloudinaryUrl: book.pdfFile?.includes("cloudinary.com"),
//       isLocalFile: book.pdfFile && !book.pdfFile.includes("cloudinary.com"),
//       needsFixing: book.pdfFile && !book.pdfFile.includes("cloudinary.com"),
//       isTruncated:
//         book.pdfFile?.includes("library-...") ||
//         book.pdfFile?.endsWith("library-"),
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // =============================================
// // FIX TRUNCATED PDF URLS - ADD THIS ENDPOINT
// // =============================================
// app.get("/api/fix-truncated-pdfs", async (req, res) => {
//   try {
//     const Book = (await import("./models/Book.js")).default;
//     const books = await Book.find({});

//     const results = [];
//     let fixed = 0;
//     let skipped = 0;

//     for (const book of books) {
//       if (book.pdfFile && book.pdfFile.includes("cloudinary.com")) {
//         // Check if URL is truncated (ends with "library-..." or similar)
//         if (
//           book.pdfFile.includes("library-...") ||
//           book.pdfFile.endsWith("library-")
//         ) {
//           console.log(`🔧 Fixing truncated URL for book: ${book.title}`);
//           console.log(`   Current URL: ${book.pdfFile}`);

//           // Extract the filename from the pdfFilename field
//           let filename = book.pdfFilename;

//           if (filename) {
//             // Clean the filename - remove any invalid characters
//             filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");

//             // Ensure it ends with .pdf
//             if (!filename.toLowerCase().endsWith(".pdf")) {
//               filename = filename + ".pdf";
//             }

//             // Construct the correct Cloudinary URL
//             const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

//             console.log(`   New URL: ${correctUrl}`);

//             // Update the book
//             book.pdfFile = correctUrl;
//             await book.save();

//             results.push({
//               id: book._id,
//               title: book.title,
//               old: book.pdfFile,
//               new: correctUrl,
//               filename: filename,
//             });
//             fixed++;
//           } else {
//             // No filename available, try to extract from the URL
//             console.log(
//               `⚠️ No pdfFilename for book: ${book.title}, trying to extract from URL...`,
//             );

//             // Try to extract from the truncated URL
//             const urlParts = book.pdfFile.split("/");
//             const lastPart = urlParts[urlParts.length - 1];

//             if (lastPart && lastPart !== "library-...") {
//               const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${lastPart}`;

//               book.pdfFile = correctUrl;
//               await book.save();

//               results.push({
//                 id: book._id,
//                 title: book.title,
//                 old: book.pdfFile,
//                 new: correctUrl,
//                 note: "Recovered from URL",
//               });
//               fixed++;
//             } else {
//               results.push({
//                 id: book._id,
//                 title: book.title,
//                 error: "Cannot determine filename",
//                 pdfFile: book.pdfFile,
//               });
//               skipped++;
//             }
//           }
//         } else {
//           skipped++;
//         }
//       } else {
//         skipped++;
//       }
//     }

//     res.json({
//       success: true,
//       message: `Fixed ${fixed} truncated PDF URLs, skipped ${skipped} books`,
//       totalProcessed: books.length,
//       fixed: fixed,
//       skipped: skipped,
//       books: results,
//     });
//   } catch (error) {
//     console.error("❌ Fix error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// });

// // =============================================
// // FIX THE SPECIFIC BOOK YOU MENTIONED
// // =============================================
// app.get("/api/fix-paul-book", async (req, res) => {
//   try {
//     const Book = (await import("./models/Book.js")).default;

//     // Find the book with id: 6995acba7dbadada4f13a584
//     const book = await Book.findById("6995acba7dbadada4f13a584");

//     if (!book) {
//       return res.status(404).json({ error: "Book not found" });
//     }

//     console.log("📚 Found book:", book.title);
//     console.log("Current pdfFile:", book.pdfFile);
//     console.log("pdfFilename:", book.pdfFilename);

//     // Extract filename from pdfFilename
//     let filename = book.pdfFilename;

//     if (!filename) {
//       return res.json({
//         error: "No pdfFilename found",
//         book: book,
//       });
//     }

//     // Clean the filename
//     filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");

//     // Ensure .pdf extension
//     if (!filename.toLowerCase().endsWith(".pdf")) {
//       filename = filename + ".pdf";
//     }

//     // Construct correct URL
//     const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

//     // Save the fix
//     const oldValue = book.pdfFile;
//     book.pdfFile = correctUrl;
//     await book.save();

//     // Test if URL works
//     let urlWorks = false;
//     try {
//       const testResponse = await fetch(correctUrl, { method: "HEAD" });
//       urlWorks = testResponse.ok;
//     } catch (e) {
//       console.log("URL test failed:", e.message);
//     }

//     res.json({
//       success: true,
//       message: "Book PDF URL fixed",
//       bookId: book._id,
//       title: book.title,
//       oldValue: oldValue,
//       newValue: correctUrl,
//       filename: filename,
//       urlWorks: urlWorks,
//       testUrl: `${correctUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`,
//       note: urlWorks
//         ? "✅ PDF should now load"
//         : "❌ URL doesn't work - file may not exist on Cloudinary",
//     });
//   } catch (error) {
//     console.error("❌ Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Fix PDFs endpoint - List all problematic books
// app.get("/api/admin/fix-pdfs", async (req, res) => {
//   try {
//     const Book = (await import("./models/Book.js")).default;
//     const books = await Book.find({});

//     const problematicBooks = [];

//     for (const book of books) {
//       if (book.pdfFile && !book.pdfFile.includes("cloudinary.com")) {
//         problematicBooks.push({
//           id: book._id,
//           title: book.title,
//           pdfFile: book.pdfFile,
//           pdfFilename: book.pdfFilename,
//           created: book.createdAt,
//         });
//       } else if (
//         book.pdfFile &&
//         (book.pdfFile.includes("library-...") ||
//           book.pdfFile.endsWith("library-"))
//       ) {
//         problematicBooks.push({
//           id: book._id,
//           title: book.title,
//           pdfFile: book.pdfFile,
//           pdfFilename: book.pdfFilename,
//           created: book.createdAt,
//           issue: "truncated_url",
//         });
//       }
//     }

//     res.json({
//       totalBooks: books.length,
//       problematicBooks: problematicBooks.length,
//       books: problematicBooks,
//       message:
//         "Use /api/fix-book-now/:id to fix individual books, /api/fix-truncated-pdfs to fix all truncated URLs, or /api/fix-all-pdfs-now to fix all at once",
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // TEMPORARY FIX ENDPOINT - Fix a single book
// app.get("/api/fix-book-now/:id", async (req, res) => {
//   try {
//     const Book = (await import("./models/Book.js")).default;
//     const book = await Book.findById(req.params.id);

//     if (!book) {
//       return res.status(404).json({ error: "Book not found" });
//     }

//     console.log("🔧 Fixing book:", book.title);
//     console.log("Current pdfFile:", book.pdfFile);

//     if (
//       book.pdfFile.includes("cloudinary.com") &&
//       !book.pdfFile.includes("library-...") &&
//       !book.pdfFile.endsWith("library-")
//     ) {
//       return res.json({
//         success: true,
//         message: "Book already has valid Cloudinary URL",
//         pdfFile: book.pdfFile,
//       });
//     }

//     // Get the filename from pdfFilename or current pdfFile
//     let filename = book.pdfFilename;

//     if (!filename && book.pdfFile) {
//       if (book.pdfFile.includes("/")) {
//         filename = book.pdfFile.split("/").pop();
//       } else {
//         filename = book.pdfFile;
//       }
//     }

//     if (!filename) {
//       return res.json({
//         error: "Cannot determine filename for this book",
//         book: book,
//       });
//     }

//     // Clean filename
//     filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");

//     // Ensure filename has .pdf extension
//     if (!filename.endsWith(".pdf")) {
//       filename = filename + ".pdf";
//     }

//     // Construct the correct Cloudinary URL
//     const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

//     // Test if URL works
//     let urlWorks = false;
//     try {
//       const testResponse = await fetch(correctUrl, { method: "HEAD" });
//       urlWorks = testResponse.ok;
//     } catch (e) {
//       console.log("URL test failed:", e.message);
//     }

//     // Save the corrected URL
//     const oldValue = book.pdfFile;
//     book.pdfFile = correctUrl;
//     await book.save();

//     res.json({
//       success: true,
//       message: "Book PDF URL fixed",
//       oldValue: oldValue,
//       newValue: correctUrl,
//       urlWorks: urlWorks,
//       testUrl: `${correctUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`,
//       note: urlWorks
//         ? "✅ PDF should now load"
//         : "❌ URL doesn't work - file may not exist on Cloudinary",
//     });
//   } catch (error) {
//     console.error("❌ Fix error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // =============================================
// // ULTIMATE FIX for all existing books
// // =============================================
// app.get("/api/fix-all-pdfs-now", async (req, res) => {
//   try {
//     const Book = (await import("./models/Book.js")).default;
//     const books = await Book.find({});

//     const results = [];
//     let fixed = 0;
//     let skipped = 0;

//     for (const book of books) {
//       if (book.pdfFile) {
//         // Check if URL is invalid (truncated or not Cloudinary)
//         if (
//           !book.pdfFile.includes("cloudinary.com") ||
//           book.pdfFile.includes("library-...") ||
//           book.pdfFile.endsWith("library-")
//         ) {
//           // Extract filename from pdfFilename or current pdfFile
//           let filename = book.pdfFilename;

//           if (!filename && book.pdfFile) {
//             if (book.pdfFile.includes("/")) {
//               filename = book.pdfFile.split("/").pop();
//             } else {
//               filename = book.pdfFile;
//             }
//           }

//           if (filename) {
//             // Clean filename - remove any invalid characters
//             filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");

//             // Ensure .pdf extension
//             if (!filename.toLowerCase().endsWith(".pdf")) {
//               filename = filename + ".pdf";
//             }

//             // Construct correct Cloudinary URL
//             const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

//             console.log(`📚 Fixing book: ${book.title}`);
//             console.log(`   Old: ${book.pdfFile}`);
//             console.log(`   New: ${correctUrl}`);

//             // Update the book
//             book.pdfFile = correctUrl;
//             await book.save();

//             results.push({
//               id: book._id,
//               title: book.title,
//               old: book.pdfFile,
//               new: correctUrl,
//             });
//             fixed++;
//           } else {
//             results.push({
//               id: book._id,
//               title: book.title,
//               error: "No filename found",
//             });
//             skipped++;
//           }
//         } else {
//           skipped++;
//         }
//       } else {
//         skipped++;
//       }
//     }

//     res.json({
//       success: true,
//       message: `Fixed ${fixed} books, skipped ${skipped} books`,
//       totalProcessed: books.length,
//       fixed: fixed,
//       skipped: skipped,
//       books: results,
//     });
//   } catch (error) {
//     console.error("❌ Fix all error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// });

// // Alternative simpler fix without version
// app.get("/api/fix-book-simple/:id", async (req, res) => {
//   try {
//     const Book = (await import("./models/Book.js")).default;
//     const book = await Book.findById(req.params.id);

//     if (!book) {
//       return res.status(404).json({ error: "Book not found" });
//     }

//     if (
//       book.pdfFile.includes("cloudinary.com") &&
//       !book.pdfFile.includes("library-...") &&
//       !book.pdfFile.endsWith("library-")
//     ) {
//       return res.json({
//         success: true,
//         message: "Book already has valid Cloudinary URL",
//       });
//     }

//     // Get the filename
//     let filename = book.pdfFilename;
//     if (!filename && book.pdfFile) {
//       if (book.pdfFile.includes("/")) {
//         filename = book.pdfFile.split("/").pop();
//       } else {
//         filename = book.pdfFile;
//       }
//     }

//     if (!filename) {
//       return res.json({
//         error: "Cannot determine filename",
//       });
//     }

//     // Clean filename
//     filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");

//     // Simple URL without version
//     const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

//     const oldValue = book.pdfFile;
//     book.pdfFile = correctUrl;
//     await book.save();

//     res.json({
//       success: true,
//       message: "Book PDF URL fixed (simple)",
//       oldValue: oldValue,
//       newValue: correctUrl,
//       testUrl: `${correctUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Bulk fix all books (legacy endpoint)
// app.get("/api/fix-all-books", async (req, res) => {
//   try {
//     const Book = (await import("./models/Book.js")).default;
//     const books = await Book.find({});

//     const results = [];

//     for (const book of books) {
//       if (book.pdfFile && !book.pdfFile.includes("cloudinary.com")) {
//         let filename = book.pdfFile;
//         if (filename.includes("/")) {
//           filename = filename.split("/").pop();
//         }
//         const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${filename}`;

//         results.push({
//           id: book._id,
//           title: book.title,
//           old: book.pdfFile,
//           new: correctUrl,
//         });

//         book.pdfFile = correctUrl;
//         await book.save();
//       }
//     }

//     res.json({
//       message: `Fixed ${results.length} books`,
//       books: results,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // =============================================
// // SOCKET.IO STATUS ENDPOINT - ADD THIS
// // =============================================
// app.get("/api/socket-status", (req, res) => {
//   const connectedSockets = io.engine?.clientsCount || 0;
  
//   res.json({
//     success: true,
//     message: "Socket.IO server is running",
//     connectedClients: connectedSockets,
//     activeUsers: io.getActiveUsers?.()?.length || 0,
//     activeRooms: io.getActiveRooms?.()?.length || 0,
//     availableStaff: io.getAvailableStaff?.()?.length || 0,
//     timestamp: new Date().toISOString()
//   });
// });

// // =============================================
// // MAIN ROUTES
// // =============================================
// app.use("/api/auth", authRoutes);
// app.use("/api/books", bookRoutes);
// app.use("/api/borrow", borrowRoutes);

// // --------------------
// // Health check
// // --------------------
// app.get("/health", (req, res) => {
//   res.status(200).json({
//     status: "OK",
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV,
//     message: "Server is running",
//     clientUrl: process.env.CLIENT_URL,
//     websocket: io ? "active" : "inactive", // UPDATED
//   });
// });

// // Test endpoint
// app.get("/api/test", (req, res) => {
//   res.json({
//     message: "API is working!",
//     environment: process.env.NODE_ENV,
//     timestamp: new Date().toISOString(),
//     clientUrl: process.env.CLIENT_URL,
//   });
// });

// // --------------------
// // Error handling
// // --------------------
// app.use(notFound);
// app.use(errorHandler);

// // --------------------
// // Start server - CHANGE FROM app.listen TO httpServer.listen
// // --------------------
// const PORT = process.env.PORT || 5000;

// httpServer.listen(PORT, "0.0.0.0", () => { // CHANGED THIS LINE
//   console.log("\n========== SERVER STARTED ==========");
//   console.log(` Server running on port ${PORT}`);
//   console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
//   console.log(` Is Production: ${process.env.NODE_ENV === "production"}`);
//   console.log(` WebSocket Server: ✅ Active (Socket.IO)`); // ADDED THIS
//   console.log(
//     ` Cloudinary Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME ? "✅" : "❌"}`,
//   );
//   console.log(
//     ` Cloudinary API Key: ${process.env.CLOUDINARY_API_KEY ? "✅" : "❌"}`,
//   );
//   console.log(
//     ` Cloudinary API Secret: ${process.env.CLOUDINARY_API_SECRET ? "✅" : "❌"}`,
//   );
//   console.log(
//     `🔗 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
//   );
//   console.log(` Allowed origins:`, allowedOrigins);
//   if (process.env.NODE_ENV === "development") {
//     console.log(` Upload directory: ${path.join(__dirname, "uploads/pdfs")}`);
//   }
//   console.log("====================================\n");
// });





import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { createServer } from "http";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import borrowRoutes from "./routes/borrowRoutes.js";
import { uploadPDF } from "./middleware/upload.js";
import { setupSocketIO } from "./server/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// Setup Socket.IO
const io = setupSocketIO(httpServer);
app.set("io", io);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --------------------
// CORS configuration
// --------------------
const allowedOrigins = [
  "https://frontend-libraryapp.onrender.com",
  "http://localhost:5173",
  "http://localhost:5000",
  "https://library-server-5rpq.onrender.com",
  "https://docs.google.com",
  "https://www.google.com",
  "https://drive.google.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman)
      if (!origin) return callback(null, true);

      // Check if origin is allowed
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("❌ CORS blocked origin:", origin);
        console.log("✅ Allowed origins:", allowedOrigins);
        callback(new Error("Not allowed by CORS"));
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
// DEBUG ROUTES
// --------------------

// Debug environment variables
app.get("/api/debug-env", (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === "production",
    isRender: process.env.RENDER === "true",
    clientUrl: process.env.CLIENT_URL,
    cloudinary_config: {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing",
      api_key: process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing",
      api_secret: process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing",
    },
  });
});

// Test Cloudinary connection
app.get("/api/test-cloudinary", async (req, res) => {
  try {
    console.log("🔍 Testing Cloudinary configuration...");

    const pingResult = await cloudinary.api.ping();
    console.log("Cloudinary ping:", pingResult);

    // Try a small test upload
    const testFile = "data:application/pdf;base64,JVBERi0xLg==";
    const uploadResult = await cloudinary.uploader.upload(testFile, {
      folder: "library-books-test",
      resource_type: "raw",
      public_id: "test-" + Date.now(),
    });

    console.log("✅ Test upload successful:", uploadResult.secure_url);

    res.json({
      success: true,
      message: "Cloudinary is working!",
      ping: pingResult,
      test_url: uploadResult.secure_url,
      config: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        environment: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    console.error("❌ Cloudinary test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      config: {
        cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
        api_key: !!process.env.CLOUDINARY_API_KEY,
        api_secret: !!process.env.CLOUDINARY_API_SECRET,
      },
    });
  }
});

// Test upload endpoint
app.post("/api/test-upload", uploadPDF, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({
      success: true,
      message: "Upload test successful",
      environment: process.env.NODE_ENV,
      file: {
        originalname: req.file.originalname,
        path: req.file.path,
        isCloudinary: req.file.path?.includes("cloudinary.com"),
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// FIX TRUNCATED PDF URLS
// =============================================
app.get("/api/fix-truncated-pdfs", async (req, res) => {
  try {
    const Book = (await import("./models/Book.js")).default;
    const books = await Book.find({});

    const results = [];
    let fixed = 0;
    let skipped = 0;

    for (const book of books) {
      if (book.pdfFile && book.pdfFile.includes("cloudinary.com")) {
        // Check if URL is truncated (ends with "library-..." or similar)
        if (
          book.pdfFile.includes("library-...") ||
          book.pdfFile.endsWith("library-")
        ) {
          console.log(`🔧 Fixing truncated URL for book: ${book.title}`);
          console.log(`   Current URL: ${book.pdfFile}`);

          // Extract the filename from the pdfFilename field
          let filename = book.pdfFilename;

          if (filename) {
            // Clean the filename - remove any invalid characters
            filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");

            // Ensure it ends with .pdf
            if (!filename.toLowerCase().endsWith(".pdf")) {
              filename = filename + ".pdf";
            }

            // Construct the correct Cloudinary URL
            const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

            console.log(`   New URL: ${correctUrl}`);

            // Update the book
            book.pdfFile = correctUrl;
            await book.save();

            results.push({
              id: book._id,
              title: book.title,
              old: book.pdfFile,
              new: correctUrl,
              filename: filename,
            });
            fixed++;
          } else {
            // No filename available, try to extract from the URL
            console.log(
              `⚠️ No pdfFilename for book: ${book.title}, trying to extract from URL...`,
            );

            // Try to extract from the truncated URL
            const urlParts = book.pdfFile.split("/");
            const lastPart = urlParts[urlParts.length - 1];

            if (lastPart && lastPart !== "library-...") {
              const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${lastPart}`;

              book.pdfFile = correctUrl;
              await book.save();

              results.push({
                id: book._id,
                title: book.title,
                old: book.pdfFile,
                new: correctUrl,
                note: "Recovered from URL",
              });
              fixed++;
            } else {
              results.push({
                id: book._id,
                title: book.title,
                error: "Cannot determine filename",
                pdfFile: book.pdfFile,
              });
              skipped++;
            }
          }
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    res.json({
      success: true,
      message: `Fixed ${fixed} truncated PDF URLs, skipped ${skipped} books`,
      totalProcessed: books.length,
      fixed: fixed,
      skipped: skipped,
      books: results,
    });
  } catch (error) {
    console.error("❌ Fix error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =============================================
// FIX SPECIFIC BOOK (ID: 6995acba7dbadada4f13a584)
// =============================================
app.get("/api/fix-paul-book", async (req, res) => {
  try {
    const Book = (await import("./models/Book.js")).default;

    // Find the book with id: 6995acba7dbadada4f13a584
    const book = await Book.findById("6995acba7dbadada4f13a584");

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    console.log("📚 Found book:", book.title);
    console.log("Current pdfFile:", book.pdfFile);
    console.log("pdfFilename:", book.pdfFilename);

    // Extract filename from pdfFilename
    let filename = book.pdfFilename;

    if (!filename) {
      return res.json({
        error: "No pdfFilename found",
        book: book,
      });
    }

    // Clean the filename
    filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");

    // Ensure .pdf extension
    if (!filename.toLowerCase().endsWith(".pdf")) {
      filename = filename + ".pdf";
    }

    // Construct correct URL
    const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

    // Save the fix
    const oldValue = book.pdfFile;
    book.pdfFile = correctUrl;
    await book.save();

    // Test if URL works
    let urlWorks = false;
    try {
      const testResponse = await fetch(correctUrl, { method: "HEAD" });
      urlWorks = testResponse.ok;
    } catch (e) {
      console.log("URL test failed:", e.message);
    }

    res.json({
      success: true,
      message: "Book PDF URL fixed",
      bookId: book._id,
      title: book.title,
      oldValue: oldValue,
      newValue: correctUrl,
      filename: filename,
      urlWorks: urlWorks,
      testUrl: `${correctUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`,
      note: urlWorks
        ? "✅ PDF should now load"
        : "❌ URL doesn't work - file may not exist on Cloudinary",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Fix PDFs endpoint - List all problematic books
app.get("/api/admin/fix-pdfs", async (req, res) => {
  try {
    const Book = (await import("./models/Book.js")).default;
    const books = await Book.find({});

    const problematicBooks = [];

    for (const book of books) {
      if (book.pdfFile && !book.pdfFile.includes("cloudinary.com")) {
        problematicBooks.push({
          id: book._id,
          title: book.title,
          pdfFile: book.pdfFile,
          pdfFilename: book.pdfFilename,
          created: book.createdAt,
        });
      } else if (
        book.pdfFile &&
        (book.pdfFile.includes("library-...") ||
          book.pdfFile.endsWith("library-"))
      ) {
        problematicBooks.push({
          id: book._id,
          title: book.title,
          pdfFile: book.pdfFile,
          pdfFilename: book.pdfFilename,
          created: book.createdAt,
          issue: "truncated_url",
        });
      }
    }

    res.json({
      totalBooks: books.length,
      problematicBooks: problematicBooks.length,
      books: problematicBooks,
      message:
        "Use /api/fix-book-now/:id to fix individual books, /api/fix-truncated-pdfs to fix all truncated URLs, or /api/fix-all-pdfs-now to fix all at once",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TEMPORARY FIX ENDPOINT - Fix a single book
app.get("/api/fix-book-now/:id", async (req, res) => {
  try {
    const Book = (await import("./models/Book.js")).default;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    console.log("🔧 Fixing book:", book.title);
    console.log("Current pdfFile:", book.pdfFile);

    if (
      book.pdfFile.includes("cloudinary.com") &&
      !book.pdfFile.includes("library-...") &&
      !book.pdfFile.endsWith("library-")
    ) {
      return res.json({
        success: true,
        message: "Book already has valid Cloudinary URL",
        pdfFile: book.pdfFile,
      });
    }

    // Get the filename from pdfFilename or current pdfFile
    let filename = book.pdfFilename;

    if (!filename && book.pdfFile) {
      if (book.pdfFile.includes("/")) {
        filename = book.pdfFile.split("/").pop();
      } else {
        filename = book.pdfFile;
      }
    }

    if (!filename) {
      return res.json({
        error: "Cannot determine filename for this book",
        book: book,
      });
    }

    // Clean filename
    filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");

    // Ensure filename has .pdf extension
    if (!filename.endsWith(".pdf")) {
      filename = filename + ".pdf";
    }

    // Construct the correct Cloudinary URL
    const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

    // Test if URL works
    let urlWorks = false;
    try {
      const testResponse = await fetch(correctUrl, { method: "HEAD" });
      urlWorks = testResponse.ok;
    } catch (e) {
      console.log("URL test failed:", e.message);
    }

    // Save the corrected URL
    const oldValue = book.pdfFile;
    book.pdfFile = correctUrl;
    await book.save();

    res.json({
      success: true,
      message: "Book PDF URL fixed",
      oldValue: oldValue,
      newValue: correctUrl,
      urlWorks: urlWorks,
      testUrl: `${correctUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`,
      note: urlWorks
        ? "✅ PDF should now load"
        : "❌ URL doesn't work - file may not exist on Cloudinary",
    });
  } catch (error) {
    console.error("❌ Fix error:", error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// ULTIMATE FIX for all existing books
// =============================================
app.get("/api/fix-all-pdfs-now", async (req, res) => {
  try {
    const Book = (await import("./models/Book.js")).default;
    const books = await Book.find({});

    const results = [];
    let fixed = 0;
    let skipped = 0;

    for (const book of books) {
      if (book.pdfFile) {
        // Check if URL is invalid (truncated or not Cloudinary)
        if (
          !book.pdfFile.includes("cloudinary.com") ||
          book.pdfFile.includes("library-...") ||
          book.pdfFile.endsWith("library-")
        ) {
          // Extract filename from pdfFilename or current pdfFile
          let filename = book.pdfFilename;

          if (!filename && book.pdfFile) {
            if (book.pdfFile.includes("/")) {
              filename = book.pdfFile.split("/").pop();
            } else {
              filename = book.pdfFile;
            }
          }

          if (filename) {
            // Clean filename - remove any invalid characters
            filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");

            // Ensure .pdf extension
            if (!filename.toLowerCase().endsWith(".pdf")) {
              filename = filename + ".pdf";
            }

            // Construct correct Cloudinary URL
            const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

            console.log(`📚 Fixing book: ${book.title}`);
            console.log(`   Old: ${book.pdfFile}`);
            console.log(`   New: ${correctUrl}`);

            // Update the book
            book.pdfFile = correctUrl;
            await book.save();

            results.push({
              id: book._id,
              title: book.title,
              old: book.pdfFile,
              new: correctUrl,
            });
            fixed++;
          } else {
            results.push({
              id: book._id,
              title: book.title,
              error: "No filename found",
            });
            skipped++;
          }
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    res.json({
      success: true,
      message: `Fixed ${fixed} books, skipped ${skipped} books`,
      totalProcessed: books.length,
      fixed: fixed,
      skipped: skipped,
      books: results,
    });
  } catch (error) {
    console.error("❌ Fix all error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Alternative simpler fix without version
app.get("/api/fix-book-simple/:id", async (req, res) => {
  try {
    const Book = (await import("./models/Book.js")).default;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (
      book.pdfFile.includes("cloudinary.com") &&
      !book.pdfFile.includes("library-...") &&
      !book.pdfFile.endsWith("library-")
    ) {
      return res.json({
        success: true,
        message: "Book already has valid Cloudinary URL",
      });
    }

    // Get the filename
    let filename = book.pdfFilename;
    if (!filename && book.pdfFile) {
      if (book.pdfFile.includes("/")) {
        filename = book.pdfFile.split("/").pop();
      } else {
        filename = book.pdfFile;
      }
    }

    if (!filename) {
      return res.json({
        error: "Cannot determine filename",
      });
    }

    // Clean filename
    filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");

    // Simple URL without version
    const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

    const oldValue = book.pdfFile;
    book.pdfFile = correctUrl;
    await book.save();

    res.json({
      success: true,
      message: "Book PDF URL fixed (simple)",
      oldValue: oldValue,
      newValue: correctUrl,
      testUrl: `${correctUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk fix all books (legacy endpoint)
app.get("/api/fix-all-books", async (req, res) => {
  try {
    const Book = (await import("./models/Book.js")).default;
    const books = await Book.find({});

    const results = [];

    for (const book of books) {
      if (book.pdfFile && !book.pdfFile.includes("cloudinary.com")) {
        let filename = book.pdfFile;
        if (filename.includes("/")) {
          filename = filename.split("/").pop();
        }
        const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${filename}`;

        results.push({
          id: book._id,
          title: book.title,
          old: book.pdfFile,
          new: correctUrl,
        });

        book.pdfFile = correctUrl;
        await book.save();
      }
    }

    res.json({
      message: `Fixed ${results.length} books`,
      books: results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// MOBILE PDF VIEWING FIXES
// =============================================

// Fix PDF URLs for mobile compatibility
app.get("/api/fix-mobile-pdfs", async (req, res) => {
  try {
    const Book = (await import("./models/Book.js")).default;
    const books = await Book.find({});

    const results = [];
    let fixed = 0;
    let skipped = 0;

    for (const book of books) {
      if (book.pdfFile && book.pdfFile.includes("cloudinary.com")) {
        // Add mobile-friendly parameters to URL
        let updatedUrl = book.pdfFile;
        
        // Remove any existing parameters
        if (updatedUrl.includes('?')) {
          updatedUrl = updatedUrl.split('?')[0];
        }
        
        // Add mobile-optimized parameters
        // flags: fl_attachment - forces download instead of preview
        // We want preview, so we'll use different parameters
        const mobileParams = new URLSearchParams({
          fl_notice: '1', // Show notice
          fl_attachment: '0', // Don't force download
          fl_force: '1', // Force render
          fl_lang: 'en'
        });
        
        updatedUrl = `${updatedUrl}?${mobileParams.toString()}`;
        
        // Also update the pdfFilename if needed
        if (book.pdfFilename) {
          // Ensure filename is URL-safe
          book.pdfFilename = encodeURIComponent(book.pdfFilename);
        }
        
        book.pdfFile = updatedUrl;
        await book.save();
        
        results.push({
          id: book._id,
          title: book.title,
          old: book.pdfFile,
          new: updatedUrl
        });
        fixed++;
      } else {
        skipped++;
      }
    }

    res.json({
      success: true,
      message: `Fixed ${fixed} books for mobile viewing, skipped ${skipped}`,
      books: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Alternative PDF viewing endpoint that works better on mobile
app.get("/api/view-pdf/:id", async (req, res) => {
  try {
    const Book = (await import("./models/Book.js")).default;
    const book = await Book.findById(req.params.id);

    if (!book || !book.pdfFile) {
      return res.status(404).json({ error: "Book or PDF not found" });
    }

    // Get the Cloudinary URL
    let pdfUrl = book.pdfFile;
    
    // Clean up the URL
    if (pdfUrl.includes('?')) {
      pdfUrl = pdfUrl.split('?')[0];
    }

    // Add mobile-friendly parameters
    const params = new URLSearchParams({
      fl_notice: '1',
      fl_attachment: '0',
      fl_force: '1',
      fl_lang: 'en',
      resource_type: 'raw'
    });

    pdfUrl = `${pdfUrl}?${params.toString()}`;

    // Return HTML with embedded PDF viewer that works better on mobile
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
        <title>${book.title} - PDF Viewer</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #1a1a1a;
            height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .header {
            background: #2d2d2d;
            color: white;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #404040;
          }
          .header h1 {
            font-size: 1.1rem;
            font-weight: 500;
            flex: 1;
            margin: 0 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .back-btn {
            background: #3d3d3d;
            border: none;
            color: white;
            font-size: 1.5rem;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            cursor: pointer;
          }
          .back-btn:hover {
            background: #4d4d4d;
          }
          .download-btn {
            background: #3d3d3d;
            border: none;
            color: white;
            font-size: 1.2rem;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            cursor: pointer;
          }
          .download-btn:hover {
            background: #4d4d4d;
          }
          .pdf-container {
            flex: 1;
            background: #0a0a0a;
            position: relative;
            overflow: hidden;
          }
          #pdf-frame {
            width: 100%;
            height: 100%;
            border: none;
            background: white;
          }
          .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #666;
            font-size: 1rem;
          }
          .error-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ff6b6b;
            text-align: center;
            padding: 20px;
            background: #2d2d2d;
            border-radius: 12px;
            display: none;
          }
          .error-message.show {
            display: block;
          }
          .error-message p {
            margin: 10px 0;
          }
          .retry-btn {
            background: #4a90e2;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 15px;
          }
          .retry-btn:hover {
            background: #357abd;
          }
          @media (max-width: 768px) {
            .header {
              padding: 8px 12px;
            }
            .header h1 {
              font-size: 1rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <button class="back-btn" onclick="goBack()">←</button>
          <h1>${book.title}</h1>
          <a href="${pdfUrl}" download="${book.pdfFilename || 'book.pdf'}" class="download-btn">↓</a>
        </div>
        <div class="pdf-container">
          <div class="loading">Loading PDF...</div>
          <div class="error-message" id="error-message">
            <p>⚠️ Failed to load PDF</p>
            <p>Try downloading instead</p>
            <button class="retry-btn" onclick="retryLoad()">Retry</button>
          </div>
          <iframe id="pdf-frame" src="" allowfullscreen></iframe>
        </div>

        <script>
          const pdfUrl = '${pdfUrl}';
          const frame = document.getElementById('pdf-frame');
          const loading = document.querySelector('.loading');
          const errorMsg = document.getElementById('error-message');
          
          // Try different PDF viewers based on device
          function loadPDF() {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            
            let viewerUrl;
            
            if (isIOS) {
              // iOS works better with direct URL
              viewerUrl = pdfUrl;
            } else if (isMobile) {
              // Android works better with Google Viewer
              viewerUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(pdfUrl) + '&embedded=true';
            } else {
              // Desktop - use browser's built-in viewer
              viewerUrl = pdfUrl;
            }
            
            frame.src = viewerUrl;
          }
          
          // Handle load events
          frame.onload = function() {
            loading.style.display = 'none';
          };
          
          frame.onerror = function() {
            loading.style.display = 'none';
            errorMsg.classList.add('show');
          };
          
          // Retry function
          function retryLoad() {
            loading.style.display = 'block';
            errorMsg.classList.remove('show');
            
            // Try alternative viewer
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
              frame.src = pdfUrl;
            } else {
              frame.src = 'https://docs.google.com/viewer?url=' + encodeURIComponent(pdfUrl) + '&embedded=true';
            }
          }
          
          // Go back function
          function goBack() {
            if (document.referrer) {
              window.location.href = document.referrer;
            } else {
              window.history.back();
            }
          }
          
          // Start loading
          loadPDF();
          
          // Set timeout for error
          setTimeout(() => {
            if (loading.style.display !== 'none') {
              loading.style.display = 'none';
              errorMsg.classList.add('show');
            }
          }, 10000);
        </script>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple redirect endpoint for mobile
app.get("/api/redirect-pdf/:id", async (req, res) => {
  try {
    const Book = (await import("./models/Book.js")).default;
    const book = await Book.findById(req.params.id);

    if (!book || !book.pdfFile) {
      return res.status(404).json({ error: "Book or PDF not found" });
    }

    let pdfUrl = book.pdfFile;
    
    // Clean URL
    if (pdfUrl.includes('?')) {
      pdfUrl = pdfUrl.split('?')[0];
    }

    // Add mobile-friendly parameters
    const params = new URLSearchParams({
      fl_notice: '1',
      fl_attachment: '0',
      fl_force: '1',
      fl_lang: 'en'
    });

    pdfUrl = `${pdfUrl}?${params.toString()}`;

    // Redirect to the PDF
    res.redirect(pdfUrl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enhanced debug book endpoint with mobile info
app.get("/api/debug-book/:id", async (req, res) => {
  try {
    const Book = (await import("./models/Book.js")).default;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Test if URL works
    let urlWorks = false;
    let urlStatus = 'unknown';
    try {
      const testResponse = await fetch(book.pdfFile, { method: "HEAD" });
      urlWorks = testResponse.ok;
      urlStatus = testResponse.status;
    } catch (e) {
      console.log("URL test failed:", e.message);
    }

    res.json({
      id: book._id,
      title: book.title,
      author: book.author,
      pdfFile: book.pdfFile,
      pdfFilename: book.pdfFilename,
      pdfFileType: typeof book.pdfFile,
      isCloudinaryUrl: book.pdfFile?.includes("cloudinary.com"),
      isLocalFile: book.pdfFile && !book.pdfFile.includes("cloudinary.com"),
      needsFixing: book.pdfFile && !book.pdfFile.includes("cloudinary.com"),
      isTruncated: book.pdfFile?.includes("library-...") || book.pdfFile?.endsWith("library-"),
      urlWorks: urlWorks,
      urlStatus: urlStatus,
      mobileViewer: `/api/view-pdf/${book._id}`,
      mobileRedirect: `/api/redirect-pdf/${book._id}`,
      googleViewer: `https://docs.google.com/viewer?url=${encodeURIComponent(book.pdfFile)}&embedded=true`,
      suggestions: [
        !urlWorks && "❌ PDF URL is not accessible",
        !book.pdfFile?.includes("cloudinary.com") && "⚠️ Not using Cloudinary",
        book.pdfFile?.includes("library-...") && "⚠️ URL is truncated",
        "Try: /api/view-pdf/" + book._id + " for mobile-friendly viewer",
        "Try: /api/redirect-pdf/" + book._id + " for direct redirect"
      ].filter(Boolean)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// SOCKET.IO STATUS ENDPOINT
// =============================================
app.get("/api/socket-status", (req, res) => {
  const connectedSockets = io.engine?.clientsCount || 0;
  
  res.json({
    success: true,
    message: "Socket.IO server is running",
    connectedClients: connectedSockets,
    activeUsers: io.getActiveUsers?.()?.length || 0,
    activeRooms: io.getActiveRooms?.()?.length || 0,
    availableStaff: io.getAvailableStaff?.()?.length || 0,
    timestamp: new Date().toISOString()
  });
});

// =============================================
// MAIN ROUTES
// =============================================
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
    clientUrl: process.env.CLIENT_URL,
    websocket: io ? "active" : "inactive",
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working!",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    clientUrl: process.env.CLIENT_URL,
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

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log("\n========== SERVER STARTED ==========");
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(` Is Production: ${process.env.NODE_ENV === "production"}`);
  console.log(` WebSocket Server: ✅ Active (Socket.IO)`);
  console.log(
    ` Cloudinary Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME ? "✅" : "❌"}`,
  );
  console.log(
    ` Cloudinary API Key: ${process.env.CLOUDINARY_API_KEY ? "✅" : "❌"}`,
  );
  console.log(
    ` Cloudinary API Secret: ${process.env.CLOUDINARY_API_SECRET ? "✅" : "❌"}`,
  );
  console.log(
    `🔗 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
  );
  console.log(` Allowed origins:`, allowedOrigins);
  if (process.env.NODE_ENV === "development") {
    console.log(` Upload directory: ${path.join(__dirname, "uploads/pdfs")}`);
  }
  console.log("====================================\n");
});