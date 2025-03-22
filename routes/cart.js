import express from "express";
import { Cart } from "../models/Cart.js";
// import Product from "../models/Product.js"; // ✅ Import the Product model
import Product from "../models/Product.js";
import { v4 as uuidv4 } from 'uuid'; // To generate a unique transaction ID

const router = express.Router();

// POST route to complete the order and save the cart data to the database
// router.post('/complete', async (req, res) => {
//   try {
//     const cartItems = req.body.cart;

//     if (!cartItems || cartItems.length === 0) {
//       return res.status(400).json({ message: 'No items in the cart' });
//     }

//     // Generate a unique transactionId for this cart
//     const transactionId = uuidv4();

//     // Attach the transactionId to each item in the cart
//     const cartData = cartItems.map(item => ({
//       ...item,
//       transactionId: transactionId, // Assign the same transaction ID to each item
//     }));

//     // Calculate the total amount for the cart
//     const totalAmount = cartItems.reduce((total, item) => total + item.totalAmount, 0);

//     // Create a new Cart document
//     const newCart = new Cart({
//       transactionId: transactionId,
//       items: cartData,
//       totalAmount: totalAmount,
//       status: 'Completed',  // Set the status as "Completed"
//     });

//     // Save to the database
//     await newCart.save();

//     // Send success response with the transaction ID
//     res.status(200).json({
//       message: 'Order completed successfully',
//       transactionId: transactionId
//     });
//   } catch (error) {
//     console.error('Error completing the order:', error);
//     res.status(500).json({
//       message: 'There was an error completing your order',
//       error: error.message
//     });
//   }
// });


router.post("/complete", async (req, res) => {
  try {
    const cartItems = req.body.cart;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "No items in the cart" });
    }

    const transactionId = uuidv4();

    const cartData = cartItems.map((item) => ({
      ...item,
      transactionId: transactionId,
    }));

    const totalAmount = cartItems.reduce((total, item) => total + item.totalAmount, 0);

    // Create a new Cart document
    const newCart = new Cart({
      transactionId,
      items: cartData,
      totalAmount,
      status: "Completed",
    });

    await newCart.save();

    // ✅ Reduce the quantity of products in the database
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.quantity -= item.quantity; // Reduce available quantity
        product.sold += item.quantity; // Increase sold count
        await product.save();
      }
    }

    res.status(200).json({
      message: "Order completed successfully",
      transactionId,
    });
  } catch (error) {
    console.error("Error completing the order:", error);
    res.status(500).json({ message: "There was an error completing your order" });
  }
});


// DELETE route to delete a specific cart transaction
router.delete('/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;  // Get the transactionId from the URL parameter

    // Find the cart by transactionId and delete it
    const deletedCart = await Cart.findOneAndDelete({ transactionId });

    if (!deletedCart) {
      return res.status(404).json({ message: 'Transaction not found' }); // If no transaction is found, return a 404 error
    }

    res.status(200).json({ message: 'Transaction deleted successfully', deleted: true }); // Send success response
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Error deleting transaction' }); // Handle any server error
  }
});

// Optional: GET route to fetch all completed carts (for admin or order review)
router.get('/all', async (req, res) => {
  try {
    const carts = await Cart.find({ status: 'Completed' }).populate('items.productId');
    res.status(200).json(carts);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// GET route to fetch a specific cart by transactionId
router.get('/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;  // Get the transactionId from the URL parameter
    const cart = await Cart.findOne({ transactionId }).populate('items.productId');  // Find the cart with the specific transactionId

    if (!cart) {
      return res.status(404).json({ message: 'Transaction not found' });  // If cart is not found, return a 404 response
    }

    res.status(200).json(cart);  // Return the cart details
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    res.status(500).json({ message: 'Server error fetching transaction details' });  // Handle server error
  }
});

export { router as cartRouter };
