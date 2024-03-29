const path = require('path');
const express = require('express');
const router = express.Router();

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

router.get('/', shopController.getIndex);

router.get('/products/:productId', shopController.getProduct);

router.get('/products', shopController.getProducts);

router.get('/cart', shopController.getCart);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/checkout/success', shopController.getCheckoutSuccess);

router.get('/checkout/cancel', shopController.getCheckout);

router.post('/cart', isAuth, shopController.postCart);

router.post('/delete-cart-item', isAuth, shopController.postDeleteCartProduct);

// router.post('/create-order', isAuth, shopController.postOrder);

module.exports = router;