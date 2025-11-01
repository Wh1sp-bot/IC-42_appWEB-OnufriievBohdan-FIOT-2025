const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('AuditLog', {
    log_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    action: { type: DataTypes.STRING(200), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW }
  }, { tableName: 'AuditLogs', timestamps: false });
};
