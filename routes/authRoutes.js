
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Staff from "../models/Staff.js";
import authMiddleware from "../middleware/middleware.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await Staff.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Staff({ username, email, password: hashedPassword, role });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully", _id: newUser._id });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all users (Admin Only)

router.get("/users", authMiddleware, async (req, res) => {
  try {
    // Only allow admin to access this route
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await Staff.find({}, "-password"); // Exclude passwords
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});


// Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Staff.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

router.delete("/users/:id", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
  
      const user = await Staff.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting user", error: err.message });
    }
  });

  router.put("/users/:id", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
  
      const { username, email, role } = req.body;
      const updatedUser = await Staff.findByIdAndUpdate(
        req.params.id,
        { username, email, role },
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
  
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: "Error updating user", error: err.message });
    }
  });


// Protected Route (Verify Token)
router.get("/verify", authMiddleware, (req, res) => {
    res.json({ login: true, role: req.user.role });
});


export default router;
