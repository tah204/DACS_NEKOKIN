const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Pet = require('../models/Pet');
const Customer = require('../models/Customer');

exports.checkAvailability = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.body;
        const service = await Service.findById(req.params.serviceId);

        if (!service || !service.category || service.category !== 3) {
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
            status: { $in: ['pending', 'active', 'completed'] },
            $or: [
                { checkIn: { $lte: checkOutDate }, checkOut: { $gte: checkInDate } },
            ],
        });

        const bookedRooms = overlappingBookings.length;
        const availableRooms = service.totalRooms - bookedRooms;

        if (availableRooms <= 0) {
            return res.status(400).json({ message: 'Không còn phòng trống trong khoảng thời gian đã chọn.' });
        }

        res.json({
            availableRooms,
            totalRooms: service.totalRooms,
            checkIn: checkInDate.toISOString(),
            checkOut: checkOutDate.toISOString(),
        });
    } catch (error) {
        console.error('Error in checkAvailability:', error.message || error);
        res.status(500).json({ message: 'Lỗi khi kiểm tra tính khả dụng.', error: error.message || error });
    }
};

exports.createBooking = async (req, res) => {
    const { bookingDate, serviceId, petId, checkIn, checkOut, subServiceId, notes } = req.body;

    if (!bookingDate || !serviceId || !petId || !req.user.customerId) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: bookingDate, serviceId, petId, customerId.' });
    }

    try {
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Dịch vụ không tồn tại.' });
        }

        let finalBookingDate;

        if (service.category === 3) {
            if (!checkIn || !checkOut) {
                return res.status(400).json({ message: 'Ngày check-in và check-out là bắt buộc cho dịch vụ khách sạn.' });
            }
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            if (isNaN(checkInDate) || isNaN(checkOutDate) || checkOutDate <= checkInDate) {
                return res.status(400).json({ message: 'Ngày check-in hoặc check-out không hợp lệ hoặc check-out phải sau check-in.' });
            }
            finalBookingDate = checkInDate;
        } else {
            const bookingDateObj = new Date(bookingDate);
            if (isNaN(bookingDateObj)) {
                return res.status(400).json({ message: 'Ngày đặt không hợp lệ.' });
            }
            console.log('Creating booking with bookingDate:', bookingDateObj.toISOString()); // Debug

            // Kiểm tra khung giờ đã được đặt
            const startOfDay = new Date(bookingDateObj);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(startOfDay);
            endOfDay.setHours(23, 59, 59, 999);

            // Tìm các booking trong cùng ngày
            const existingBookings = await Booking.find({
                serviceId,
                status: { $in: ['pending', 'active', 'completed'] },
                bookingDate: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            });

            // Kiểm tra trùng giờ chính xác
            const bookingTimeStr = bookingDateObj.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const bookedTimes = existingBookings.map(booking =>
                new Date(booking.bookingDate).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            );
            console.log('Booked times in this day:', bookedTimes); // Debug

            if (bookedTimes.includes(bookingTimeStr)) {
                return res.status(400).json({ message: 'Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác.' });
            }
            finalBookingDate = bookingDateObj;
        }

        const pet = await Pet.findById(petId);
        if (!pet) {
            return res.status(404).json({ message: 'Thú cưng không tồn tại.' });
        }

        let newBookingData = {
            customerId: req.user.customerId,
            bookingDate: finalBookingDate,
            serviceId,
            petId,
            status: 'pending',
            notes: notes || '',
        };

        if (service.category === 3) {
            newBookingData.checkIn = new Date(checkIn);
            newBookingData.checkOut = new Date(checkOut);
            const overlappingBookings = await Booking.find({
                serviceId,
                status: { $in: ['pending', 'active', 'completed'] },
                $or: [
                    { checkIn: { $lte: newBookingData.checkOut }, checkOut: { $gte: newBookingData.checkIn } },
                ],
            });

            if (overlappingBookings.length >= service.totalRooms) {
                return res.status(400).json({ message: 'Không còn phòng trống trong khoảng thời gian đã chọn.' });
            }
        }

        const booking = new Booking(newBookingData);
        const newBooking = await booking.save();
        await Booking.populate(newBooking, [
            { path: 'serviceId', select: 'name price category' },
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
        const query = req.user.role === 'admin' ? {} : { customerId: req.user.customerId };
        const bookings = await Booking.find(query)
            .populate('serviceId', 'name price category')
            .populate('petId', 'name type')
            .populate('customerId', 'name phone');
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error in getAllBookings:', error.message || error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách booking.', error: error.message || error });
    }
};

