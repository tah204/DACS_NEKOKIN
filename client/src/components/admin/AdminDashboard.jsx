import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalServices: 0,
    totalNews: 0,
    totalBookings: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
        setError('');
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thống kê:', error);
        setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="card p-4">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="card p-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h2 className="card-title">Dashboard</h2>
      <p className="card-text">Chào mừng đến với bảng điều khiển quản trị. Bạn có thể xem tổng quan tại đây.</p>

      <div className="row mt-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100 bg-primary text-white p-3">
            <h5 className="card-title">Tổng Dịch Vụ</h5>
            <p className="card-text display-4">{stats.totalServices}</p>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100 bg-success text-white p-3">
            <h5 className="card-title">Tổng Tin Tức</h5>
            <p className="card-text display-4">{stats.totalNews}</p>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100 bg-warning text-white p-3">
            <h5 className="card-title">Tổng Đơn Đặt Hàng</h5>
            <p className="card-text display-4">{stats.totalBookings}</p>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100 bg-info text-white p-3">
            <h5 className="card-title">Tổng Khách Hàng</h5>
            <p className="card-text display-4">{stats.totalCustomers}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;