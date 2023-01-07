const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(
      (products) => {
        res.render('shop/product-list', {
          prods: products,
          pageTitle: 'All Products',
          path: '/products'
        });
      }
    )
    .catch( err => console.log(err))
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId; //productId is the variable name given in the routing file of shop
  Product.findByPk(prodId)
  .then( (product) => {
    res.render('shop/product-detail', {
      product: product.dataValues,
      pageTitle: product.dataValues.title,
      path: '/products'
    });
  })
  .catch( err => console.log('Error in showing the product details', err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then( (products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch( err => console.log(err) )
};

exports.getCart = (req, res, next) => {
  req.user
  .getCart()
  .then(cart => {
    return cart.getProducts()
    .then(products => {
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products,
        });
    })
    .catch(err => console.log(err))
  })
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user
  .getCart()
  .then(cart => {
    fetchedCart = cart;
    return cart.getProducts({ where: {id: prodId} })
  })
  .then(products => {
    let product;
    if(products.length > 0) {
      product = products[0];
    }
    
    if(product) {
      const oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;
      return product;
    }
    return Product.findByPk(prodId)
  })
  .then(product => {
    return fetchedCart.addProduct(product, {
      through: { quantity: newQuantity, }
    })
  })
  .then(() => {
    res.redirect('/cart');
  })
  .catch(err => console.log(err));
}

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
  .getCart()
  .then(cart => {
    fetchedCart = cart;
    return cart.getProducts();
  })
  .then(products => {
    return req.user
      .createOrder()
      .then(order => {
        return order.addProduct(products.map(product => {
          product.orderItem = { quantity: product.cartItem.quantity };
          return product;
        }))
      })
      .catch(err => console.log(err));
  })
  // check for the error in the below line
  // .then(result => {
  //   return fetchedCart.setProduct(null);
  // })
  .then(result => {
    res.redirect('/orders');
  })
  .catch(err => console.log(err));
};

exports.postDeleteCartProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
  .getCart()
  .then(cart => {
    return cart.getProducts({where: {id: prodId}})
  })
  .then(products => {
    const product = products[0];
    return product.cartItem.destroy();
  })
  .then((result) => {
    res.redirect('/cart');
  })
  .catch(err => console.log(err))
}

exports.getOrders = (req, res, next) => {
  req.user
  .getOrders({ include: ['products'] })
  .then(orders => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders,
    });
  })
  .catch(err => console.log(err))
};