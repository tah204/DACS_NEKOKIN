import React, { useState, useEffect } from 'react';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token, vui lòng đăng nhập');

      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Lỗi khi lấy danh sách đơn đặt dịch vụ');

      const data = await response.json();
      console.log('Fetched bookings:', data); // Log dữ liệu từ API

      // Sắp xếp bookings theo trạng thái: pending → active → completed → canceled
      const statusOrder = {
        pending: 1,
        active: 2,
        completed: 3,
        canceled: 4,
      };
      const sortedBookings = data.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

      setBookings(sortedBookings);
      setError(null);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token, vui lòng đăng nhập');

      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const responseData = await response.json(); // Lấy dữ liệu phản hồi
      console.log('Update booking response:', responseData); // Log phản hồi

      if (!response.ok) {
        throw new Error(responseData.message || 'Lỗi khi cập nhật trạng thái đơn đặt dịch vụ');
      }

      setSuccess(`Cập nhật trạng thái thành ${newStatus === 'active' ? 'Đã Xác Nhận' : newStatus === 'completed' ? 'Hoàn Thành' : 'Hủy'} thành công!`);
      fetchBookings();
      setError(null);
    } catch (error) {
      console.error('Error updating booking:', error);
      setError(error.message);
      setSuccess(null);
    }
  };

  // Hàm chuyển đổi trạng thái thành tên hiển thị
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ Xử Lý';
      case 'active':
        return 'Đã Xác Nhận';
      case 'completed':
        return 'Hoàn Thành';
      case 'canceled':
        return 'Hủy';
      default:
        return status;
    }
  };

  return (
    <div className="card p-4">
      <h2 className="card-title mb-4">Quản Lý Đơn Đặt Dịch Vụ</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Khách Hàng</th>
            <th>Thú Cưng</th>
            <th>Dịch Vụ</th>
            <th>Ngày Hẹn</th>
            <th>Ngày Nhận Phòng</th>
            <th>Ngày Trả Phòng</th>
            <th>Trạng Thái</th>
            <th>Ghi Chú</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <tr key={booking._id}>
              <td>{index + 1}</td>
              <td>{booking.customerId?.name || 'N/A'}</td>
              <td>{booking.petId?.name || 'N/A'} ({booking.petId?.type || 'N/A'})</td>
              <td>{booking.serviceId?.name || 'N/A'}</td>
              <td>
                {booking.serviceId?.category !== 3
                  ? new Date(booking.bookingDate).toLocaleString('vi-VN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : 'N/A'}
              </td>
              <td>{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('vi-VN') : 'N/A'}</td>
              <td>{booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('vi-VN') : 'N/A'}</td>
              <td>{getStatusDisplay(booking.status)}</td>
              <td>{booking.notes || 'Không có ghi chú'}</td>
              <td>
                <div className="d-flex flex-column gap-2">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUpdateStatus(booking._id, 'active')}
                    disabled={booking.status === 'active' || booking.status === 'completed' || booking.status === 'canceled'}
                  >
                    Xác Nhận
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleUpdateStatus(booking._id, 'completed')}
                    disabled={booking.status !== 'active' || booking.status === 'completed' || booking.status === 'canceled'}
                  >
                    Hoàn Thành
                  </button>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleUpdateStatus(booking._id, 'canceled')}
                    disabled={booking.status === 'completed' || booking.status === 'canceled'}
                  >
                    Hủy
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingManagement;