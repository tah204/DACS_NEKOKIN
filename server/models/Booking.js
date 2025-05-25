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
  },
  checkOut: {
    type: Date,
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'canceled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

bookingSchema.pre('validate', async function(next) {
  if (this.checkIn && this.checkOut) {
    if (this.checkOut <= this.checkIn) {
      return next(new Error('Ngày check-out phải sau ngày check-in.'));
    }
  }

  const Customer = mongoose.model('Customer');
  const Pet = mongoose.model('Pet');

  try {
    const customer = await Customer.findById(this.customerId);
    const pet = await Pet.findById(this.petId);

    if (!customer) {
      return next(new Error('Khách hàng không tìm thấy.'));
    }
    if (!pet) {
      return next(new Error('Thú cưng không tìm thấy.'));
    }

    if (pet.customerId.toString() !== this.customerId.toString()) {
      return next(new Error('Thú cưng không thuộc về khách hàng này.'));
    }
  } catch (error) {
    return next(new Error('Lỗi kiểm tra mối quan hệ khách hàng và thú cưng: ' + error.message));
  }

  next();
});

bookingSchema.index({ customerId: 1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ petId: 1 });
bookingSchema.index({ serviceId: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ serviceId: 1, bookingDate: 1 }); // Thêm index tối ưu cho truy vấn getAvailableTimes

module.exports = mongoose.model('Booking', bookingSchema);