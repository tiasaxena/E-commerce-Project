require('dotenv').config();
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const uri = process.env.CONNECTION_URI;
let _db;

//connection to the mongodb server
const mongoConnect = (callback) => {
    //connects us to mongodb
    MongoClient.connect(uri)
    .then(client => {
        // console.log('Connected!');
        //connect to the database 'shop', and if not found, create one
        _db = client.db();
        //this callback will spin the localhost:3000 server up
        callback();
    })
    .catch(err => {
        console.log(err);
    });
}

//connection to the database
const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'NO DATABASE FOUND!'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;