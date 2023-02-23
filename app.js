const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
//* The csurf package looks not only into the req,body but also the query parameters
const csrf = require('csurf'); //prevents from CSRF attacks
const flash = require('connect-flash'); //flash is a special area of session for storing messages 

require('dotenv').config();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/user');
const errorController = require('./controllers/error');
const multer = require('multer');
const app = express();
const store = new MongoDBStore({
    uri: process.env.MONGODB_CONNECTION_URI,
    collection: 'sessions',
});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    //null is the error message that is thrown to inform multer that something is wrong with the incoming and it should not store it.
    //Since it is null, the file will be stored as such.
    //'images  is the name of the folder under which the file will be stored
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    //Date will the truly unique hash created.
    callback(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, callback) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    //true tells that the file must be stored as it has nothing wrong with it
    callback(null, true);
  } else {
    //false tells that the file must not be stored as it has wrong extension type which we do not support.
    callback(null, false);
  }
}

app.set('view engine', 'ejs');

//second arguement changes as per the folder name of the <views> folder here
app.set('views', 'views');

//urlencoded data(text data) is submitted -> if a form is submitted, all the fields, even the media and urls ones are all stored in text encoded format
app.use(bodyParser.urlencoded({ extended: false }));

//Initialise middleware for multer
//.single means that in forms we expect to get single files and not multiple files.
//'image' is actually the the value of the name attribute which we have set on in the form.
// app.use(multer({ dest: 'images' }).single('image'));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

//serves up all the css files
//public name changes as per the <public> foldername
app.use(express.static(path.join(__dirname, 'public')));

//serve all the images statically as if they were present in the root folder
//first arguement means that all the images found in the image folder will be served statically
app.use('/images', express.static(path.join(__dirname, 'images')));

//HERE WE INITIALIZE THE SESSION MIDDLEWARE
//the session middleware listens to every incoming requests
//we execute the session as a function to which we pass parameters
//the secret is used for signing the hash which secretly stored the ID in the cookie
//the session keyword in auth.js is added by this middleware, which listens and responds to each of the incoming requests.
//RESAVE: false --> the session will not be saved on every request that is done but only if something is changed in the session, this will improve the performance.
//SAVEUNINITIALIZED --> ensures that no session gets saved for a request where it doesn't need to be saved because nothing was changed about it
app.use(session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
    //this session middleware automatically adds a cookie.
    //the cookie can also be configured, like so
    // cookie: {
    //      configurations done here
    // }
}));

//we need to add the csrf token to all the views wherever potential sensitive post requests are made
app.use(csrfProtection);

app.use(flash());

app.use((req, res, next) => {
  //these will be locally available for the views of the website
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        //Error Handling -> might happend that user does not exists even at this point(the user is deleted from database midway)
        if(!user) {
          return next();
        }
        req.user = user;
        next();
      })
      .catch(err => {
        // throw new Error(err); //this will fail to invoke the global error handling middleware
        next(new Error(err));
      });
});

app.use('/admin', adminRoutes);

app.use(shopRoutes);

app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

//special type of middleware that is looked after by express.
//when multiple error handling middlewares are there, they will be executed form top to bottom.
//This code will be invoked by all the throws
//NOTE: the throw keyword inside catch of the session middleware in this file will though not invoke this error handling middleware.
//Throw keyword inside the async code does not invoke the error handling middleware.
//Work Around: next(new Error(error)) works inside of async code.
//JIST: Outside async -> use direct 'throw' and inside async(Promise, Callbacks, then or catch block), wrap it inside next()
app.use((error, req, res, next) => {
  res.redirect('/500');
})

//connects to the same mongoDB setup but with mongoose this time
mongoose.connect(process.env.CONNECTION_URI)
.then(result => {
    app.listen(process.env.PORT, () => {
        console.log(`App is listening to Port ${process.env.PORT}`)
    });
})
.catch(err => {
    console.log(err);
});