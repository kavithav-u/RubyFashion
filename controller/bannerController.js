const Category = require('../models/category');
const productModel = require("../models/product");
const User = require('../models/user');
const Banner = require('../models/banner');

const getBanner = async(req,res)=>{
    try{
        const banners = await Banner.find({});
      console.log(banners)
      res.render('admin/banner', { banners });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  };


  const addBanner = async (req, res) => {
    try {
      const { title, description } = req.body;
      console.log("req.body",req.body)
      const image = req.file.filename;
      console.log("image",image)
  
      // Create a new banner object using the Banner model
      const newBanner = new Banner({
        image,
        title,
        description,
      });
  
      // Save the new banner to the database
      const savedBanner = await newBanner.save();
  
      res.status(201).json(savedBanner);
    } catch (error) {
      console.error('Error adding banner:', error);
      res.status(500).json({ error: 'An error occurred while adding the banner' });
    }
  };

  const editBanner = async (req, res) => {
  try {
    const { id, title, description } = req.body;
    console.log("req.body", req.body);
    let image; 
    if (req.file) {
      image = req.file.filename;
    } else {
      const banner = await Banner.findById(id);
      image = banner.image;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      { image, title, description },
      { new: true }
    );
    console.log('Banner updated:', updatedBanner);
    res.json(updatedBanner);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: 'Error updating banner' });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    console.log("bannerId",bannerId)

    // Find the banner by ID and remove it from the database
    const deletedBanner = await Banner.findByIdAndDelete(bannerId);

    if (!deletedBanner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.redirect('/admin/banner');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

  module.exports = {
    getBanner,
    addBanner,
    editBanner,
    deleteBanner
  
  };
    
