// import Book from "../models/Book.js";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";
// import { v2 as cloudinary } from "cloudinary";
// import dotenv from "dotenv";

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Helper function to delete file from storage
// const deleteFile = async (filePath) => {
//   if (process.env.NODE_ENV === "production") {
//     // Extract public_id from Cloudinary URL
//     if (filePath && filePath.includes("cloudinary")) {
//       try {
//         // Extract public_id from Cloudinary URL
//         const urlParts = filePath.split("/");
//         const filename = urlParts[urlParts.length - 1];
//         const publicId = `library-books/${filename.split(".")[0]}`;
//         await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
//         console.log(" Deleted file from Cloudinary:", publicId);
//       } catch (error) {
//         console.log(" Could not delete from Cloudinary:", error.message);
//       }
//     }
//   } else {
//     // Local file deletion
//     if (filePath) {
//       const fullPath = path.join(
//         __dirname,
//         "..",
//         "uploads",
//         "pdfs",
//         path.basename(filePath),
//       );
//       try {
//         if (fs.existsSync(fullPath)) {
//           fs.unlinkSync(fullPath);
//           console.log(" Deleted local file:", fullPath);
//         }
//       } catch (err) {
//         console.log(" Could not delete local file:", err.message);
//       }
//     }
//   }
// };

// // Helper function to generate PDF URL
// const getPdfUrl = (book) => {
//   if (!book.pdfFile) return null;

//   // If it's already a Cloudinary URL (from production), use it directly
//   if (book.pdfFile.includes("cloudinary.com")) {
//     // Remove version parameter to ensure consistent URLs
//     return book.pdfFile.replace(/\/v\d+\//, "/");
//   }

//   // For local development with server running
//   if (process.env.NODE_ENV === "development") {
//     return `${process.env.BASE_URL || "http://localhost:5000"}/api/books/pdf/${book._id}`;
//   }

//   // Fallback: try to use the stored path
//   return book.pdfFile;
// };

// export const getAllBooks = async (req, res) => {
//   try {
//     const { category, search } = req.query;
//     let query = {};

//     if (category) {
//       query.category = category;
//     }

//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: "i" } },
//         { author: { $regex: search, $options: "i" } },
//         { isbn: { $regex: search, $options: "i" } },
//       ];
//     }

//     const books = await Book.find(query).sort({ createdAt: -1 });

//     const booksWithPdfUrl = books.map((book) => {
//       const bookObj = book.toObject();
//       bookObj.pdfUrl = getPdfUrl(book);
//       return bookObj;
//     });

//     res.json(booksWithPdfUrl);
//   } catch (error) {
//     console.error(" Error in getAllBooks:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getBookById = async (req, res) => {
//   try {
//     const book = await Book.findById(req.params.id);
//     if (!book) {
//       return res.status(404).json({ message: "Book not found" });
//     }

//     const bookObj = book.toObject();
//     bookObj.pdfUrl = getPdfUrl(book);

//     res.json(bookObj);
//   } catch (error) {
//     console.error(" Error in getBookById:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const createBook = async (req, res) => {
//   try {
//     console.log("\n========== CREATE BOOK ==========");

//     // Validate required fields
//     const requiredFields = [
//       "title",
//       "author",
//       "isbn",
//       "description",
//       "category",
//       "publishedYear",
//       "totalCopies",
//     ];
//     for (const field of requiredFields) {
//       if (!req.body[field]) {
//         return res.status(400).json({ message: `${field} is required` });
//       }
//     }

//     // Create book data
//     const bookData = {
//       title: req.body.title,
//       author: req.body.author,
//       isbn: req.body.isbn,
//       description: req.body.description,
//       category: req.body.category,
//       publishedYear: parseInt(req.body.publishedYear),
//       publisher: req.body.publisher || "",
//       totalCopies: parseInt(req.body.totalCopies),
//       availableCopies: parseInt(req.body.totalCopies),
//       coverImage: req.body.coverImage || "",
//     };

