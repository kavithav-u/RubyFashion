const User = require('../models/user');
const Order = require('../models/order');
const productModel = require('../models/product')
const { Coupon } = require('../models/coupons');
const PDFDocument = require('pdfkit');



const getSales = async(req,res)=>{
    try{
        const sales = await Order.find()
        .sort({ createdAt: -1 }).
        populate('user').populate('items.product');

      console.log("sales",sales)
        res.render("admin/sales", {sales})
    } catch (err) {
        // Handle error here
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

const salesFilter = async(req,res)=>{
    try {
        const { startDate, endDate } = req.body;
        console.log("req.body",req.body)


    // Convert startDate and endDate to JavaScript Date objects
    const startDateObj = new Date(startDate + 'T00:00:00Z'); // Assuming UTC timezone
    const endDateObj = new Date(endDate + 'T23:59:59Z');   // Assuming UTC timezone
    // Fetch sales data based on the query
    const sales = await Order.find({
      createdAt: { $gte: startDateObj, $lte: endDateObj }
    })
    .populate('user')
    .populate('items.product');
    console.log("sales",sales)

    res.render("admin/sales", { sales });
  } catch (err) {
    // Handle error here
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const downloadSalesReportPdf = async (req,res)=>{
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
    doc.fontSize(18).text(`Sales Report`, { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(14).text(`Sale ID: ${orderId}`, { align: 'left' });
    doc.moveDown(0.5);

    doc.fontSize(14).text(` Date: ${order.createdAt.toDateString()}`, { align: 'left' });
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
      

const downloadAllSalesReportPdf = async (req,res)=>{
    try {
       // Fetch all orders from the database
    const orders = await Order.find().populate('items.product').populate('user');

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set the response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="all_orders.pdf"`);

    // Pipe the PDF document to the response stream
    doc.pipe(res);

    // Add table header
    doc.fontSize(14).text('No.', 50, 50, { align: 'left' });
    doc.text('Customer Name', 100, 50, { align: 'left' });
    doc.text('Ordered Date', 200, 50, { align: 'left' });
    doc.text('Product Name', 300, 50, { align: 'left' });
    doc.text('Quantity', 420, 50, { align: 'left' });
    doc.text('Total Amount', 480, 50, { align: 'left' }); // Adjusted position

    let yPos = 70; // Starting position for the first row of data

    let totalSalesAmount = 0;

    // Loop through each order and add its details to the table
    orders.forEach((order, index) => {
      const orderedDate = order.createdAt.toDateString().split(' ');
      orderedDate.shift(); // Remove the day portion

      // Add a gap between headings and values
      yPos += 20;

      // Calculate the total amount and other values for the current order
      let quantity = 0;
      let totalAmount = 0;
      let productName = '';

      order.items.forEach(item => {
        quantity += item.quantity;
        totalAmount += item.product.price * item.quantity;

        const productWords = item.product.productName.split(" ");
        let truncatedProductName = productWords.slice(0, 2).join(" ");
        if (truncatedProductName.length > 10) {
          truncatedProductName = truncatedProductName.slice(0, 10) + "...";
        }
        productName += `${truncatedProductName}\n`;
      });

      // Check if adding the current order details would exceed the page height
      if (yPos + 100 >= doc.page.height) {
        // Add a new page and reset yPos
        doc.addPage();
        yPos = 50;
      }

      // Add the order details to the current page
      doc.fontSize(12).text(index + 1, 50, yPos, { align: 'left' });
      doc.text(order.user.username, 100, yPos, { align: 'left' });
      doc.text(orderedDate.join(' '), 200, yPos, { align: 'left' });
      doc.text(productName, 300, yPos, { align: 'left' });
      doc.text(quantity.toString(), 420, yPos, { align: 'left' });
      doc.text(`Rs. ${totalAmount.toFixed(2)}`, 480, yPos, { align: 'left' }); // Adjusted position

      yPos += 100; // Move to the next row
      totalSalesAmount += totalAmount; // Add to total sales amount
    });

    // Add the total sales amount at the end in a single line
    doc.fontSize(14).text(`Total Sales Amount: Rs. ${totalSalesAmount.toFixed(2)}`, 50, yPos + 20, { align: 'left' });

    // Finalize the PDF and end the response
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = {
    getSales,
    salesFilter,
    downloadSalesReportPdf,
    downloadAllSalesReportPdf,
    
}