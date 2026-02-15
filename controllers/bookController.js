
// import Book from '../models/Book.js';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import fs from 'fs';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export const getAllBooks = async (req, res) => {
//     try {
//         const { category, search } = req.query;
//         let query = {};

//         if (category) {
//             query.category = category;
//         }

//         if (search) {
//             query.$or = [
//                 { title: { $regex: search, $options: 'i' } },
//                 { author: { $regex: search, $options: 'i' } },
//                 { isbn: { $regex: search, $options: 'i' } }
//             ];
//         }

//         const books = await Book.find(query).sort({ createdAt: -1 });
        
//         const booksWithPdfUrl = books.map(book => {
//             const bookObj = book.toObject();
//             if (bookObj.pdfFile) {
//                 bookObj.pdfUrl = `http://localhost:5000/api/books/pdf/${book._id}`;
//             }
//             return bookObj;
//         });
        
//         res.json(booksWithPdfUrl);
//     } catch (error) {
//         console.error('❌ Error in getAllBooks:', error);
//         res.status(500).json({ message: error.message });
//     }
// };

// export const getBookById = async (req, res) => {
//     try {
//         const book = await Book.findById(req.params.id);
//         if (!book) {
//             return res.status(404).json({ message: 'Book not found' });
//         }
        
//         const bookObj = book.toObject();
//         if (bookObj.pdfFile) {
//             bookObj.pdfUrl = `http://localhost:5000/api/books/pdf/${book._id}`;
//         }
        
//         res.json(bookObj);
//     } catch (error) {
//         console.error('❌ Error in getBookById:', error);
//         res.status(500).json({ message: error.message });
//     }
// };

// export const createBook = async (req, res) => {
//     try {
//         console.log('\n========== CREATE BOOK ==========');
//         console.log('📥 Body:', req.body);
//         console.log('📎 File:', req.file);
//         console.log('================================\n');
        
//         // Create book data
//         const bookData = {
//             title: req.body.title,
//             author: req.body.author,
//             isbn: req.body.isbn,
//             description: req.body.description,
//             category: req.body.category,
//             publishedYear: parseInt(req.body.publishedYear),
//             publisher: req.body.publisher || '',
//             totalCopies: parseInt(req.body.totalCopies),
//             availableCopies: parseInt(req.body.totalCopies),
//             coverImage: req.body.coverImage || ''
//         };
        
//         // Handle PDF file upload
//         if (req.file) {
//             // Store the path relative to server root
//             const pdfPath = `/uploads/pdfs/${req.file.filename}`;
//             bookData.pdfFile = pdfPath;
//             bookData.pdfFilename = req.file.originalname;
//             console.log('✅ PDF saved at:', pdfPath);
//             console.log('✅ PDF filename:', req.file.originalname);
//         } else {
//             console.log('⚠️ No PDF file uploaded');
//         }

//         const book = new Book(bookData);
//         await book.save();
        
//         console.log('✅ Book saved with ID:', book._id);
//         console.log('✅ PDF in DB:', book.pdfFile ? 'Yes' : 'No');
        
//         // Add PDF URL for response
//         const bookObj = book.toObject();
//         if (bookObj.pdfFile) {
//             bookObj.pdfUrl = `http://localhost:5000/api/books/pdf/${book._id}`;
//         }
        
//         res.status(201).json(bookObj);
//     } catch (error) {
//         console.error('❌ Error creating book:', error);
//         res.status(400).json({ message: error.message });
//     }
// };

// export const updateBook = async (req, res) => {
//     try {
//         console.log('\n========== UPDATE BOOK ==========');
//         console.log('📥 ID:', req.params.id);
//         console.log('📥 Body:', req.body);
//         console.log('📎 File:', req.file);
//         console.log('================================\n');
        
//         // Build update data
//         const updateData = {
//             title: req.body.title,
//             author: req.body.author,
//             isbn: req.body.isbn,
//             description: req.body.description,
//             category: req.body.category,
//             publishedYear: parseInt(req.body.publishedYear),
//             publisher: req.body.publisher || '',
//             totalCopies: parseInt(req.body.totalCopies),
//             availableCopies: parseInt(req.body.totalCopies),
//             coverImage: req.body.coverImage || ''
//         };
        
