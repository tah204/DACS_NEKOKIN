import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      try {
        // Lấy thông tin người dùng từ localStorage hoặc API
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

        // Lấy danh sách booking của customer
        const bookingResponse = await axios.get('http://localhost:5000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(bookingResponse.data);
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
    }
  };

  if (loading) return <div className="text-center py-5">Đang tải...</div>;
  if (error) return <div className="text-center py-5 text-danger">{error}</div>;

  return (
    <section className="booking-history-section py-5 bg-light">
      <div className="container">
        <h2 className="text-center mb-4">Dịch Vụ Đang Đặt</h2>
        {bookings.length === 0 ? (
          <div className="text-center">
            <p>Bạn chưa có đặt dịch vụ nào.</p>
            <Link to="/services" className="btn btn-primary">
              Đặt Dịch Vụ Ngay
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th>Dịch Vụ</th>
                  <th>Thú Cưng</th>
                  <th>Ngày Đặt</th>
                  <th>Trạng Thái</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.serviceId?.name || 'Không xác định'}</td>
                    <td>{booking.petId?.name || 'Không xác định'}</td>
                    <td>{new Date(booking.bookingDate).toLocaleString('vi-VN')}</td>
                    <td>
                      <span
                        className={`badge ${
                          booking.status === 'active'
                            ? 'bg-success'
                            : booking.status === 'completed'
                            ? 'bg-primary'
                            : 'bg-danger'
                        }`}
                      >
                        {booking.status === 'active'
                          ? 'Đang hoạt động'
                          : booking.status === 'completed'
                          ? 'Đã hoàn thành'
                          : 'Đã hủy'}
                      </span>
                    </td>
                    <td>
                      {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('vi-VN') : 'Không áp dụng'}
                    </td>
                    <td>
                      {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('vi-VN') : 'Không áp dụng'}
                    </td>
                    <td>
                      {booking.status === 'active' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          Hủy
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyBookings;