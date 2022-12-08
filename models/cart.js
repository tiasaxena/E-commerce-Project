const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    // name of the file with which you want the data to be stored
    'cart.json'
);

// For making the product, with each new product, we needed to create a new object everytime. However, here we need not instantiate objects ewach time when a propduct is added to the cart. So we don't need to make a constructor. Rather, we will directly read form file.
module.exports = class Cart {
    //A static method (or static function) is a method defined as a member of an object but is accessible directly from an API object's constructor, rather than from an object instance created via the constructor.
    static addProduct(id, productPrice) {
        //fetch the previous cart items by reading the file at 'p' path
        fs.readFile(p, (err, fileContent) => {
            //declare the structure of cart
                //products is an array of objects
            let cart = { products: [], totalPrice: 0 };
            //if cart if found to exist
            if(!err) {
                cart = JSON.parse(fileContent);
            }

            //check if there is already an existing product
            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct; //data structure same as product

            //if product already exists, then update the product by increasing the quantity by one
            if(existingProduct) {
                updatedProduct = { ...existingProduct };
                updatedProduct.qty = updatedProduct.qty + 1;
                //update the cart
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                //if the item does not exists
                updatedProduct = { id: id, qty: 1};
                //add to the cart the new product to update the cart
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + +productPrice;
            //write to the cart file
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            })
        });
    }
} ;