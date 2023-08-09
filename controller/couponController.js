const User = require('../models/user');
const Order = require('../models/order');
const productModel = require('../models/product')
const { Coupon } = require('../models/coupons');



const getCoupon = async(req,res)=>{
    try{
        const Coupons = await Coupon.find({})
      
        res.render("admin/coupons", {Coupons})
    } catch (err) {
        // Handle error here
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

const addCoupon = async (req,res)=>{
    try{
        
        const {couponCode , discountPercentage, validFrom, validUntil} = req.body
        
        const existingCoupon = await Coupon.findOne({couponCode})
        if(existingCoupon){
            const errorMessage = 'Coupon code already exists';
            return res.render('admin/coupons', { Coupons, errorMessage: 'Coupon code already exists' });
        }
        // Create a new Coupon
        const newCoupon = new Coupon ({
            couponCode , 
            discountPercentage, 
            validFrom, 
            validUntil  
        })
            // Save the new coupon to the database
            const savedCoupon = await newCoupon.save();
            res.redirect('/admin/coupons')
    } catch (err){
        console.error(err);
        res.status(500).send("Internal Server Error")
    }
}


const editCoupon = async(req,res) => {
    try{
        const coupon = await Coupon.findById(req.params.id)
        if (!coupon) {
            return res.status(404).send('Coupon not found');
          }
          const {editCouponCode , editDiscountPercentage, editValidFrom, editValidUntil} = req.body
          coupon.couponCode = editCouponCode,
          coupon.discountPercentage = editDiscountPercentage,
          coupon.validFrom = editValidFrom,
          coupon.validUntil = editValidUntil;

          await coupon.save();
      
          res.redirect("/admin/coupons")
        } catch (err) {
          // Handle error here
          console.error(err);
          res.status(500).send('Internal Server Error');
        }
      };

      
      

module.exports = {
    getCoupon,
    addCoupon,
    editCoupon,
    
}