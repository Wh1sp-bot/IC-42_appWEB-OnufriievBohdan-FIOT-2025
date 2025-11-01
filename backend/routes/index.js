const express = require('express');
const router = express.Router();
router.use('/roles', require('./roles'));
router.use('/programs', require('./programs'));
router.use('/exercises', require('./exercises'));
router.use('/users', require('./users'));
router.use('/auditlogs', require('./auditlogs'));
router.use('/auth', require('./auth'));
module.exports = router;
