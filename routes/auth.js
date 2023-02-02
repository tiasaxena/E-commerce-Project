const express = require('express');
//here you can add only head, body, cookie, params, etc. to test the specific type of requests
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');4
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset/:token', authController.getNewPassword);

router.get('/reset', authController.getReset);

router.post( '/login',
    [
      body('email')
        .isEmail()
        // .normalizeEmail()
        .withMessage('Please enter a valid email address.'),
      body('password', 'Password has to be valid.')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
    ],
    authController.postLogin
  );
  

router.post('/logout', authController.postLogout);

//check will look for 'email' in all the headers, cookies, requests, basically everywhere
router.post('/signup',
        [
            check('email')
            .isEmail()
            // .normalizeEmail()
            .withMessage('Please enter a valid message.')
            .custom((value, {req} ) => {
                // if(value === "test@test.com") {
                //     throw new Error('This email address is forbidden!');
                // }
                return User.findOne({ email: value })
                .then(userDoc => {
                    if(userDoc) {
                        return Promise.reject(
                            'Email already exists! Please pick a different one.'
                        );
                    }
                });
            }),
            //the second param : body, params, header, check, etc. holds the default error messages that must flash in case either of the checks set up in the chain fails
            body(
                'password',
                'Please enter a password with only numbers and text of length atleast 5'
            )
                .isLength({ min: 5 })
                .isAlphanumeric()
                .trim(),
            body('confirmPassword').custom((value, {req}) => {
                if(value !== req.body.password) {
                    throw new Error('Passwords do not match!');
                }
                return true;
            })
        ],
       authController.postSignup
    );

router.post('/reset', authController.postReset);

router.post('/new-password', authController.postNewPassword);

module.exports = router;