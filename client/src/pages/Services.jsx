import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Services = () => {
  const [services, setServices] = useState([]);
  const [petTypeFilter, setPetTypeFilter] = useState('all');
  const [ageRangeFilter, setAgeRangeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 16;

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
    const matchesPetType = petTypeFilter === 'all' || service.petType === petTypeFilter;
    const matchesAgeRange = ageRangeFilter === 'all' || service.ageRange === ageRangeFilter;
    const serviceNameNoAccents = removeAccents(service.name).toLowerCase();
    const searchQueryNoAccents = removeAccents(searchQuery).toLowerCase();
    const matchesSearch = serviceNameNoAccents.includes(searchQueryNoAccents);
    return matchesPetType && matchesAgeRange && matchesSearch;
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
        {/* Tiêu đề */}
        <h2 className="text-center mb-5">Dịch vụ</h2>

        {/* Bộ lọc */}
        <div className="row mb-4">
          <div className="col-12 col-md-4 mb-3">
            <select
              value={petTypeFilter}
              onChange={(e) => {
                setPetTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select"
            >
              <option value="all">Tất cả thú cưng</option>
              <option value="dog">Chó</option>
              <option value="cat">Mèo</option>
              <option value="both">Chó và Mèo</option>
            </select>
          </div>
          <div className="col-12 col-md-4 mb-3">
            <select
              value={ageRangeFilter}
              onChange={(e) => {
                setAgeRangeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select"
            >
              <option value="all">Tất cả độ tuổi</option>
              <option value="under_2_months">Dưới 2 tháng</option>
              <option value="2_to_6_months">Từ 2-6 tháng</option>
              <option value="6_to_12_months">Từ 6-12 tháng</option>
              <option value="1_to_7_years">Từ 1-7 năm</option>
              <option value="over_7_years">Trên 7 năm</option>
              <option value="all">Mọi độ tuổi</option>
            </select>
          </div>
          <div className="col-12 col-md-4 mb-3">
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            />
          </div>
        </div>

        {/* Danh sách dịch vụ */}
        <div className="row g-4">
          {currentServices.length > 0 ? (
            currentServices.map((service) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={service._id}>
                <Link to={`/services/${service._id}`} className="text-decoration-none text-dark">
                  <div className="card h-100 shadow-sm">
                    <img
                      src={`/images/${service.image}`}
                      alt={service.name}
                      className="card-img-top img-fluid"
                      onError={(e) => (e.target.src = '/images/default_service.jpg')}
                      style={{ objectFit: 'cover', height: '200px' }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h3 className="card-title text-center">{service.name}</h3>
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
          <div className="row mt-4">
            <div className="col-12 text-center">
              <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
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
                      >
                        {number}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;