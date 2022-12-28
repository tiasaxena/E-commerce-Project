const path = require('path');

const PORT = 3000;

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
//second arguement changes as per the folder name of the <views> folder here
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
//serves up all the css files
    //public name changes as per the <public> foldername
app.use(express.static(path.join(__dirname, 'public')));

//The app.use(path, callback) function is used to mount the specified middleware function(s) at the path which is being specified
app.use('/admin', adminRoutes);

app.use(shopRoutes);

app.use(errorController.get404);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});