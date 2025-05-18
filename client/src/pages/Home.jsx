import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [consultation, setConsultation] = useState({ petName: '', phone: '' });

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/news')
      .then((response) => {
        const sortedNews = response.data
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);
        setFeaturedNews(sortedNews);
      })
      .catch((error) => console.error('Error fetching featured news:', error));

    axios
      .get('http://localhost:5000/api/products')
      .then((response) => {
        const shuffledProducts = response.data.sort(() => 0.5 - Math.random());
        const selectedProducts = shuffledProducts.slice(0, 4);
        setFeaturedProducts(selectedProducts);
      })
      .catch((error) => console.error('Error fetching featured products:', error));

    axios
      .get('http://localhost:5000/api/services')
      .then((response) => {
        const shuffledServices = response.data.sort(() => 0.5 - Math.random());
        const selectedServices = shuffledServices.slice(0, 4);
        setFeaturedServices(selectedServices);
      })
      .catch((error) => console.error('Error fetching featured services:', error));
  }, []);

  const handleLinkClick = () => {
    window.scrollTo(0, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConsultation((prev) => ({ ...prev, [name]: value }));
  };

  const handleConsultationSubmit = (e) => {
    e.preventDefault();
    console.log('Consultation submitted:', consultation);
    setConsultation({ petName: '', phone: '' });
  };

  return (
    <div>
      {/* Banner */}
      <section
        className="d-flex align-items-center justify-content-center text-center text-white bg-primary"
        id="home"
        style={{
          backgroundImage: `url(/images/anhbia.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
        }}
      >
        <div className="container">
          <h1 className="display-4 text-uppercase fw-bold mb-3">NekoKin</h1>
          <p className="lead">
            Ở đây có dịch vụ cho thú cưng và nhiều hơn thế nữa
          </p>
        </div>
      </section>

      {/* Giới Thiệu */}
      <section className="py-5" id="gioi-thieu">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-6">
              <h2 className="mb-4">Giới thiệu</h2>
              <p className="text-muted mb-3">
                NekoKin ra đời từ niềm đam mê và tình yêu dành cho thú cưng, với mong muốn mang đến các sản phẩm và dịch vụ chăm sóc thú cưng tốt nhất.
              </p>
              <p className="text-muted mb-3">
                Chúng tôi cung cấp các sản phẩm chất lượng cao, dịch vụ tư vấn chuyên nghiệp, và tin tức hữu ích để giúp bạn chăm sóc thú cưng của mình một cách hiệu quả. NekoKin cam kết đồng hành cùng bạn trên hành trình nuôi dưỡng và bảo vệ sức khỏe cho các bé yêu.
              </p>
              <Link
                to="/about"
                className="btn btn-primary"
                onClick={handleLinkClick}
              >
                Chi tiết
              </Link>
            </div>
            <div className="col-12 col-lg-6 text-center">
              <img
                src="/images/intro.jpg"
                alt="Thú cưng"
                className="img-fluid rounded shadow"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tư Vấn Nhanh */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-6 order-lg-2">
              <div className="p-4 bg-white rounded shadow-sm">
                <h2 className="h4 mb-3">TƯ VẤN NHANH</h2>
                <p className="mb-4 text-muted">Vui lòng nhập thông tin để được hỗ trợ!</p>
                <form onSubmit={handleConsultationSubmit}>
                  <div className="mb-3">
                    <label htmlFor="petName" className="form-label">
                      Tên khách hàng
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="petName"
                      name="petName"
                      value={consultation.petName}
                      onChange={handleInputChange}
                      placeholder="Nhập tên"
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
                      value={consultation.phone}
                      onChange={handleInputChange}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Tư vấn
                  </button>
                </form>
                <p className="mt-3 text-center text-muted">
                  Hãy gọi ngay <strong>036 321 3230</strong>
                </p>
              </div>
            </div>
            <div className="col-12 col-lg-6 text-center order-lg-1">
              <img
                src="/images/tuvan.jpg"
                alt="Thú cưng tư vấn"
                className="img-fluid rounded-circle shadow"
                style={{ maxWidth: '400px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sản Phẩm Nổi Bật */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">Sản phẩm nổi bật</h2>
          <div className="row g-4">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div key={product._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <Link
                    to={`/products/${product._id}`}
                    className="text-decoration-none text-dark"
                    onClick={handleLinkClick}
                  >
                    <div className="card h-100 shadow-sm">
                      <img
                        src={`/images/${product.image}`}
                        className="card-img-top img-fluid"
                        alt={product.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => (e.target.src = '/images/default_product.jpg')}
                      />
                      <div className="card-body">
                        <h3 className="card-title text-center">{product.name}</h3>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <p className="text-muted">Không có sản phẩm nổi bật.</p>
              </div>
            )}
          </div>
          <div className="text-center mt-4">
            <Link
              to="/products"
              className="btn btn-primary"
              onClick={handleLinkClick}
            >
              Xem thêm
            </Link>
          </div>
        </div>
      </section>

      {/* Dịch Vụ Nổi Bật */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Dịch vụ nổi bật</h2>
          <div className="row g-4">
            {featuredServices.length > 0 ? (
              featuredServices.map((service) => (
                <div key={service._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <Link
                    to={`/services/${service._id}`}
                    className="text-decoration-none text-dark"
                    onClick={handleLinkClick}
                  >
                    <div className="card h-100 shadow-sm">
                      <img
                        src={`/images/${service.image}`}
                        className="card-img-top img-fluid"
                        alt={service.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => (e.target.src = '/images/default_service.jpg')}
                      />
                      <div className="card-body">
                        <h3 className="card-title text-center">{service.name}</h3>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <p className="text-muted">Không có dịch vụ nổi bật.</p>
              </div>
            )}
          </div>
          <div className="text-center mt-4">
            <Link
              to="/services"
              className="btn btn-primary"
              onClick={handleLinkClick}
            >
              Xem thêm
            </Link>
          </div>
        </div>
      </section>

      {/* Tin Tức Nổi Bật */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">Tin tức nổi bật</h2>
          <div className="row g-4">
            {featuredNews.length > 0 ? (
              featuredNews.map((item) => (
                <div key={item._id} className="col-12 col-md-6 col-lg-4">
                  <Link
                    to={`/news/${item._id}`}
                    className="text-decoration-none text-dark"
                    onClick={handleLinkClick}
                  >
                    <div className="card h-100 shadow-sm">
                      <div className="row g-0">
                        <div className="col-4">
                          <img
                            src={`/images/${item.image}`}
                            className="img-fluid h-100"
                            alt={item.title}
                            style={{ objectFit: 'cover' }}
                            onError={(e) => (e.target.src = '/images/default_news.jpg')}
                          />
                        </div>
                        <div className="col-8">
                          <div className="card-body">
                            <h3 className="card-title">{item.title}</h3>
                            <p className="card-text text-muted">{item.content}</p>
                            <p className="card-text text-muted small">
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <p className="text-muted">Không có tin tức nổi bật.</p>
              </div>
            )}
          </div>
          <div className="text-center mt-4">
            <Link
              to="/news"
              className="btn btn-primary"
              onClick={handleLinkClick}
            >
              Xem thêm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;