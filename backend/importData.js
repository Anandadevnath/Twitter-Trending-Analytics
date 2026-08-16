/**
 * importData.js - Import cleaned CSV into MongoDB
 *
 * Run AFTER the Python preprocessing step:
 *   cd ml && python preprocess.py
 *   cd ../backend && node importData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Trend = require('./models/Trend');

async function importData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const csvPath = path.join(__dirname, '..', 'ml', 'data', 'twitter-trending-hashtags-cleaned.csv');

  if (!fs.existsSync(csvPath)) {
    console.error('Cleaned CSV not found! Run "cd ml && python preprocess.py" first.');
    process.exit(1);
  }

  const csv = fs.readFileSync(csvPath, 'utf-8');
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');

  // Find column indices
  const tagIdx = headers.indexOf('tag');
  const yearIdx = headers.indexOf('year');
  const peakDateIdx = headers.indexOf('peak_date');
  const tweetsIdx = headers.indexOf('tweets');
  const rankIdx = headers.indexOf('rank');
  const categoryIdx = headers.indexOf('category');
  const trendingLevelIdx = headers.indexOf('trending_level');

  const docs = [];
  for (let i = 1; i < lines.length; i++) {
    // Handle commas in tag names by parsing carefully
    const line = lines[i];
    // Split from the right side since tag might contain commas
    const parts = line.split(',');

    // The CSV has: tag,year,peak_date,tweets,rank,category,trending_level,tag_length,word_count,month,day_of_week
    // We need to handle tags that contain commas
    // Count total expected columns from headers
    const totalCols = headers.length;
    const extraParts = parts.length - totalCols;

    // If extra parts, the tag contains commas - rejoin the tag parts
    let tag, rest;
    if (extraParts > 0) {
      tag = parts.slice(0, extraParts + 1).join(',');
      rest = parts.slice(extraParts + 1);
    } else {
      tag = parts[0];
      rest = parts.slice(1);
    }

    const year = parseInt(rest[0]);
    const peak_date = new Date(rest[1]);
    const tweets = parseInt(rest[2]);
    const rank = parseInt(rest[3]);
    const category = rest[4];
    const trending_level = rest[5];

    if (tag && !isNaN(year) && !isNaN(tweets) && !isNaN(rank) && category && trending_level) {
      docs.push({ tag, year, peak_date, tweets, rank, category, trending_level });
    }
  }

  // Clear existing data and insert
  await Trend.deleteMany({});
  await Trend.insertMany(docs);
  console.log(`Imported ${docs.length} trends into MongoDB`);

  await mongoose.disconnect();
  console.log('Done!');
}

importData().catch(err => {
  console.error('Import error:', err);
  process.exit(1);
});
