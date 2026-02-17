import express from "express";
import { uploadPDF } from "../middleware/upload.js";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  servePdf,
} from "../controllers/bookController.js";
import { auth, adminAuth } from "../middleware/auth.js";

const router = express.Router();

// Public routes (no auth required for viewing)
router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.get("/pdf/:id", servePdf); // PDF viewing endpoint
router.get("/:id/pdf", servePdf); // Alternative endpoint for consistency

// Admin only routes with file upload
router.post("/", auth, adminAuth, uploadPDF, createBook);
router.put("/:id", auth, adminAuth, uploadPDF, updateBook);
router.delete("/:id", auth, adminAuth, deleteBook);

export default router;


