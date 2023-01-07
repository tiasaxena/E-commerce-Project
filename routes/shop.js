const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products/:productId', shopController.getProduct);

router.get('/products', shopController.getProducts);

router.get('/cart', shopController.getCart);

router.get('/orders', shopController.getOrders);

router.get('/orders', shopController.getOrders);

router.post('/cart', shopController.postCart);

router.post('/delete-cart-item', shopController.postDeleteCartProduct);

router.post('/create-order', shopController.postOrder);

module.exports = router;