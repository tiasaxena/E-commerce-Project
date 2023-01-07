const Sequelize = require('sequelize');

const sequelize = require('../util/database');

// .define() is used to define new model
const Product = sequelize.define('product', {
  // id: {
  //   type: Sequelize.INTEGER,
  //   autoIncreament: true,
  //   allowNull: false,
  //   primaryKey: true,
  // }, 
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: false
  },
});

module.exports = Product;