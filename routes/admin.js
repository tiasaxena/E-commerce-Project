const path = require('path');
const express = require('express');
const router = express.Router();
const { body } = require('express-validator')

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/edit-product => GET
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// /admin/add-product => POST
router.post('/add-product',
    [
        body('title').isString().isLength({ min: 3 }).trim().withMessage('Title should be of minimum 3 length!'),
        // body('imageUrl').isURL().withMessage('The image URL provided is incorrect!'),
        body('price').isFloat().withMessage('Price must be a decimal formatted number!'),
        body('description').isLength({ min: 5, max: 400 }).trim().withMessage('The description must have minimum 5 and maximum 400 length!'),
    ],
    isAuth, 
    adminController.postAddProduct);

// /admin/edit-product => POST
router.post('/edit-product', 
    [
        body('title').isString().isLength({ min: 3 }).trim().withMessage('Title should be of minimum 3 length!'),
        // body('imageUrl').isURL().withMessage('The image URL provided is incorrect!'),
        body('price').isFloat().withMessage('Price must be a decimal formatted number!'),
        body('description').isLength({ min: 5, max: 400 }).trim().withMessage('The description must have minimum 5 and maximum 400 length!'),
    ],
    isAuth,
    adminController.postEditProducts);

// /admin/delete-product => POST
// router.post('/delete-product', isAuth, adminController.postDeleteProduct);
//TODO Now we not delete using our desgined logic, let JS do it for us using https keyword --> 'delete'
//* The delete keyword accepts query parameters but not the req.body
router.delete('/product/:productId', isAuth, adminController.deleteProduct);  

module.exports = router;
