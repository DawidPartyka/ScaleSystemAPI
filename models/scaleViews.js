const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('./options/standardConfiguration');

config.modelName = 'ScaleViews';

class ScaleViews extends Model {}

ScaleViews.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    }
}, config);

module.exports = ScaleViews;