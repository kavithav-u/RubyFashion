
const User = require('../models/user');
const productModel = require('../models/product');
const Category = require('../models/category');
const Order = require('../models/order');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');


// Function to check if an order is cancelable.
function isCancelable(createdAt) {
  const currentDate = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds.

  // Calculate the difference in days between the current date and the order creation date.
  const diffDays = Math.floor((currentDate - createdAt) / oneDay);

  return diffDays < 1; // Return true if the order is less than one day old, false otherwise.
}


const getuserprofile = async (req, res) => {
    try {
      if (!req.session.userLogin) {
        // User is not logged in
        return res.status(401).json({ error: 'Please log in first' });
      }
        const userLogin = req.session.userLogin;
      const users = await User.findById(req.session.userId)
      const walletAmount = users.wallet;
      console.log("walletAmount:",walletAmount)
      const user = await User.findById(req.session.userId).populate('cart.product').populate('address');
      const order = await Order.find({user:req.session.userId}).populate('items.product');
           // Loop through each order and log the items
            order.forEach((orderItem) => {
              console.log(orderItem.items); // Log the items for each order
            });
            const address = user.address;
            order.sort((a, b) => b.createdAt - a.createdAt);

      res.render('user/profile',{users , order, isCancelable, userLogin , name: users.username, address: address, user,walletAmount });

    } catch (error){
        console.log(error.message)
    }
  };

  
  const cancelOrder = async (req, res) => {
    try {
      if (!req.session.userLogin) {
        // User is not logged in
        return res.render("user/login", { message: "You have to login first" });
      }
        const orderId = req.params.id;
      // Find the order by ID
      const order = await Order.findById(orderId).populate('user').populate('items.product');
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      // Find the user who placed the order
      const user = order.user;
      // Check if the order is already canceled
      if (order.status === 'cancel') {
        return res.status(400).json({ error: 'Order is already canceled' });
      }
      // Add the canceled order's totalAmount to the user's wallet
      user.wallet += order.totalAmount;
      // Update the order status to "cancelled"
      order.status = 'cancel';
  
      // Iterate through each product in the order and add the quantity back to the database
      for (const orderedProduct of order.items) {
        const productId = orderedProduct.product._id;
        const quantity = orderedProduct.quantity;
  
        // Find the corresponding product in the database
        const product = await productModel.findById(productId);
        if (!product) {
          return res.status(404).json({ error: `Product with ID ${productId} not found` });
        }
  
        // Add the canceled order's quantity back to the product's available stock
        product.quantity += quantity;
  
        // Save the updated product in the database
        await product.save();
      }
  
      // Save the updated user and order
      await order.save();
      await user.save();
  
      res.redirect('/profile');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
 const editAddress = async (req,res)=>{
  try{
    const { firstName, lastName, email, houseNumber, city, state, pin, phone } = req.body;
    const addressId = req.params.id;
    
    // Find the user's address by addressId
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const address = user.address.id(addressId);
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Update the address details
    address.firstName = firstName;
    address.lastName = lastName;
    address.email = email;
    address.houseNumber = houseNumber;
    address.city = city;
    address.state = state;
    address.pin = pin;
    address.phone = phone;

    await user.save();

    res.redirect('/profile'); // Redirect to the profile page after updating the address
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.userId;

    // Find the user by ID
    const user = await User.findById(userId);

    // Compare the current password with the one stored in the database
    if (!user || !(currentPassword && user.password === currentPassword)) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match' });
    }

    // Update the password
    user.password = newPassword;
    await user.save();

    res.redirect('/profile'); // Redirect to the profile page after updating the password
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const userlogout= async(req,res)=>{

    if (!req.session.userLogin) {
      // User is not logged in
      return res.render("user/login", { message: "You have to login first" });
    }
    const userLogin = req.session.userLogin;
    const categories=await Category.find({isDeleted:false})
      const products=await productModel.find({isDeleted:false})
      const featuredProducts = await productModel.find({featured : true});
    const newProducts = await productModel.find({ newProducts : true})
    const onSale = await productModel.find({ onSale : true})
  req.session.destroy()
    res.render("user/home",{userLogin , name: userLogin.username,categories, products, featuredProducts, newProducts, onSale })
  }

  const walletInfo = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      const walletAmount = user.wallet; // Get the wallet amount from the user object
      res.render('user/profile', { walletAmount }); // Pass the walletAmount to the template
    } catch (error) {
      console.error('Error fetching wallet amount:', error);
      res.status(500).send('An error occurred while fetching wallet amount.');
    }
  };

  const returnOrder = async(req,res)=>{
    try{
      const orderId = req.params.id;
      const returnReason = req.body.returnReason;

      // Fetch the order from the database
      const order = await Order.findById(orderId).populate('user').populate('items.product');
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
       // Find the user who placed the order
        const user = order.user;
        // Add the canceled order's totalAmount to the user's wallet
      user.wallet += order.totalAmount;
      // Update the order status to "returned" and save the return reason
      order.status = 'Returned';
      order.returnReason = returnReason;
      // Iterate through each product in the order and add the quantity back to the database
      for (const orderedProduct of order.items) {
        const productId = orderedProduct.product._id;
        const quantity = orderedProduct.quantity;
  
        // Find the corresponding product in the database
        const product = await productModel.findById(productId);
        if (!product) {
          return res.status(404).json({ error: `Product with ID ${productId} not found` });
        }
  
        // Add the canceled order's quantity back to the product's available stock
        product.quantity += quantity;
  
        // Save the updated product in the database
        await product.save();
      }
      await order.save();
      await user.save();
  
      res.redirect('/profile'); // Redirect back to the profile page after successful return
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const downloadOrderPdf = async (req, res) => {
    try {
      const orderId = req.params.id;
  
      // Fetch the order details from the database
      const order = await Order.findById(orderId).populate('items.product').populate('user');
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      // Create a new PDF document
      const doc = new PDFDocument();
  
      // Set the response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="order_${orderId}.pdf"`);
  
      // Pipe the PDF document to the response stream
      doc.pipe(res);
  
      // Add order details to the PDF
      doc.fontSize(18).text(`Order Details`, { align: 'center' });
      doc.moveDown(0.5);
  
      doc.fontSize(14).text(`Order ID: ${orderId}`, { align: 'left' });
      doc.moveDown(0.5);
  
      doc.fontSize(14).text(`Order Date: ${order.createdAt.toDateString()}`, { align: 'left' });
      doc.moveDown(0.5);
  
      doc.fontSize(14).text(`Customer Name: ${order.user.username}`, { align: 'left' });
      doc.moveDown(0.5);
  
      doc.fontSize(14).text(`Payment Method: ${order.paymentMethod}`, { align: 'left' });
      doc.moveDown(1.5);

      // Table header
      doc.font('Helvetica-Bold').fontSize(12);
      doc.text('Product Name', 50, 200, { align: 'left' });
      doc.text('Price (Rs.)', 200, 200, { align: 'left' });
      doc.text('Quantity', 350, 200, { align: 'left' });
      doc.text('Subtotal (Rs.)', 450, 200, { align: 'left' });
      doc.moveDown(0.5);
  
      // Loop through each item in the order and add it to the PDF as a table row
      let totalAmount = 0;
      let tableTop = 230; // Adjust the starting position for the table
  
      for (const orderedProduct of order.items) {
        const product = orderedProduct.product;
        const quantity = orderedProduct.quantity;
        const subtotal = product.price * quantity;
        totalAmount += subtotal;
        const productName = product.productName;
        const maxProductNameLength = 16;
         // Split product name into multiple lines if its length exceeds maxProductNameLength
  if (productName.length > maxProductNameLength) {
    const productNameLines = doc
      .font('Helvetica')
      .fontSize(12)
      .widthOfString(productName, { width: 200 });

    if (productNameLines > 1) {
      const words = productName.split(' ');
      let line = '';
      const productNameLines = [];

      for (const word of words) {
        if ((line + word).length > maxProductNameLength) {
          productNameLines.push(line);
          line = word + ' ';
        } else {
          line += word + ' ';
        }
      }
      productNameLines.push(line);

      for (let i = 0; i < productNameLines.length; i++) {
        doc.text(productNameLines[i], 50, tableTop + i * 15, { align: 'left' });
      }
    }
  } else {
    doc.text(productName, 50, tableTop, { align: 'left' });
  }
  
        doc.font('Helvetica').fontSize(12);
        doc.text(product.price.toString(), 200, tableTop, { align: 'left' });
        doc.text(quantity.toString(), 350, tableTop, { align: 'left' });
        doc.text(subtotal.toString(), 450, tableTop, { align: 'left' });
        doc.moveDown(0.5);
  
        tableTop += 20; // Move the position for the next row
      }
      tableTop += 20; // Move the position for the next row

      doc.moveDown(1);
  
      doc.fontSize(14).text(`Total Amount: Rs. ${totalAmount}`, { align: 'left' });
  
      // Finalize the PDF and end the response
      doc.end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  

  module.exports = {
    getuserprofile,
    cancelOrder,
    editAddress,
    updatePassword,
    userlogout,
    walletInfo,
    downloadOrderPdf,
    returnOrder
  }