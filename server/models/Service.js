const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  duration: { type: String, required: true },
  petType: { type: String, required: true, enum: ['cat', 'dog', 'both'] },
  ageRange: { type: String, required: true, enum: ['under_2_months', '2_to_6_months', '6_to_12_months', '1_to_7_years', 'over_7_years', 'all'] },
  category: { type: String, required: true, enum: ['health', 'grooming'] }
});

module.exports = mongoose.model('Service', serviceSchema);