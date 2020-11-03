function verifyAdmin() {
  return function (req, res, next) {
    if (req.user.userType == "Admin") {
      return next()
    }
    
    res.redirect('/')
  }
}

module.exports = verifyAdmin;