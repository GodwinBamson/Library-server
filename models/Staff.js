import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["user", "admin"], default: "user" },
});

const Staff = mongoose.model("Staff", StaffSchema);
export default Staff;
