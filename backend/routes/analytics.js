const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/trendController');

router.get('/', ctrl.getAnalytics);

module.exports = router;
