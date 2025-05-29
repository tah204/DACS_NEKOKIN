import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import Sidebar from './Sidebar';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import TimeSlotPicker from './TimeSlotPicker';

// Đảm bảo đã import CSS của react-datepicker
import 'react-datepicker/dist/react-datepicker.css';
// Import CSS tùy chỉnh cho BookingModal
import './BookingModal.css';

const BookingModal = ({ isOpen, onClose, initialCategoryId }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        serviceId: '',
        petId: '',
        bookingDate: null,
        checkIn: null,
        checkOut: null,
        bookingTime: '',
        notes: '',
    });
    const [pets, setPets] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);
    const [availability, setAvailability] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const currentCategoryId = initialCategoryId;

    // Debug formData
    useEffect(() => {
        console.log('BookingModal formData:', formData);
    }, [formData]);

    // Reset form khi modal đóng hoặc mở lại
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFormData({
                serviceId: '',
                petId: '',
                bookingDate: null,
                checkIn: null,
                checkOut: null,
                bookingTime: '',
                notes: '',
            });
            setPets([]);
            setAvailableServices([]);
            setSelectedServiceDetails(null);
            setAvailability(null);
            setError('');
            setSuccess('');
            setLoading(false);
            if (currentCategoryId) {
                fetchAvailableServices();
                fetchPets();
            } else {
                setError('Không thể đặt lịch. Danh mục dịch vụ không xác định.');
            }
        }
    }, [isOpen, currentCategoryId]);

    // Fetch details for the selected specific service
    useEffect(() => {
        const fetchSelectedServiceDetails = async () => {
            if (!formData.serviceId) {
                setSelectedServiceDetails(null);
                return;
            }
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/services/${formData.serviceId}`);
                setSelectedServiceDetails(response.data);
                setError('');
            } catch (err) {
                setError('Không thể tải thông tin chi tiết dịch vụ đã chọn.');
                setSelectedServiceDetails(null);
            } finally {
                setLoading(false);
            }
        };
        if (formData.serviceId && isOpen) {
            fetchSelectedServiceDetails();
        }
    }, [formData.serviceId, isOpen]);

    const fetchAvailableServices = useCallback(async () => {
        if (!currentCategoryId) return;
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/services/category/${currentCategoryId}`);
            setAvailableServices(response.data);
            if (response.data.length === 0) {
                setError('Không có dịch vụ cụ thể nào trong danh mục này.');
            }
        } catch (err) {
            setError('Không thể tải danh sách dịch vụ trong danh mục này.');
            console.error('Error fetching available services:', err);
        } finally {
            setLoading(false);
        }
    }, [currentCategoryId]);

    const fetchPets = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Vui lòng đăng nhập để xem và thêm thú cưng.');
                return;
            }
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/pets', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPets(response.data);
            if (response.data.length === 0) {
                setError('Bạn chưa có thú cưng nào. Vui lòng thêm thú cưng trước khi đặt lịch.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách thú cưng. Vui lòng đăng nhập.');
            console.error('Error fetching pets:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const checkAvailability = useCallback(
        debounce(async () => {
            if (selectedServiceDetails?.category === 3 && formData.checkIn && formData.checkOut) {
                const checkInDate = moment(formData.checkIn);
                const checkOutDate = moment(formData.checkOut);

                if (checkOutDate.isSameOrBefore(checkInDate, 'day')) {
                    setError('Ngày trả phòng phải sau ngày nhận phòng.');
                    setAvailability(null);
                    return;
                }
                const today = moment().startOf('day');
                if (checkInDate.isBefore(today) || checkOutDate.isBefore(today)) {
                    setError('Ngày nhận phòng hoặc ngày trả phòng không thể là ngày trong quá khứ.');
                    setAvailability(null);
                    return;
                }

                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.post(
                        `http://localhost:5000/api/bookings/check-availability/${formData.serviceId}`,
                        { checkIn: formData.checkIn.toISOString(), checkOut: formData.checkOut.toISOString() },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setAvailability(response.data);
                    setError('');
                } catch (err) {
                    setError(err.response?.data?.message || 'Lỗi khi kiểm tra tính khả dụng.');
                    setAvailability(null);
                    console.error('Error in checkAvailability:', err);
                } finally {
                    setLoading(false);
                }
            } else if (selectedServiceDetails?.category === 3) {
                setAvailability(null);
            }
        }, 500),
        [formData.checkIn, formData.checkOut, formData.serviceId, selectedServiceDetails?.category]
    );

    useEffect(() => {
        if (step === 2 && selectedServiceDetails?.category === 3) {
            checkAvailability();
        }
        return () => checkAvailability.cancel();
    }, [formData.checkIn, formData.checkOut, checkAvailability, step, selectedServiceDetails?.category]);

    const handleDateChange = (date, name) => {
        setFormData((prev) => ({ ...prev, [name]: date }));
        setError('');
        setSuccess('');
        if (name === 'bookingDate') {
            setFormData((prev) => ({ ...prev, bookingTime: '' }));
        }
    };

    const handleTimeSelect = (timeString) => {
        setFormData((prev) => ({ ...prev, bookingTime: timeString }));
        setError('');
        setSuccess('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleSelectService = (serviceId) => {
        setFormData(prev => ({ ...prev, serviceId: serviceId }));
        setAvailability(null);
        setError('');
    };

    const handleNextStep = () => {
        setError('');
        if (!currentCategoryId) {
            setError('Lỗi: Danh mục dịch vụ không xác định. Vui lòng đóng và mở lại form.');
            return;
        }

        if (step === 1) {
            if (!formData.serviceId) {
                setError('Vui lòng chọn một dịch vụ cụ thể.');
                return;
            }
            if (!formData.petId) {
                setError('Vui lòng chọn thú cưng.');
                return;
            }
            if (pets.length === 0) {
                setError('Bạn chưa có thú cưng nào. Vui lòng thêm thú cưng để đặt lịch.');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (selectedServiceDetails?.category !== 3) {
                if (!formData.bookingDate) {
                    setError('Vui lòng chọn ngày đặt lịch.');
                    return;
                }
                if (!formData.bookingTime) {
                    setError('Vui lòng chọn giờ đặt lịch.');
                    return;
                }
                const bookingDateTime = moment(formData.bookingDate).hour(moment(formData.bookingTime, 'HH:mm').hour()).minute(moment(formData.bookingTime, 'HH:mm').minute());
                const now = moment();
                if (bookingDateTime.isBefore(now)) {
                    setError('Thời gian đặt lịch không thể là trong quá khứ.');
                    return;
                }
            } else {
                if (!formData.checkIn || !formData.checkOut) {
                    setError('Ngày nhận phòng và ngày trả phòng là bắt buộc cho dịch vụ khách sạn.');
                    return;
                }
                const checkInDate = moment(formData.checkIn);
                const checkOutDate = moment(formData.checkOut);
                if (checkOutDate.isSameOrBefore(checkInDate, 'day')) {
                    setError('Ngày trả phòng phải sau ngày nhận phòng.');
                    return;
                }
                if (availability === null || availability.availableRooms <= 0) {
                    setError('Không còn phòng trống hoặc chưa kiểm tra khả dụng. Vui lòng chọn lại ngày khác.');
                    return;
                }
            }
            setStep(3);
        }
    };

    const handlePrevStep = () => {
        setStep((prev) => prev - 1);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để đặt lịch.');
            }

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const customerId = user.customerId;
            if (!customerId) {
                throw new Error('Thông tin người dùng không đầy đủ. Vui lòng đăng nhập lại.');
            }

            if (!formData.serviceId) {
                throw new Error('Không thể đặt lịch. ID dịch vụ không xác định.');
            }

            const payload = {
                serviceId: formData.serviceId,
                petId: formData.petId,
                notes: formData.notes,
            };

            if (selectedServiceDetails?.category === 3) {
                payload.bookingDate = formData.checkIn ? formData.checkIn.toISOString() : null;
                payload.checkIn = formData.checkIn ? formData.checkIn.toISOString() : null;
                payload.checkOut = formData.checkOut ? formData.checkOut.toISOString() : null;
            } else {
                const bookingDateTime = moment(formData.bookingDate)
                    .hour(moment(formData.bookingTime, 'HH:mm').hour())
                    .minute(moment(formData.bookingTime, 'HH:mm').minute());
                payload.bookingDate = bookingDateTime.toISOString();
            }

            const response = await axios.post(
                'http://localhost:5000/api/bookings',
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess('Đặt lịch thành công! Chi tiết booking: ' + response.data._id);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            console.error('Error during booking submission:', err);
            setError(err.response?.data?.message || err.message || 'Lỗi khi đặt lịch. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const getMinDate = useCallback(() => {
        return moment().startOf('day').toDate();
    }, []);

    const getMinCheckoutDate = useCallback(() => {
        if (formData.checkIn) {
            return moment(formData.checkIn).add(1, 'day').toDate();
        }
        return getMinDate();
    }, [formData.checkIn, getMinDate]);

    if (!currentCategoryId && isOpen) {
        return (
            <Sidebar isOpen={isOpen} onClose={onClose} title="Lỗi Đặt Lịch">
                <div className="modal-content-custom">
                    <h2 className="text-center text-primary mb-4 fw-bold">Lỗi Đặt Lịch</h2>
                    <div className="alert alert-danger mb-4" role="alert">
                        Không thể đặt lịch vì danh mục dịch vụ không xác định. Vui lòng quay lại và chọn một danh mục dịch vụ.
                    </div>
                    <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Đóng
                        </button>
                    </div>
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar isOpen={isOpen} onClose={onClose} title="Đặt Lịch Hẹn">
            <div className="modal-content-custom">
                {error && (
                    <div className="alert alert-danger mb-4" role="alert">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="alert alert-success mb-4" role="alert">
                        {success}
                    </div>
                )}

                <div className="progress mb-4">
                    <div
                        className="progress-bar bg-danger"
                        role="progressbar"
                        style={{ width: `${(step / 3) * 100}%` }}
                        aria-valuenow={(step / 3) * 100}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    >
                        Bước {step} / 3
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div>
                            <h4 className="mb-3">Chọn dịch vụ & thú cưng</h4>

                            <div className="mb-4">
                                <label className="form-label d-block">Chọn dịch vụ cụ thể bạn muốn đặt:</label>
                                {loading && availableServices.length === 0 ? (
                                    <div className="text-center text-muted">Đang tải dịch vụ...</div>
                                ) : availableServices.length > 0 ? (
                                    <div className="d-flex flex-wrap gap-3 justify-content-center">
                                        {availableServices.map((service) => (
                                            <div
                                                key={service._id}
                                                className={`card p-3 shadow-sm option-card ${formData.serviceId === service._id ? 'active border border-danger' : ''}`}
                                                onClick={() => handleSelectService(service._id)}
                                                style={{ cursor: 'pointer', maxWidth: '220px', minWidth: '180px' }}
                                            >
                                                <img src={`/images/${service.image}`} alt={service.name} className="card-img-top mb-2" style={{ height: '100px', objectFit: 'cover' }} />
                                                <h5 className="card-title text-center">{service.name}</h5>
                                                <p className="card-text text-muted small text-center flex-grow-1">{service.description.substring(0, 50)}{service.description.length > 50 ? '...' : ''}</p>
                                                <div className="text-center">
                                                    <span className="badge bg-info text-dark">{service.price?.toLocaleString('vi-VN')} VNĐ</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="alert alert-warning text-center">Không có dịch vụ nào trong danh mục này.</div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="petId" className="form-label">Chọn thú cưng của bạn</label>
                                <select
                                    id="petId"
                                    name="petId"
                                    value={formData.petId}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="">-- Chọn thú cưng của bạn --</option>
                                    {pets.length > 0 ? (
                                        pets.map((pet) => (
                                            <option key={pet._id} value={pet._id}>
                                                {pet.name} ({pet.type})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>Bạn chưa có thú cưng nào. Vui lòng thêm thú cưng.</option>
                                    )}
                                </select>
                            </div>
                            <div className="d-flex justify-content-end">
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleNextStep}
                                    disabled={!formData.serviceId || !formData.petId || pets.length === 0 || loading}
                                >
                                    Tiếp tục
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h4 className="mb-3">Chọn ngày giờ</h4>
                            {selectedServiceDetails && (
                                <p className="text-muted">Bạn đang đặt dịch vụ: <strong>{selectedServiceDetails.name}</strong></p>
                            )}

                            {selectedServiceDetails?.category === 3 ? (
                                <>
                                    <div className="mb-3">
                                        <label htmlFor="checkIn" className="form-label">Ngày nhận phòng</label>
                                        <DatePicker
                                            selected={formData.checkIn}
                                            onChange={(date) => handleDateChange(date, 'checkIn')}
                                            selectsStart
                                            startDate={formData.checkIn}
                                            endDate={formData.checkOut}
                                            minDate={getMinDate()}
                                            dateFormat="dd/MM/yyyy"
                                            className="form-control"
                                            placeholderText="Chọn ngày nhận phòng"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="checkOut" className="form-label">Ngày trả phòng</label>
                                        <DatePicker
                                            selected={formData.checkOut}
                                            onChange={(date) => handleDateChange(date, 'checkOut')}
                                            selectsEnd
                                            startDate={formData.checkIn}
                                            endDate={formData.checkOut}
                                            minDate={getMinCheckoutDate()}
                                            dateFormat="dd/MM/yyyy"
                                            className="form-control"
                                            placeholderText="Chọn ngày trả phòng"
                                            required
                                        />
                                    </div>
                                    {loading ? (
                                        <div className="text-center text-muted mb-3">Đang kiểm tra khả dụng...</div>
                                    ) : (
                                        availability && (
                                            <div className={`alert ${availability.availableRooms > 0 ? 'alert-success' : 'alert-warning'} mb-3`}>
                                                Số phòng trống: {availability.availableRooms} / {availability.totalRooms}
                                            </div>
                                        )
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="d-flex flex-column flex-lg-row gap-4 justify-content-center align-items-start">
                                        <div className="mb-3 flex-grow-1 datepicker-container">
                                            <label htmlFor="bookingDate" className="form-label">Ngày đặt lịch</label>
                                            <DatePicker
                                                selected={formData.bookingDate}
                                                onChange={(date) => handleDateChange(date, 'bookingDate')}
                                                minDate={getMinDate()}
                                                dateFormat="dd/MM/yyyy"
                                                className="form-control"
                                                placeholderText="Chọn ngày đặt lịch"
                                                inline
                                                required
                                            />
                                        </div>
                                        <div className="mb-3 flex-grow-1 timepicker-container">
                                            <label htmlFor="bookingTime" className="form-label">Chọn giờ</label>
                                            {formData.bookingDate ? (
                                                <TimeSlotPicker
                                                    selectedDate={formData.bookingDate}
                                                    selectedTime={formData.bookingTime}
                                                    onSelectTime={handleTimeSelect}
                                                    serviceId={formData.serviceId} // Thêm serviceId
                                                />
                                            ) : (
                                                <div className="alert alert-info text-center py-4">Vui lòng chọn ngày để xem giờ khả dụng.</div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="d-flex justify-content-between">
                                <button type="button" className="btn btn-secondary" onClick={handlePrevStep}>
                                    Quay lại
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleNextStep}
                                    disabled={loading || (selectedServiceDetails?.category === 3 && (availability === null || availability.availableRooms <= 0))}
                                >
                                    Tiếp tục
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h4 className="mb-3">Thông tin bổ sung & Xác nhận</h4>
                            <div className="mb-3">
                                <label htmlFor="notes" className="form-label">Ghi chú</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="form-control"
                                    rows="3"
                                    placeholder="Ví dụ: Thú cưng của tôi có dị ứng với..."
                                ></textarea>
                            </div>
                            <div className="mb-3 summary-section p-3 border rounded">
                                <h5>Thông tin đặt lịch của bạn:</h5>
                                <p><strong>Dịch vụ:</strong> {selectedServiceDetails?.name || 'Đang tải...'}</p>
                                <p><strong>Thú cưng:</strong> {pets.find(p => p._id === formData.petId)?.name || 'N/A'}</p>

                                {selectedServiceDetails?.category === 3 ? (
                                    <>
                                        <p><strong>Ngày nhận phòng:</strong> {formData.checkIn ? moment(formData.checkIn).format('DD/MM/YYYY') : 'N/A'}</p>
                                        <p><strong>Ngày trả phòng:</strong> {formData.checkOut ? moment(formData.checkOut).format('DD/MM/YYYY') : 'N/A'}</p>
                                        <p><strong>Phòng trống:</strong> {availability?.availableRooms} / {availability?.totalRooms}</p>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Ngày đặt:</strong> {formData.bookingDate ? moment(formData.bookingDate).format('DD/MM/YYYY') : 'N/A'}</p>
                                        <p><strong>Giờ đặt:</strong> {formData.bookingTime || 'N/A'}</p>
                                    </>
                                )}
                                <p><strong>Ghi chú:</strong> {formData.notes || 'Không có'}</p>
                                <p className="fw-bold text-success">
                                    <strong>Tổng tiền ước tính: </strong>
                                    {selectedServiceDetails?.price?.toLocaleString('vi-VN')} VNĐ
                                    {selectedServiceDetails?.category === 3 && formData.checkIn && formData.checkOut && (
                                        ` x ${Math.ceil((moment(formData.checkOut).valueOf() - moment(formData.checkIn).valueOf()) / (1000 * 60 * 60 * 24))} ngày`
                                    )}
                                </p>
                            </div>
                            <div className="d-flex justify-content-between">
                                <button type="button" className="btn btn-secondary" onClick={handlePrevStep}>
                                    Quay lại
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-danger"
                                    disabled={loading || (selectedServiceDetails?.category === 3 && (availability === null || availability.availableRooms <= 0))}
                                >
                                    {loading ? 'Đang xác nhận...' : 'Xác nhận đặt lịch'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </Sidebar>
    );
};

export default BookingModal;