const mongoose = require('mongoose');

const trendSchema = new mongoose.Schema({
  tag: { type: String, required: true, index: true },
  year: { type: Number, required: true, index: true },
  peak_date: { type: Date, required: true },
  tweets: { type: Number, required: true },
  rank: { type: Number, required: true },
  category: { type: String, required: true, index: true },
  trending_level: { type: String, required: true, index: true }
});

// Text index for search
trendSchema.index({ tag: 'text' });

module.exports = mongoose.model('Trend', trendSchema);
