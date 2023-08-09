// sessionMiddleware.js

const adminlogoff = (req, res, next) => {
    try{
    if (req.session.adminLoggedin) {
        res.redirect('/admin/dashboard');
      
    } else {
    next();
    }
  }catch (error){
    console.log(error.message);
  }
};




const adminlogin = (req,res,next) => {
    try {
        if( req.session.adminLoggedin){
            next();
        } else {
          res.redirect('/admin/login');
        }
      } catch (error) {
        console.log(error.message);
      }
    };
  
  module.exports = {
    adminlogoff,
  adminlogin
};
  