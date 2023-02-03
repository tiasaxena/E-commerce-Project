const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.find()
  .then((products) => {
  res.render('shop/product-list', {
    prods: products,
    pageTitle: 'All Products',
    path: '/products',
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
      //since the below 2 options are needed to be passed through every request, we will shift this to the app.js
      // isAuthenticated: req.session.isLoggedIn,
      //this function is provided by the middleware we initialized in app.js
      // csrfToken: req.csrfToken(),
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
    });
  })
  .catch(err => {
    console.log(err);
  });
};

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId': req.user._id })
  .then(orders => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders,
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = 'invoice-' + orderId + '.pdf';
  const invoicePath = path.join('data', 'invoices', invoiceName);

  Order.findById(orderId)
  .then(order => {
    if(!order) {
      return next(new error('No order found!'));
    }
    if(String(order.user.userId) !== String(req.user._id)) {
      return next(new Error('Unauthorized!'))
    }

    //Reading entire files will increase the load times and will not provide good experience to the user with increase in the load time.
    // fs.readFile(invoicePath, (err, data) => {
      //   //'data' is read in the form of buffer
      //   if(err) {
        //     return next(err);
        //   }
        //   //tells the browser about the content -> it's a PDF
        //   res.setHeader('Content-Type', 'application/pdf');
        //   //'inline' means that the pdf will be opened in the browser.
        //   // if 'inline' is replaced with 'attachment', the pdf would be downloadable
        //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
        //   res.send(data);
        // });
        
        //Hence, we use, buffer stream
        // const file = fs.createReadStream(invoicePath);
        // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
        // file.pipe(res);

        //Using PDFKit
        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '" ');
        pdfDoc.pipe(fs.createWriteStream(invoicePath)); 
        pdfDoc.pipe(res);

        pdfDoc.fontSize(20).text('Invoice', {
          underline: true,
        });
        pdfDoc.text('-------------------------------------------');
        let totalPrice = 0;
        order.products.forEach(prod => {
          totalPrice += prod.quantity * prod.product.price;
          pdfDoc.text(
            prod.product.title + 
            ' - ' + 
            prod.quantity + 
            ' x ' + 
            ' $ ' + 
            prod.product.price
          );
        });
        pdfDoc.text('----');
        pdfDoc.text('Total Price: $' + totalPrice);

        pdfDoc.end();
  })
  .catch(err => {
    throw next(new Error('No order found!'));
  })

}

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
        email: req.user.email,
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