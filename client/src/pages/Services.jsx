import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Services = () => {
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 6;

  const removeAccents = (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/services')
      .then((response) => setServices(response.data))
      .catch((error) => console.error('Error fetching services:', error));
  }, []);

  useEffect(() => {
    console.log('Current page changed:', currentPage);
    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      console.log('Scrolled to top successfully');
    } catch (error) {
      console.error('Error scrolling to top:', error);
      window.scrollTo(0, 0);
    }
  }, [currentPage]);

  const filteredServices = services.filter((service) => {
    const serviceNameNoAccents = removeAccents(service.name).toLowerCase();
    const searchQueryNoAccents = removeAccents(searchQuery).toLowerCase();
    const matchesSearch = serviceNameNoAccents.includes(searchQueryNoAccents);
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);

  const handlePageChange = (pageNumber) => {
    console.log('Changing to page:', pageNumber);
    setCurrentPage(pageNumber);
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <section className="services-section py-5 bg-light">
      <div className="container">
        {/* Phần tiêu đề và mô tả */}
        <div className="row align-items-center mb-5">
          <div className="col-12 col-md-6">
            <h2 className="text-center text-primary mb-4" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
              Dịch vụ
            </h2>
            <img
              src="/images/tamspa.jpg"
              alt="Dịch vụ chăm sóc thú cưng"
              className="img-fluid rounded shadow"
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
              onError={(e) => (e.target.src = '/images/default_service.jpg')}
            />
          </div>
          <div className="col-12 col-md-6">
            <p className="lead text-muted">
              Dịch vụ bạn đang tìm kiếm nằm tại đây! Chúng tôi cung cấp các giải pháp chăm sóc chuyên nghiệp và tận tâm
              cho thú cưng của bạn, từ kiểm tra sức khỏe, chăm sóc lông đến khách sạn lưu trú. Hãy khám phá và chọn dịch vụ phù hợp!
            </p>
            <button className="btn btn-primary mt-3">Xem thêm</button>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="row mb-5 g-3 justify-content-center">
          <div className="col-12 col-md-3">
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control shadow-sm"
              style={{ borderRadius: '20px', padding: '10px' }}
            />
          </div>
        </div>

        {/* Danh sách dịch vụ */}
        <div className="row g-4 mb-5">
          <h3 className="text-center mb-4" style={{ fontSize: '2rem', color: '#1e3a8a' }}>
            Các dịch vụ dành cho thú cưng
          </h3>
          {currentServices.length > 0 ? (
            currentServices.map((service) => (
              <div className="col-12 col-sm-6 col-md-4" key={service._id}>
                <Link to={`/services/${service._id}`} className="text-decoration-none">
                  <div
                    className="card h-100 border-0 shadow-sm"
                    style={{ borderRadius: '15px', overflow: 'hidden', backgroundColor: '#1e3a8a', color: '#fff' }}
                  >
                    <img
                      src={service.image ? `/images/${service.image}` : '/images/default_service.jpg'}
                      alt={service.name}
                      className="card-img-top img-fluid"
                      onError={(e) => (e.target.src = '/images/default_service.jpg')}
                      style={{ objectFit: 'cover', height: '200px' }}
                    />
                    <div className="card-body text-center p-3">
                      <h5 className="card-title mb-2" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                        {service.name}
                      </h5>
                      <p className="card-text" style={{ fontSize: '0.9rem' }}>
                        {service.description.length > 50
                          ? `${service.description.substring(0, 50)}...`
                          : service.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p className="text-muted">Không tìm thấy dịch vụ phù hợp.</p>
            </div>
          )}
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="row mt-5">
            <div className="col-12 text-center">
              <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      style={{ borderRadius: '20px', margin: '0 5px' }}
                    >
                      Trước
                    </button>
                  </li>
                  {pageNumbers.map((number) => (
                    <li
                      key={number}
                      className={`page-item ${currentPage === number ? 'active' : ''}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(number)}
                        style={{
                          borderRadius: '20px',
                          margin: '0 5px',
                          backgroundColor: currentPage === number ? '#007bff' : '',
                          color: currentPage === number ? '#fff' : '',
                        }}
                      >
                        {number}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      style={{ borderRadius: '20px', margin: '0 5px' }}
                    >
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* Phần Triết lý của ADI */}
        <div className="row align-items-center mb-5 py-5 bg-white shadow-sm">
          <div className="col-12 col-md-6 order-md-2">
            <img
              src="/images/stress.jpg"
              alt="Triết lý ADI"
              className="img-fluid rounded"
              style={{ maxHeight: '300px', objectFit: 'contain' }}
              onError={(e) => (e.target.src = '/images/default_service.jpg')}
            />
          </div>
          <div className="col-12 col-md-6 order-md-1">
            <h3 className="text-primary mb-3" style={{ fontSize: '2rem' }}>
              Triết lý của ADI
            </h3>
            <p className="text-muted">
              Chúng tôi tin rằng việc chăm sóc thú cưng không chỉ là trách nhiệm mà còn là niềm vui. Với đội ngũ chuyên
              nghiệp và tận tâm, chúng tôi mang đến sự an toàn và yêu thương cho thú cưng của bạn. Hãy để chúng tôi đồng
              hành cùng bạn!
            </p>
            <button className="btn btn-primary mt-3">Tìm hiểu thêm</button>
          </div>
        </div>

        {/* Phần Compassionate care */}
        <div className="row align-items-center mb-5 py-5 bg-light">
          <div className="col-12 col-md-6">
            <img
              src="/images/petfun.jpg"
              alt="Chăm sóc tận tâm"
              className="img-fluid rounded shadow"
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
              onError={(e) => (e.target.src = '/images/default_service.jpg')}
            />
          </div>
          <div className="col-12 col-md-6 text-center">
            <h3 className="text-primary mb-3" style={{ fontSize: '2.5rem' }}>
              Compassionate care, right when matters
            </h3>
            <p className="text-muted mb-4">
              Chúng tôi luôn ở đây khi bạn cần, mang đến sự chăm sóc tận tâm cho thú cưng của bạn.
            </p>
            <button className="btn btn-primary">Đặt lịch ngay</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;