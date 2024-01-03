const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    next(); // User is authenticated, proceed to the next middleware
  } else {
    // User is not authenticated, redirect to the login page
    res.redirect("/");
  }
};

const preventAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    // User is already authenticated, redirect to the dashboard
    res.redirect("/dashboard");
  } else {
    next(); // User is not authenticated, proceed to the next middleware
  }
};

module.exports = { requireAuth, preventAuth };
