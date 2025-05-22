import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import HeroIntro from '../components/HeroIntro';
import { motion } from 'framer-motion';
import NewsSlider from '../components/NewsSlider';
import '../App.css'; // Đảm bảo đường dẫn đúng với vị trí file CSS

const Home = () => {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [consultation, setConsultation] = useState({ petName: '', phone: '' });

  useEffect(() => {
    axios.get('http://localhost:5000/api/news')
      .then((res) => {
        const sortedNews = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setFeaturedNews(sortedNews);
      })
      .catch((err) => console.error('Error fetching news:', err));

    axios.get('http://localhost:5000/api/products')
      .then((res) => {
        const shuffled = res.data.sort(() => 0.5 - Math.random()).slice(0, 4);
        setFeaturedProducts(shuffled);
      })
      .catch((err) => console.error('Error fetching products:', err));

    axios.get('http://localhost:5000/api/services')
      .then((res) => {
        const shuffled = res.data.sort(() => 0.5 - Math.random()).slice(0, 4);
        setFeaturedServices(shuffled);
      })
      .catch((err) => console.error('Error fetching services:', err));
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
      <HeroIntro />

      {/* Giới thiệu */}
      <section className="py-5" id="gioi-thieu">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-6">
              <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <h2 className="mb-4 intro-title">Giới thiệu</h2>
                <p className="text-muted mb-3 intro-text">
                  NekoKin ra đời từ niềm đam mê và tình yêu dành cho thú cưng...
                </p>
                <p className="text-muted mb-3 intro-text">
                  Chúng tôi cung cấp các sản phẩm chất lượng cao, dịch vụ tư vấn chuyên nghiệp...
                </p>
                <Link to="/about" className="btn btn-red" onClick={handleLinkClick}>Chi tiết</Link>
              </motion.div>
            </div>
            <div className="col-12 col-lg-6 text-center">
              <motion.img
                src="/images/thú-cưng-và-bs.jpg"
                alt="Thú cưng"
                className="img-fluid rounded shadow"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tư vấn nhanh */}
      <section className="py-5" style={{ backgroundColor: '#FAF7F1' }}>
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-6 order-lg-2">
              <div className="consultation-box">
                <h2 className="h3 mb-3 intro-title">Tư vấn nhanh</h2>
                <p className="mb-4 text-muted">Vui lòng nhập thông tin để được hỗ trợ tốt nhất!</p>
                <form onSubmit={handleConsultationSubmit}>
                  <div className="mb-3">
                    <label htmlFor="petName" className="form-label fw-semibold">Tên khách hàng</label>
                    <input type="text" className="form-control" id="petName" name="petName" value={consultation.petName} onChange={handleInputChange} placeholder="Nhập tên của bạn" />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label fw-semibold">Số điện thoại</label>
                    <input type="tel" className="form-control" id="phone" name="phone" value={consultation.phone} onChange={handleInputChange} placeholder="Nhập số điện thoại" />
                  </div>
                  <button type="submit" className="btn w-100 py-2 btn-red">Gửi yêu cầu tư vấn</button>
                </form>
                <p className="mt-3 text-center text-muted">Hoặc gọi ngay <strong>036 321 3230</strong></p>
              </div>
            </div>
            <div className="col-12 col-lg-6 text-center order-lg-1">
              <img src="/images/tuvan1.jpg" alt="Thú cưng tư vấn" className="img-fluid rounded-circle shadow consultation-image" />
            </div>
          </div>
        </div>
      </section>

      {/* Dịch vụ */}
      <motion.section className="py-5" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <div className="container">
          <h2 className="text-center mb-5 intro-title">Sự chăm sóc tốt nhất dành cho thú cưng</h2>
          <div className="row g-4">
            {featuredServices.length > 0 ? (
              featuredServices.map((service) => (
                <div key={service._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <Link to={`/services/${service._id}`} className="text-decoration-none text-dark" onClick={handleLinkClick}>
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }} className="card h-100 shadow-sm border-0">
                      <img src={`/images/${service.image}`} className="card-img-top img-fluid card-img-custom" alt={service.name} onError={(e) => (e.target.src = '/images/default_service.jpg')} />
                      <div className="card-body">
                        <h3 className="card-title card-title-center">{service.name}</h3>
                      </div>
                    </motion.div>
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
            <Link to="/services" onClick={handleLinkClick} className="btn btn-red px-4 py-2">Tìm hiểu thêm</Link>
          </div>
        </div>
      </motion.section>

      {/* Sản phẩm */}
      <motion.section className="py-5" style={{ backgroundColor: '#FAF7F1' }} initial={{ opacity: 0, y: 70 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.5 }}>
        <div className="container">
          <h2 className="text-center mb-5 intro-title">Sản phẩm nổi bật</h2>
          <div className="row g-4">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div key={product._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <Link to={`/products/${product._id}`} className="text-decoration-none text-dark" onClick={handleLinkClick}>
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }} className="card h-100 shadow-sm">
                      <img src={`/images/${product.image}`} className="card-img-top img-fluid card-img-custom" alt={product.name} onError={(e) => (e.target.src = '/images/default_product.jpg')} />
                      <div className="card-body">
                        <h3 className="card-title text-center">{product.name}</h3>
                      </div>
                    </motion.div>
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
            <Link to="/products" className="btn btn-red" onClick={handleLinkClick}>Xem thêm</Link>
          </div>
        </div>
      </motion.section>

      {/* Tin tức */}
      <NewsSlider featuredNews={featuredNews} />
    </div>
  );
};

export default Home;
