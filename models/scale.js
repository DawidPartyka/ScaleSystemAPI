const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('./options/standardConfiguration');

config.modelName = 'Scale';

class Scale extends Model {}

Scale.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    sounds: {
        type: DataTypes.STRING(12),
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
},
    config,
);

module.exports = Scale;