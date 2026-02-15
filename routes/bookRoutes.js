// import express from 'express';
// import { 
//     getAllBooks, 
//     getBookById, 
//     createBook, 
//     updateBook, 
//     deleteBook 
// } from '../controllers/bookController.js';
// import { auth, adminAuth } from '../middleware/auth.js';

// const router = express.Router();

// router.get('/', getAllBooks);
// router.get('/:id', getBookById);
// router.post('/', auth, adminAuth, createBook);
// router.put('/:id', auth, adminAuth, updateBook);
// router.delete('/:id', auth, adminAuth, deleteBook);

// export default router;




// import express from 'express';
// import upload from '../middleware/upload.js';
// import { 
//     getAllBooks, 
//     getBookById, 
//     createBook, 
//     updateBook, 
//     deleteBook,
//     servePdf 
// } from '../controllers/bookController.js';
// import { auth, adminAuth } from '../middleware/auth.js';

// const router = express.Router();

// // Public routes
// router.get('/', getAllBooks);
// router.get('/:id', getBookById);
// router.get('/pdf/:id', servePdf);

// // Admin only routes with file upload
// router.post('/', auth, adminAuth, upload.single('pdfFile'), createBook);
// router.put('/:id', auth, adminAuth, upload.single('pdfFile'), updateBook);
// router.delete('/:id', auth, adminAuth, deleteBook);

// export default router;




// import express from 'express';
// import upload from '../middleware/upload.js';
// import { 
//     getAllBooks, 
//     getBookById, 
//     createBook, 
//     updateBook, 
//     deleteBook,
//     servePdf 
// } from '../controllers/bookController.js';
// import { auth, adminAuth } from '../middleware/auth.js';

// const router = express.Router();

// // Public routes
// router.get('/', getAllBooks);
// router.get('/:id', getBookById);
// router.get('/pdf/:id', servePdf);

// // IMPORTANT: Order matters! upload.single MUST come before auth
// // Because multer needs to process multipart/form-data BEFORE authentication
// router.post('/', upload.single('pdfFile'), auth, adminAuth, createBook);
// router.put('/:id', upload.single('pdfFile'), auth, adminAuth, updateBook);
// router.delete('/:id', auth, adminAuth, deleteBook);

// // TEST ROUTE - Add this temporarily to verify multer is working
// router.post('/test-upload', upload.single('pdfFile'), (req, res) => {
//     console.log('📎 TEST UPLOAD - File:', req.file);
//     console.log('📥 TEST UPLOAD - Body:', req.body);
//     res.json({ 
//         message: 'Upload test successful', 
//         file: req.file,
//         body: req.body 
//     });
// });

// export default router;


// import express from 'express';
// import upload from '../middleware/upload.js';
// import { 
//     getAllBooks, 
//     getBookById, 
//     createBook, 
//     updateBook, 
//     deleteBook,
//     servePdf 
// } from '../controllers/bookController.js';
// import { auth, adminAuth } from '../middleware/auth.js';

// const router = express.Router();

// // Public routes
// router.get('/', getAllBooks);
// router.get('/:id', getBookById);
// router.get('/pdf/:id', servePdf);

// // IMPORTANT: THE CORRECT ORDER IS:
// // 1. upload.single('pdfFile') - processes the file FIRST
// // 2. auth - then check authentication
// // 3. adminAuth - then check admin role
// // 4. createBook - finally handle the request
// router.post('/', upload.single('pdfFile'), auth, adminAuth, createBook);
// router.put('/:id', upload.single('pdfFile'), auth, adminAuth, updateBook);
// router.delete('/:id', auth, adminAuth, deleteBook);

// // Test route (keep for debugging)
// router.post('/test-upload', upload.single('pdfFile'), (req, res) => {
//     console.log('📎 TEST UPLOAD - File:', req.file);
//     console.log('📥 TEST UPLOAD - Body:', req.body);
//     res.json({ 
//         message: 'Upload test successful', 
//         file: req.file,
//         body: req.body 
//     });
// });

// export default router;


// import express from 'express';
// import upload from '../middleware/upload.js';
// import { 
//     getAllBooks, 
//     getBookById, 
//     createBook, 
//     updateBook, 
//     deleteBook,
//     servePdf 
// } from '../controllers/bookController.js';
// import { auth, adminAuth } from '../middleware/auth.js';

// const router = express.Router();

// // Public routes
// router.get('/', getAllBooks);
// router.get('/:id', getBookById);
// router.get('/pdf/:id', servePdf);

