const User = require('../models/user');
const Category = require('../models/category');
const productModel = require("../models/product");

const addToCart = async (req, res) => {
  try {


    const userLogin = req.session.userLogin;
    const productId = req.params.id;
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find the user by their ID
    const user = await User.findById(req.session.userId);
    console.log("user", user)
    console.log("session", req.session.userId)

    // Check if the product already exists in the user's cart
    const existingProduct = user.cart.find(item => item.product.toString() === productId);
    if (existingProduct) {
      // Update the quantity of the existing product if needed
      existingProduct.quantity += 1;
    } else {
      // Add the product to the cart
      user.cart.push({ product: productId, quantity: 1 });
    }

    // Save the updated cart to the database
    await user.save();

    // Populate the product details in the cart using aggregation lookup
    const populatedUser = await User.aggregate([
      { $match: { _id: user._id } },
      {
        $lookup: {
          from: 'productModel', // Replace 'products' with the actual collection name for products
          localField: 'cart.product',
          foreignField: '_id',
          as: 'cartItems',
        },
      },
    ]);

    // Extract the cart items with populated product details
    const cartItems = populatedUser[0].cart;

    res.redirect('/cart');
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getCart = async (req, res) => {
  try {
    const userLogin = req.session.userLogin;

    const user = await User.findById(req.session.userId).populate("cart.product");
    const cartItems = user.cart.map(async (item) => {
      const product = await productModel.findById(item.product);
      let quantityMessage = item.quantity.toString()
      console.log("ggggg",product.quantity)
console.log("fffffff",item.quantity)
      if(product.quantity === 0){
        quantityMessage = "Out of Stock"
      }
      return {
        product: {
          _id: product._id,
          productName: product.productName,
          offerPrice: product.offerPrice,
          itemImage: product.itemImage[0]
        },
        quantity: quantityMessage
      };
    });
    const resolvedCartItems = await Promise.all(cartItems);
    const canProceedToCheckout = resolvedCartItems.every(item => item.quantity !== "Out of Stock");

    res.render('user/cart', { userLogin, cartItems: resolvedCartItems, name: user.username,canProceedToCheckout: canProceedToCheckout });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.userId;

    // Find the user and update the quantity in the cart
    const user = await User.findById(userId);
    const cartItem = user.cart.find(item => item.product.toString() === productId);

    if (cartItem) {
      // Ensure the quantity is not below 1
      const newQuantity = parseInt(quantity, 10);
      if (newQuantity < 1) {
        return res.status(400).json({ error: 'Quantity cannot be below 1' });
      }

      cartItem.quantity = newQuantity;
      await user.save();

      // Populate the product details in the cart using aggregation lookup
      const populatedUser = await User.aggregate([
        { $match: { _id: user._id } },
        {
          $lookup: {
            from: 'productModel',
            localField: 'cart.product',
            foreignField: '_id',
            as: 'cartItems',
          },
        },
      ]);

      // Extract the cart items with populated product details
      const cartItems = populatedUser[0].cart;

      return res.status(200).json({ cartItems });
    } else {
      return res.status(404).json({ error: 'Cart item not found' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const removeCartItem = async (req,res)=>{
  try {
    const userId = req.session.userId;
    const productId = req.params.productId;


    // Find the user by their ID
    const user = await User.findById(userId);

    // Check if the product exists in the user's cart
    const productIndex = user.cart.findIndex(item => item.product.toString() === productId);
    if (productIndex === -1) {
      return res.status(404).render('/user/error');;
    }

    // Remove the product from the cart
    user.cart.splice(productIndex, 1);

    // Save the updated cart to the database
    await user.save();

    res.redirect("/cart");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeCartItem

};
