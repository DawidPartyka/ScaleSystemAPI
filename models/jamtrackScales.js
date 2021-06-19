const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('./options/standardConfiguration');

class JamtrackScales extends Model {}

config.modelName = 'JamtrackScales';

JamtrackScales.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    ScaleTimestamp: {
        type: DataTypes.STRING,
        allowNull: false
    },
    JamtrackId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    ScaleId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    tonic: {
        type: DataTypes.SMALLINT,
        allowNull: false
    }
}, config);

module.exports = JamtrackScales;

