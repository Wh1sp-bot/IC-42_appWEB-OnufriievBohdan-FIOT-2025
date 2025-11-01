const { User } = require('../models');
const bcrypt = require('bcrypt');

module.exports = {
  list: async (req, res, next) => {
    try {
      // support query by login or email
      const where = {};
      if (req.query.login) where.login = req.query.login;
      if (req.query.email) where.email = req.query.email;
      const users = Object.keys(where).length ? await User.findAll({ where }) : await User.findAll();
      res.json(users);
    } catch (err) { next(err); }
  },

  get: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ message: 'Not found' });
      res.json(user);
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      const { login, email, password, role_id } = req.body;
      if (!login || !password) return res.status(400).json({ message: 'login and password required' });
      const existing = await User.findOne({ where: { login } });
      if (existing) return res.status(409).json({ message: 'User exists' });
      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({ login, email, password_hash: hash, role_id: role_id || 2 });
      // remove password_hash from response
      const obj = user.toJSON(); delete obj.password_hash;
      res.status(201).json(obj);
    } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try {
      const { password, ...rest } = req.body;
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ message: 'Not found' });
      if (password) {
        const hash = await bcrypt.hash(password, 10);
        await user.update({ ...rest, password_hash: hash });
      } else {
        await user.update(rest);
      }
      const obj = user.toJSON(); delete obj.password_hash;
      res.json(obj);
    } catch (err) { next(err); }
  },

  remove: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ message: 'Not found' });
      await user.destroy();
      res.status(204).send();
    } catch (err) { next(err); }
  }
};
