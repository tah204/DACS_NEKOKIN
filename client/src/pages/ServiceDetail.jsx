import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    phone: '',
    bookingDate: '',
  });

  useEffect(() => {
    let mounted = true;

    // Kiểm tra id hợp lệ
    if (!id) {
      if (mounted) setError('ID không hợp lệ. Vui lòng thử lại.');
      return;
    }

    axios
      .get(`http://localhost:5000/api/services/${id}`)
      .then((response) => {
        if (mounted) {
          console.log('Service Detail Response:', response.data);
          if (!response.data || !response.data.name) {
            setError('Dữ liệu dịch vụ không hợp lệ.');
          } else {
            setService(response.data);
          }
        }
      })
      .catch((error) => {
        if (mounted) {
          console.error('Error fetching service:', error.response ? error.response.data : error.message);
          setError('Không thể tải thông tin dịch vụ.');
        }
      });

    // Cleanup function để tránh cập nhật state khi component unmount
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    console.log('Booking submitted:', bookingForm);
    setShowModal(false);
    setBookingForm({ customerName: '', phone: '', bookingDate: '' });
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
                <p className="card-text fs-4 text-primary mb-2">
                  {service.price.toLocaleString()} VNĐ
                </p>
                <p className="card-text text-muted mb-2">
                  <strong>Dành cho:</strong>{' '}
                  {service.petType === 'cat'
                    ? 'Mèo'
                    : service.petType === 'dog'
                    ? 'Chó'
                    : 'Chó và Mèo'}
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
                    onClick={() => setShowModal(true)}
                  >
                    Đặt dịch vụ
                  </button>
                  <Link
                    to="/services"
                    className="btn btn-secondary"
                    onClick={() => window.scrollTo(0, 0)}
                  >
                    Quay lại danh sách dịch vụ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`modal fade ${showModal ? 'show d-block' : ''}`}
        tabIndex="-1"
        style={{ display: showModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Đặt dịch vụ: {service.name}</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowModal(false)}
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
                <button type="submit" className="btn btn-primary w-100">
                  Xác nhận đặt dịch vụ
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceDetail;