const Product = require('../models/product');

//the second parameter passed to the render function has nothing to do with the naming and can be named anything. The variables are available in the views folder. 
exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.getProducts = (req, res, next) => {
  Product.find()
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
  .catch(err =>{
    console.log(err);
  });
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
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product,
    });
  })
  .catch(err => console.log(err));
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

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
    console.log(err);
  })
};

exports.postEditProducts = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;

  Product.updateOne(
    { _id: prodId },
    {
      title: updatedTitle,
      imageUrl: updatedImageUrl,
      price: updatedPrice,
      description: updatedDescription,
    }
  )
  .then(() => {
    res.redirect('/admin/products');
  })
  .catch(err => {
    console.log(err);
  });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndDelete(prodId)
  .then(() => {
    res.redirect('/admin/products');
  })
  .catch(err => {
    console.log(err);
  });
}