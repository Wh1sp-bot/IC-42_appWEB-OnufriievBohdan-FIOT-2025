const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Program', {
    program_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    difficulty: { type: DataTypes.ENUM('Beginner','Intermediate','Advanced'), allowNull: true },
    created_at: { type: DataTypes.DATEONLY, allowNull: true, defaultValue: DataTypes.NOW }
  }, { tableName: 'Programs', timestamps: false });
};
