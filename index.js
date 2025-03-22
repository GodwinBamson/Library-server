import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import { cartRouter } from "./routes/cart.js";
import authRoutes from "./routes/authRoutes.js";
import productRouter from "./routes/product.js";

import Product from "./models/Product.js";
import Admin from "./models/Staff.js"; // Ensure Admin is the correct import
import User from "./models/Staff.js"; // Ensure User is the correct import
import { Cart } from "./models/Cart.js"; // Ensure Cart is imported

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

app.use("/api/auth", authRoutes);
app.use("/cart", cartRouter);
app.use("/product", productRouter); // ✅ Ensure router is used

// ✅ Dashboard Route - Fetch Total Counts & Sales
app.get("/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await Admin.countDocuments({ role: "admin" });
    const totalStaff = await User.countDocuments(); // Includes all staff
    const totalProducts = await Product.countDocuments();

    // Calculate daily sales from the Cart model (assuming completed transactions)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailySales = await Cart.aggregate([
      { $match: { createdAt: { $gte: today }, status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalSales = dailySales.length ? dailySales[0].total : 0;

    return res.json({
      ok: true,
      totalUsers,
      totalAdmins,
      totalStaff,
      totalProducts,
      totalSales,
    });
  } catch (err) {
    console.error("❌ Dashboard Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const port = process.env.PORT || 6000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
