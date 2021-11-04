const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('./options/standardConfiguration');

class Cover extends Model {}

config.modelName = 'Cover';

Cover.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ext: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, config);

module.exports = Cover;