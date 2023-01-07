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
  req.user.getProducts()
  .then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  })
  .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if(editMode === "false"){
    return res.redirect('/');
  }

  const prodId = req.params.productId;
  req.user.getProducts({ where: {id: prodId }})
  .then(products => {
    const product = products[0];
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
  //createProduct is one of the magic associations / special methods / mixins offered by sequelizer.
  //Visit the docs and video: 164
  req.user.createProduct({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
  })
  .then((product) => {
    res.redirect('/admin/products');
  })
  .catch((err) => {
    console.log(err);
  });
};

exports.postEditProducts = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;

  Product.update({
    title: updatedTitle,
    imageUrl: updatedImageUrl,
    description: updatedDescription,
    price: updatedPrice,
  }, {
    where: {
      id: prodId
    }
  })
  .then(() => {
    res.redirect('/admin/products');
  })
  .catch( err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
  .then(product => {
    return product.destroy();
  })
  .then(result => {
    console.log('Item Destroyed!');
    res.redirect('/admin/products');
  })
  .catch(err => console.log(err));
}