const mongoose = require('mongoose');

  const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    duration: { type: String, required: true },
    type: { type: String, required: true, enum: ['health', 'grooming', 'hotel'] },
    totalRooms: { 
      type: Number, 
      required: function() { return this.type === 'hotel'; },
      min: 0 
    },
    subServices: [{
      name: { type: String, required: true },
      price: { type: Number, required: true },
      description: { type: String },
      image: { type: String }
    }]
  });

  module.exports = mongoose.model('Service', serviceSchema);