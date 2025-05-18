import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ActiveBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để xem dịch vụ đang đặt.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const activeBookings = response.data.filter((b) => b.status === 'active');
        setBookings(activeBookings);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching active bookings:', error.response?.data || error.message);
        setError('Không thể tải danh sách dịch vụ đang đặt.');
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <div className="text-center py-5">Đang tải...</div>;
  if (error) return <div className="text-center py-5">{error}</div>;

  return (
    <section className="active-bookings-section py-5 bg-light">
      <div className="container">
        <h2 className="text-center mb-4">Dịch vụ bạn đang đặt</h2>
        {bookings.length === 0 ? (
          <p className="text-center">Bạn chưa có dịch vụ nào đang đặt.</p>
        ) : (
          <div className="row g-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="col-12 col-md-6 col-lg-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Dịch vụ: {booking.serviceId?.name || 'Không xác định'}</h5>
                    <p className="card-text">
                      <strong>Tên khách hàng:</strong> {booking.customerName}
                    </p>
                    <p className="card-text">
                      <strong>Số điện thoại:</strong> {booking.phone}
                    </p>
                    <p className="card-text">
                      <strong>Ngày đặt:</strong>{' '}
                      {new Date(booking.bookingDate).toLocaleString('vi-VN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                    <p className="card-text">
                      <strong>Giá:</strong> {booking.serviceId?.price?.toLocaleString() || 'N/A'} VNĐ
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-5">
          <Link to="/booking-history" className="btn btn-primary">
            Xem lịch sử dịch vụ
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ActiveBookings;