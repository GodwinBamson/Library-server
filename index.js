
// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import bcrypt from 'bcryptjs';  // Import bcryptjs for hashing passwords
// import User from './models/User.js';
// import connectDB from './config/db.js';
// import userRoutes from './routes/userRoutes.js';
// import authRoutes from './routes/authRoutes.js';
// import productRoutes from './routes/productRoutes.js'; 
// import cartRouter from './routes/cartRoutes.js';
// // import { cartRouter } from './routes/cartRoutes.js';
// import dashboardRoutes from './routes/dashboardRoutes.js';

// dotenv.config();
// const app = express();

// // ✅ Enable CORS
// // 
// app.use(cors());
// app.use(express.json());  // To parse JSON request bodies

// // Connect to the database
// connectDB();

// // Function to check if Super Admin exists and create if not
// const createSuperAdminIfNotExists = async () => {
//   try {
//     const superAdmin = await User.findOne({ role: 'superadmin' });

//     if (!superAdmin) {
//       const hashedPassword = await bcrypt.hash('superadmin123', 10); // Hash the password

//       const superAdminUser = new User({
//         username: 'superadmin',
//         email: 'superadmin@example.com',
//         password: hashedPassword,
//         role: 'superadmin',
//       });

//       await superAdminUser.save();  // Save the super admin to the database
//       console.log('Super Admin created!');
//     }
//   } catch (err) {
//     console.error('Error creating super admin:', err.message);  // Handle errors properly
//   }
// };

// // Run the function to check and create Super Admin if needed
// createSuperAdminIfNotExists();

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use("/api/carts", cartRouter); 
// app.use('/api/products', productRoutes);
// app.use('/api/dashboards', dashboardRoutes);

// // Listen on the specified port
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import connectDB from './config/db.js';
// import authRoutes from './routes/authRoutes.js';
// import bookRoutes from './routes/bookRoutes.js';
// import borrowRoutes from './routes/borrowRoutes.js';

// dotenv.config();
// connectDB();

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use('/api/auth', authRoutes);
// app.use('/api/books', bookRoutes);
// app.use('/api/borrow', borrowRoutes);

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });







// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import connectDB from './config/db.js';
// import authRoutes from './routes/authRoutes.js';
// import bookRoutes from './routes/bookRoutes.js';
// import borrowRoutes from './routes/borrowRoutes.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config();
// connectDB();

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve static files from uploads directory
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use('/api/auth', authRoutes);
// app.use('/api/books', bookRoutes);
// app.use('/api/borrow', borrowRoutes);

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });


// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import connectDB from './config/db.js';
// import authRoutes from './routes/authRoutes.js';
// import bookRoutes from './routes/bookRoutes.js';
// import borrowRoutes from './routes/borrowRoutes.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config();
// connectDB();

// const app = express();

// // IMPORTANT: Configure CORS properly for file uploads
// app.use(cors({
//     origin: 'http://localhost:5173',
//     credentials: true
// }));

// // IMPORTANT: Order matters - these must be before routes
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve static files from uploads directory
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/books', bookRoutes);
// app.use('/api/borrow', borrowRoutes);

// // Test route
// app.get('/api/test', (req, res) => {
//     res.json({ message: 'API is working!' });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`✅ Server running on port ${PORT}`);
// });




// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import connectDB from './config/db.js';
// import authRoutes from './routes/authRoutes.js';
// import bookRoutes from './routes/bookRoutes.js';
// import borrowRoutes from './routes/borrowRoutes.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config();
// connectDB();

// const app = express();

// // CORS first
// app.use(cors({
//     origin: 'http://localhost:5173',
//     credentials: true
// }));

// // IMPORTANT: DO NOT USE GLOBAL BODY PARSERS
// // Comment these out completely - they break file uploads
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // Serve static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Apply body parsers ONLY to routes that need them
// // Auth routes need JSON parsing
// app.use('/api/auth', express.json());
// app.use('/api/auth', express.urlencoded({ extended: true }));

// // Borrow routes need JSON parsing
// app.use('/api/borrow', express.json());
// app.use('/api/borrow', express.urlencoded({ extended: true }));

// // Book routes handle their own parsing via multer
// app.use('/api/books', bookRoutes);

// // Test route
// app.get('/api/test', (req, res) => {
//     res.json({ message: 'API is working!' });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`✅ Server running on port ${PORT}`);
//     console.log('📁 Static files served from:', path.join(__dirname, 'uploads'));
// });


// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import connectDB from './config/db.js';
// import authRoutes from './routes/authRoutes.js';
// import bookRoutes from './routes/bookRoutes.js';
// import borrowRoutes from './routes/borrowRoutes.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config();
// connectDB();

// const app = express();

// // CORS first
// app.use(cors({
//     origin: 'http://localhost:5173',
//     credentials: true
// }));

// // Body parsers - keep these
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/books', bookRoutes);
// app.use('/api/borrow', borrowRoutes);

// // Test route
// app.get('/api/test', (req, res) => {
//     res.json({ message: 'API is working!' });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`✅ Server running on port ${PORT}`);
// });




// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import connectDB from './config/db.js';
// import { notFound, errorHandler } from './middleware/errorMiddleware.js';
// import authRoutes from './routes/authRoutes.js';
// import bookRoutes from './routes/bookRoutes.js';
// import borrowRoutes from './routes/borrowRoutes.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config();
// connectDB();


// // Use them
// app.use(notFound);
// app.use(errorHandler);

// const app = express();

// // CORS first
// app.use(cors({
//     origin: 'http://localhost:5173',
//     credentials: true
// }));

// // Body parsers - keep these (they help with non-file routes)
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/books', bookRoutes);
// app.use('/api/borrow', borrowRoutes);

// // Test route
// app.get('/api/test', (req, res) => {
//     res.json({ message: 'API is working!' });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`✅ Server running on port ${PORT}`);
// });



// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import connectDB from './config/db.js';
// import { notFound, errorHandler } from './middleware/errorMiddleware.js';
// import authRoutes from './routes/authRoutes.js';
// import bookRoutes from './routes/bookRoutes.js';
// import borrowRoutes from './routes/borrowRoutes.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config();
// connectDB();

// // Initialize app FIRST
// const app = express();

// // Then use middleware and routes
// // CORS first
// app.use(cors({
//     origin: 'http://localhost:5173',
//     credentials: true
// }));

// // Body parsers - keep these (they help with non-file routes)
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/books', bookRoutes);
// app.use('/api/borrow', borrowRoutes);

// // Test route
// app.get('/api/test', (req, res) => {
//     res.json({ message: 'API is working!' });
// });

// // Error handling middleware - these should be LAST
// app.use(notFound);
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`✅ Server running on port ${PORT}`);
// });



// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import connectDB from './config/db.js';
// import { notFound, errorHandler } from './middleware/errorMiddleware.js';
// import authRoutes from './routes/authRoutes.js';
// import bookRoutes from './routes/bookRoutes.js';
// import borrowRoutes from './routes/borrowRoutes.js';
// import fs from 'fs';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config();
// connectDB();

// const app = express();

// // CORS configuration for production
// const corsOptions = {
//     origin: process.env.NODE_ENV === 'production' 
//         ? process.env.CLIENT_URL 
//         : 'http://localhost:5173',
//     credentials: true,
//     optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));

// // Body parsers
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Create uploads directory if in development
// if (process.env.NODE_ENV === 'development') {
//     const uploadDir = path.join(__dirname, 'uploads/pdfs');
    
//     // Create directory if it doesn't exist
//     if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//         console.log('📁 Created uploads directory for development');
//     } else {
//         console.log('📁 Uploads directory already exists');
//     }
    
//     // Test write permissions
//     try {
//         const testFile = path.join(uploadDir, `test-${Date.now()}.txt`);
//         fs.writeFileSync(testFile, 'test');
//         console.log('✅ Upload directory is writable');
//         fs.unlinkSync(testFile);
//         console.log('✅ Test file deleted successfully');
//     } catch (err) {
//         console.error('❌ Upload directory is NOT writable:', err.message);
//         console.error('   Please check permissions for:', uploadDir);
//     }
    
//     // Serve static files from uploads directory
//     app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//     console.log('📂 Static files will be served from /uploads');
// }

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/books', bookRoutes);
// app.use('/api/borrow', borrowRoutes);

// // Health check endpoint for Render
// app.get('/health', (req, res) => {
//     res.status(200).json({ 
//         status: 'OK', 
//         timestamp: new Date().toISOString(),
//         environment: process.env.NODE_ENV
//     });
// });

// // Test route
// app.get('/api/test', (req, res) => {
//     res.json({ 
//         message: 'API is working!',
//         environment: process.env.NODE_ENV,
//         timestamp: new Date().toISOString()
//     });
// });

// // Error handling middleware
// app.use(notFound);
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log('\n========== SERVER STARTED ==========');
//     console.log(`✅ Server running on port ${PORT}`);
//     console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
//     console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    
//     if (process.env.NODE_ENV === 'development') {
//         console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads/pdfs')}`);
//     }
    
//     console.log('====================================\n');
// });



import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import borrowRoutes from './routes/borrowRoutes.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

// CORS configuration - FIXED for production
const allowedOrigins = [
    'https://frontend-libraryapp.onrender.com',
    'http://localhost:5173',
    'http://localhost:5000',
    'https://library-server-5rpq.onrender.com'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Origin:', req.headers.origin);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    next();
});

// Create uploads directory if in development
if (process.env.NODE_ENV === 'development') {
    const uploadDir = path.join(__dirname, 'uploads/pdfs');
    
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('📁 Created uploads directory for development');
    }
    
    // Test write permissions
    try {
        const testFile = path.join(uploadDir, `test-${Date.now()}.txt`);
        fs.writeFileSync(testFile, 'test');
        console.log('✅ Upload directory is writable');
        fs.unlinkSync(testFile);
    } catch (err) {
        console.error('❌ Upload directory is NOT writable:', err.message);
    }
    
    // Serve static files from uploads directory
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        message: 'Server is running'
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working!',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('\n========== SERVER STARTED ==========');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`🔗 Allowed origins:`, allowedOrigins);
    console.log('====================================\n');
});