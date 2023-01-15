const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  console.log('get login', req.session.isLoggedIn);
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn,
  });
}

exports.postLogin = (req, res, next) => {
  //after the user logs in, we want to create a session
  User.findById('63c01c371ad2b43a1815cfb8')
  .then(user => {
    req.session.user = user;
    req.session.isLoggedIn = true;
    req.session.save((err) => {
      console.log(err);
      res.redirect('/');
    })
  })
  .catch(err => {
    console.log(err);
  })

  //HERE WE USE THE SESSION MIDDLEWARE
  // req.session.isLoggedIn = true;
  //HERE WE INITIALIZE THE COOKIE
  //With every request that we make, the cookie is sent to the browser. It is a cross request data storage
  // res.setHeader('Set-Cookie', 'loggedIn=true');
  // res.redirect('/');
}

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  })
}