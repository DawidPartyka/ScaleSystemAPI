const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('./options/standardConfiguration');

config.modelName = 'JamtrackArtists';

class JamtrackArtists extends Model {}

JamtrackArtists.init({}, config);

module.exports = JamtrackArtists;