import Book from '../models/Book.js';
import User from '../models/User.js';

export const borrowBook = async (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user.id;

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.availableCopies < 1) {
            return res.status(400).json({ message: 'No copies available' });
        }

        const user = await User.findById(userId);
        
        const alreadyBorrowed = user.borrowedBooks.find(
            b => b.book.toString() === bookId && !b.returned
        );
        
        if (alreadyBorrowed) {
            return res.status(400).json({ message: 'You already have this book borrowed' });
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        user.borrowedBooks.push({
            book: bookId,
            dueDate,
            returned: false
        });

        await user.save();

        book.availableCopies -= 1;
        await book.save();

        res.json({ 
            message: 'Book borrowed successfully',
            dueDate: dueDate.toISOString().split('T')[0]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const returnBook = async (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const borrowedBook = user.borrowedBooks.find(
            b => b.book.toString() === bookId && !b.returned
        );

        if (!borrowedBook) {
            return res.status(400).json({ message: 'You have not borrowed this book' });
        }

        borrowedBook.returned = true;
        borrowedBook.returnedDate = new Date();
        await user.save();

        const book = await Book.findById(bookId);
        book.availableCopies += 1;
        await book.save();

        res.json({ message: 'Book returned successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBorrowedBooks = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('borrowedBooks.book', 'title author coverImage isbn')
            .select('borrowedBooks');
        
        res.json(user.borrowedBooks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};