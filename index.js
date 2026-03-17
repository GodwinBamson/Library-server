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

// =============================================
// IMPROVED CORS CONFIGURATION FOR MOBILE
// =============================================
const allowedOrigins = [
  "https://frontend-libraryapp.onrender.com",
  "https://library-server-5rpq.onrender.com",
  "http://localhost:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5000",
  // Mobile development patterns
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,  // Local network IPs
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/, // Common mobile hotspot range
  /^http:\/\/172\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/, // Docker/internal networks
];

// Function to check if origin matches any pattern
const isOriginAllowed = (origin) => {
  if (!origin) return true;
  
  // Check exact matches
  if (allowedOrigins.includes(origin)) return true;
  
  // Check regex patterns
  for (const pattern of allowedOrigins) {
    if (pattern instanceof RegExp && pattern.test(origin)) {
      return true;
    }
  }
  
  // Allow any origin in development
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  
  // In production, allow if it's from onrender.com
  if (origin && origin.includes('onrender.com')) {
    return true;
  }
  
  return false;
};

app.use(
  cors({
    origin: function (origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.log("❌ CORS blocked origin:", origin);
        console.log("✅ Allowed patterns: onrender.com, localhost, local IPs");
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Cache-Control",
      "Pragma",
    ],
    exposedHeaders: ["Content-Disposition", "Content-Length"],
  })
);

// Handle preflight requests
app.options("*", cors());

// =============================================
// BODY PARSERS WITH INCREASED LIMITS FOR MOBILE
// =============================================
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// =============================================
// REQUEST LOGGING WITH MOBILE DETECTION
// =============================================
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Origin:", req.headers.origin);
  console.log("User-Agent:", req.headers['user-agent']?.substring(0, 50) + '...');
  console.log("Is Mobile:", /mobile|android|iphone|ipad|ipod/i.test(req.headers['user-agent'] || ''));
  console.log("Auth Header:", req.headers.authorization ? "Present" : "Missing");
  next();
});

// =============================================
// DEVELOPMENT UPLOADS DIRECTORY
// =============================================
if (process.env.NODE_ENV === "development") {
  const uploadDir = path.join(__dirname, "uploads/pdfs");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("✅ Created uploads directory for development");
  }

  try {
    const testFile = path.join(uploadDir, `test-${Date.now()}.txt`);
    fs.writeFileSync(testFile, "test");
    console.log("✅ Upload directory is writable");
    fs.unlinkSync(testFile);
  } catch (err) {
    console.error("❌ Upload directory is NOT writable:", err.message);
  }

  // Serve static files with proper MIME types for mobile
  app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
      }
    }
  }));
}

// =============================================
// MOBILE DEBUG ENDPOINTS
// =============================================

// Mobile connectivity test
app.get("/api/mobile-debug", (req, res) => {
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(req.headers['user-agent'] || '');
  
  res.json({
    success: true,
    message: "Mobile connection successful",
    timestamp: new Date().toISOString(),
    isMobile: isMobile,
    clientInfo: {
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      origin: req.headers.origin,
      host: req.headers.host,
      'user-agent': req.headers['user-agent'],
      accept: req.headers.accept,
    },
    serverInfo: {
      environment: process.env.NODE_ENV,
      port: process.env.PORT || 5000,
      cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? "✅ Configured" : "❌ Missing",
      allowedOrigins: allowedOrigins.length,
    },
    cors: {
      origin: req.headers.origin,
      allowed: isOriginAllowed(req.headers.origin),
    }
  });
});

// Test PDF access for mobile
app.get("/api/test-pdf-mobile", (req, res) => {
  res.json({
    success: true,
    message: "PDF test endpoint",
    pdfInstructions: {
      note: "For mobile PDF viewing, use the following format:",
      directUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/`,
      withViewer: `https://docs.google.com/viewer?url=`,
      embedded: `Use #toolbar=0&navpanes=0&view=FitH for better mobile viewing`
    }
  });
});

