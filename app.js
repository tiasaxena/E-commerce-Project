const path = require('path');
const PORT = 3000;
const express = require('express');
const bodyParser = require('body-parser');
const mongoConnect = require('./util/database').mongoConnect;
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User = require('./models/user');
const errorController = require('./controllers/error');
const app = express();

app.set('view engine', 'ejs');
//second arguement changes as per the folder name of the <views> folder here
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
//serves up all the css files
    //public name changes as per the <public> foldername
app.use(express.static(path.join(__dirname, 'public')));
//In the below middleware function, we are trying to retrieve the user. Potential question arises that how can we use findByPk outsie and before sequelize? But remember in the middleware function, the function only gets registered and not executed. It will execute only when the incoming request is made. So, npm start will spin up the server, REGISTER the below function and execute the sequelizer firstly. Certainly, till the time we receive some incoming request, the sequelizer has already been executed.
app.use((req, res, next) => {
    User.findById('63bdc764afddc65104de1a9c')
    .then(user => {
        req.user = new User(user.username, user.email, user.cart, user._id);
        next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

//connect to the mongo server alongwith the server set-up 
mongoConnect(() => {
    app.listen(PORT, (req, res) => {
        console.log(`SERVER IS LISTENING TO ${PORT}`);
    })
})