const Trend = require('../models/Trend');

// GET /api/trends - all trends with pagination + filters
exports.getTrends = async (req, res) => {
  try {
    const { page = 1, limit = 20, year, category, trending_level } = req.query;
    const filter = {};
    if (year) filter.year = Number(year);
    if (category) filter.category = category;
    if (trending_level) filter.trending_level = trending_level;

    const total = await Trend.countDocuments(filter);
    const trends = await Trend.find(filter)
      .sort({ tweets: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ trends, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/trends/top - top 10 by tweets
exports.getTopTrends = async (req, res) => {
  try {
    const trends = await Trend.find().sort({ tweets: -1 }).limit(10);
    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/trends/year/:year
exports.getTrendsByYear = async (req, res) => {
  try {
    const trends = await Trend.find({ year: Number(req.params.year) }).sort({ rank: 1 });
    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/trends/search/:tag
exports.searchTrends = async (req, res) => {
  try {
    const regex = new RegExp(req.params.tag, 'i');
    const trends = await Trend.find({ tag: regex }).sort({ tweets: -1 }).limit(20);
    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalTrends = await Trend.countDocuments();
    const years = await Trend.distinct('year');
    const maxTweetDoc = await Trend.findOne().sort({ tweets: -1 });

    // Trends by year
    const trendsByYear = await Trend.aggregate([
      { $group: { _id: '$year', count: { $sum: 1 }, totalTweets: { $sum: '$tweets' } } },
      { $sort: { _id: 1 } }
    ]);

    // Category distribution
    const categoryDistribution = await Trend.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Trending level distribution
    const trendingLevelDistribution = await Trend.aggregate([
      { $group: { _id: '$trending_level', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly distribution
    const monthlyDistribution = await Trend.aggregate([
      { $group: { _id: { $month: '$peak_date' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Top 10 by tweets
    const top10 = await Trend.find().sort({ tweets: -1 }).limit(10);

    res.json({
      totalTrends,
      totalYears: years.length,
      years: years.sort(),
      maxTweets: maxTweetDoc ? maxTweetDoc.tweets : 0,
      mostPopular: maxTweetDoc ? maxTweetDoc.tag : '',
      trendsByYear,
      categoryDistribution,
      trendingLevelDistribution,
      monthlyDistribution,
      top10
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
