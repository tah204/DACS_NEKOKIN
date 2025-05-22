const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Pet = require('../models/Pet');

exports.checkAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.body;
    const service = await Service.findById(req.params.serviceId);

    if (!service || service.type !== 'hotel') {
      return res.status(400).json({ message: 'Invalid service or not a hotel service' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }

    const overlappingBookings = await Booking.find({
      serviceId: req.params.serviceId,
      serviceType: 'hotel',
      status: { $in: ['active', 'completed'] },
      $or: [
        { checkIn: { $lte: checkOutDate }, checkOut: { $gte: checkInDate } }
      ]
    });

    const bookedRooms = overlappingBookings.length;
    const availableRooms = service.totalRooms - bookedRooms;

    if (availableRooms <= 0) {
      return res.status(400).json({ message: 'No rooms available for the selected dates' });
    }

    res.json({ 
      availableRooms, 
      totalRooms: service.totalRooms,
      checkIn: checkInDate,
      checkOut: checkOutDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking availability', error: error.message });
  }
};

exports.createBooking = async (req, res) => {
  const { customerName, phone, bookingDate, serviceId, petId, checkIn, checkOut } = req.body;

  if (!customerName || !phone || !bookingDate || !serviceId || !petId) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.' });
  }

  try {
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Chỉ kiểm tra quyền sở hữu thú cưng nếu user không phải admin
    if (req.user.role !== 'admin' && pet.customerId.toString() !== req.user.customerId) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this pet' });
    }

    if (service.type === 'hotel') {
      if (!checkIn || !checkOut) {
        return res.status(400).json({ message: 'Check-in and check-out dates are required for hotel service' });
      }
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const overlappingBookings = await Booking.find({
        serviceId,
        serviceType: 'hotel',
        status: { $in: ['active', 'completed'] },
        $or: [{ checkIn: { $lte: checkOutDate }, checkOut: { $gte: checkInDate } }]
      });
      if (overlappingBookings.length >= service.totalRooms) {
        return res.status(400).json({ message: 'No rooms available for the selected dates' });
      }
    }

    const booking = new Booking({
      customerName,
      phone,
      bookingDate: new Date(bookingDate),
      serviceId,
      userId: req.user.id,
      petId,
      serviceType: service.type,
      checkIn: service.type === 'hotel' ? new Date(checkIn) : undefined,
      checkOut: service.type === 'hotel' ? new Date(checkOut) : undefined
    });

    const newBooking = await booking.save();
    await newBooking.populate('serviceId', 'name price').populate('petId', 'name type');
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    // Nếu là admin, lấy tất cả bookings; nếu là user, chỉ lấy bookings của user
    const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const bookings = await Booking.find(query)
      .populate('serviceId', 'name price')
      .populate('petId', 'name type');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};