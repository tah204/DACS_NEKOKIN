import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelLoading, setCancelLoading] = useState(false);

    useEffect(() => {
        const fetchUserAndBookings = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                const token = localStorage.getItem('token');

                if (!token) {
                    setError('Vui lòng đăng nhập để xem lịch sử đặt dịch vụ.');
                    setLoading(false);
                    return;
                }

                let userData = storedUser ? JSON.parse(storedUser) : null;
                if (!userData) {
                    const userResponse = await axios.get('http://localhost:5000/auth/user/profile', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    userData = userResponse.data;
                    localStorage.setItem('user', JSON.stringify(userData));
                }
                setUser(userData);

                if (!userData.customerId) {
                    setError('Thông tin người dùng không đầy đủ. Vui lòng đăng nhập lại.');
                    setLoading(false);
                    return;
                }

                const bookingResponse = await axios.get('http://localhost:5000/api/bookings', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Bookings data:', bookingResponse.data);
                const activeBookings = bookingResponse.data.filter((booking) =>
                    booking.status === 'pending' || booking.status === 'active'
                );
                setBookings(activeBookings);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching bookings:', error.response?.data || error.message);
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                } else {
                    setError('Không thể tải lịch sử đặt dịch vụ. Vui lòng thử lại sau.');
                }
                setLoading(false);
            }
        };

        fetchUserAndBookings();
    }, []);

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đặt dịch vụ này?')) return;

        setCancelLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/bookings/${bookingId}`,
                { status: 'canceled' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBookings((prevBookings) =>
                prevBookings.map((booking) =>
                    booking._id === bookingId ? { ...booking, status: 'canceled' } : booking
                )
            );
            alert('Hủy đặt dịch vụ thành công.');
        } catch (error) {
            console.error('Error canceling booking:', error.response?.data || error.message);
            alert(error.response?.data?.message || 'Hủy đặt dịch vụ thất bại. Vui lòng thử lại.');
        } finally {
            setCancelLoading(false);
        }
    };

    const calculateDays = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 0;
        const start = moment(checkIn);
        const end = moment(checkOut);
        return Math.ceil(end.diff(start, 'days'));
    };

    if (loading) return <div className="text-center py-5">Đang tải...</div>;
    if (error) return <div className="text-center py-5 text-danger">{error}</div>;

    return (
        <section className="booking-history-section py-5 bg-light" style={{ marginTop: '40px' }}>
            <div className="container">
                <h2 className="text-center mb-5 fw-bold" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 'bold' }}>Đơn Đặt Dịch Vụ</h2>
                {bookings.length === 0 ? (
                    <div className="text-center p-5 border rounded bg-white shadow-sm">
                        <p className="mb-4">Bạn chưa có đặt dịch vụ nào.</p>
                        <Link to="/services" className="btn btn-primary btn-lg">
                            Đặt Dịch Vụ Ngay
                        </Link>
                    </div>
                ) : (
                    <div className="row g-4">
                        {bookings.map((booking) => {
                            const serviceName = booking.serviceId?.subServices
                                ? booking.serviceId.subServices[0]?.name
                                : booking.serviceId?.name || 'Dịch vụ không xác định';

                            const isHotelService = booking.serviceId?.category === 3;

                            const days = isHotelService ? calculateDays(booking.checkIn, booking.checkOut) : 1;
                            const totalPrice = booking.serviceId?.price 
                                ? booking.serviceId.price * days 
                                : null;

                            let statusBadgeClass = '';
                            let statusText = '';
                            switch (booking.status) {
                                case 'pending':
                                    statusBadgeClass = 'bg-warning text-dark';
                                    statusText = 'Đang chờ xử lý';
                                    break;
                                case 'active':
                                    statusBadgeClass = 'bg-success';
                                    statusText = 'Đã xác nhận';
                                    break;
                                default:
                                    statusBadgeClass = 'bg-secondary';
                                    statusText = 'Không xác định';
                            }

                            return (
                                <div key={booking._id} className="col-12 col-md-6 col-lg-4">
                                    <div className="card h-100 shadow-sm border-0">
                                        <div className="card-body">
                                            <h5 className="card-title text-dark">
                                                {serviceName}
                                            </h5>
                                            <p className="card-text text-muted mb-2">
                                                Thú cưng: {booking.petId?.name || 'Thú cưng không xác định'}
                                            </p>
                                            {!isHotelService && (
                                                <p className="card-text mb-2">
                                                    Ngày hẹn: {booking.bookingDate 
                                                        ? new Date(booking.bookingDate).toLocaleDateString('vi-VN') 
                                                        : 'Không xác định'}
                                                </p>
                                            )}
                                            {isHotelService ? (
                                                <>
                                                    <p className="card-text mb-2">
                                                        Ngày nhận phòng: {booking.checkIn 
                                                            ? new Date(booking.checkIn).toLocaleDateString('vi-VN') 
                                                            : 'Không áp dụng'}
                                                    </p>
                                                    <p className="card-text mb-2">
                                                        Ngày trả phòng: {booking.checkOut 
                                                            ? new Date(booking.checkOut).toLocaleDateString('vi-VN') 
                                                            : 'Không áp dụng'}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="card-text mb-2">
                                                    Giờ hẹn: {booking.bookingDate 
                                                        ? new Date(booking.bookingDate).toLocaleTimeString('vi-VN', { 
                                                              hour: '2-digit', 
                                                              minute: '2-digit' 
                                                          }) 
                                                        : 'Không áp dụng'}
                                                </p>
                                            )}
                                            {booking.notes && (
                                                <p className="card-text mb-2">
                                                    Ghi chú: {booking.notes}
                                                </p>
                                            )}
                                            <p className="card-text mb-2">
                                                Giá: {totalPrice 
                                                    ? `${totalPrice.toLocaleString('vi-VN')} VNĐ${isHotelService ? ` (${days} ngày)` : ''}` 
                                                    : 'Chưa có giá'}
                                            </p>
                                            <p className="card-text">
                                                <span className={`badge ${statusBadgeClass} p-2`}>
                                                    {statusText}
                                                </span>
                                            </p>
                                            {(booking.status === 'pending' || booking.status === 'active') && (
                                                <button
                                                    className="btn btn-danger btn-sm mt-3"
                                                    onClick={() => handleCancelBooking(booking._id)}
                                                    disabled={cancelLoading}
                                                >
                                                    {cancelLoading ? 'Đang hủy...' : 'Hủy Đặt'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {/* Nút dẫn đến Booking History */}
                <div className="text-center mt-5">
                    <Link to="/bookinghistory" className="btn btn-secondary btn-lg">
                        Xem Lịch Sử Đặt Dịch Vụ
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default MyBookings;