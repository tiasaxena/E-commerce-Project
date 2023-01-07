const path = require('path');
const PORT = 3000;
const express = require('express');
const bodyParser = require('body-parser');
const sequelize  = require('./util/database'); 
const errorController = require('./controllers/error');
const app = express();
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

app.set('view engine', 'ejs');
//second arguement changes as per the folder name of the <views> folder here
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
//serves up all the css files
    //public name changes as per the <public> foldername
app.use(express.static(path.join(__dirname, 'public')));
//In the below middleware function, we are trying to retrieve the user. Potential question arises that how can we use findByPk outsie and before sequelize? But remember in the middleware function, the function only gets registered and not executed. It will execute only when the incoming request is made. So, npm start will spin up the server, REGISTER the below function and execute the sequelizer firstly. Certainly, till the time we receive some incoming request, the sequelizer has already been executed.  
app.use((req, res, next) => {
    User.findByPk(1)
    .then(user => {
        //req.user is an sequelize onject, which means all the associated functions like destroy(), etc. can be accessed from wherever we call.
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
});
//The app.use(path, callback) function is used to mount the specified middleware function(s) at the path which is being specified
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

//drawing the relations between the user and the product model
//one-to-many relation
User.hasMany(Product);
Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
//one-to-one relation
User.hasOne(Cart);
Cart.belongsTo(User);
//many-to-many relation
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
//one-to-many relation
User.hasMany(Order);
Order.belongsTo(User);
Order.belongsToMany(Product, { through: OrderItem });

//convert the models into table form in the database.
//if the table already exists, won't get overrided unless specified 
sequelize
    //force: true ensures that the previous data gets over ridden by the changes introduced in the database 
    // .sync({ force: true })
    .sync()
    .then((result) => {
        return User.findByPk(1);
    })
    .then(user => {
        if(!user) {
            User.create({ id: 1, name: "Tia Saxena", email: "test@test.com"})
        }
        //below line returns an pbject, while the above line returns a promise, thus consistancy breaks, so we don't use it in that way and rather return the user(which already exists as a promise)
        // return user;
        return Promise.resolve(user);
    })
    .then(user => {
        return user.createCart();
    })
    .then((cart) => {
        app.listen(PORT, () => {
            console.log(`Server running at port ${PORT}`);
        })
    })
    .catch((error) => console.log(error));