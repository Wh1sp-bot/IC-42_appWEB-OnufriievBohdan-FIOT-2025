const { User } = require('../models');
const bcrypt = require('bcrypt');

module.exports = {
  login: async (req, res, next) => {
    try {
      const { login, password } = req.body;
      if (!login || !password) return res.status(400).json({ message: 'login and password required' });
      const user = await User.findOne({ where: { login } });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
      const obj = { user_id: user.user_id, login: user.login, email: user.email, role_id: user.role_id, created_at: user.created_at };
      res.json(obj);
    } catch (err) { next(err); }
  }
};
