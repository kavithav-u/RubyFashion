const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
    UserId: {
    type: String,
    default: uuidv4(),
  
  },
  ReferrelCode: {
    type: String,
    default: uuidv4(),
    unique: true,
  },
  number: {
    type: String,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  email:{
    type:String,
    required:true,
    unique: true
},   
 password:{
    type:String,
    required:true,
},

cart:[{
  product:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"product",
  },
  quantity:{
      type:Number,
      default:1,
      required : true
  }
}],
wishlist: [
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    }
  }
],


address: [
  {
    firstName: String,
    lastName: String,
    email:{
      type:String,
      required:true,
  },
    houseNumber:String,
    city: String,
    state: String,
    streetaddress: String,
    pin: Number,
    phone: Number,
    country: String,
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
],
wallet: {
  type: Number,
  default: 0,
},
});


const User = mongoose.model('User', userSchema);

module.exports = User;