exports.updateBooking = async (req, res) => {
    const { bookingDate, serviceId, petId, checkIn, checkOut, status, notes } = req.body;

    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking không tồn tại.' });
        }

        if (req.user.role !== 'admin' && booking.customerId.toString() !== req.user.customerId) {
            return res.status(403).json({ message: 'Không được phép: Bạn không có quyền cập nhật booking này.' });
        }

        let newBookingDate = booking.bookingDate;
        if (bookingDate) {
            const bookingDateObj = new Date(bookingDate);
            if (isNaN(bookingDateObj)) {
                return res.status(400).json({ message: 'Ngày đặt không hợp lệ.' });
            }
            newBookingDate = bookingDateObj;
        }
        booking.bookingDate = newBookingDate;

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
            if (!['pending', 'active', 'completed', 'canceled'].includes(status)) {
                return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
            }
            booking.status = status;
        }
        if (notes !== undefined) {
            booking.notes = notes;
        }

        const currentService = await Service.findById(serviceId || booking.serviceId);
        if (!currentService) {
            return res.status(404).json({ message: 'Dịch vụ không tồn tại sau khi cập nhật serviceId.' });
        }

        if (currentService.category === 3) {
            const newCheckIn = checkIn ? new Date(checkIn) : booking.checkIn;
            const newCheckOut = checkOut ? new Date(checkOut) : booking.checkOut;

            if (!newCheckIn || !newCheckOut || newCheckOut <= newCheckIn) {
                return res.status(400).json({ message: 'Ngày check-in và check-out là bắt buộc và hợp lệ cho dịch vụ khách sạn.' });
            }

            const overlappingBookings = await Booking.find({
                serviceId: currentService._id,
                status: { $in: ['pending', 'active', 'completed'] },
                _id: { $ne: booking._id },
                $or: [
                    { checkIn: { $lte: newCheckOut }, checkOut: { $gte: newCheckIn } },
                ],
            });

            if (overlappingBookings.length >= currentService.totalRooms) {
                return res.status(400).json({ message: 'Không còn phòng trống trong khoảng thời gian đã chọn.' });
            }

            booking.checkIn = newCheckIn;
            booking.checkOut = newCheckOut;
            if (bookingDate === undefined) {
                booking.bookingDate = newCheckIn;
            }
        } else {
            booking.checkIn = undefined;
            booking.checkOut = undefined;
        }

        const updatedBooking = await booking.save();
        await updatedBooking
            .populate('serviceId', 'name price category')
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

exports.getAvailableTimes = async (req, res) => {
    try {
        const { date } = req.query;
        const { serviceId } = req.params;

        if (!date) {
            return res.status(400).json({ message: 'Vui lòng cung cấp ngày.' });
        }

        const selectedDate = new Date(date);
        if (isNaN(selectedDate)) {
            return res.status(400).json({ message: 'Ngày không hợp lệ.' });
        }

        const service = await Service.findById(serviceId);
        if (!service || service.category === 3) {
            return res.status(400).json({ message: 'Dịch vụ không hợp lệ hoặc là dịch vụ khách sạn.' });
        }

        // Danh sách khung giờ khả dụng (khớp với TimeSlotPicker: 8:00–15:00, cách 30 phút)
        const availableTimeSlots = [
            '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00'
        ];

        // Lấy các booking trong ngày được chọn
        const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

        const bookings = await Booking.find({
            serviceId,
            status: { $in: ['pending', 'active', 'completed'] },
            bookingDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        console.log('Bookings found for', selectedDate.toISOString(), ':', bookings); // Debug

        // Trích xuất các khung giờ đã được đặt
        const bookedTimes = bookings.map(booking => {
            const timeStr = new Date(booking.bookingDate).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            });
            console.log('Extracted time from booking:', timeStr); // Debug
            return timeStr;
        });

        console.log('Booked times:', bookedTimes); // Debug

        // Lọc ra các khung giờ còn trống
        const availableTimes = availableTimeSlots.filter(
            time => !bookedTimes.includes(time)
        );

        console.log('Available times:', availableTimes); // Debug

        res.json({ availableTimes });
    } catch (error) {
        console.error('Error in getAvailableTimes:', error.message || error);
        res.status(500).json({ message: 'Lỗi khi lấy khung giờ trống.', error: error.message || error });
    }
};

module.exports = {
    checkAvailability: exports.checkAvailability,
    createBooking: exports.createBooking,
    getAllBookings: exports.getAllBookings,
    updateBooking: exports.updateBooking,
    deleteBooking: exports.deleteBooking,
    getAvailableTimes: exports.getAvailableTimes
};