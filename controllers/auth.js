//NodeJS's unique library that generates secure and unique random IDs for the users. 
const crypto = require('crypto');

const brcypt = require('bcryptjs'); 
const Mailjet = require('node-mailjet');
const { validationResult } = require('express-validator/check');

require('dotenv').config();
const User = require('../models/user');

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET,
);

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
    oldInput: {
      email: '',
      password: '',
    },
    validationErrors: [],
  });
}

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationErrors: [],
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message,
  });
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }
  })
  .then(user => {
    let message = req.flash('error');
    if(message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token,
    });
  })
  .catch(err => {
    console.log(err);
  });
}

exports.postLogin = (req, res, next) => {
  //after the user logs in, we want to create a session
  const email = req.body.email;
  const password  = req.body.password;

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422)
    .render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: { 
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }
  //check if email is found in the databse
  User.findOne({ email: email })
  .then(user => {
    //check for password if the user is found
    if(!user) {
      return res.status(422)
      .render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: 'Email ID not registered. Please create an account first!',
      oldInput: { 
        email: email,
        password: password,
      },
      validationErrors: [{param: 'email'}],
      });
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
      return res.status(422)
      .render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: 'Password did not match! Please try again.',
      oldInput: { 
        email: email,
        password: password,
      },
      validationErrors: [{param: 'password'}],
      });
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
  
  //check for the errors that rose while validating
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422)
    .render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: { 
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  
  //since we can't decrypt, email IDs are not encrypted 
    //12 are the rounds of salting
  brcypt
  .hash(password, 12)
  .then(hashedPassword => {
    const user = new User({
      email: email,
      password: hashedPassword,
      cart: { items:[] }
    });
    return user.save();
  })
  .then(result => {
    req.flash('error', 'Successfully created account');
    //UNCOMMENT IT LATER
    // mailjet
    //   .post('send', { version: 'v3.1' })
    //   .request({
    //     Messages: [
    //       {
    //         From: {
    //           Email: "verma.sshubam@gmail.com",
    //           Name: "XYZ ShoppersStop"
    //         },
    //         To: [
    //           {
    //             Email: email,
    //             Name: "Check"
    //           }
    //         ],
    //         Subject: "Successfully logged in to the Shopping site",
    //         HTMLPart: "<h3>You successfully signed up to ShopperStop!</h3>"
    //       }
    //     ]
    //   })
    //   .then((result) => {
    //     console.log('Account created successfully!');
    //   })
    //   .catch((err) => {
    //       console.log('err', err);
    //   })
    return res.redirect('/login');
  })
  .catch(err => {
    console.log(err);
  });
};

exports.postReset = (req, res, next) => {
  //generate random taken and save it to the user model
  //32 is the bytes
  crypto.randomBytes(32, (err, buffer) => {
    if(err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex'); //converts the buffer to string in hex form
    //find if the email entered in the user form actually exists or not
    User.findOne({
      email: req.body.email,
    })
    .then(user => {
      if(!user) {
        req.flash('error', 'No account with the entered email found!');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    })
    .then(result => {
      console.log(token);
      res.redirect('/');
      mailjet.post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: "verma.sshubam@gmail.com",
              Name: "XYZ ShoppersStop"
            },
            To: [
              {
                Email: req.body.email,
                Name: "Check"
              }
            ],
            Subject: "Reset Password of ShopperStop",
            HTMLPart: `<p> You requested a password reset! </p> <p> Click the below <a href="http://localhost:${process.env.PORT}/reset/${token}"> link </a> to set a new password. </p>`
          }
        ]
      })
    })
    .then(result => {
      console.log('Email for password change sent!');
    })
    .catch(err => {
      console.log(err);
    })
  })
}

exports.postNewPassword = (req, res, next) => {
  let resetUser;
  const newPassword = req.body.password;
  const userId = req.body.userId;
  //we also need the token here, else by hit and trial of random token, people might reach the same route, change the password of random people on the backend.
  const passwordToken = req.body.passwordToken;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
  .then(user => {
    resetUser = user;
    return brcypt.hash(newPassword, 12);
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(reseult => {
    req.flash('error', 'Password changed succesfully!');
    res.redirect('/login');
  })
  .catch(err => {
    console.log(err);
  })
}