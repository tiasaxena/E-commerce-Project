const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
//serves up all the css files
app.use(express.static(path.join(__dirname, 'public')));

//The app.use(path, callback) function is used to mount the specified middleware function(s) at the path which is being specified
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(5000, () => {
    console.log('Server listening on port 5000')
});