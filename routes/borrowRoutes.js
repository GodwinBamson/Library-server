import express from 'express';
import { 
    borrowBook, 
    returnBook, 
    getBorrowedBooks 
} from '../controllers/borrowController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/borrow', auth, borrowBook);
router.post('/return', auth, returnBook);
router.get('/my-books', auth, getBorrowedBooks);

export default router;