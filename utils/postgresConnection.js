const { Sequelize } = require('sequelize');

const dotenv = require('dotenv');

dotenv.config();

module.exports = new Sequelize(process.env.DBNAME, process.env.DBUSER, process.env.DBPASS, {
    host: process.env.DBHOST,
    dialect: process.env.DBDIAL,
    logging: process.env.DBLOG ? (process.env.DBLOG === 'true') : false
});