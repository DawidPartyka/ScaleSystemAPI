const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('./options/standardConfiguration');

config.modelName = 'CustomScale';

class CustomScale extends Model {}

CustomScale.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    scaleJsonScheme: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    tonic: {
        type: DataTypes.SMALLINT,
        allowNull: false
    }
}, config);

module.exports = CustomScale;