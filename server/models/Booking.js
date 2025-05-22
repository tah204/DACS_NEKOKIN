const mongoose = require('mongoose');

  const bookingSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    bookingDate: { type: Date, required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    checkIn: { 
      type: Date,
      required: function() { return this.serviceType === 'hotel'; }
    },
    checkOut: { 
      type: Date,
      required: function() { return this.serviceType === 'hotel'; }
    },
    serviceType: { 
      type: String, 
      enum: ['health', 'grooming', 'hotel'], 
      required: true 
    },
    status: { type: String, enum: ['active', 'completed', 'canceled'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
  });

  bookingSchema.pre('validate', function(next) {
    if (this.serviceType === 'hotel' && this.checkIn && this.checkOut) {
      if (this.checkOut <= this.checkIn) {
        next(new Error('Check-out date must be after check-in date'));
      }
    }
    next();
  });

  bookingSchema.index({ userId: 1 });
  bookingSchema.index({ serviceId: 1 });
  bookingSchema.index({ petId: 1 });
  bookingSchema.index({ serviceId: 1, checkIn: 1, checkOut: 1 });

  module.exports = mongoose.model('Booking', bookingSchema);