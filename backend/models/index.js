const { Sequelize } = require('sequelize');
const RoleModel = require('./Role');
const ProgramModel = require('./Program');
const ExerciseModel = require('./Exercise');
const UserModel = require('./User');
const AuditLogModel = require('./AuditLog');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: false
});

const Role = RoleModel(sequelize);
const Program = ProgramModel(sequelize);
const Exercise = ExerciseModel(sequelize);
const User = UserModel(sequelize);
const AuditLog = AuditLogModel(sequelize);

// Associations
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

Program.hasMany(Exercise, { foreignKey: 'program_id', as: 'exercises' });
Exercise.belongsTo(Program, { foreignKey: 'program_id', as: 'program' });

User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { sequelize, Role, Program, Exercise, User, AuditLog };
