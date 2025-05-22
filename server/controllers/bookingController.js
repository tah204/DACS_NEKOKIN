const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Pet = require('../models/Pet');
const Customer = require('../models/Customer');

exports.checkAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.body;
    const service = await Service.findById(req.params.serviceId);

    if (!service || service.type !== 'hotel') {
      return res.status(400).json({ message: 'Dịch vụ không hợp lệ hoặc không phải dịch vụ khách sạn.' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate) || isNaN(checkOutDate)) {
      return res.status(400).json({ message: 'Ngày check-in hoặc check-out không hợp lệ.' });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Ngày check-out phải sau ngày check-in.' });
    }

    const overlappingBookings = await Booking.find({
      serviceId: req.params.serviceId,
      status: { $in: ['active', 'completed'] },
      $or: [{ checkIn: { $lte: checkOutDate }, checkOut: { $gte: checkInDate } }],
    });

    const bookedRooms = overlappingBookings.length;
    const availableRooms = service.totalRooms - bookedRooms;

    if (availableRooms <= 0) {
      return res.status(400).json({ message: 'Không còn phòng trống trong khoảng thời gian đã chọn.' });
    }

    res.json({ 
      availableRooms, 
      totalRooms: service.totalRooms,
      checkIn: checkInDate,
      checkOut: checkOutDate
    });
  } catch (error) {
    console.error('Error in checkAvailability:', error.message || error);
    res.status(500).json({ message: 'Lỗi khi kiểm tra tính khả dụng.', error: error.message || error });
  }
};

exports.createBooking = async (req, res) => {
  const { bookingDate, serviceId, petId, checkIn, checkOut, subServiceId } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!bookingDate || !serviceId || !petId || !req.user.customerId) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: bookingDate, serviceId, petId, customerId.' });
  }

  try {
    // Kiểm tra dữ liệu hợp lệ
    const bookingDateObj = new Date(bookingDate);
    if (isNaN(bookingDateObj)) {
      return res.status(400).json({ message: 'Ngày đặt không hợp lệ.' });
    }

    // Lấy thông tin dịch vụ
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại.' });
    }

    // Kiểm tra pet có tồn tại không
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: 'Thú cưng không tồn tại.' });
    }

    // Kiểm tra tính khả dụng cho dịch vụ khách sạn
    let checkInDate, checkOutDate;
    if (service.type === 'hotel') {
      if (!checkIn || !checkOut) {
        return res.status(400).json({ message: 'Ngày check-in và check-out là bắt buộc cho dịch vụ khách sạn.' });
      }

      checkInDate = new Date(checkIn);
      checkOutDate = new Date(checkOut);

      if (isNaN(checkInDate) || isNaN(checkOutDate)) {
        return res.status(400).json({ message: 'Ngày check-in hoặc check-out không hợp lệ.' });
      }

      if (checkOutDate <= checkInDate) {
        return res.status(400).json({ message: 'Ngày check-out phải sau ngày check-in.' });
      }

      const overlappingBookings = await Booking.find({
        serviceId,
        status: { $in: ['active', 'completed'] },
        $or: [{ checkIn: { $lte: checkOutDate }, checkOut: { $gte: checkInDate } }],
      });

      if (overlappingBookings.length >= service.totalRooms) {
        return res.status(400).json({ message: 'Không còn phòng trống trong khoảng thời gian đã chọn.' });
      }
    }

    // Tạo booking mới
    const booking = new Booking({
      customerId: req.user.customerId,
      bookingDate: bookingDateObj,
      serviceId,
      petId,
      checkIn: service.type === 'hotel' ? checkInDate : undefined,
      checkOut: service.type === 'hotel' ? checkOutDate : undefined,
      status: 'active',
    });

    const newBooking = await booking.save();
    // Sử dụng populate một lần với mảng các trường
    await Booking.populate(newBooking, [
      { path: 'serviceId', select: 'name type' },
      { path: 'petId', select: 'name type' },
      { path: 'customerId', select: 'name phone' },
    ]);
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error in createBooking:', error.message || error);
    res.status(500).json({ message: 'Lỗi khi tạo booking.', error: error.message || error.toString() });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    // Nếu là admin, lấy tất cả bookings; nếu là user, chỉ lấy bookings của customerId
    const query = req.user.role === 'admin' ? {} : { customerId: req.user.customerId };
    const bookings = await Booking.find(query)
      .populate('serviceId', 'name type')
      .populate('petId', 'name type')
      .populate('customerId', 'name phone');
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error in getAllBookings:', error.message || error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách booking.', error: error.message || error });
  }
};

