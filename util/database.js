const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('node-complete', 'root', process.env.PASSWORD, {
    dialect: 'mysql',
    host: 'localhost',
})

//Here sequelize is esssentially the database connection pool however managed by sequelizer, giving us bunch of useful features.
module.exports = sequelize;