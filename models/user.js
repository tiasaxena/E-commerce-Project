const mongoose = require('mongoose');
const { Schema } = require('mongoose');


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                }
            }
        ],
    }
});

userSchema.methods.addToCart = function(product) {
    // this refers to the user object that invoked the method
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    })
    let newQuantity = 1;
    let updatedCartItems = [ ...this.cart.items ];
    if(cartProductIndex >= 0) {
      newQuantity = updatedCartItems[cartProductIndex].quantity + 1; 
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: product._id,
        quantity: newQuantity
      })
    }

    const updatedCart = {
      items: updatedCartItems
    }

    //update the cart
    this.cart = updatedCart;
    this.save();
}

userSchema.methods.deleteItemFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter( cartProduct => {
      return productId.toString() !== cartProduct.productId.toString();
    })
    this.cart.items = updatedCartItems;
    return this.save();
}
userSchema.methods.clearCart = function() {
  this.cart = { items: [] }
  return this.save();
}

module.exports = mongoose.model('User', userSchema);

//   makeOrder() {
//     const db = getDb();
//     return this.getCart()
//     .then(products => {
//       const order = {
//         items: products,
//         user: {
//           _id: this._id,
//           username: this.username,
//         }
//       };
//       return db.collection('orders')
//       .insertOne(order)
//     })
//     .then( result => {
//       this.cart = { items: [] };
//       return db.collection('users')
//       .updateOne(
//         {_id: this._id},
//         { $set: {cart: {items: []}} }
//       );
//     });
//   }

//   getOrders() {
//     const db = getDb();
//     return db.collection('orders')
//     .find({'user._id': this._id})
//     .toArray();
//   }

// module.exports = User;