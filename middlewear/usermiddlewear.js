const userlogout = (req, res, next) => {
    try {
        if (req.session.userLogin) {
            res.redirect('/home');
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
  };
  
  const userlogin = (req, res, next) => {
    try {
        if (req.session.userLogin) {
            next();
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.log(error.message);
    }
  };
  
  module.exports = {
    userlogin,
    userlogout,
  };
  