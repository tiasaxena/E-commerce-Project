const path = require('path');
const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

// // /admin/edit-product => GET
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// /admin/add-product => POST
router.post('/add-product', adminController.postAddProduct);

// // /admin/edit-product => POST
router.post('/edit-product', adminController.postEditProducts);

// // /admin/delete-product => POST
router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;
