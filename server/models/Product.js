const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
  petType: {
    type: String,
    enum: ['dog', 'cat', 'both'], 
    required: true,
  },
  ageRange: {
    type: String,
    enum: [
      'under_2_months', 
      '2_to_6_months', 
      '6_to_12_months', 
      '1_to_7_years', 
      'over_7_years', 
      'all'
    ],
    required: true,
  },
});

module.exports = mongoose.model('Product', productSchema);