//         // Handle PDF file upload
//         if (req.file) {
//             // Get old book to delete old PDF
//             const oldBook = await Book.findById(req.params.id);
//             if (oldBook && oldBook.pdfFile) {
//                 const oldPdfPath = path.join(__dirname, '..', oldBook.pdfFile);
//                 try {
//                     if (fs.existsSync(oldPdfPath)) {
//                         fs.unlinkSync(oldPdfPath);
//                         console.log('✅ Deleted old PDF file');
//                     }
//                 } catch (err) {
//                     console.log('⚠️ Could not delete old PDF:', err.message);
//                 }
//             }
            
//             // Store new PDF
//             const pdfPath = `/uploads/pdfs/${req.file.filename}`;
//             updateData.pdfFile = pdfPath;
//             updateData.pdfFilename = req.file.originalname;
//             console.log('✅ New PDF saved:', pdfPath);
//         }

//         const book = await Book.findByIdAndUpdate(
//             req.params.id,
//             updateData,
//             { new: true, runValidators: true }
//         );
        
//         if (!book) {
//             return res.status(404).json({ message: 'Book not found' });
//         }
        
//         const bookObj = book.toObject();
//         if (bookObj.pdfFile) {
//             bookObj.pdfUrl = `http://localhost:5000/api/books/pdf/${book._id}`;
//         }
        
//         console.log('✅ Book updated successfully');
//         res.json(bookObj);
//     } catch (error) {
//         console.error('❌ Error updating book:', error);
//         res.status(400).json({ message: error.message });
//     }
// };

// export const deleteBook = async (req, res) => {
//     try {
//         const book = await Book.findById(req.params.id);
//         if (!book) {
//             return res.status(404).json({ message: 'Book not found' });
//         }

//         // Delete PDF file if exists
//         if (book.pdfFile) {
//             const pdfPath = path.join(__dirname, '..', book.pdfFile);
//             try {
//                 if (fs.existsSync(pdfPath)) {
//                     fs.unlinkSync(pdfPath);
//                     console.log('✅ Deleted PDF file');
//                 }
//             } catch (err) {
//                 console.log('⚠️ Could not delete PDF:', err.message);
//             }
//         }

//         await Book.findByIdAndDelete(req.params.id);
//         res.json({ message: 'Book deleted successfully' });
//     } catch (error) {
//         console.error('❌ Error deleting book:', error);
//         res.status(500).json({ message: error.message });
//     }
// };

// export const servePdf = async (req, res) => {
//     try {
//         const book = await Book.findById(req.params.id);
//         if (!book || !book.pdfFile) {
//             return res.status(404).json({ message: 'PDF not found' });
//         }

//         // Construct full path
//         const pdfPath = path.join(__dirname, '..', book.pdfFile);
        
//         if (!fs.existsSync(pdfPath)) {
//             console.error('❌ PDF file not found:', pdfPath);
//             return res.status(404).json({ message: 'PDF file not found on server' });
//         }

//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `inline; filename="${book.pdfFilename || book.title}.pdf"`);
        
//         const fileStream = fs.createReadStream(pdfPath);
//         fileStream.pipe(res);
        
//         console.log('📄 Serving PDF:', book.pdfFilename);
//     } catch (error) {
//         console.error('❌ Error serving PDF:', error);
//         res.status(500).json({ message: error.message });
//     }
// };


//note

// import Book from '../models/Book.js';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import fs from 'fs';
// import { v2 as cloudinary } from 'cloudinary';
// import dotenv from 'dotenv';

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Configure Cloudinary
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // Helper function to delete file from storage
// const deleteFile = async (filePath) => {
//     if (process.env.NODE_ENV === 'production') {
//         // Extract public_id from Cloudinary URL
//         if (filePath && filePath.includes('cloudinary')) {
//             try {
//                 const publicId = filePath.split('/').pop().split('.')[0];
//                 await cloudinary.uploader.destroy(`library-books/${publicId}`, { resource_type: 'raw' });
//                 console.log('✅ Deleted file from Cloudinary');
//             } catch (error) {
//                 console.log('⚠️ Could not delete from Cloudinary:', error.message);
//             }
//         }
//     } else {
//         // Local file deletion
//         if (filePath) {
//             const fullPath = path.join(__dirname, '..', filePath);
//             try {
//                 if (fs.existsSync(fullPath)) {
//                     fs.unlinkSync(fullPath);
//                     console.log('✅ Deleted local file');
//                 }
//             } catch (err) {
//                 console.log('⚠️ Could not delete local file:', err.message);
//             }
//         }
//     }
// };

