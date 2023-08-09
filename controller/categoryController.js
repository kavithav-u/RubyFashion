const Category = require('../models/category');

const addCategory = async (req, res) => {
  const { name } = req.body;
  const image = req.file.filename;
  let offer = null;

  if (req.body.applyOfferCheckbox) {
    const { discount, startDate, endDate } = req.body;
    offer = {
      discount,
      startDate,
      endDate,
    };
  }

  // Convert the category name to lowercase
  const lowercaseName = name.toLowerCase();

  // Check if the category name already exists in lowercase or uppercase
  let alreadyExist = await Category.findOne({
    $or: [
      { name: lowercaseName },
      { name: { $regex: new RegExp(`^${name}$`, 'i') } }
    ]
  });

  if (alreadyExist) {
    const categories = await Category.find();
    return res.render('admin/categories', {
      message: "Category already exists",
      categories
    });
  }

  // Create a new category with the lowercase name
  const newCategory = new Category({ name: lowercaseName, image,offer });
  await newCategory.save();
  res.redirect('/admin/category');
}



const editCategory = async (req, res) => {
  try {
    const categoryId = req.body.categoryId;
    const updatedName = req.body.name;
    const updatedImage = req.file ? req.file.filename : null;

    // Find the category in the database
    const category = await Category.findById(categoryId);

    // Update the category's name if a new name was provided
    if (updatedName) {
      category.name = updatedName;
    }

    // Update the category's image if a new image was selected
    if (updatedImage) {
      category.image = updatedImage;
    }

    // Update offer details if available
    if (req.body.offerDiscount || req.body.offerStartDate || req.body.offerEndDate) {
      category.offer = {
        discount: req.body.offerDiscount || 0,
        startDate: req.body.offerStartDate || null,
        endDate: req.body.offerEndDate || null,
      };
    }

    // Save the updated category
    await category.save();

    res.redirect('/admin/category');
  } catch (error) {
    console.error(error);
    res.render('admin/category', { error: 'Failed to edit category' });
  }
};



const allCategories = async (req, res) => {
    try {
      const categories = await Category.find();
      res.render('admin/categories', { categories });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  };

  const unlistcategory = async (req, res) => {
    const categoryId = req.params.id;
    console.log(categoryId)
  
    try {
     
      let category=await Category.findById(categoryId);
  
      category.isDeleted=!category.isDeleted
    await category.save()
      res.redirect('/admin/category');
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  };




module.exports = {
addCategory,
editCategory,
unlistcategory,
allCategories,

};

