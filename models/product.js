const { ObjectId } = require('mongodb');

const getDb = require('../util/database').getDb;
class Product{
  constructor(title, price, imageUrl, description, userId) {
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
    this.userId = userId;
  }
  save() {
    const db = getDb();
    return db.collection('products')
      .insertOne(this)
      .then(result => {
      })
      .catch(err => {
      console.log(err);
    })
  }

  static fetchAll() {
    const db = getDb();
    return db.collection('products')
    .find()
    //mongoDb's .find() actually doesn't return a promise but a cursor. For eg, if there are a hundred thousands of documents, then they all can't be dealth at once. So, we prefer pagination. Likewise, in case there are a hundreds of documents, we might want to put them all in an array and get that array returned from the database.
    .toArray()
    .then(products => {
      return products;
    })
    .catch(err => {
      console.log(err);
    })
  }

  static findById(id) {
    const db = getDb();
    return db.collection('products')
    .find({ _id: ObjectId(id) })
    // mongo db does not know if we are getting a single or multiple documents from find.
    // it returns  a cursor. And certainly, we use next() or also forEach() -> (https://www.mongodb.com/docs/manual/tutorial/iterate-a-cursor/)
    // .next() is use to return the next document that is returned by the find function here
    .next()
    .then(product => {
      return product;
    })
    .catch(err => {console.log(err)});
  }

  static update(prodId, title, imageUrl, price, description, userId) {
    const db = getDb();
    return db.collection('products')
    .updateOne(
      {
        _id: ObjectId(prodId)
      },
      {
        $set: {
          title: title,
          imageUrl: imageUrl,
          price: price,
          description: description,
          userId: userId,
        }
      }
    )
  }

  static delete(id) {
    const db = getDb();
    return db.collection('products')
    .deleteOne({
      _id: ObjectId(id)
    })
  }
}

module.exports = Product;