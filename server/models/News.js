const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  fullContent: { type: String },
  date: { type: Date, default: Date.now },
  image: { type: String, required: true },
  topic: { type: String, required: true },
});

module.exports = mongoose.model('News', newsSchema);