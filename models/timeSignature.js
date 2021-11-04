const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('./options/standardConfiguration');

config.modelName = 'TimeSignature';

class TimeSignature extends Model {}

TimeSignature.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    signature: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, config);

module.exports = TimeSignature;