const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const OrderItem = sequelize.define('orderItem', {
    // id : {
    //     type: Sequelize.INTEGER,
    //     autoIncreament: true,
    //     allowNull: false,
    // },
quantity: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
});

module.exports = OrderItem;