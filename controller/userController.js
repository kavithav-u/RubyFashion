const session = require("express-session")
const twilio = require('twilio');
const User = require('../models/user');
const productModel = require('../models/product');
const Category = require('../models/category');
const Banner = require('../models/banner');
const nodemailer = require('nodemailer');


// Twilio configuration
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.ACCOUNT_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
// const twilioPhoneNumber = '+14175573620';



function generateUniqueReferralCode() {
  
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const codeLength = 6;
  let ReferralCode = '';

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    RTCDTMFSendereferralCode += characters.charAt(randomIndex);
  }

  return ReferralCode;
}

const userlogin=(req,res)=>{
    res.render("user/login")
}

const userRegister=(req,res)=>{
    res.render("user/register")
}

const forgotPassword=(req,res)=>{
  res.render("user/forgotPassword")
}

const getCredentials = async (req, res) => {
  try {
    const email = req.body.email;
    console.log("email",email);
    const user = await User.find({email:email})
    console.log("user",user)
    console.log("ee",user[0].username)
    if(!user){
      return res.send('User not found.');
    }

    
    // Send an email with the user's credentials
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
          user: 'vukavitha98@gmail.com',
          pass: 'pevhkzkipskwfwkl',
      },
  });
console.log("transporter",transporter)
console.log("userrrr",user[0].username)
  const mailOptions = {
      from: 'vukavitha98@gmail.com',
      to: email,
      subject: 'Your Credentials',
      text: `Username: ${user[0].username}\nPassword: ${user[0].password}`,
  };
  console.log("mailOptions",mailOptions)

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.log(error);
          return res.send('Error sending email.');
      } else {
          console.log('Email sent: ' + info.response);
          return res.send('Email sent with user credentials.');
      }
  });
} catch (err) {
      console.log(err);
      res.render("user/login", { message: "An error occurred, please try again" });
  }
}


const login = async (req, res) => {
    const { username, password } = req.body;
    
  
    try {
      const categories=await Category.find({isDeleted:false})
      const products=await productModel.find({isDeleted:false})
      
      
      const user = await User.findOne({ username }); // Create a query object to find the user by email
      console.log(user);
  
      if (!user || user.password !== password) {
        return res.render("user/login", { message: "Invalid email or password" });
      }
      if(user.isDeleted){
        return res.render("user/login", { message: "You have been bloked by admin" });
      }
  
      req.session.userLogin = true;
      const userLogin = req.session.userLogin;
      const name = user.username;
      req.session.username=name;
      req.session.password=user.password;
      req.session.userId = user._id;


      if (!user.ReferrelCode) {
        user.ReferrelCode = generateUniqueReferralCode();
        await user.save();
      }

      res.redirect("/home");
    } catch (err) {
      console.log(err);
      res.render("user/login", { message: "An error occurred, please try again" });
    }
  };


  const home = async(req, res) => {
    try {
        const userLogin = req.session.userLogin;
      console.log(userlogin)
      const categories=await Category.find({isDeleted:false})
      const products=await productModel.find({isDeleted:false})
      const featuredProducts = await productModel.find({featured : true});
    const newProducts = await productModel.find({ newProducts : true})
    const onSale = await productModel.find({ onSale : true})
    const banners = await Banner.find({})
    console.log("BANNERS",banners)
 
        res.render('user/home', { banners,searchResults:null, userLogin, name:req.session.username,categories,products, featuredProducts, newProducts, onSale });
    } catch (error) {
        console.log(error.message);
    }
};



