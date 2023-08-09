const Category = require('../models/category');
const productModel = require("../models/product");
const User = require('../models/user');

const allProduct = async (req, res) => {
    try {
      const products = await productModel.find({});
      const categories=await Category.find({})  
      res.render('admin/product', { products,categories });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  };

  const addproduct = async (req, res) => {
        
                const {
                  name,
                  category,
                  price,
                  offerPrice,
                    brand,
                    description,
                  quantity,
                  size,
                  colors,
                  featured,
                  newProducts,
                  onSale
                } = req.body;        

      const newProduct = new productModel({
        productName: name,
        itemImage : req.files.map((file) =>file.filename),
        category,
              moreInfo: {
                brand,
                description,
                rating: 0 ,
              },
              price,
              offerPrice,
              quantity,
              size,
              colors: colors.split(',').map(color => color.trim()),
              featured: Boolean(featured),
              newProducts: Boolean(newProducts),
              onSale: Boolean(onSale),
      });
  
      let existingProduct = await productModel.findOne({ name:name });
      console.log(existingProduct);
  
      if (existingProduct) {
        const Products = await productModel.find();
        const categories = await Category.find();
        return res.render("admin/product", { message: "Product already exists", Products, categories });
      }
        
      const savedProduct = await newProduct.save();
      res.redirect('/admin/product');
   
  };
  

  const editProduct = async (req, res) => {
    try {
      // Fetch the product details from the database
      const product = await productModel.findById(req.params.id).populate('category');
      const categories=await Category.find({})  

      // Render the editProduct.ejs view with the product data
      res.render('admin/editProduct', { product,categories });
    } catch (err) {
      console.error(err);
      res.redirect('/admin/product');
    }
  };

  
  // Edit Product
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      offerPrice,
      size,
      colors,
      quantity,
      description,
      brand,
      category,
      featured,
      newProducts,
      onSale,
    } = req.body;

    // Convert string values to boolean
    const isFeatured = featured === 'true';
    const isNewProduct = newProducts === 'true';
    const isOnSale = onSale === 'true';

    const itemImages = req.files ? req.files.map(file => file.filename) : undefined;

    const product = await productModel.findById(req.params.id);
    if (!product) {
      console.log("Product not found");
      return res.redirect('/admin/product'); // Redirect back to the product list page
    }

    // Update the product properties
    product.productName = name;
    product.price = price;
    product.offerPrice = offerPrice;
    console.log("offerPrice",offerPrice)
    product.size = size;
    product.colors = colors;
    product.quantity = quantity;
    if (itemImages) {
      // Add new images to existing images
      product.itemImage.push(...itemImages);
    }
    product.moreInfo.brand = brand;
    product.moreInfo.description = description;
    product.category = category;
    product.featured = isFeatured;
    product.newProducts = isNewProduct;
    product.onSale = isOnSale;

    await product.save();
    res.redirect('/admin/product');
  } catch (err) {
    console.log(err);
    res.redirect('/admin/product');
  }
};

const removeProductImage=async(req,res)=>{
  try{
    const productId=req.body.id;
    const position=req.body.position;
    const product=await productModel.findById(productId)
    const image=product.itemImage[position]

    await productModel.updateOne(
       { _id:productId},
       {$pull:{itemImage:image}}

    ).then((response)=>{
        console.log("response from database",response)
    })
    res.json({remove:true})
}
catch(error)
{
   
    console.log(error)
}
}

  const singleProduct = async (req, res) => {

    try {
      const productId = req.params.productId;
      const userLogin = req.session.userLogin;
      const product = await productModel.findById(productId).populate('category').exec();
      const user = await User.findById(req.session.userId)
  
      // Calculate the offer price if the category has an offer
    let offerPrice = product.offerPrice;
    if (product.category && product.category.offer && product.category.offer.discount > 0) {
      const discountAmount = (product.offerPrice * product.category.offer.discount / 100);
      offerPrice = product.offerPrice - discountAmount;
    }
      if (!product) {
        return res.render('error', { error: 'Product not found' });
      }
  
      res.render('user/singleProduct', { product, userLogin, name:user.username,offerPrice  });
    } catch (error) {
      res.render('error', { error: 'An error occurred' });
    }

}



const unlistproduct= async (req,res)=>{
  let id=req.params.id
  try{
    let product= await productModel.findById(id)
  
    product.isDeleted=!product.isDeleted;
    await product.save()
    res.render("admin/product")
  }catch(err){
    console.log(err)
  }
}



  module.exports = {
    allProduct,
    addproduct,
    editProduct,
    singleProduct,
    unlistproduct,
    updateProduct,
    removeProductImage
    };