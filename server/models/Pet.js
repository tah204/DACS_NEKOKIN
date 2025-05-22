const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['cat', 'dog', 'other'], required: true },
  ageRange: { 
    type: String, 
    enum: ['under_2_months', '2_to_6_months', '6_to_12_months', '1_to_7_years', 'over_7_years'], 
    required: true 
  },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true }
});

module.exports = mongoose.model('Pet', PetSchema);