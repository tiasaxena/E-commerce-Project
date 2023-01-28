const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf'); //prevents from CSRF attacks
const flash = require('connect-flash'); //flash is a special area of session for storing messages 

const PORT = 8000;
require('dotenv').config();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/user');
const errorController = require('./controllers/error');
const app = express();
const store = new MongoDBStore({
    uri: process.env.MONGODB_CONNECTION_URI,
    collection: 'sessions',
});
const csrfProtection = csrf();


app.set('view engine', 'ejs');
//second arguement changes as per the folder name of the <views> folder here
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
//serves up all the css files
//public name changes as per the <public> foldername
app.use(express.static(path.join(__dirname, 'public')));
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
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => console.log(err));
});
app.use((req, res, next) => {
  //these will be locally available for the views of the website
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

//connects to the same mongoDB setup but with mongoose this time
mongoose.connect(process.env.CONNECTION_URI)
.then(result => {
    app.listen(PORT, () => {
        console.log(`App is listening to Port ${PORT}`)
    });
})
.catch(err => {
    console.log(err);
});