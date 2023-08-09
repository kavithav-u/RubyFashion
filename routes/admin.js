const express = require('express');
const adminRouter = express.Router();
const multer = require('multer');
var path = require('path');
const adminController = require('../controller/adminController');
const categoryController = require('../controller/categoryController');
const productController = require('../controller/productController');
const couponController = require('../controller/couponController');
const bannerController = require('../controller/bannerController');
const salesController = require('../controller/salesController');
const adminmiddlewear = require('../middlewear/adminmiddlewear');


// Multer configuration for single file upload
const storageSingle = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads');
  },
  filename: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

const uploadSingle = multer({
  storage: storageSingle,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  },
}).single('image');

// Multer configuration for multiple file upload
const storageMultiple = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads'); // Adjust the destination folder according to your project structure
  },
  filename: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

const uploadMultiple = multer({
  storage: storageMultiple,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  },
}).array('itemImage[]', 5);
  

adminRouter.get('/login',adminmiddlewear.adminlogoff,adminController.getlogin);
adminRouter.post('/login',adminmiddlewear.adminlogoff,adminController.loginPost);
adminRouter.get('/dashboard',adminmiddlewear.adminlogin,adminController.getDashboard);
adminRouter.post('/sort_sales_data',adminmiddlewear.adminlogin,adminController.adminSortSalesData);
adminRouter.get('/monthly-sales',adminmiddlewear.adminlogin,adminController.monthlySalesGraph);

adminRouter.get("/logout", adminController.adminlogoff);
// Category routes
adminRouter.get('/category',adminmiddlewear.adminlogin,categoryController.allCategories);
adminRouter.post('/addcategory',adminmiddlewear.adminlogin,uploadSingle,categoryController.addCategory);
adminRouter.post('/editCategory',adminmiddlewear.adminlogin,uploadSingle,categoryController.editCategory);
adminRouter.get("/category/action/:id",adminmiddlewear.adminlogin,categoryController.unlistcategory)

// product routes
adminRouter.get('/product',adminmiddlewear.adminlogin,productController.allProduct);
adminRouter.post("/addproduct",adminmiddlewear.adminlogin,uploadMultiple,productController.addproduct);
adminRouter.get("/product/editProduct/:id",adminmiddlewear.adminlogin,uploadMultiple,productController.editProduct)
adminRouter.post("/product/updateProduct/:id",adminmiddlewear.adminlogin,uploadMultiple,productController.updateProduct)
adminRouter.get("/product/action/:id",adminmiddlewear.adminlogin,productController.unlistproduct)
adminRouter.post("/product/removeProductImage",adminmiddlewear.adminlogin,productController.removeProductImage)



adminRouter.get("/user-list",adminmiddlewear.adminlogin,adminController.getuserlist)
adminRouter.get("/user-list/action/:id",adminmiddlewear.adminlogin,adminController.userunlist)

adminRouter.get("/orderDetails",adminmiddlewear.adminlogin,adminController.getOrderList)
adminRouter.post("/order/:id/status",adminmiddlewear.adminlogin,adminController.updateOrderStatus)

// Coupon Routes
adminRouter.get('/coupons',adminmiddlewear.adminlogin,couponController.getCoupon);
adminRouter.post('/addCoupon',adminmiddlewear.adminlogin,couponController.addCoupon);
adminRouter.post('/edit-coupon/:id',adminmiddlewear.adminlogin,couponController.editCoupon);


adminRouter.get('/banner',adminmiddlewear.adminlogin,bannerController.getBanner);
adminRouter.post('/addBanner',adminmiddlewear.adminlogin,uploadSingle,bannerController.addBanner);
adminRouter.post('/updateBanner',adminmiddlewear.adminlogin,uploadSingle,bannerController.editBanner);
adminRouter.post('/delete-banner/:id',adminmiddlewear.adminlogin,uploadSingle,bannerController.deleteBanner);

adminRouter.get('/sales',adminmiddlewear.adminlogin,salesController.getSales);
adminRouter.post('/filterSales',adminmiddlewear.adminlogin,salesController.salesFilter);
adminRouter.get("/download-sales-pdf/:id",adminmiddlewear.adminlogin,salesController.downloadSalesReportPdf );
adminRouter.get('/download-all-sales-pdf', adminmiddlewear.adminlogin, salesController.downloadAllSalesReportPdf);



module.exports = adminRouter;
