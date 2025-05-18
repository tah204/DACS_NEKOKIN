import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [petTypeFilter, setPetTypeFilter] = useState('all');
  const [ageRangeFilter, setAgeRangeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16;

  const removeAccents = (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/products')
      .then((response) => setProducts(response.data))
      .catch((error) => console.error('Error fetching products:', error));
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

  const filteredProducts = products.filter((product) => {
    const matchesPetType = petTypeFilter === 'all' || product.petType === petTypeFilter;
    const matchesAgeRange = ageRangeFilter === 'all' || product.ageRange === ageRangeFilter;
    const productNameNoAccents = removeAccents(product.name).toLowerCase();
    const searchQueryNoAccents = removeAccents(searchQuery).toLowerCase();
    const matchesSearch = productNameNoAccents.includes(searchQueryNoAccents);
    return matchesPetType && matchesAgeRange && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (pageNumber) => {
    console.log('Changing to page:', pageNumber);
    setCurrentPage(pageNumber);
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <section className="products-section py-5 bg-light">
      <div className="container">
        {/* Tiêu đề */}
        <h2 className="text-center mb-5">Sản phẩm</h2>

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
            </select>
          </div>
          <div className="col-12 col-md-4 mb-3">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            />
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="row g-4">
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={product._id}>
                <Link to={`/products/${product._id}`} className="product-card text-decoration-none text-dark">
                  <div className="card h-100 shadow-sm">
                    <img
                      src={`/images/${product.image}`}
                      alt={product.name}
                      className="card-img-top img-fluid"
                      onError={(e) => (e.target.src = '/images/default_product.jpg')}
                      style={{ objectFit: 'cover', height: '200px' }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h3 className="card-title text-center">{product.name}</h3>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p className="text-muted">Không tìm thấy sản phẩm phù hợp.</p>
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

export default Products;