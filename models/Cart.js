import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true }, // Unique transaction ID for the entire order
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      quantity: Number,
      price: Number,
      totalAmount: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: "Pending" }, // Status could be "Completed" or "Pending"
  createdAt: { type: Date, default: Date.now },
});

const cartModel = mongoose.model("Cart", cartSchema);

export { cartModel as Cart };
