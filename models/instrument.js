const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('./options/standardConfiguration');

config.modelName = 'Instrument';

class Instrument extends Model {}

Instrument.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    strings: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    }
}, config);

module.exports = Instrument;