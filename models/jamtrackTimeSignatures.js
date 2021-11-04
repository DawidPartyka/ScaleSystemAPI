const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('./options/standardConfiguration');

config.modelName = 'JamtrackTimeSignatures';

class JamtrackTimeSignatures extends Model {}

JamtrackTimeSignatures.init({}, config);

module.exports = JamtrackTimeSignatures;