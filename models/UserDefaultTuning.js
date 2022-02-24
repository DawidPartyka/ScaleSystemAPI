const { Model } = require('sequelize');
const config = require('./options/standardConfiguration');

config.modelName = 'UserDefaultTuning';

class UserDefaultTuning extends Model {}

UserDefaultTuning.init({}, config);

module.exports = UserDefaultTuning;