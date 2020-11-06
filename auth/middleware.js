function authMiddleware() {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }

    res.redirect('/signin')
  }
}

module.exports = authMiddleware;