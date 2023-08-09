
const User = require('../models/user');
const Order = require('../models/order');
require('dotenv').config();


// Admin Login
const getlogin = (req, res) => {
    try {
      res.render('admin/login');
    } catch (err) {
      console.log(err);
    }
  };
  

// Admin loginPost

const loginPost = (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    console.log(process.env.ADMIN_USERNAME,"process.env.ADMIN_USERNAME")
    console.log(process.env.ADMIN_PASSWORD,"process.env.ADMIN_PASSWORD")
    if (username === adminUsername && password === adminPassword) {
      req.session.adminLoggedin = true;
      res.redirect('/admin/dashboard');
    } else {
      res.render('admin/login', { error: 'Invalid username or password' });
    }
  } catch (err) {
    console.log(err);
  }
};


// get dashboard
const getDashboard = async (req,res)=>{
  try {

          // Fetch total sales for each month
    const monthlySales = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } } // Sort the results by month in ascending order
    ]);

        // Sorting based on the value of req.params.sortType
        let sortField = '';
        if (req.params.sortType === 'daily') {
          // Implement daily sorting logic
          sortField = 'dailyField';
        } else if (req.params.sortType === 'weekly') {
          // Implement weekly sorting logic
          sortField = 'weeklyField';
        } else if (req.params.sortType === 'yearly') {
          // Implement yearly sorting logic
          sortField = 'yearlyField';
        }
    

    const totalSalesResult = await Order.aggregate ([
      {$group: { _id:null, totalSales:{$sum:'$totalAmount'}}}
    ])

      console.log(totalSalesResult,"totalSalesResult")
    // Get total orders
    const totalOrdersResult = await Order.countDocuments();

    // Get total COD orders
    const codOrdersResult = await Order.countDocuments({ paymentMethod: 'cash' });

    // Get total online payment orders
    const onlinePaymentOrdersResult = await Order.countDocuments({ paymentMethod: 'online' });

    // Render the dashboard EJS template with data
    res.render('admin/dashboard', {
      totalSalesResult: totalSalesResult.length > 0 ? totalSalesResult[0].totalSales : 0,
      totalOrders: totalOrdersResult,
      codOrders: codOrdersResult,
      onlinePaymentOrders: onlinePaymentOrdersResult,
      monthlySales: JSON.stringify(monthlySales) // Convert the array to a JSON string
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


  const adminSortSalesData = async (req,res)=>{
    try {


       const monthlySales = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } } // Sort the results by month in ascending order
    ]);

      const { type, interval } = req.body;

      // Implement the sorting logic based on the selected interval
      let sortCriteria = {};
      if (interval === 'daily') {
        sortCriteria = { createdAt: { $gte: calculateStartDate('daily') } };
      } else if (interval === 'weekly') {
        sortCriteria = { createdAt: { $gte: calculateStartDate('weekly') } };
      } else if (interval === 'monthly') {
        sortCriteria = { createdAt: { $gte: calculateStartDate('monthly') } };
      }
  
      const sales = await Order.aggregate([
        { $match: sortCriteria },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            totalSales: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 },
            cod: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'cash'] }, 1, 0] } },
            onlinePayment: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'online'] }, 1, 0] } }
          }
        }
      ]);

      res.json({
        totalSales: sales.length > 0 ? sales[0].totalSales : 0,
        totalOrders: sales.length > 0 ? sales[0].totalOrders : 0,
        average: sales.length > 0 ? sales[0].averageOrderValue : 0,
        cod: sales.length > 0 ? sales[0].cod : 0,
        onlinePayment: sales.length > 0 ? sales[0].onlinePayment : 0,
        monthlySales: JSON.stringify(monthlySales) // Convert the array to a JSON string
      });
    } catch (error) {
      console.error('Error sorting sales data:', error);
      res.status(500).json({ error: 'An error occurred while sorting sales data' });
    }
  }



  const calculateStartDate = (interval) => {
    const currentDate = new Date();
    if (interval === 'daily') {
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    } else if (interval === 'weekly') {
      const firstDayOfWeek = currentDate.getDate() - currentDate.getDay();
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), firstDayOfWeek);
    } else if (interval === 'monthly') {
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    }
  };


  const monthlySalesGraph = async (req, res) => {
    try {
      const monthlySales = await Order.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            totalSales: { $sum: '$totalAmount' }
          }
        },
        { $sort: { _id: 1 } } // Sort the results by month in ascending order
      ]);

  
      res.json(monthlySales);
    } catch (error) {
      console.error('Error fetching monthly sales data:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };

  const getuserlist=async(req,res)=>{

     try {
    // Fetch all user details from the database
    const users = await User.find();
    res.render('admin/user-list', { users });
  } catch (error) {
    console.error(error);
    res.render('admin/user-details', { error: 'Failed to fetch user details' });
  }
  }

  const userunlist=async(req,res)=>{
    let id=req.params.id
    
    try{

      const unlist= await User.findById(id)
      unlist.isDeleted=!unlist.isDeleted;
      await unlist.save()
      res.redirect("/admin/user-list")
    }catch(err){
      console.log(err)
    }
    }

const adminlogoff=(req,res)=>{
    try{
        req.session.adminLoggedin=false
        req.session.destroy();
      res.redirect("/admin/login" );
    }
    catch(err){
      console.log(err)
    }
  }



  const getOrderList = async (req,res)=>{

    try {
      // Fetch all user details from the database
 
      const users = await User.find()
      const order = await Order.find().populate('user').populate('items.product');
     // Loop through each order and log the items
order.forEach((orderItem) => {
});
      
      res.render('admin/orderDetails', { users , order});
    } catch (error) {
      console.error(error);
      res.render('admin/orderDetails', { error: 'Failed to fetch user details' });
    }
  }


  const updateOrderStatus = async (req,res)=>{
    try{
      const orderId = req.params.id;
      const { status} = req.body;

       // Find the order by ID
       const order = await Order.findById(orderId);
       if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      // Update the order status
    order.status = status;
    await order.save();

    res.redirect('/admin/orderDetails'); // Redirect to the order details page or any other desired page
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = {
    getlogin,
    loginPost,
    getDashboard,
    adminSortSalesData,
    adminlogoff,
    userunlist,
    getuserlist,
    getOrderList,
    updateOrderStatus,
    monthlySalesGraph
};

