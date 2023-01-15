const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const PORT = 3000;
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
})


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

app.use((req, res, next) => {
    if(req.session.user === undefined) {
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        console.log('user', user);
        req.user = user;
        next();
    })
    .catch(err => {
        console.log(err);
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

//connects to the same mongoDB setup but with mongoose this time
mongoose.connect(process.env.CONNECTION_URI)
.then(result => {
    User.findOne()
    .then(user => {
        if(!user) {
            const user = new User({
                username: 'Tia Saxena',
                email: 'tia.test@gmai.com',
                cart: { items:[] }
            });
            user.save();
        }
    })
    app.listen(PORT, () => {
        console.log(`App is listening to Port ${PORT}`)
    });
})
.catch(err => {
    console.log(err);
});