// Debug environment
app.get("/api/debug-env", (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === "production",
    isRender: process.env.RENDER === "true",
    clientUrl: process.env.CLIENT_URL,
    allowedOrigins: allowedOrigins.map(o => o.toString()),
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

    res.json({
      success: true,
      message: "Cloudinary is working!",
      ping: pingResult,
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

// Debug single book
app.get("/api/debug-book/:id", async (req, res) => {
  try {
    const Book = (await import("./models/Book.js")).default;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
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
      mobileViewUrl: book.pdfFile ? `${book.pdfFile}#toolbar=0&navpanes=0&view=FitH` : null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// PDF FIX ENDPOINTS
// =============================================

// Fix truncated PDF URLs
app.get("/api/fix-truncated-pdfs", async (req, res) => {
  try {
    const Book = (await import("./models/Book.js")).default;
    const books = await Book.find({});

    const results = [];
    let fixed = 0;
    let skipped = 0;

    for (const book of books) {
      if (book.pdfFile && book.pdfFile.includes("cloudinary.com")) {
        if (book.pdfFile.includes("library-...") || book.pdfFile.endsWith("library-")) {
          console.log(`🔧 Fixing truncated URL for book: ${book.title}`);
          
          let filename = book.pdfFilename;

          if (filename) {
            filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");
            if (!filename.toLowerCase().endsWith(".pdf")) {
              filename = filename + ".pdf";
            }

            const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

            book.pdfFile = correctUrl;
            await book.save();

            results.push({
              id: book._id,
              title: book.title,
              old: book.pdfFile,
              new: correctUrl,
              mobileUrl: `${correctUrl}#toolbar=0&navpanes=0&view=FitH`,
            });
            fixed++;
          } else {
            results.push({
              id: book._id,
              title: book.title,
              error: "Cannot determine filename",
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

// Fix all PDFs
app.get("/api/fix-all-pdfs-now", async (req, res) => {
  try {
    const Book = (await import("./models/Book.js")).default;
    const books = await Book.find({});

    const results = [];
    let fixed = 0;
    let skipped = 0;

    for (const book of books) {
      if (book.pdfFile) {
        if (!book.pdfFile.includes("cloudinary.com") || 
            book.pdfFile.includes("library-...") || 
            book.pdfFile.endsWith("library-")) {
          
          let filename = book.pdfFilename;

          if (!filename && book.pdfFile) {
            if (book.pdfFile.includes("/")) {
              filename = book.pdfFile.split("/").pop();
            } else {
              filename = book.pdfFile;
            }
          }

          if (filename) {
            filename = filename.replace(/[^a-zA-Z0-9-_.() ]/g, "");
            if (!filename.toLowerCase().endsWith(".pdf")) {
              filename = filename + ".pdf";
            }

            const correctUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/library-books/${encodeURIComponent(filename)}`;

            book.pdfFile = correctUrl;
            await book.save();

            results.push({
              id: book._id,
              title: book.title,
              old: book.pdfFile,
              new: correctUrl,
              mobileUrl: `${correctUrl}#toolbar=0&navpanes=0&view=FitH`,
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

// Socket.IO status
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

// =============================================
// HEALTH CHECK
// =============================================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    message: "Server is running",
    clientUrl: process.env.CLIENT_URL,
    websocket: io ? "active" : "inactive",
    mobile: {
      supported: true,
      endpoint: "/api/mobile-debug"
    }
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working!",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    clientUrl: process.env.CLIENT_URL,
    mobileFriendly: true,
  });
});

// =============================================
// ERROR HANDLING
// =============================================
app.use(notFound);
app.use(errorHandler);

// =============================================
// START SERVER
// =============================================
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log("\n========== SERVER STARTED ==========");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📱 Is Production: ${process.env.NODE_ENV === "production"}`);
  console.log(`📱 WebSocket Server: ✅ Active (Socket.IO)`);
  console.log(`📱 Mobile Debug: /api/mobile-debug`);
  console.log(`📱 Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? "✅" : "❌"}`);
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  console.log(`📱 Allowed origins: ${allowedOrigins.length} patterns`);
  console.log("====================================\n");
});


