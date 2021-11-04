const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('./options/standardConfiguration');

config.modelName = 'UserLog';

class UserLog extends Model {}

UserLog.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    action: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    ip: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIP: true
        }
    },
    additionalData: {
        type: DataTypes.STRING,
        allowNull: true
    },
    responseStatus: {
        type: DataTypes.SMALLINT,
        defaultValue: 200,
        validate: {
            isNumeric: true,
            min: 100,
            max: 599
        }
    }
}, config);

module.exports = UserLog;

