const fs = require('fs');
const path = require('path');
const Cart = require('./cart');

const db = require('../util/database');

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

//either in the constructor or in the save() method, we should pass a unique identifier. For now, let's make add it in the save methods  
module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    //the ? is used to prevent SQL injecion attack as in the inputs SQL commands get inputed cus of which data can be leaked upon execution of the queries. 
    return db.execute(
      'INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)', 
      [this.title, this.price, this.imageUrl, this.description]
    );
  }

  //delete a product
  static deleteById(id) {
    getProductsFromFile(products => {
      //extract the product that matches the id
      const product = products.find(prod => prod.id === id);
      const updatedProducts = products.filter(prod => prod.id !== id);
      fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        // if upadted products are displayed successfully, then we can also proceed to delete the item from the cart if it is found there
        if(!err) {
          Cart.deleteProduct(id, product.price);
        }
      })
    })
  }

  static fetchAll() {
    return db.execute('SELECT * FROM products');
  }

  static findById(id) {
    return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
  }
};
