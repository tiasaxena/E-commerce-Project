// const mysql = require('mysql2');
// const dotenv = require('dotenv');
// dotenv.config();

//whenever we execute a query, we must close the connection.
//the downside is that because of this, we need to establish and keep re-establishing the connection each time.
//Thus, instead of using createConnection, we rather use createPool which means that the connections are handed bakc into the pool after each query is done and before each query, the connection gets established. After the program is finished, the pool shuts down. So is the name pool.  
// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: process.env.PASSWORD
// });

//we export using promises, because this will allow us to use promises while working with connections here.
//promises handles asynchronous tasks, asynchronous data, instead of callbacks, because promises allows us to write code in a bit more structured way.
//promises provides us with functions like: .then() and .catch() 
// module.exports = pool.promise();