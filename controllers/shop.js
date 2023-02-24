const fs = require('fs');
const path = require('path');

require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);  

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

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
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

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
}

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
}

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

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate('cart.items.productId')
    .then(user => {
      products = user.cart.items;
      total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      });
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: products.map(p => {
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: p.productId.title, 
                description: p.productId.description,
              },
              unit_amount: p.productId.price * 100,
            },
            quantity: p.quantity
          };
        }),
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
      });
    })
    .then(session => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch(err => {
      console.log('CHECKOUT', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      console.log('CHECKOUT SUCESS', err)
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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