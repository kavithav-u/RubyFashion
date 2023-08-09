const Category = require('../models/category');
const productModel = require("../models/product");
const User = require('../models/user');
const Order = require('../models/order');
const Razorpay = require('razorpay');
const { Coupon } = require('../models/coupons');



const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const getCheckout = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productModel.findById(productId);
    const user = await User.findById(req.session.userId).populate('cart.product').populate('address');
    const coupons = await Coupon.find({})
    const userLogin = req.session.userLogin;
    if (!req.session.userLogin) {
      // User is not logged in
      return res.render("user/login", { message: "You have to login first" });
    }

    const address = user.address;
    res.render("user/checkout", {
      userLogin,
      user: req.session.user,
      name: req.session.username,
      product,
      cartItems: user.cart,
      address: address,
      coupons
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};



  const addaddress = async (req,res)=>{
    try{
        const { edit_firstName, edit_lastName, edit_email, edit_house_number, edit_state, edit_street_address, edit_city, edit_postcode, edit_phone } = req.body;
        const user = await User.findById(req.session.userId)
        console.log(user,"user")

        if (!user) {
            return res.status(404).json({ error: "User not found" });
          }
           const newAddress = {
            firstName: edit_firstName,
            lastName: edit_lastName,
            email: edit_email,
            houseNumber: edit_house_number,
            city: edit_city,
            state: edit_state,
            streetaddress: edit_street_address,
            pin: edit_postcode,
            phone: edit_phone.replace(/\D/g, ""),
            isDefault: false,
           };
    
           user.address.push(newAddress);
           await user.save();
           res.redirect('/checkout')
          } catch (error) {
              console.error(error);
              // Send an error response back to the client
              res.json({ success: false });
          }
    
  };

  const editaddress = async (req,res)=>{
    try {
      const addressId = req.params.id;
      const { firstName, lastName, email, houseNumber, state, city, pin} = req.body;
  
      // Find the user and the address by ID
      const user = await User.findById(req.session.userId);
      const address = user.address.id(addressId);
  
      if (!user || !address) {
        return res.status(404).json({ error: "User or address not found" });
      }
  
      // Update the address fields
      address.firstName = firstName;
    address.lastName = lastName;
    address.email = email;
    address.houseNumber = houseNumber;
    address.state = state;
    address.city = city;
    address.pin = pin;
      // Update other address fields
  
      // Save the updated user object
      await user.save();
  
      // Redirect back to the checkout page or display a success message
      res.redirect('/checkout');
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  };


  const successpage=async(req,res)=>{
  
    const userLogin = req.session.userLogin;
    
    const user = await User.findById(req.session.userId)
    
    res.render("user/success" , {userLogin ,name:user.username})
  }

  const placeOrder = async (req, res) => {
      req.session.cartTotal = req.body.totalAmount;  
      const { addressId, paymentMethod, totalAmount, subtotal, products } = req.body;
      try{
      // Retrieve the user from the database
      const user = await User.findById(req.session.userId);
      // Find the selected address from the user's addresses
      const address = user.address.find((item) => item._id.toString() === addressId);
  
      // Parse the order totals as numbers
      const parsedSubtotal = parseFloat(subtotal);
      console.log(parseFloat(subtotal),"parseFloat(subtotal)");
      const parsedTotal = parseFloat(totalAmount);
      console.log(parsedTotal);

if (paymentMethod === 'cash') {
        // Create an array of order items
        const orderItems = await Promise.all(products.map(async (product) => {
        console.log('Processing product:', product);
        const updatedProduct = await productModel.findByIdAndUpdate(product.Id, { $inc: { quantity: -product.quantity } });

          return {
            
            product: updatedProduct._id, // Use product._id instead of product.Id
            quantity: product.quantity
          };
          
        }));
  // Create a new order document
  const order = new Order({
    user: user._id,
    items: orderItems,
    subtotal: parsedSubtotal,
   totalAmount: parseFloat(totalAmount),
    paymentMethod: paymentMethod,
    shippingAddress: {
      name: address.name,
      houseNumber: address.houseNumber,
      city: address.city,
      state: address.state,
      pin: address.pin,
      phone: address.phone,
    },
  });
  // Save the order to the database
  await order.save();

   // Clear the user's cart
   user.cart = [];
   await user.save();
   return res.json({ success: true });

} else if (paymentMethod === 'online') {
  // Handle Online Payment using Razorpay
  const razorpayOrder = {
    amount : totalAmount *100,
    currency:process.env.RAZORPAY_CURRENCY,
    receipt:process.env.RAZORPAY_RECEIPT,
    payment_capture:process.env.RAZORPAY_PAYMENT_CAPTURE,
  }
  console.log("razorpayOrder",razorpayOrder)

      // Create an array of order items with Promise.all()
      const orderItems = await Promise.all(products.map(async (product) => {
        await productModel.findByIdAndUpdate(product._id, { $inc: { quantity: -product.quantity } });
        return {
          product: product.Id, // Assuming product._id contains the ID of the product
          quantity: product.quantity
        };
        
      }));
       razorpay.orders.create(razorpayOrder, async (err,order)=>{
        if(err) {
          console.error(err,"Error message");
          res.json({sucess:false})
          return
        }

       const orderId = order.id;



  const newOrder = new Order({
    user: user._id,
    items: orderItems,
    subtotal: parsedSubtotal,
   totalAmount: parseFloat(totalAmount),
    paymentMethod: paymentMethod,
    shippingAddress: {
      name: address.name,
      houseNumber: address.houseNumber,
      city: address.city,
      state: address.state,
      pin: address.pin,
      phone: address.phone,
    },
    razorpayOrderId: orderId // Store the Razorpay order ID in the order document
  });

  res.json ({ success:true , razorpayOrderId:orderId })
      // Clear the user's cart
  await newOrder.save();
  user.cart = [];

});
  }
} catch(error){
  console.error(error);
  res.json({success :false});
}

};
const applyCoupon = async (req, res) => {
  try {
  
    const { couponCode,totalAmountCart } = req.body;
    // Retrieve the user from the database (assuming you have a session-based user ID)
    const user = await User.findById(req.session.userId);
    // Find the coupon in the database based on the given coupon code
    const coupon = await Coupon.findOne({ couponCode });
    if (!coupon || !coupon.isActive) {
      // Coupon not found or inactive
      return res.json({ success: false });
    }

    const discountAmount = coupon.discountPercentage;
    const updatedTotalAmount = totalAmountCart - (totalAmountCart * coupon.discountPercentage) / 100;

    return res.json({ success: true, updatedTotalAmount });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.json({ success: false });
  }
};
  
  
module.exports = {
    getCheckout,
    addaddress,
    editaddress,
    placeOrder,
    successpage,
    applyCoupon
}

