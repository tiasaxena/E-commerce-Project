const fs = require('fs');
const path = require('path');
const Cart = require('./cart');
console.log(Cart);

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

//either in the onctructor or in the save() method, we should pass a unique identifier. For now, let's make add it in the save methos  
module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile(products => {
      if(this.id) {
        const existingProductIndex = products.findIndex(prod => prod.id === this.id);
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        //write to the file
        fs.writeFile(p, JSON.stringify(updatedProducts), err => {
          console.log(err);
        });
      } else {
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), err => {
          console.log(err);
        });
      }
    });
  }

  //delete a product
  static deleteById(id) {
    getProductsFromFile(products => {
      //extract the product that matches the id
      const product =  products.find(prod => prod.id === id);
      const updatedProducts = products.filter(prod => prod.id !== id);
      fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        // if upadted products are displayed successfully, then we can also proceed to delete the item from the cart if it is found there
        if(!err) {
          Cart.deleteProduct(id, product.price);
        }
      })
    })
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  //the callback(cb) function will be executed only when we are done with finding the id of the desired item 
  static findById(id, cb) {
    //we will get all the products from file, by calling the function getproductsFromFile and then the callback, to find the right item with specific id, will be executed when all the items are fetched.
    getProductsFromFile((products) => {
      let product;
      for(let x = 0; x < products.length; x++) {
        if(products[x].id === id) {
          product = products[x]; 
        }
      }
      cb(product);
    });
  }
};