//     // Handle PDF file upload
//     if (req.file) {
//       if (process.env.NODE_ENV === "production") {
//         // Store Cloudinary URL
//         bookData.pdfFile = req.file.path; // Cloudinary URL
//         bookData.pdfFilename = req.file.originalname;
//         console.log(" PDF saved to Cloudinary:", req.file.path);
//       } else {
//         // Store local filename only
//         bookData.pdfFile = req.file.filename;
//         bookData.pdfFilename = req.file.originalname;
//         console.log(" PDF saved locally as:", req.file.filename);
//       }
//     }

//     const book = new Book(bookData);
//     await book.save();

//     const bookObj = book.toObject();
//     bookObj.pdfUrl = getPdfUrl(book);

//     res.status(201).json({
//       success: true,
//       message: "Book created successfully",
//       book: bookObj,
//     });
//   } catch (error) {
//     console.error(" Error creating book:", error);

//     // Handle duplicate key error (ISBN)
//     if (error.code === 11000) {
//       return res.status(400).json({ message: "ISBN already exists" });
//     }

//     res.status(400).json({ message: error.message });
//   }
// };

// export const updateBook = async (req, res) => {
//   try {
//     console.log("\n========== UPDATE BOOK ==========");

//     // Get old book to check for PDF changes
//     const oldBook = await Book.findById(req.params.id);
//     if (!oldBook) {
//       return res.status(404).json({ message: "Book not found" });
//     }

//     // Build update data
//     const updateData = {
//       title: req.body.title,
//       author: req.body.author,
//       isbn: req.body.isbn,
//       description: req.body.description,
//       category: req.body.category,
//       publishedYear: parseInt(req.body.publishedYear),
//       publisher: req.body.publisher || "",
//       totalCopies: parseInt(req.body.totalCopies),
//       availableCopies: parseInt(req.body.totalCopies),
//       coverImage: req.body.coverImage || "",
//     };

//     // Handle PDF file upload
//     if (req.file) {
//       // Delete old PDF if exists
//       if (oldBook.pdfFile) {
//         await deleteFile(oldBook.pdfFile);
//       }

//       // Store new PDF
//       if (process.env.NODE_ENV === "production") {
//         updateData.pdfFile = req.file.path; // Cloudinary URL
//         updateData.pdfFilename = req.file.originalname;
//       } else {
//         updateData.pdfFile = req.file.filename;
//         updateData.pdfFilename = req.file.originalname;
//       }
//       console.log(" New PDF saved");
//     }

//     const book = await Book.findByIdAndUpdate(req.params.id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     const bookObj = book.toObject();
//     bookObj.pdfUrl = getPdfUrl(book);

//     res.json({
//       success: true,
//       message: "Book updated successfully",
//       book: bookObj,
//     });
//   } catch (error) {
//     console.error(" Error updating book:", error);

//     if (error.code === 11000) {
//       return res.status(400).json({ message: "ISBN already exists" });
//     }

//     res.status(400).json({ message: error.message });
//   }
// };

// export const deleteBook = async (req, res) => {
//   try {
//     const book = await Book.findById(req.params.id);
//     if (!book) {
//       return res.status(404).json({ message: "Book not found" });
//     }

//     // Delete PDF file if exists
//     if (book.pdfFile) {
//       await deleteFile(book.pdfFile);
//     }

//     await Book.findByIdAndDelete(req.params.id);

//     res.json({
//       success: true,
//       message: "Book deleted successfully",
//     });
//   } catch (error) {
//     console.error(" Error deleting book:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const servePdf = async (req, res) => {
//   try {
//     const book = await Book.findById(req.params.id);
//     if (!book || !book.pdfFile) {
//       return res.status(404).json({ message: "PDF not found" });
//     }

//     console.log(" Serving PDF for book:", book.title);

//     // For production with Cloudinary
//     if (
//       process.env.NODE_ENV === "production" &&
//       book.pdfFile.includes("cloudinary.com")
//     ) {
//       const cloudinaryUrl = book.pdfFile.replace(/\/v\d+\//, "/");

//       // Add parameters to disable toolbar, download, and print
//       // Using viewer param with minimal UI
//       const finalUrl = `${cloudinaryUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&disableRange=true`;

