
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    studentId: {
        type: String,
        unique: true,
        sparse: true
    },
    borrowedBooks: [{
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        },
        borrowedDate: {
            type: Date,
            default: Date.now
        },
        dueDate: Date,
        returned: {
            type: Boolean,
            default: false
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);





// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     role: {
//         type: String,
//         enum: ['student', 'admin'],
//         default: 'student'
//     },
//     studentId: {
//         type: String,
//         unique: true,
//         sparse: true
//     },
//     // New fields for profile management
//     profileSetup: {
//         type: Boolean,
//         default: false
//     },
//     firstName: {
//         type: String,
//         trim: true,
//         default: null
//     },
//     lastName: {
//         type: String,
//         trim: true,
//         default: null
//     },
//     image: {
//         type: String,
//         default: null
//     },
//     color: {
//         type: String,
//         default: null
//     },
//     borrowedBooks: [{
//         book: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Book'
//         },
//         borrowedDate: {
//             type: Date,
//             default: Date.now
//         },
//         dueDate: Date,
//         returned: {
//             type: Boolean,
//             default: false
//         }
//     }],
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// // Pre-save middleware to hash password
// userSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

// // Method to compare password
// userSchema.methods.comparePassword = async function(password) {
//     return await bcrypt.compare(password, this.password);
// };

// // Virtual to get full name (combines firstName and lastName if they exist)
// userSchema.virtual('fullName').get(function() {
//     if (this.firstName && this.lastName) {
//         return `${this.firstName} ${this.lastName}`;
//     }
//     return this.name;
// });

// // Pre-save middleware to sync name with firstName and lastName if not set
// userSchema.pre('save', function(next) {
//     // If firstName and lastName are not set but name is, split the name
//     if (!this.firstName && !this.lastName && this.name) {
//         const nameParts = this.name.split(' ');
//         this.firstName = nameParts[0] || null;
//         this.lastName = nameParts.slice(1).join(' ') || null;
//     }
//     next();
// });

// export default mongoose.model('User', userSchema);