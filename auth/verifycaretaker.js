function verifyCaretaker() {
  return function (req, res, next) {
    if (req.user.isCaretaker) {
      return next()
    }
    
    res.redirect('/')
  }
}

module.exports = verifyCaretaker