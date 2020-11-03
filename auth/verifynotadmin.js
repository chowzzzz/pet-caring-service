function verifyNotAdmin() {
  return function (req, res, next) {
    if (req.user.userType == "User") {
      return next()
    }
    
    res.redirect('/')
  }
}

module.exports = verifyNotAdmin;