const newuser = async (req, res) => {
  try {
    const { username, email, password, ReferralCode } = req.body;
    let number = "91" + req.body.number;
    let existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.render("user/register", { message: "User already exists" });
    }

    let ReferredByUser = null;
    if (ReferralCode) {
      ReferredByUser = await User.findOne({ ReferrelCode: ReferralCode });
      console.log("ReferredByUser", ReferredByUser);
      if (!ReferredByUser) {
        return res.render("user/register", {
          message: "Invalid referral code",
        });
      }
    }

    const user = new User({
      username,
      email,
      number,
      password,
      wallet: 50, 
    });

    if (ReferredByUser) {
      ReferredByUser.wallet += 100;
      await ReferredByUser.save();
    }

    await user.save();
    let message = "New user created";

    res.render("user/login", {
      message: message,
      userLogin: req.session.userLogin,
      user: req.session.user,
      name: req.session.username,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
};




const sample = async(req, res) => {
  try {

    req.session.phoneNumber = req.body.number;
	
    const otp = generateOTP();
    req.session.otp = otp;
    req.session.otp = otp;
  client.messages
    .create({
      body: `Your OTP is: ${otp}`, 
      from: '+14175573620',
      to: req.session.phoneNumber
    })
    .then(message => {
      console.log('OTP sent successfully:', message.sid);
      console.log('OTP after generating:', otp); // Changed the log statement here
      res.render('user/otplogin');
    })
    .catch(err => {
      console.error('Error sending OTP:', err);
      res.redirect('/login');
    });

} catch(err){
  console.log(err)
}
}
 

const verifyOtp = async (req, res) => {
  try {
    console.log("from session",req.session.phoneNumber)
    const userEnteredOTP = [
      req.body.otp1,
      req.body.otp2,
      req.body.otp3,
      req.body.otp4
    ].join("");
    console.log("eeeeeeeee",userEnteredOTP)
    const otp = req.session.otp.toString();
console.log("userEnteredOTP",userEnteredOTP)
console.log("OTP",otp)
    // Fetch user details based on phone number
    const user = await User.findOne({ number: req.session.phoneNumber.toString() });

    if (user.isDeleted) {
      return res.render("user/login", { message: "You have been blocked by admin" });
    }

    if (userEnteredOTP === otp) {
      
        console.log("success otp")
      req.session.userLogin = true;
      req.session.username = user.username; 
      req.session.userId = user._id;
      const userLogin = req.session.userLogin;
      const categories=await Category.find({isDeleted:false})
      const products=await productModel.find({isDeleted:false})
      const featuredProducts = await productModel.find({featured : true});
    const newProducts = await productModel.find({ newProducts : true})
    const onSale = await productModel.find({ onSale : true})
    const banners = await Banner.find({})
    console.log("BANNERS",banners)
    res.render('user/home', {banners,searchResults:null,userLogin, name:req.session.username,categories,products, featuredProducts, newProducts, onSale });
    } else {
      // OTP verification failed
      res.render("user/otplogin");
    }
  } catch (error) {
    console.error(error);
   // Render an error page or handle the error as needed
  }
};


const search = async (req, res) => {
  try {
    const { search } = req.query;
    console.log("req.query",req.query)
    const searchResults = await productModel.find({
      productName: { $regex: search, $options: 'i' },
      isDeleted: false,
    });
    console.log("searchResults",searchResults)
    const userLogin = req.session.userLogin;
    const categories = await Category.find({ isDeleted: false });
    const products = await productModel.find({ isDeleted: false });
    const featuredProducts = await productModel.find({ featured: true });
    const newProducts = await productModel.find({ newProducts: true });
    const onSale = await productModel.find({ onSale: true });
    const banners = await Banner.find({})

    res.render('user/home', {
      searchResults,
      userLogin,
      name: req.session.username,
      categories,
      products,
      featuredProducts,
      newProducts,
      onSale,
      banners
    });
  } catch (error) {
    console.error('Error occurred during search:', error);
    res.render('user/home', { error: 'An error occurred during search' });
  }
};


function generateOTP() {
  const otpLength = 4; // Set the desired length of the OTP
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < otpLength; i++) {
    otp += Math.floor(Math.random() * 10);  }
  return otp;
}




const userlogout=(req,res)=>{
 
    req.session.destroy()
      res.render("user/login",{message:"User Logout" ,searchResults:null })
    
    
    }

  module.exports={
    userlogin,
    userRegister,
    login,
    home,
    newuser,
    userlogout,
    sample,
    verifyOtp,
    search,
    forgotPassword,
    getCredentials

}