const mongoose=require("mongoose");
const schema= mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const productSchema=new schema({
  
  productId: {
    type: String,
    default: uuidv4(),
    unique: true,
  },
    productName: String,
    price: Number,
    offerPrice: {
      type: Number,
      default: 0,
    },
    size: String,
    colors: [{
        type: String,
        trim: true
      }],
    quantity: Number,
    itemImage: [
        {type: String}
    ],
    moreInfo: {
        brand: String,
        description: String,
        rating: Number
    },  category: {
        type: schema.Types.ObjectId,
        ref: 'Category'
      },
      featured: {
        type: Boolean,
        default: false
      },
      newProducts: {
        type: Boolean,
        default: false
      },
      onSale: {
        type: Boolean,
        default: false
      },
      isDeleted: {
      type: Boolean,
      default: false,
    },
    reviews:[{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    }],
});



const productModel = mongoose.model("product", productSchema);
module.exports=productModel;

// correction started