exports.updateBooking = async (req, res) => {
  const { bookingDate, serviceId, petId, checkIn, checkOut, status } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking không tồn tại.' });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && booking.customerId.toString() !== req.user.customerId) {
      return res.status(403).json({ message: 'Không được phép: Bạn không có quyền cập nhật booking này.' });
    }

    // Cập nhật thông tin
    if (bookingDate) {
      const bookingDateObj = new Date(bookingDate);
      if (isNaN(bookingDateObj)) {
        return res.status(400).json({ message: 'Ngày đặt không hợp lệ.' });
      }
      booking.bookingDate = bookingDateObj;
    }
    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (!service) return res.status(404).json({ message: 'Dịch vụ không tồn tại.' });
      booking.serviceId = serviceId;
    }
    if (petId) {
      const pet = await Pet.findById(petId);
      if (!pet) return res.status(404).json({ message: 'Thú cưng không tồn tại.' });
      if (req.user.role !== 'admin' && pet.customerId.toString() !== req.user.customerId) {
        return res.status(403).json({ message: 'Không được phép: Bạn không sở hữu thú cưng này.' });
      }
      booking.petId = petId;
    }
    if (status) {
      if (!['active', 'completed', 'canceled'].includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
      }
      booking.status = status;
    }

    // Xử lý checkIn/checkOut nếu có
    if (serviceId || checkIn || checkOut) {
      const service = await Service.findById(serviceId || booking.serviceId);
      if (service.type === 'hotel') {
        const newCheckIn = checkIn ? new Date(checkIn) : booking.checkIn;
        const newCheckOut = checkOut ? new Date(checkOut) : booking.checkOut;

        if (!newCheckIn || !newCheckOut) {
          return res.status(400).json({ message: 'Ngày check-in và check-out là bắt buộc cho dịch vụ khách sạn.' });
        }

        if (newCheckOut <= newCheckIn) {
          return res.status(400).json({ message: 'Ngày check-out phải sau ngày check-in.' });
        }

        const overlappingBookings = await Booking.find({
          serviceId: service._id,
          status: { $in: ['active', 'completed'] },
          _id: { $ne: booking._id }, // Loại trừ chính booking đang cập nhật
          $or: [{ checkIn: { $lte: newCheckOut }, checkOut: { $gte: newCheckIn } }]
        });

        if (overlappingBookings.length >= service.totalRooms) {
          return res.status(400).json({ message: 'Không còn phòng trống trong khoảng thời gian đã chọn.' });
        }

        booking.checkIn = newCheckIn;
        booking.checkOut = newCheckOut;
      } else {
        booking.checkIn = undefined;
        booking.checkOut = undefined;
      }
    }

    const updatedBooking = await booking.save();
    await updatedBooking
      .populate('serviceId', 'name type')
      .populate('petId', 'name type')
      .populate('customerId', 'name phone');
    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Error in updateBooking:', error.message || error);
    res.status(500).json({ message: 'Lỗi khi cập nhật booking.', error: error.message || error });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking không tồn tại.' });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && booking.customerId.toString() !== req.user.customerId) {
      return res.status(403).json({ message: 'Không được phép: Bạn không có quyền xóa booking này.' });
    }

    await booking.deleteOne();
    res.status(200).json({ message: 'Booking đã được xóa.' });
  } catch (error) {
    console.error('Error in deleteBooking:', error.message || error);
    res.status(500).json({ message: 'Lỗi khi xóa booking.', error: error.message || error });
  }
};