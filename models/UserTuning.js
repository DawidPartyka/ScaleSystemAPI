const { Model } = require('sequelize');
const config = require('./options/standardConfiguration');

config.modelName = 'UserTuning';

class UserTuning extends Model {}

UserTuning.init({}, config);

module.exports = UserTuning;