import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  sold: { type: Number, default: 0 }, // ✅ Added sold field
});

const Product = mongoose.model("Product", productSchema);
export default Product;