// // IMPORTANT: Multer MUST be first in the middleware chain
// // The order should be: upload.single('pdfFile') → auth → adminAuth → createBook
// router.post('/', upload.single('pdfFile'), auth, adminAuth, createBook);
// router.put('/:id', upload.single('pdfFile'), auth, adminAuth, updateBook);
// router.delete('/:id', auth, adminAuth, deleteBook);

// // Test route to verify multer is working
// router.post('/test-upload', upload.single('pdfFile'), (req, res) => {
//     console.log('✅ TEST UPLOAD - File received:', req.file ? req.file.originalname : 'No file');
//     console.log('✅ TEST UPLOAD - Body:', req.body);
//     res.json({ 
//         message: 'Test upload successful', 
//         file: req.file,
//         body: req.body 
//     });
// });

// export default router;




// import express from 'express';
// import { uploadPDF } from '../middleware/upload.js';
// import { 
//     getAllBooks, 
//     getBookById, 
//     createBook, 
//     updateBook, 
//     deleteBook,
//     servePdf 
// } from '../controllers/bookController.js';
// import { auth, adminAuth } from '../middleware/auth.js';

// const router = express.Router();

// // Public routes
// router.get('/', getAllBooks);
// router.get('/:id', getBookById);
// router.get('/pdf/:id', servePdf);

// // IMPORTANT: Use the uploadPDF middleware directly
// router.post('/', uploadPDF, auth, adminAuth, createBook);
// router.put('/:id', uploadPDF, auth, adminAuth, updateBook);
// router.delete('/:id', auth, adminAuth, deleteBook);

// // Test route
// router.post('/test-upload', uploadPDF, (req, res) => {
//     console.log('📎 TEST UPLOAD - File:', req.file);
//     console.log('📥 TEST UPLOAD - Body:', req.body);
//     res.json({ 
//         message: 'Test upload successful', 
//         file: req.file,
//         body: req.body 
//     });
// });

// export default router;




// import express from 'express';
// import { uploadPDF } from '../middleware/upload.js';
// import { 
//     getAllBooks, 
//     getBookById, 
//     createBook, 
//     updateBook, 
//     deleteBook,
//     servePdf 
// } from '../controllers/bookController.js';
// import { auth, adminAuth } from '../middleware/auth.js';

// const router = express.Router();

// // Public routes
// router.get('/', getAllBooks);
// router.get('/:id', getBookById);
// router.get('/pdf/:id', servePdf);

// // Add a test route without auth to isolate
// router.post('/test-multer', uploadPDF, (req, res) => {
//     console.log('✅ TEST MULTER - File:', req.file);
//     console.log('✅ TEST MULTER - Body:', req.body);
//     res.json({ 
//         message: 'Multer test successful', 
//         file: req.file,
//         body: req.body 
//     });
// });

// // IMPORTANT: Use uploadPDF middleware
// router.post('/', uploadPDF, auth, adminAuth, createBook);
// router.put('/:id', uploadPDF, auth, adminAuth, updateBook);
// router.delete('/:id', auth, adminAuth, deleteBook);

// export default router;





// import express from 'express';
// import { uploadPDF } from '../middleware/upload.js';
// import { 
//     getAllBooks, 
//     getBookById, 
//     createBook, 
//     updateBook, 
//     deleteBook,
//     servePdf 
// } from '../controllers/bookController.js';
// import { auth, adminAuth } from '../middleware/auth.js';

// const router = express.Router();

// // Debug middleware to see all requests
// router.use((req, res, next) => {
//     console.log(`🔍 ${req.method} ${req.path} - Content-Type: ${req.headers['content-type']}`);
//     next();
// });

// // Test ping route
// router.post('/ping', (req, res) => {
//     console.log('🏓 PING ROUTE HIT');
//     console.log('Body:', req.body);
//     res.json({ message: 'pong', body: req.body });
// });

// // Test multer route - simplified
// router.post('/test-upload', (req, res, next) => {
//     console.log('📋 Test-upload route hit, about to call uploadPDF');
//     next();
// }, uploadPDF, (req, res) => {
//     console.log('✅ Test-upload complete - File:', req.file ? 'Present' : 'Missing');
//     console.log('✅ Test-upload body:', req.body);
//     res.json({ 
//         message: 'Test upload complete', 
//         file: req.file,
//         body: req.body 
//     });
// });

// // Public routes
// router.get('/', getAllBooks);
// router.get('/:id', getBookById);
// router.get('/pdf/:id', servePdf);

// // Main create route - temporarily remove auth to isolate
// router.post('/', uploadPDF, createBook);  // Removed auth and adminAuth for testing

// router.put('/:id', uploadPDF, auth, adminAuth, updateBook);
// router.delete('/:id', auth, adminAuth, deleteBook);

// export default router;



