const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  checkIn: {
    type: Date,
    required: function() {
      const service = this.serviceId ? mongoose.model('Service').findById(this.serviceId) : null;
      return service && service.type === 'hotel';
    }
  },
  checkOut: {
    type: Date,
    required: function() {
      const service = this.serviceId ? mongoose.model('Service').findById(this.serviceId) : null;
      return service && service.type === 'hotel';
    }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'canceled'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware để kiểm tra checkIn và checkOut
bookingSchema.pre('validate', async function(next) {
  if (this.checkIn && this.checkOut) {
    if (this.checkOut <= this.checkIn) {
      return next(new Error('Check-out date must be after check-in date'));
    }
  }

  // Kiểm tra tính nhất quán giữa customerId và petId
  const Customer = mongoose.model('Customer');
  const Pet = mongoose.model('Pet');

  const customer = await Customer.findById(this.customerId);
  const pet = await Pet.findById(this.petId);

  if (!customer || !pet) {
    return next(new Error('Customer or Pet not found'));
  }

  if (pet.customerId.toString() !== this.customerId.toString()) {
    return next(new Error('Pet does not belong to the customer'));
  }

  next();
});

// Index để tối ưu hóa truy vấn
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ petId: 1 });
bookingSchema.index({ serviceId: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);