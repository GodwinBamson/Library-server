

import express from "express";
import Product from "../models/Product.js";
import verifyAdmin from "./authRoutes.js";

const router = express.Router();

// Add product
router.post("/add", verifyAdmin, async (req, res) => {
  try {
    const { name, price, quantity, sold = 0 } = req.body;
    if (isNaN(price) || price <= 0) return res.status(400).json({ message: "Invalid price" });

    const newProduct = new Product({ name, price: Number(price), quantity, sold });
    await newProduct.save();
    return res.json({ added: true, product: newProduct });
  } catch (err) {
    return res.status(500).json({ message: "Error adding product" });
  }
});

// Get all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({});
    return res.status(200).json({ success: true, products });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching products" });
  }
});

// Update product
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json({ updated: true, product: updatedProduct });
  } catch (err) {
    return res.status(500).json({ message: "Error updating product" });
  }
});

// Delete product
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    return res.json({ deleted: true });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting product" });
  }
});

export default router;