// import express from 'express';
// import multer from 'multer';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import fs from 'fs';
// import { 
//     getAllBooks, 
//     getBookById, 
//     createBook, 
//     updateBook, 
//     deleteBook,
//     servePdf 
// } from '../controllers/bookController.js';
// import { auth, adminAuth } from '../middleware/auth.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const router = express.Router();

// // ========== SIMPLE TEST ROUTE ==========
// router.get('/test', (req, res) => {
//     res.json({ message: 'Test route working' });
// });

// // ========== DIRECT MULTER CONFIGURATION ==========
// const uploadDir = path.join(__dirname, '../uploads/pdfs');
// console.log('📁 Upload directory:', uploadDir);

// // Ensure directory exists
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//     console.log('✅ Created upload directory');
// }

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         console.log('📂 Destination callback - SHOULD APPEAR');
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         console.log('📄 Filename callback - SHOULD APPEAR');
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, 'pdf-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage });

// // ========== TEST UPLOAD ROUTE ==========
// router.post('/test-upload', (req, res, next) => {
//     console.log('🔵 TEST-UPLOAD ROUTE HIT - BEFORE MULTER');
//     console.log('Headers:', req.headers['content-type']);
//     next();
// }, upload.single('pdfFile'), (req, res) => {
//     console.log('🟢 TEST-UPLOAD ROUTE HIT - AFTER MULTER');
//     console.log('File:', req.file);
//     console.log('Body:', req.body);
//     res.json({ 
//         message: 'Test upload successful', 
//         file: req.file,
//         body: req.body 
//     });
// });

// // ========== MAIN CREATE ROUTE ==========
// router.post('/', (req, res, next) => {
//     console.log('🔵 MAIN CREATE ROUTE HIT - BEFORE MULTER');
//     console.log('Headers:', req.headers['content-type']);
//     next();
// }, upload.single('pdfFile'), (req, res, next) => {
//     console.log('🟢 MAIN CREATE ROUTE HIT - AFTER MULTER');
//     console.log('File:', req.file);
//     console.log('Body:', req.body);
//     next();
// }, auth, adminAuth, createBook);

// // Other routes
// router.get('/', getAllBooks);
// router.get('/:id', getBookById);
// router.get('/pdf/:id', servePdf);
// router.put('/:id', upload.single('pdfFile'), auth, adminAuth, updateBook);
// router.delete('/:id', auth, adminAuth, deleteBook);

// export default router;



// //Working
// import express from 'express';
// import upload from '../middleware/upload.js';
// import { 
//     getAllBooks, 
//     getBookById, 
//     createBook, 
//     updateBook, 
//     deleteBook,
//     servePdf 
// } from '../controllers/bookController.js';
// import { auth, adminAuth } from '../middleware/auth.js';

// const router = express.Router();

// // Public routes
// router.get('/', getAllBooks);
// router.get('/:id', getBookById);
// router.get('/pdf/:id', servePdf);

// // Admin only routes with file upload
// router.post('/', auth, adminAuth, upload.single('pdfFile'), createBook);
// router.put('/:id', auth, adminAuth, upload.single('pdfFile'), updateBook);
// router.delete('/:id', auth, adminAuth, deleteBook);

// export default router;




// Working
// import express from 'express';
// import { uploadPDF } from '../middleware/upload.js'; // Change this import
// import { 
//     getAllBooks, 
//     getBookById, 
//     createBook, 
//     updateBook, 
//     deleteBook,
//     servePdf 
// } from '../controllers/bookController.js';
// import { auth, adminAuth } from '../middleware/auth.js';

// const router = express.Router();

// // Public routes
// router.get('/', getAllBooks);
// router.get('/:id', getBookById);
// router.get('/pdf/:id', servePdf);

// // Admin only routes with file upload - use uploadPDF instead of upload.single
// router.post('/', auth, adminAuth, uploadPDF, createBook);
// router.put('/:id', auth, adminAuth, uploadPDF, updateBook);
// router.delete('/:id', auth, adminAuth, deleteBook);

// export default router;



import express from 'express';
import { uploadPDF } from '../middleware/upload.js';
import { 
    getAllBooks, 
    getBookById, 
    createBook, 
    updateBook, 
    deleteBook,
    servePdf 
} from '../controllers/bookController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no auth required for viewing)
router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.get('/pdf/:id', servePdf); // PDF viewing endpoint
router.get('/:id/pdf', servePdf); // Alternative endpoint for consistency

// Admin only routes with file upload
router.post('/', auth, adminAuth, uploadPDF, createBook);
router.put('/:id', auth, adminAuth, uploadPDF, updateBook);
router.delete('/:id', auth, adminAuth, deleteBook);

export default router;

