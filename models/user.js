const { ObjectId } = require('mongodb');
const getDb = require('../util/database').getDb;
class User {
  constructor(username, email, cart, id) {
    this.username = username;
    this.email = email;
    this.cart = cart; //{items: []}
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection('users')
    .insertOne(this);
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    })

    let newQuantity = 1;
    let updatedCartItems = [ ...this.cart.items ];

    if(cartProductIndex >= 0) {
      newQuantity = updatedCartItems[cartProductIndex].quantity + 1; 
      updatedCartItems[cartProductIndex].quantity = newQuantity
    } else {
      updatedCartItems.push({
        productId: ObjectId(product._id),
        quantity: newQuantity
      })
    }

    const updatedCart = {
      items: updatedCartItems
    }
    const db = getDb();

    //update the cart
    return db.collection('users')
    .updateOne(
      { _id: this._id },
      { $set: { cart: updatedCart } }
    )
  }

  getCart() {
    //get the [{product dets, quantity}]
    //dets in product table and quantity in cart field of users table
    const db = getDb();
    //loop throught the user's cart's items and for each productId, fetch the entire document from the product table
    //for that, firstly, store the ids of the products present in the user's cart
    const productIds = this.cart.items.map(item => {
      return item.productId;
    });
    //against each of the productIds, get the entire info of the product from products table
    return db.collection('products')
    .find({ _id: { $in: productIds }})
    .toArray()
    .then(products => {
      return products.map(product => {
        return {
          ...product,
          quantity: this.cart.items.find(item => {
            return item.productId.toString() === product._id.toString();
          }).quantity,
        }
      });
    });
  }

  deleteItemFromCart(productId) {
    const db = getDb();
    let updatedCartItems = [...this.cart.items];
    //get the index of the productId passed
    const cartProductIndex = this.cart.items.findIndex( cp => {
      return productId.toString() === cp.productId.toString();
    })
    updatedCartItems.splice(cartProductIndex, 1);
    
    const updatedCart = {
      items: updatedCartItems
    }
    return db.collection('users')
    .updateOne(
      {_id: this._id},
      { $set: { cart: updatedCart }}
    );
  }

  makeOrder() {
    const db = getDb();
    return this.getCart()
    .then(products => {
      const order = {
        items: products,
        user: {
          _id: this._id,
          username: this.username,
        }
      };
      return db.collection('orders')
      .insertOne(order)
    })
    .then( result => {
      this.cart = { items: [] };
      return db.collection('users')
      .updateOne(
        {_id: this._id},
        { $set: {cart: {items: []}} }
      );
    });
  }

  getOrders() {
    const db = getDb();
    return db.collection('orders')
    .find({'user._id': this._id})
    .toArray();
  }

  static findById(userId) {
    const db = getDb();
    return db.collection('users')
    //findOne does not return a cursor because we are sure that only one document is received back. So, no need to use next.
    .findOne({
      _id: ObjectId(userId)
    })
    .then(user => {
      return user;
    })
    .catch(err => {
      console.log(err);
    })
  }
}

module.exports = User;