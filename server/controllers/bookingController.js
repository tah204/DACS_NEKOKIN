const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
  const { customerName, phone, bookingDate, serviceId } = req.body;

  if (!customerName || !phone || !bookingDate || !serviceId) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.' });
  }

  try {
    const booking = new Booking({
      customerName,
      phone,
      bookingDate,
      serviceId,
      userId: req.user.id,
    });

    const newBooking = await booking.save();
    await newBooking.populate('serviceId', 'name price');
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate('serviceId', 'name price');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};