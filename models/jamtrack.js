const { Sequelize, Model, DataTypes } = require('sequelize');
const path = require('path');
const config = require('./options/standardConfiguration');

config.modelName = 'Jamtrack';

class Jamtrack extends Model {}

Jamtrack.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    serverLocation: {
        type: DataTypes.STRING,
        allowNull: false
    },
    size: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    ext: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    bpm: {
        type: DataTypes.STRING,
        allowNull: false
    },
    duration: {
        type: DataTypes.STRING(10),
        allowNull: false
    }
}, config);

module.exports = Jamtrack;