const { DataTypes } = require('sequelize');

module.exports = {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    foreignKey: {
        type: DataTypes.UUID,
        allowNull: false
    }
}