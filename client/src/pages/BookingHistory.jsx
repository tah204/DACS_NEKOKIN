import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BookingHistory = () => {
  const [completedBookings, setCompletedBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndCompletedBookings = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Vui lòng đăng nhập để xem lịch sử dịch vụ đã sử dụng.');
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

        const completedOrCanceled = bookingResponse.data.filter((booking) =>
          booking.status === 'completed' || booking.status === 'canceled'
        );
        setCompletedBookings(completedOrCanceled);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching completed bookings:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
          setError('Không thể tải lịch sử dịch vụ đã sử dụng. Vui lòng thử lại sau.');
        }
        setLoading(false);
      }
    };

    fetchUserAndCompletedBookings();
  }, []);

  if (loading) return <div className="text-center py-5">Đang tải...</div>;
  if (error) return <div className="text-center py-5 text-danger">{error}</div>;

  const getStatusDisplay = (status) => {
    let statusBadgeClass = '';
    let statusText = '';
    switch (status) {
      case 'pending':
        statusBadgeClass = 'bg-warning text-dark';
        statusText = 'Đang chờ xử lý';
        break;
      case 'active':
        statusBadgeClass = 'bg-success';
        statusText = 'Đang hoạt động';
        break;
      case 'completed':
        statusBadgeClass = 'bg-primary';
        statusText = 'Đã hoàn thành';
        break;
      case 'canceled':
        statusBadgeClass = 'bg-danger';
        statusText = 'Đã hủy';
        break;
      default:
        statusBadgeClass = 'bg-secondary';
        statusText = 'Không xác định';
    }
    return { statusBadgeClass, statusText };
  };

  return (
    <section className="my-booking-section py-5 bg-light" style={{ marginTop: '40px' }}>
      <div className="container">
        <h2 className="text-center mb-5 fw-bold" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 'bold' }}>
          Lịch Sử Dịch Vụ Đã Sử Dụng
        </h2>
        {completedBookings.length === 0 ? (
          <div className="text-center">
            <p>Bạn chưa có dịch vụ nào đã hoàn thành hoặc đã hủy.</p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/services" className="btn btn-primary">
                Đặt Dịch Vụ Ngay
              </Link>
              <Link to="/mybookings" className="btn btn-secondary">
                Quay Lại Đơn Đặt Dịch Vụ
              </Link>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th>Dịch Vụ</th>
                  <th>Thú Cưng</th>
                  <th>Ngày Hẹn</th>
                  <th>Giờ Hẹn</th>
                  <th>Ngày Nhận Phòng</th>
                  <th>Ngày Trả Phòng</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {completedBookings.map((booking) => {
                  const isHotelService = booking.serviceId?.category === 3;
                  const { statusBadgeClass, statusText } = getStatusDisplay(booking.status);

                  return (
                    <tr key={booking._id}>
                      <td>{booking.serviceId?.name || 'Không xác định'}</td>
                      <td>{booking.petId?.name || 'Không xác định'}</td>
                      <td>
                        {!isHotelService
                          ? booking.bookingDate
                            ? new Date(booking.bookingDate).toLocaleDateString('vi-VN')
                            : 'Không xác định'
                          : 'Không áp dụng'}
                      </td>
                      <td>
                        {!isHotelService
                          ? booking.bookingDate
                            ? new Date(booking.bookingDate).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Không áp dụng'
                          : 'Không áp dụng'}
                      </td>
                      <td>
                        {isHotelService
                          ? booking.checkIn
                            ? new Date(booking.checkIn).toLocaleDateString('vi-VN')
                            : 'Không áp dụng'
                          : 'Không áp dụng'}
                      </td>
                      <td>
                        {isHotelService
                          ? booking.checkOut
                            ? new Date(booking.checkOut).toLocaleDateString('vi-VN')
                            : 'Không áp dụng'
                          : 'Không áp dụng'}
                      </td>
                      <td>
                        <span className={`badge ${statusBadgeClass} p-2`}>{statusText}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="text-center mt-5">
              <Link to="/mybookings" className="btn btn-secondary">
                Quay Lại Đơn Đặt Dịch Vụ
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BookingHistory;