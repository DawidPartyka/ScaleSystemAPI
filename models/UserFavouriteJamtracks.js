const { Model } = require('sequelize');
const config = require('./options/standardConfiguration');

config.modelName = 'UserFavouriteJamtracks';

class UserFavouriteJamtracks extends Model {};

UserFavouriteJamtracks.init({}, config);

module.exports = UserFavouriteJamtracks;