// // Helper function to generate PDF URL
// const getPdfUrl = (book) => {
//     if (!book.pdfFile) return null;
    
//     if (process.env.NODE_ENV === 'production') {
//         return book.pdfFile; // Cloudinary URL
//     } else {
//         return `${process.env.BASE_URL || 'http://localhost:5000'}/api/books/pdf/${book._id}`;
//     }
// };

// export const getAllBooks = async (req, res) => {
//     try {
//         const { category, search } = req.query;
//         let query = {};

//         if (category) {
//             query.category = category;
//         }

//         if (search) {
//             query.$or = [
//                 { title: { $regex: search, $options: 'i' } },
//                 { author: { $regex: search, $options: 'i' } },
//                 { isbn: { $regex: search, $options: 'i' } }
//             ];
//         }

//         const books = await Book.find(query).sort({ createdAt: -1 });
        
//         const booksWithPdfUrl = books.map(book => {
//             const bookObj = book.toObject();
//             bookObj.pdfUrl = getPdfUrl(book);
//             return bookObj;
//         });
        
//         res.json(booksWithPdfUrl);
//     } catch (error) {
//         console.error('❌ Error in getAllBooks:', error);
//         res.status(500).json({ message: error.message });
//     }
// };

// export const getBookById = async (req, res) => {
//     try {
//         const book = await Book.findById(req.params.id);
//         if (!book) {
//             return res.status(404).json({ message: 'Book not found' });
//         }
        
//         const bookObj = book.toObject();
//         bookObj.pdfUrl = getPdfUrl(book);
        
//         res.json(bookObj);
//     } catch (error) {
//         console.error('❌ Error in getBookById:', error);
//         res.status(500).json({ message: error.message });
//     }
// };

// export const createBook = async (req, res) => {
//     try {
//         console.log('\n========== CREATE BOOK ==========');
        
//         // Validate required fields
//         const requiredFields = ['title', 'author', 'isbn', 'description', 'category', 'publishedYear', 'totalCopies'];
//         for (const field of requiredFields) {
//             if (!req.body[field]) {
//                 return res.status(400).json({ message: `${field} is required` });
//             }
//         }
        
//         // Create book data
//         const bookData = {
//             title: req.body.title,
//             author: req.body.author,
//             isbn: req.body.isbn,
//             description: req.body.description,
//             category: req.body.category,
//             publishedYear: parseInt(req.body.publishedYear),
//             publisher: req.body.publisher || '',
//             totalCopies: parseInt(req.body.totalCopies),
//             availableCopies: parseInt(req.body.totalCopies),
//             coverImage: req.body.coverImage || ''
//         };
        
//         // Handle PDF file upload
//         if (req.file) {
//             if (process.env.NODE_ENV === 'production') {
//                 // Store Cloudinary URL
//                 bookData.pdfFile = req.file.path; // Cloudinary URL
//                 bookData.pdfFilename = req.file.originalname;
//                 console.log('✅ PDF saved to Cloudinary:', req.file.path);
//             } else {
//                 // Store local path
//                 const pdfPath = `/uploads/pdfs/${req.file.filename}`;
//                 bookData.pdfFile = pdfPath;
//                 bookData.pdfFilename = req.file.originalname;
//                 console.log('✅ PDF saved locally at:', pdfPath);
//             }
//         }

//         const book = new Book(bookData);
//         await book.save();
        
//         const bookObj = book.toObject();
//         bookObj.pdfUrl = getPdfUrl(book);
        
//         res.status(201).json({
//             success: true,
//             message: 'Book created successfully',
//             book: bookObj
//         });
//     } catch (error) {
//         console.error('❌ Error creating book:', error);
        