//       console.log(" Redirecting to:", finalUrl);

//       // Set headers to prevent download
//       res.setHeader("Content-Disposition", "inline");
//       res.setHeader("X-Content-Type-Options", "nosniff");
//       res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
//       res.setHeader("Access-Control-Allow-Credentials", "true");

//       return res.redirect(302, finalUrl);
//     }

//     // Development: serve local file
//     const pdfPath = path.join(__dirname, "..", "uploads", "pdfs", book.pdfFile);

//     if (!fs.existsSync(pdfPath)) {
//       return res.status(404).json({ message: "PDF file not found on server" });
//     }

//     // Set proper headers to disable download/print
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", "inline");
//     res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
//     res.setHeader("Pragma", "no-cache");
//     res.setHeader("Expires", "0");
//     res.setHeader("X-Content-Type-Options", "nosniff");
//     res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
//     res.setHeader("Access-Control-Allow-Credentials", "true");

//     const fileStream = fs.createReadStream(pdfPath);
//     fileStream.pipe(res);
//   } catch (error) {
//     console.error(" Error serving PDF:", error);
//     res.status(500).json({ message: error.message });
//   }
// };




import Book from "../models/Book.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
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

// Helper function to delete file from storage
const deleteFile = async (filePath) => {
  if (process.env.NODE_ENV === "production") {
    // Extract public_id from Cloudinary URL
    if (filePath && filePath.includes("cloudinary")) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = filePath.split("/");
        const filename = urlParts[urlParts.length - 1];
        const publicId = `library-books/${filename.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
        console.log(" Deleted file from Cloudinary:", publicId);
      } catch (error) {
        console.log(" Could not delete from Cloudinary:", error.message);
      }
    }
  } else {
    // Local file deletion
    if (filePath) {
      const fullPath = path.join(
        __dirname,
        "..",
        "uploads",
        "pdfs",
        path.basename(filePath),
      );
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(" Deleted local file:", fullPath);
        }
      } catch (err) {
        console.log(" Could not delete local file:", err.message);
      }
    }
  }
};

// Helper function to generate PDF URL
const getPdfUrl = (book) => {
  if (!book.pdfFile) return null;

  // If it's already a Cloudinary URL (from production)
  if (book.pdfFile.includes("cloudinary.com")) {
    // Ensure it's using raw format for PDFs
    if (!book.pdfFile.includes('/raw/upload/')) {
      return book.pdfFile.replace('/upload/', '/raw/upload/');
    }
    return book.pdfFile;
  }

  // For local development
  if (process.env.NODE_ENV === "development") {
    return `${process.env.BASE_URL || "http://localhost:5000"}/api/books/pdf/${book._id}`;
  }

  return book.pdfFile;
};

export const getAllBooks = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } },
      ];
    }

    const books = await Book.find(query).sort({ createdAt: -1 });

    const booksWithPdfUrl = books.map((book) => {
      const bookObj = book.toObject();
      bookObj.pdfUrl = getPdfUrl(book);
      return bookObj;
    });

    res.json(booksWithPdfUrl);
  } catch (error) {
    console.error(" Error in getAllBooks:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const bookObj = book.toObject();
    bookObj.pdfUrl = getPdfUrl(book);

    res.json(bookObj);
  } catch (error) {
    console.error(" Error in getBookById:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createBook = async (req, res) => {
  try {
    console.log("\n========== CREATE BOOK ==========");

    // Validate required fields
    const requiredFields = [
      "title",
      "author",
      "isbn",
      "description",
      "category",
      "publishedYear",
      "totalCopies",
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Create book data
    const bookData = {
      title: req.body.title,
      author: req.body.author,
      isbn: req.body.isbn,
      description: req.body.description,
      category: req.body.category,
      publishedYear: parseInt(req.body.publishedYear),
      publisher: req.body.publisher || "",
      totalCopies: parseInt(req.body.totalCopies),
      availableCopies: parseInt(req.body.totalCopies),
      coverImage: req.body.coverImage || "",
    };

    // Handle PDF file upload
    if (req.file) {
      if (process.env.NODE_ENV === "production") {
        // Store Cloudinary URL
        bookData.pdfFile = req.file.path; // Cloudinary URL
        bookData.pdfFilename = req.file.originalname;
        console.log(" PDF saved to Cloudinary:", req.file.path);
      } else {
        // Store local filename only
        bookData.pdfFile = req.file.filename;
        bookData.pdfFilename = req.file.originalname;
        console.log(" PDF saved locally as:", req.file.filename);
      }
    }

    const book = new Book(bookData);
    await book.save();

    const bookObj = book.toObject();
    bookObj.pdfUrl = getPdfUrl(book);

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      book: bookObj,
    });
  } catch (error) {
    console.error(" Error creating book:", error);

    // Handle duplicate key error (ISBN)
    if (error.code === 11000) {
      return res.status(400).json({ message: "ISBN already exists" });
    }

    res.status(400).json({ message: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    console.log("\n========== UPDATE BOOK ==========");

    // Get old book to check for PDF changes
    const oldBook = await Book.findById(req.params.id);
    if (!oldBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Build update data
    const updateData = {
      title: req.body.title,
      author: req.body.author,
      isbn: req.body.isbn,
      description: req.body.description,
      category: req.body.category,
      publishedYear: parseInt(req.body.publishedYear),
      publisher: req.body.publisher || "",
      totalCopies: parseInt(req.body.totalCopies),
      availableCopies: parseInt(req.body.totalCopies),
      coverImage: req.body.coverImage || "",
    };

    // Handle PDF file upload
    if (req.file) {
      // Delete old PDF if exists
      if (oldBook.pdfFile) {
        await deleteFile(oldBook.pdfFile);
      }

      // Store new PDF
      if (process.env.NODE_ENV === "production") {
        updateData.pdfFile = req.file.path; // Cloudinary URL
        updateData.pdfFilename = req.file.originalname;
      } else {
        updateData.pdfFile = req.file.filename;
        updateData.pdfFilename = req.file.originalname;
      }
      console.log(" New PDF saved");
    }

    const book = await Book.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    const bookObj = book.toObject();
    bookObj.pdfUrl = getPdfUrl(book);

    res.json({
      success: true,
      message: "Book updated successfully",
      book: bookObj,
    });
  } catch (error) {
    console.error(" Error updating book:", error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "ISBN already exists" });
    }

    res.status(400).json({ message: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Delete PDF file if exists
    if (book.pdfFile) {
      await deleteFile(book.pdfFile);
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error(" Error deleting book:", error);
    res.status(500).json({ message: error.message });
  }
};
export const servePdf = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book || !book.pdfFile) {
      return res.status(404).json({ message: "PDF not found" });
    }

    console.log(" Serving PDF for book:", book.title);
    console.log(" PDF file path:", book.pdfFile);

    // For production with Cloudinary
    if (
      process.env.NODE_ENV === "production" && 
      book.pdfFile && 
      book.pdfFile.includes("cloudinary.com")
    ) {
      // Cloudinary URL is already complete - just add parameters
      // Make sure we're using the raw file URL
      let cloudinaryUrl = book.pdfFile;
      
      // If it's not a raw file URL, ensure it's properly formatted
      if (!cloudinaryUrl.includes('/raw/upload/')) {
        // Insert /raw/upload/ for PDF files
        cloudinaryUrl = cloudinaryUrl.replace('/upload/', '/raw/upload/');
      }
      
      const finalUrl = `${cloudinaryUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
      
      console.log(" Redirecting to Cloudinary URL:", finalUrl);
      
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      
      return res.redirect(302, finalUrl);
    }

    // Development: serve local file
    const pdfPath = path.join(__dirname, "..", "uploads", "pdfs", book.pdfFile);
    
    console.log(" Attempting to serve local PDF from:", pdfPath);

    if (!fs.existsSync(pdfPath)) {
      console.error(" PDF file not found at path:", pdfPath);
      return res.status(404).json({ message: "PDF file not found on server" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error(" Error serving PDF:", error);
    res.status(500).json({ message: error.message });
  }
};
