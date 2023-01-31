const mongoose = require('mongoose');
const { Schema } = require('mongoose');


const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    resetToken: String,
    resetTokenExpiration: Date, 
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