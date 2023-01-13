const path = require('path');
const PORT = 3000;
const express = require('express');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User = require('./models/user');
const errorController = require('./controllers/error');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

app.set('view engine', 'ejs');
//second arguement changes as per the folder name of the <views> folder here
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
//serves up all the css files
    //public name changes as per the <public> foldername
app.use(express.static(path.join(__dirname, 'public')));
//In the below middleware function, we are trying to retrieve the user. Potential question arises that how can we use findByPk outsie and before sequelize? But remember in the middleware function, the function only gets registered and not executed. It will execute only when the incoming request is made. So, npm start will spin up the server, REGISTER the below function and execute the sequelizer firstly. Certainly, till the time we receive some incoming request, the sequelizer has already been executed.
app.use((req, res, next) => {
    User.findById('63c01c371ad2b43a1815cfb8')
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
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