//         // Handle duplicate key error (ISBN)
//         if (error.code === 11000) {
//             return res.status(400).json({ message: 'ISBN already exists' });
//         }
        
//         res.status(400).json({ message: error.message });
//     }
// };

// export const updateBook = async (req, res) => {
//     try {
//         console.log('\n========== UPDATE BOOK ==========');
        
//         // Build update data
//         const updateData = {
//             title: req.body.title,
//             author: req.body.author,
//             isbn: req.body.isbn,
//             description: req.body.description,
//             category: req.body.category,
//             publishedYear: parseInt(req.body.publishedYear),
//             publisher: req.body.publisher || '',
//             totalCopies: parseInt(req.body.totalCopies),
//             availableCopies: parseInt(req.body.totalCopies),
//             coverImage: req.body.coverImage || ''
//         };
        
//         // Handle PDF file upload
//         if (req.file) {
//             // Get old book to delete old PDF
//             const oldBook = await Book.findById(req.params.id);
//             if (oldBook && oldBook.pdfFile) {
//                 await deleteFile(oldBook.pdfFile);
//             }
            
//             // Store new PDF
//             if (process.env.NODE_ENV === 'production') {
//                 updateData.pdfFile = req.file.path; // Cloudinary URL
//                 updateData.pdfFilename = req.file.originalname;
//             } else {
//                 const pdfPath = `/uploads/pdfs/${req.file.filename}`;
//                 updateData.pdfFile = pdfPath;
//                 updateData.pdfFilename = req.file.originalname;
//             }
//             console.log('✅ New PDF saved');
//         }

//         const book = await Book.findByIdAndUpdate(
//             req.params.id,
//             updateData,
//             { new: true, runValidators: true }
//         );
        
//         if (!book) {
//             return res.status(404).json({ message: 'Book not found' });
//         }
        
//         const bookObj = book.toObject();
//         bookObj.pdfUrl = getPdfUrl(book);
        
//         res.json({
//             success: true,
//             message: 'Book updated successfully',
//             book: bookObj
//         });
//     } catch (error) {
//         console.error('❌ Error updating book:', error);
        
//         if (error.code === 11000) {
//             return res.status(400).json({ message: 'ISBN already exists' });
//         }
        
//         res.status(400).json({ message: error.message });
//     }
// };

// export const deleteBook = async (req, res) => {
//     try {
//         const book = await Book.findById(req.params.id);
//         if (!book) {
//             return res.status(404).json({ message: 'Book not found' });
//         }

//         // Delete PDF file if exists
//         if (book.pdfFile) {
//             await deleteFile(book.pdfFile);
//         }

//         await Book.findByIdAndDelete(req.params.id);
        
//         res.json({ 
//             success: true,
//             message: 'Book deleted successfully' 
//         });
//     } catch (error) {
//         console.error('❌ Error deleting book:', error);
//         res.status(500).json({ message: error.message });
//     }
// };

// export const servePdf = async (req, res) => {
//     // This endpoint is only for development (local files)
//     if (process.env.NODE_ENV === 'production') {
//         return res.status(404).json({ message: 'PDF serving not available in production' });
//     }
    
//     try {
//         const book = await Book.findById(req.params.id);
//         if (!book || !book.pdfFile) {
//             return res.status(404).json({ message: 'PDF not found' });
//         }

//         const pdfPath = path.join(__dirname, '..', book.pdfFile);
        
//         if (!fs.existsSync(pdfPath)) {
//             return res.status(404).json({ message: 'PDF file not found on server' });
//         }

//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `inline; filename="${book.pdfFilename || book.title}.pdf"`);
        
//         const fileStream = fs.createReadStream(pdfPath);
//         fileStream.pipe(res);
//     } catch (error) {
//         console.error('❌ Error serving PDF:', error);
//         res.status(500).json({ message: error.message });
//     }
// };


