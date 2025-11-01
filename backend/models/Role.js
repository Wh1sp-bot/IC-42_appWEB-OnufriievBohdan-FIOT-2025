const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Role', {
    role_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(50), allowNull: false, unique: true }
  }, { tableName: 'Roles', timestamps: false });
};
