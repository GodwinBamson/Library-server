import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: [{ type: mongoose.Schema.ObjectId, ref: "User", required: true }],
  admin: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  messages: [{ type: mongoose.Schema.ObjectId, ref: "Message", required: true }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hook before saving
channelSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Hook before findOneAndUpdate
channelSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Channel = mongoose.model("Channel", channelSchema);
export default Channel;
