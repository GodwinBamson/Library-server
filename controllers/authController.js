import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { name, email, password, role, studentId } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password,
            role: role || 'student',
            studentId
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('borrowedBooks.book', 'title author coverImage');
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};





// import User from '../models/User.js';
// import jwt from 'jsonwebtoken';
// import { compare } from "bcrypt";
// import { renameSync, unlinkSync } from "fs";

// const maxAge = 3 * 24 * 60 * 60 * 1000; // 3 days

// const createToken = (email, userId) => {
//   return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge });
// };

// // Cookie options function
// const getCookieOptions = () => {
//   const isProduction = process.env.NODE_ENV === "production";
//   return {
//     httpOnly: true,
//     secure: isProduction,                       // only true in production (HTTPS)
//     sameSite: isProduction ? "none" : "lax",   // allow cross-site only in production
//     maxAge,
//   };
// };

// // Original register function (modified to use bcrypt)
// export const register = async (req, res) => {
//     try {
//         const { name, email, password, role, studentId } = req.body;

//         // Check if user exists
//         let user = await User.findOne({ email });
//         if (user) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         // Create new user (password will be hashed by the model's pre-save hook)
//         user = new User({
//             name,
//             email,
//             password, // This will be hashed by the model's pre-save middleware
//             role: role || 'student',
//             studentId,
//             profileSetup: true // Add this field to your User model
//         });

//         await user.save();

//         // Create token (using both approaches - JWT in response and cookie)
//         const token = jwt.sign(
//             { id: user._id, email: user.email, role: user.role },
//             process.env.JWT_SECRET || process.env.JWT_KEY,
//             { expiresIn: '1d' }
//         );

//         // Set cookie (new approach)
//         res.cookie("jwt", createToken(email, user._id), getCookieOptions());

//         res.status(201).json({
//             token, // Keep for backward compatibility
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//                 studentId: user.studentId,
//                 profileSetup: user.profileSetup,
//                 image: user.image,
//                 color: user.color
//             }
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Modified login function (combined both approaches)
// export const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({ message: "Email and Password is required." });
//         }

//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: "User with the given email not found." });
//         }

//         const isMatch = await compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: "Invalid credentials" });
//         }

//         // Create token (both JWT and cookie)
//         const token = jwt.sign(
//             { id: user._id, email: user.email, role: user.role },
//             process.env.JWT_SECRET || process.env.JWT_KEY,
//             { expiresIn: '1d' }
//         );

//         // Set cookie
//         res.cookie("jwt", createToken(email, user._id), getCookieOptions());

//         res.json({
//             token, // Keep for backward compatibility
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//                 studentId: user.studentId,
//                 profileSetup: user.profileSetup,
//                 firstName: user.firstName,
//                 lastName: user.lastName,
//                 image: user.image,
//                 color: user.color,
//             }
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Modified getProfile function (combined both approaches)
// export const getProfile = async (req, res) => {
//     try {
//         // Get userId from either req.user.id (old) or req.userId (new)
//         const userId = req.user?.id || req.userId;
        
//         const user = await User.findById(userId)
//             .select('-password')
//             .populate('borrowedBooks.book', 'title author coverImage');
        
//         if (!user) {
//             return res.status(404).json({ message: "User with the given id not found." });
//         }

//         res.json({
//             id: user._id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             studentId: user.studentId,
//             profileSetup: user.profileSetup,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             image: user.image,
//             color: user.color,
//             borrowedBooks: user.borrowedBooks
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // New: Get user info (similar to getProfile but more focused)
// export const getUserInfo = async (req, res) => {
//     try {
//         const userId = req.user?.id || req.userId;
        
//         const userData = await User.findById(userId);
//         if (!userData) {
//             return res.status(404).json({ message: "User with the given id not found." });
//         }

//         return res.status(200).json({
//             id: userData._id,
//             email: userData.email,
//             profileSetup: userData.profileSetup,
//             firstName: userData.firstName,
//             lastName: userData.lastName,
//             image: userData.image,
//             color: userData.color,
//             name: userData.name,
//             role: userData.role,
//             studentId: userData.studentId
//         });
//     } catch (error) {
//         console.log({ error });
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// };

// // New: Update profile
// export const updateProfile = async (req, res) => {
//     try {
//         const userId = req.user?.id || req.userId;
//         const { firstName, lastName, color, name } = req.body;

//         if (!firstName || !lastName) {
//             return res.status(400).json({ message: "FirstName, LastName, and Color are required." });
//         }

//         const userData = await User.findByIdAndUpdate(
//             userId,
//             { 
//                 firstName, 
//                 lastName, 
//                 color, 
//                 profileSetup: true,
//                 name: name || `${firstName} ${lastName}` // Update name field if exists
//             },
//             { new: true, runValidators: true }
//         );

//         return res.status(200).json({
//             id: userData._id,
//             email: userData.email,
//             profileSetup: userData.profileSetup,
//             firstName: userData.firstName,
//             lastName: userData.lastName,
//             image: userData.image,
//             color: userData.color,
//             name: userData.name,
//             role: userData.role
//         });
//     } catch (error) {
//         console.log({ error });
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// };

// // New: Add profile image
// export const addProfileImage = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ message: "File is required." });
//         }

//         const date = Date.now();
//         let fileName = "uploads/profiles/" + date + req.file.originalname;
//         renameSync(req.file.path, fileName);

//         const userId = req.user?.id || req.userId;
        
//         const updatedUser = await User.findByIdAndUpdate(
//             userId,
//             { image: fileName },
//             { new: true, runValidators: true }
//         );

//         return res.status(200).json({
//             image: updatedUser.image,
//         });
//     } catch (error) {
//         console.log({ error });
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// };

// // New: Remove profile image
// export const removeProfileImage = async (req, res) => {
//     try {
//         const userId = req.user?.id || req.userId;
        
//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         if (user.image) {
//             unlinkSync(user.image);
//         }

//         user.image = null;
//         await user.save();

//         return res.status(200).json({ message: "Profile image removed successfully." });
//     } catch (error) {
//         console.log({ error });
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// };

// // New: Logout
// export const logout = async (req, res) => {
//     try {
//         res.cookie("jwt", "", {
//             maxAge: 1,
//             secure: process.env.NODE_ENV === "production",
//             sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//         });

//         return res.status(200).json({ message: "Logout successful." });
//     } catch (error) {
//         console.error("Logout Error:", error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// };