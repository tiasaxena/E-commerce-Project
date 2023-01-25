const brcypt = require('bcryptjs'); 

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
  });
}

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  //after the user logs in, we want to create a session
  const email = req.body.email;
  const password  = req.body.password;

  //check if email is found in the databse
  User.findOne({ email: email })
  .then(user => {
    //check for password if the user is found
    if(!user) {
      req.flash('error', 'Email ID not registered. Please create an account first!');
      return res.redirect('/login');
    }
    brcypt.compare(password, user.password)
    .then(matchFound => {
      if(matchFound) {
        //create the session
        req.session.isLoggedIn = true;
        req.session.user = user;
        //save the session
        return req.session.save(err => {
          console.log(err);
          res.redirect('/');
        });                                               
      }
      req.flash('error', 'Wrong password.');
      return res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
      res.redirect('/login');
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

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  //check if user already exists
  User.findOne({
    email: email
  })
  .then(userDoc => {
    if(userDoc) {
      req.flash('error', 'E-Mail already exists! Please pick a new one.');
      return res.redirect('/signup');
    }
    //since we can't decrypt, email IDs are not encrypted 
    //12 are the rounds of salting
    return brcypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items:[] }
      });
      return user.save();
    })
    .then(result => {
      req.flash(null);
      res.redirect('/login');
    })
  })
  .catch(err => {
    console.log(err);
  })
};