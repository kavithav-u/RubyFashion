
const User = require('../models/user');
const productModel = require('../models/product');
const Category = require('../models/category');
const Order = require('../models/order');



const ITEMS_PER_PAGE = 6; // Define the number of products per page

const getShopPage = async (req, res) => {
    try {
      const userLogin = req.session.userLogin;
      const users = await User.find();
      const categoryId = req.params.id;
  
      // Calculate total pages for pagination
      const totalProducts = await productModel.countDocuments({});
      const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * ITEMS_PER_PAGE;
  
      // Fetch products for the current page
      let productsQuery = productModel.find({});
              // Handle category filter
              if (categoryId) {
                productsQuery = productsQuery.find({ category: categoryId });
            }
  
      // Handle sorting options
      const sortOption = req.query.sort || null;
      if (sortOption === 'lowToHigh') {
        productsQuery = productsQuery.sort({ price: 1 });
      } else if (sortOption === 'highToLow') {
        productsQuery = productsQuery.sort({ price: -1 });
      }

      const products = await productsQuery
        .skip(skip)
        .limit(ITEMS_PER_PAGE);
  
      const categories = await Category.find({ isDeleted: false });
  
      res.render('user/shop', {
        products,
        categories,
        currentPage: page,
        totalPages,
        selectedCategory: categoryId,
        userLogin,
        name: users.username,
        categoryId,
        sortOption,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
  
  const filterCategory = async (req, res) => {
    try {
      const userLogin = req.session.userLogin;

  
      const users = await User.find();
      const categoryId = req.params.id;
  
      // Calculate total pages for pagination
      const totalProducts = await productModel.countDocuments({ category: categoryId });
      const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * ITEMS_PER_PAGE;
  
      // Fetch products for the current page with sorting applied
      let productsQuery = productModel.find({ category: categoryId });
  
      // Handle sorting options
      const sortOption = req.query.sort || null;
      if (sortOption === 'lowToHigh') {
        productsQuery = productsQuery.sort({ price: 1 });
      } else if (sortOption === 'highToLow') {
        productsQuery = productsQuery.sort({ price: -1 });
      }
            // If a categoryId is provided, filter products by category
            if (categoryId) {
              productsQuery = productsQuery.find({ category: categoryId });
          }
  
      const products = await productsQuery
        .skip(skip)
        .limit(ITEMS_PER_PAGE);
  
      const categories = await Category.find({ isDeleted: false });
  
      res.render('user/shop', {
        products,
        categoryId,
        currentPage: page,
        selectedCategory: categoryId,
        totalPages,
        categories,
        userLogin,
        name: users.username,
        sortOption,
      });
    } catch (error) {
      console.error('Error fetching products by category:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
  
module.exports = {
    getShopPage,
    filterCategory

}