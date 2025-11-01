require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const routes = require('./routes');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});
const PORT = process.env.PORT || 4000;
async function start() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error('Unable to connect to DB:', err);
  }
}
start();
