import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [isValidBooking, setIsValidBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    phone: '',
    bookingDate: '',
    bookingTime: '',
    serviceId: id,
  });
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!id) {
        if (mounted) setError('ID không hợp lệ. Vui lòng thử lại.');
        return;
      }

      try {
        const serviceResponse = await axios.get(`http://localhost:5000/api/services/${id}`);
        if (mounted && (!serviceResponse.data || !serviceResponse.data.name)) {
          setError('Dữ liệu dịch vụ không hợp lệ.');
        } else if (mounted) {
          setService(serviceResponse.data);
          setBookingForm((prev) => ({ ...prev, serviceId: id }));
        }
      } catch (error) {
        if (mounted) {
          console.error('Error fetching data:', error.response ? error.response.data : error.message);
          setError('Không thể tải thông tin.');
        }
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [id]);

  const validateBookingTime = (date, time) => {
    const currentDateTime = new Date();
    const currentDate = currentDateTime.toISOString().split('T')[0];
    const currentTime = currentDateTime.toTimeString().split(' ')[0].substring(0, 5);

    if (!date || !time) {
      setBookingError('');
      setIsValidBooking(false);
      return;
    }

    if (date < currentDate) {
      setBookingError('Không thể đặt lịch cho ngày đã qua.');
      setIsValidBooking(false);
      return;
    }

    if (date === currentDate && time < currentTime) {
      setBookingError('Không thể đặt lịch trước giờ hiện tại.');
      setIsValidBooking(false);
      return;
    }

    setBookingError('');
    setIsValidBooking(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => {
      const updatedForm = { ...prev, [name]: value };
      if (name === 'bookingDate' || name === 'bookingTime') {
        validateBookingTime(
          name === 'bookingDate' ? value : updatedForm.bookingDate,
          name === 'bookingTime' ? value : updatedForm.bookingTime
        );
      }
      return updatedForm;
    });
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (!isValidBooking) return;

    const bookingDateTime = new Date(`${bookingForm.bookingDate}T${bookingForm.bookingTime}:00+07:00`);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/bookings',
        { customerName: bookingForm.customerName, phone: bookingForm.phone, bookingDate: bookingDateTime.toISOString(), serviceId: bookingForm.serviceId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowBookingModal(false);
      setBookingForm({ customerName: '', phone: '', bookingDate: '', bookingTime: '', serviceId: id });
      setBookingError('');
      setIsValidBooking(false);
      alert('Đặt lịch thành công! Vui lòng kiểm tra tại "Dịch vụ đang đặt".');
    } catch (error) {
      console.error('Error booking:', error.message);
      setError('Đặt lịch thất bại.');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', loginForm);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setShowLoginModal(false);
      setShowBookingModal(true);
    } catch (error) {
      console.error('Error logging in:', error.message);
      setError('Đăng nhập thất bại.');
    }
  };

  if (error) return <div className="text-center py-5">{error}</div>;
  if (!service) return <div className="text-center py-5">Đang tải...</div>;

  return (
    <section className="service-detail-section py-5 bg-light">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-6 mb-4">
            <img
              src={`/images/${service.image}`}
              alt={service.name}
              className="img-fluid rounded shadow"
              style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
              onError={(e) => (e.target.src = '/images/default_service.jpg')}
            />
          </div>
          <div className="col-12 col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title mb-3">{service.name}</h2>
                <p className="card-text fs-4 text-primary mb-2">{service.price.toLocaleString()} VNĐ</p>
                <p className="card-text text-muted mb-2">
                  <strong>Dành cho:</strong>{' '}
                  {service.petType === 'cat' ? 'Mèo' : service.petType === 'dog' ? 'Chó' : 'Chó và Mèo'}
                </p>
                <p className="card-text text-muted mb-2">
                  <strong>Độ tuổi:</strong>{' '}
                  {service.ageRange === 'all'
                    ? 'Tất cả độ tuổi'
                    : service.ageRange === 'under_2_months'
                    ? 'Dưới 2 tháng'
                    : service.ageRange === '2_to_6_months'
                    ? 'Từ 2-6 tháng'
                    : service.ageRange === '6_to_12_months'
                    ? 'Từ 6-12 tháng'
                    : service.ageRange === '1_to_7_years'
                    ? 'Từ 1-7 năm'
                    : 'Trên 7 năm'}
                </p>
                <p className="card-text text-muted mb-2">
                  <strong>Thời gian thực hiện:</strong> {service.duration}
                </p>
                <p className="card-text text-muted mb-4">
                  <strong>Mô tả dịch vụ:</strong> {service.description}
                </p>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => (localStorage.getItem('token') ? setShowBookingModal(true) : setShowLoginModal(true))}
                  >
                    Đặt dịch vụ
                  </button>
                  <Link to="/services" className="btn btn-secondary" onClick={() => window.scrollTo(0, 0)}>
                    Quay lại danh sách dịch vụ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Đặt Lịch */}
        <div
          className={`modal fade ${showBookingModal ? 'show d-block' : ''}`}
          tabIndex="-1"
          style={{ display: showBookingModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Đặt dịch vụ: {service.name}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowBookingModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleBookingSubmit}>
                  <div className="mb-3">
                    <label htmlFor="customerName" className="form-label">
                      Tên khách hàng
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="customerName"
                      name="customerName"
                      value={bookingForm.customerName}
                      onChange={handleInputChange}
                      placeholder="Nhập tên"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={bookingForm.phone}
                      onChange={handleInputChange}
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="bookingDate" className="form-label">
                      Ngày đặt
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="bookingDate"
                      name="bookingDate"
                      value={bookingForm.bookingDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="bookingTime" className="form-label">
                      Giờ đặt
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      id="bookingTime"
                      name="bookingTime"
                      value={bookingForm.bookingTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {bookingError && <div className="alert alert-danger">{bookingError}</div>}
                  <button type="submit" className="btn btn-primary w-100" disabled={!isValidBooking}>
                    Xác nhận đặt dịch vụ
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Đăng Nhập */}
        <div
          className={`modal fade ${showLoginModal ? 'show d-block' : ''}`}
          tabIndex="-1"
          style={{ display: showLoginModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Đăng nhập</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowLoginModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleLoginSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={loginForm.username}
                      onChange={handleLoginInputChange}
                      placeholder="Nhập tên đăng nhập"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={loginForm.password}
                      onChange={handleLoginInputChange}
                      placeholder="Nhập mật khẩu"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Đăng nhập
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceDetail;