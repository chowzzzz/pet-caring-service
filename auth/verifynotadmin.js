function verifyNotAdmin() {
  return function (req, res, next) {
    if (req.user.userType == "Admin") {
      res.redirect('/')
    }
    
    return next();
  }
}

module.exports = verifyNotAdmin;