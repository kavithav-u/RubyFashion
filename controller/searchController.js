const productModel = require('../models/product');
const Category = require('../models/category');


const querySearch = (req, res) => {
  const query = req.query.query;
  const regex = new RegExp(query, "i");

  productModel.find({
    $or: [
      { productName: { $regex: regex } },
      { "moreInfo.description": { $regex: regex } }
    ]
  })
    .then((result) => {
      res.render("singleProduct", {
        login: req.session.userLogin,
        products: result,
        totalPages: 1,
        pageNo: 1,
        count: result.length
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
};

module.exports = {
  querySearch
};
