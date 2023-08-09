const Category = require('../models/category');
const productModel = require("../models/product");
const User = require('../models/user');



const getWishlist = async (req,res)=>{
    const userLogin = req.session.userLogin;
    if (!userLogin) {
      return res.render("user/login", { message: "You have to login first" });
    }
    const userId = req.session.userId;
    console.log("userId",userId)
    const user = await User.findById(userId).populate("wishlist.product");
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const wishlistItems = user.wishlist.map(async (item) => {
        const product = await productModel.findById(item.product)
        return {
          _id: product._id,
          productName: product.productName,
          price: product.price,
          itemImage: product.itemImage[0]
        };
      });
          const resolvedWishlistItems = await Promise.all(wishlistItems);
    res.render('user/wishlist',{userLogin , name : user.username , wishlist:resolvedWishlistItems})
}

const addToWishlist = async (req, res) => {
    try {
      if (!req.session.userId) {
        // User is not logged in
        return res.render("user/login", { message: "You have to login first" });
      }
  
      const userId = req.session.userId;
      const productId = req.params.id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Check if the product already exists in the wishlist
      const isProductInWishlist = user.wishlist.some((wishlistItem) => wishlistItem.product.toString() === productId);
      if (isProductInWishlist) {
        return res.redirect('/wishlist');
    }
  
      // Add the product to the wishlist
      user.wishlist.push({ product: productId });
  
      // Save the updated user document
      await user.save();
  
      // Product added to the wishlist successfully
      res.redirect('/wishlist');
     
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };


// Controller function to remove an item from the wishlist
const removeFromWishlist = async (req, res) => {
    try {

  
      const userId = req.session.userId;
      const productId = req.params.id;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Find the index of the product in the wishlist
      const productIndex = user.wishlist.findIndex(
        (item) => item.product.toString() === productId
      );
      if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found in wishlist' });
      }
  
      // Remove the product from the wishlist
      user.wishlist.splice(productIndex, 1);
  
      // Save the updated user document
      await user.save();
  
      // Item successfully removed from the wishlist
      res.redirect("/wishlist");
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist
}