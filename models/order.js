const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Order = sequelize.define('order', {
    // id : {
    //     type: Sequelize.INTEGER,
    //     autoIncreament: true,
    //     allowNull: false,
    //     primaryKey: true,
    // }
});

module.exports = Order;