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

router.post('/cart', isAuth, shopController.postCart);

router.post('/delete-cart-item', isAuth, shopController.postDeleteCartProduct);

router.post('/create-order', isAuth, shopController.postOrder);

module.exports = router;