const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Exercise', {
    exercise_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    program_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    muscle_group: { type: DataTypes.STRING(100), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true }
  }, { tableName: 'Exercises', timestamps: false });
};
