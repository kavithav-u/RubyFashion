const mongoose=require("mongoose");
const schema= mongoose.Schema;


const categorySchema = new schema({
    name: {
      type: String,
      required: true,
      unique: true 
    },
    image: {
      type: String,
      
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    offer: {
      // Embedding offer details directly within the category document
      discount: {
        type: Number,
        default: 0,
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      // Other offer-related fields...
    },
  });

  
  const Category = mongoose.model('Category', categorySchema);
  
  module.exports = Category;
  