const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/trendController');

router.get('/', ctrl.getTrends);
router.get('/top', ctrl.getTopTrends);
router.get('/year/:year', ctrl.getTrendsByYear);
router.get('/search/:tag', ctrl.searchTrends);

module.exports = router;
