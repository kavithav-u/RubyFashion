const express = require('express');
const userRouter = express.Router();


const userController = require('../controller/userController');
const usermiddlewear = require("../middlewear/usermiddlewear")
const productController = require('../controller/productController');
const cartController = require('../controller/cartController');
const checkoutController = require('../controller/checkoutController');
const profileController = require('../controller/profileController');
const wishlistController = require('../controller/wishlistController');
const shopController = require('../controller/shopController');
const couponController = require('../controller/couponController');



userRouter.get("/",usermiddlewear.userlogout,userController.home);
userRouter.get("/login",usermiddlewear.userlogout,userController.userlogin)
userRouter.get("/register",userController.userRegister);
userRouter.post("/register",userController.newuser);
userRouter.post("/",userController.login)
userRouter.post("/sentOtp", userController.sample);
userRouter.get("/sentOtp",usermiddlewear.userlogin,userController.home)
userRouter.post("/verifyOtp",userController.verifyOtp)
userRouter.get("/home",usermiddlewear.userlogin,userController.home)
userRouter.get("/userlogout",userController.userlogout);
userRouter.get("/product/:productId",productController.singleProduct);

userRouter.get("/cart",cartController.getCart)
userRouter.get("/add-to-cart/:id", cartController.addToCart);
userRouter.post("/updateCartQuantity",cartController.updateCartQuantity)
userRouter.post("/deleteCartProduct/:productId",cartController.removeCartItem)


userRouter.get('/checkout', checkoutController.getCheckout);
userRouter.post('/save-address', checkoutController.addaddress);
userRouter.post("/edit-address/:id", checkoutController.editaddress)
userRouter.post("/placeOrder",usermiddlewear.userlogin,checkoutController.placeOrder)
userRouter.get("/success",usermiddlewear.userlogin,checkoutController.successpage)

userRouter.get("/profile",usermiddlewear.userlogin,profileController.getuserprofile)
userRouter.post("/cancel-order/:id",usermiddlewear.userlogin,profileController.cancelOrder)
userRouter.post("/cancel-order/:id", usermiddlewear.userlogin, profileController.cancelOrder, profileController.getuserprofile);
userRouter.post("/edit-address/:id",usermiddlewear.userlogin,profileController.editAddress)
userRouter.post("/update-password",usermiddlewear.userlogin,profileController.updatePassword)
userRouter.get("/wallet-info",usermiddlewear.userlogin,profileController.walletInfo)
userRouter.get("/download-order-pdf/:id",usermiddlewear.userlogin,profileController.downloadOrderPdf)
userRouter.post("/return-order/:id",usermiddlewear.userlogin,profileController.returnOrder)
userRouter.get("/logout",profileController.userlogout)


userRouter.get("/wishlist",wishlistController.getWishlist);
userRouter.get('/wishlist/addToWishlist/:id', wishlistController.addToWishlist);
userRouter.post("/wishlist/remove/:id",wishlistController.removeFromWishlist)


userRouter.post('/applyCoupon',usermiddlewear.userlogin,checkoutController.applyCoupon)


// Search route
userRouter.get('/search', userController.search);
userRouter.get('/shop', shopController.getShopPage);
userRouter.get('/category/:id', shopController.filterCategory);







module.exports = userRouter;