import Book from '../models/Book.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'; // Add this import at the top

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to delete file from storage
const deleteFile = async (filePath) => {
    if (process.env.NODE_ENV === 'production') {
        // Extract public_id from Cloudinary URL
        if (filePath && filePath.includes('cloudinary')) {
            try {
                // Extract public_id from Cloudinary URL
                // URL format: https://res.cloudinary.com/cloud_name/raw/upload/v123456/library-books/pdf-123456.pdf
                const urlParts = filePath.split('/');
                const filename = urlParts[urlParts.length - 1];
                const publicId = `library-books/${filename.split('.')[0]}`;
                await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
                console.log('✅ Deleted file from Cloudinary:', publicId);
            } catch (error) {
                console.log('⚠️ Could not delete from Cloudinary:', error.message);
            }
        }
    } else {
        // Local file deletion
        if (filePath) {
            const fullPath = path.join(__dirname, '..', 'uploads', 'pdfs', path.basename(filePath));
            try {
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                    console.log('✅ Deleted local file:', fullPath);
                }
            } catch (err) {
                console.log('⚠️ Could not delete local file:', err.message);
            }
        }
    }
};

// Helper function to generate PDF URL
const getPdfUrl = (book) => {
    if (!book.pdfFile) return null;
    
    if (process.env.NODE_ENV === 'production') {
        // In production, return the Cloudinary URL directly
        return book.pdfFile;
    } else {
        // In development, return the local endpoint
        return `${process.env.BASE_URL || 'http://localhost:5000'}/api/books/pdf/${book._id}`;
    }
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
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } }
            ];
        }

        const books = await Book.find(query).sort({ createdAt: -1 });
        
        const booksWithPdfUrl = books.map(book => {
            const bookObj = book.toObject();
            bookObj.pdfUrl = getPdfUrl(book);
            return bookObj;
        });
        
        res.json(booksWithPdfUrl);
    } catch (error) {
        console.error('❌ Error in getAllBooks:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        const bookObj = book.toObject();
        bookObj.pdfUrl = getPdfUrl(book);
        
        res.json(bookObj);
    } catch (error) {
        console.error('❌ Error in getBookById:', error);
        res.status(500).json({ message: error.message });
    }
};

export const createBook = async (req, res) => {
    try {
        console.log('\n========== CREATE BOOK ==========');
        
        // Validate required fields
        const requiredFields = ['title', 'author', 'isbn', 'description', 'category', 'publishedYear', 'totalCopies'];
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
            publisher: req.body.publisher || '',
            totalCopies: parseInt(req.body.totalCopies),
            availableCopies: parseInt(req.body.totalCopies),
            coverImage: req.body.coverImage || ''
        };
        
        // Handle PDF file upload
        if (req.file) {
            if (process.env.NODE_ENV === 'production') {
                // Store Cloudinary URL
                bookData.pdfFile = req.file.path; // Cloudinary URL
                bookData.pdfFilename = req.file.originalname;
                console.log('✅ PDF saved to Cloudinary:', req.file.path);
            } else {
                // Store local filename only
                bookData.pdfFile = req.file.filename;
                bookData.pdfFilename = req.file.originalname;
                console.log('✅ PDF saved locally as:', req.file.filename);
            }
        }

        const book = new Book(bookData);
        await book.save();
        
        const bookObj = book.toObject();
        bookObj.pdfUrl = getPdfUrl(book);
        
        res.status(201).json({
            success: true,
            message: 'Book created successfully',
            book: bookObj
        });
    } catch (error) {
        console.error('❌ Error creating book:', error);
        
        // Handle duplicate key error (ISBN)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'ISBN already exists' });
        }
        
        res.status(400).json({ message: error.message });
    }
};

export const updateBook = async (req, res) => {
    try {
        console.log('\n========== UPDATE BOOK ==========');
        
        // Get old book to check for PDF changes
        const oldBook = await Book.findById(req.params.id);
        if (!oldBook) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        // Build update data
        const updateData = {
            title: req.body.title,
            author: req.body.author,
            isbn: req.body.isbn,
            description: req.body.description,
            category: req.body.category,
            publishedYear: parseInt(req.body.publishedYear),
            publisher: req.body.publisher || '',
            totalCopies: parseInt(req.body.totalCopies),
            availableCopies: parseInt(req.body.totalCopies),
            coverImage: req.body.coverImage || ''
        };
        
        // Handle PDF file upload
        if (req.file) {
            // Delete old PDF if exists
            if (oldBook.pdfFile) {
                await deleteFile(oldBook.pdfFile);
            }
            
            // Store new PDF
            if (process.env.NODE_ENV === 'production') {
                updateData.pdfFile = req.file.path; // Cloudinary URL
                updateData.pdfFilename = req.file.originalname;
            } else {
                updateData.pdfFile = req.file.filename;
                updateData.pdfFilename = req.file.originalname;
            }
            console.log('✅ New PDF saved');
        }

        const book = await Book.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        const bookObj = book.toObject();
        bookObj.pdfUrl = getPdfUrl(book);
        
        res.json({
            success: true,
            message: 'Book updated successfully',
            book: bookObj
        });
    } catch (error) {
        console.error('❌ Error updating book:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ message: 'ISBN already exists' });
        }
        
        res.status(400).json({ message: error.message });
    }
};

