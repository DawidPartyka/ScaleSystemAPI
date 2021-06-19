const { Model } = require('sequelize');
const config = require('./options/standardConfiguration');

config.modelName = 'UserScale';

class UserScale extends Model {}

UserScale.init({}, config);

module.exports = UserScale;