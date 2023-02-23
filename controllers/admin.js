const { validationResult } = require('express-validator');

const fileHelper = require('../util/file');
const Product = require('../models/product');

//the second parameter passed to the render function has nothing to do with the naming and can be named anything. The variables are available in the views folder. 
exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: true,
    product: {
      title: '',
      price: '',
      imageUrl: '',
      description: '',
      userId: req.user, 
    },
    errorMessage: null,
    validationErrors: [],
  });
};

exports.getProducts = (req, res, next) => {
  Product.find({
    userId: req.user._id,
  })
  //product model has user id field, but if we need the entire fields of the userId, we can get it by using population
  // .populate('userId')
  //using select, we can specify the only needful fields that we want.
  .then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if(editMode === "false"){
    return res.redirect('/');
  }

  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(products => {
    const product = products;
    if(!product) {
      return res.redirect('/');
    }
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: false,
      product: products,
      errorMessage: null,
      validationErrors: [],
    });
  })
  .catch(err => {
    // res.redirect('/500');
    const error = new Error(err);
    error.httpStatusCode = 500;
    //if we pass an error instance in next, execution of all the next middleware stops and express looks up to execute that Error Handling Middleware
    return next(error);
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  
  //Handle if the file format in the form is not supported
  if(!image) {
    return res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: true,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: 'File format not supported! It should be an image.',
      validationErrors: [],
    });
  }

  const imageUrl = image.path;

  if(!errors.isEmpty()) {
    return res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: false,
      product: {
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
        userId: req.user, 
      },
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const product = new Product({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    userId: req.user, 
  });

  product.save()
  .then(result => {
    res.redirect('/admin/products');
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
};

exports.postEditProducts = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImage = req.file;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  const errors = validationResult(req);

  if(!updatedImage || updatedImage === undefined) {
    return res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
      },
      errorMessage: 'File format not supported! It should be an image.',
      validationErrors: [],
    });
  }

  const updatedImageUrl = updatedImage.path;

  if(!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        imageUrl: updatedImageUrl,
        description: updatedDescription,
        _id: prodId, 
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  //authorize that the item to be editted is actually created by the currently logged in the user
  Product.findOne({
    _id: prodId
  })
  .then(product => {
    if(String(product.userId) !== String(req.user._id)) {
      return res.redirect('/');
    }

    product.title = updatedTitle;
    product.price = updatedPrice;
    if(updatedImage) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = updatedImageUrl;
    }
    product.description = updatedDescription;

    return product.save()
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
};

exports.deleteProduct = (req, res, next) => {
// exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  //find if file exists
  //if it does, remove from the images folder also
  Product.findById(prodId)
  .then(product => {
    if(!product) {
      return next(new Error('Product not found!'));
    }
    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({
      _id: prodId,
      userId: req.user._id,
    })
  })
  .then(() => {
    // res.redirect('/admin/products');

    //the normal object will be changed to json using .json 
    res.status(200).json({ message: 'Success!' });
  })
  .catch(err => {
    // const error = new Error(err);
    // error.httpStatusCode = 500;
    // return next(error);
    res.status(500).json({ message: 'Deleting product failed.' });
  })
}