export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Delete PDF file if exists
        if (book.pdfFile) {
            await deleteFile(book.pdfFile);
        }

        await Book.findByIdAndDelete(req.params.id);
        
        res.json({ 
            success: true,
            message: 'Book deleted successfully' 
        });
    } catch (error) {
        console.error('❌ Error deleting book:', error);
        res.status(500).json({ message: error.message });
    }
};

// export const servePdf = async (req, res) => {
//     try {
//         const book = await Book.findById(req.params.id);
//         if (!book || !book.pdfFile) {
//             return res.status(404).json({ message: 'PDF not found' });
//         }

//         // Disable caching
//         res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
//         res.setHeader('Pragma', 'no-cache');
//         res.setHeader('Expires', '0');

//         if (process.env.NODE_ENV === 'production') {
//             // In production, redirect to Cloudinary URL
//             console.log('🔄 Redirecting to Cloudinary PDF:', book.pdfFile);
            
//             // Add cache busting parameter to Cloudinary URL
//             const cloudinaryUrl = new URL(book.pdfFile);
//             cloudinaryUrl.searchParams.set('_t', Date.now().toString());
            
//             return res.redirect(302, cloudinaryUrl.toString());
//         } else {
//             // Development: serve local file
//             const pdfPath = path.join(__dirname, '..', 'uploads', 'pdfs', book.pdfFile);
            
//             if (!fs.existsSync(pdfPath)) {
//                 return res.status(404).json({ message: 'PDF file not found on server' });
//             }

//             res.setHeader('Content-Type', 'application/pdf');
//             res.setHeader('Content-Disposition', `inline; filename="${book.pdfFilename || book.title}.pdf"`);
            
//             const fileStream = fs.createReadStream(pdfPath);
//             fileStream.pipe(res);
//         }
//     } catch (error) {
//         console.error('❌ Error serving PDF:', error);
//         res.status(500).json({ message: error.message });
//     }
// };



export const servePdf = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book || !book.pdfFile) {
            return res.status(404).json({ message: 'PDF not found' });
        }

        // Check for token in Authorization header
        const authHeader = req.headers.authorization;
        let token = null;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
        
        // If no token in header, check cookies (if you're using cookies)
        // token = req.cookies?.token;
        
        if (!token) {
            console.log('❌ No token provided for PDF access');
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ Token verified for user:', decoded.id);
        } catch (error) {
            console.log('❌ Invalid token:', error.message);
            return res.status(401).json({ message: 'Invalid token' });
        }

        console.log('📄 Serving PDF for book:', book.title);

        // Set proper headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${book.pdfFilename || book.title}.pdf"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

        if (process.env.NODE_ENV === 'production') {
            // For production, redirect to Cloudinary URL
            const cloudinaryUrl = book.pdfFile.replace(/\/v\d+\//, '/');
            console.log('🔄 Redirecting to:', cloudinaryUrl);
            return res.redirect(cloudinaryUrl);
        } else {
            // Development: serve local file
            const pdfPath = path.join(__dirname, '..', 'uploads', 'pdfs', book.pdfFile);
            
            if (!fs.existsSync(pdfPath)) {
                return res.status(404).json({ message: 'PDF file not found on server' });
            }
            
            const fileStream = fs.createReadStream(pdfPath);
            fileStream.pipe(res);
        }
    } catch (error) {
        console.error('❌ Error serving PDF:', error);
        res.status(500).json({ message: error.message });
    }
};
