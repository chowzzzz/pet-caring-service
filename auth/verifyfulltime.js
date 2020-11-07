function verifyFullTime() {
    return function (req, res, next) {
      if (req.user.isFullTime) {
        return next()
      }
      
      res.redirect('/')
    }
  }
  
  module.exports = verifyFullTime