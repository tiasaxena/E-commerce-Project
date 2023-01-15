const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.find()
  .then((products) => {
  res.render('shop/product-list', {
    prods: products,
    pageTitle: 'All Products',
    path: '/products',
    isAuthenticated: req.session.isLoggedIn,
    });
  })
  .catch(err =>{
    console.log(err);
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then((product) => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products',
      isAuthenticated: req.session.isLoggedIn,
    });
  })
  .catch(err => console.log('Error in showing the product details', err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
  .then((products) => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      isAuthenticated: req.session.isLoggedIn,
    });
  })
  .catch(err =>{
    console.log(err);
  });
};

exports.getCart = (req, res, next) => {
  req.user
  //here productId holds the entire product document with the id and rest of the product details
  .populate('cart.items.productId')
  .then(user => {
    const products = user.cart.items;
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: products,
      isAuthenticated: req.session.isLoggedIn,
    });
  })
  .catch(err => {
    console.log(err);
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  //send the product to the addtoCart method
  Product.findById(prodId)
  .then(product => {
    return req.user.addToCart(product);
  })
  .then(result => {
    res.redirect('/cart');
  })
  .catch(err => {
    console.log(err);
  })
  
}

exports.postOrder = (req, res, next) => {
  //get the cart items array with all the fields pre-populated
  req.user
  .populate('cart.items.productId')
  .then(user => {
    const products = user.cart.items.map(item => {
      return { product: { ...item.productId._doc }, quantity: item.quantity }
    });
    const order = new Order({
      user: {
        username: req.user.username,
        //mongoose will return only the id of the user model 
        userId: req.user,
      },
      products: products
    });
    return order.save();
  })
  .then((result) => {
    return req.user.clearCart();
  })
  .then(() => {
    res.redirect('/orders');
  })
  .catch(err => {
    console.log(err);
  });
}

exports.postDeleteCartProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.deleteItemFromCart(prodId)
  .then((result) => {
    res.redirect('/cart');
  })
  .catch(err => {
    console.log(err);
  });
}

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId': req.user._id })
  .then(orders => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders,
      isAuthenticated: req.session.isLoggedIn,
    });
  })
  .catch(err => console.log(err))
};