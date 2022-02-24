const { Sequelize, Model, DataTypes } = require('sequelize');
const config = require('./options/standardConfiguration');

config.modelName = 'User';

class User extends Model {}

User.init({
   id: {
       type: DataTypes.UUID,
       defaultValue: Sequelize.UUIDV4,
       primaryKey: true
   },
   mail: {
       type: DataTypes.STRING,
       allowNull: false,
       unique: true,
       validate: {
           isEmail: true
       }
   },
   password: {
       type: DataTypes.STRING,
       allowNull: false
   }
}, config);

module.exports = User;
