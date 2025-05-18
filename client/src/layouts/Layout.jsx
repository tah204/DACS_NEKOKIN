import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { FaInstagram, FaTiktok, FaPinterest, FaFacebook, FaTwitter, FaYoutube } from 'react-icons/fa';

const Layout = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    let timer;
    if (showMessage) {
      timer = setTimeout(() => {
        setShowMessage(false);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [showMessage]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setMessage('');
    setShowMessage(false);

    if (password.length < 6) {
      setMessage('Mật khẩu phải dài ít nhất 6 ký tự');
      setShowMessage(true);
      return;
    }
    if (!isLogin && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Email không hợp lệ');
      setShowMessage(true);
      return;
    }

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin ? { username, password } : { username, password, email, role: 'user' };
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      setMessage(data.message);
      setShowMessage(true);

      if (response.ok) {
        setTimeout(() => {
          setShowModal(false);
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.token);
          setShowToast(true);
          setUsername('');
          setPassword('');
          setEmail('');
          setShowMessage(false);
        }, 2000);
      }
    } catch (error) {
      setMessage('Lỗi kết nối máy chủ');
      setShowMessage(true);
    }
  }, [isLogin, username, password, email]);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setShowToast(false);
  }, []);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setMessage('');
    setShowMessage(false);
    setUsername('');
    setPassword('');
    setEmail('');
  }, []);

  const handleShow = useCallback(() => setShowModal(true), []);

  const handleAdminAccess = useCallback(() => {
    navigate('/admin/dashboard');
  }, [navigate]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) handleClose();
    };
    if (showModal) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [showModal, handleClose]);

  return (
    <div className="d-flex flex-column min-vh-100">
      {user && showToast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header bg-success text-white">
              <strong className="me-auto">Thông báo</strong>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowToast(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="toast-body">
              Chào mừng {user.username}!
            </div>
          </div>
        </div>
      )}

      <header className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow-sm">
        <div className="container">
          <Link className="navbar-brand" to="/home" onClick={scrollToTop}>
            <img src="/images/logoshop.jpg" alt="NekoKin Logo" className="img-fluid" style={{ maxHeight: '40px' }} />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {[
                { to: "/home", label: "Trang Chủ", isHashLink: true },
                { to: "/about", label: "Giới thiệu", isHashLink: false },
                { to: "/products", label: "Sản phẩm", isHashLink: false },
                { to: "/services", label: "Dịch vụ", isHashLink: false },
                { to: "/news", label: "Tin tức", isHashLink: false },
                { to: "/active-bookings", label: "Dịch vụ đang đặt", isHashLink: false, userOnly: true }, // Thêm mục mới
              ].map((item, index) => (
                <li key={index} className="nav-item">
                  {item.userOnly ? (
                    user && user.role === 'user' && (
                      <Link to={item.to} className="nav-link" onClick={scrollToTop}>
                        {item.label}
                      </Link>
                    )
                  ) : item.isHashLink ? (
                    <HashLink smooth to={item.to} className="nav-link" onClick={scrollToTop}>
                      {item.label}
                    </HashLink>
                  ) : (
                    <Link to={item.to} className="nav-link" onClick={scrollToTop}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
              <li className="nav-item">
                {user ? (
                  <div className="d-flex align-items-center">
                    <span className="nav-link text-white">Xin chào, {user.username}</span>
                    {user.role === 'admin' && (
                      <button className="nav-link btn btn-link text-white p-0" onClick={handleAdminAccess}>
                        Quản Trị
                      </button>
                    )}
                    <button className="nav-link btn btn-link text-white p-0" onClick={handleLogout}>
                      Đăng Xuất
                    </button>
                  </div>
                ) : (
                  <button className="nav-link btn btn-link text-white p-0" onClick={handleShow}>
                    Đăng Nhập
                  </button>
                )}
              </li>
            </ul>
          </div>
        </div>
      </header>

      <main className="flex-grow-1" style={{ marginTop: '56px' }}>
        <Outlet />
      </main>

      <footer className="bg-primary text-white py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <img src="/images/logoshop.jpg" alt="NekoKin Logo" className="img-fluid mb-3" style={{ maxHeight: '40px' }} />
              <p className="text-muted">
                NekoKin là cộng đồng cung cấp sản phẩm và dịch vụ chăm sóc thú cưng tốt nhất.
              </p>
            </div>
            <div className="col-md-4">
              <h3 className="h5 mb-3 text-white">Danh sách trang</h3>
              <ul className="list-unstyled">
                {[
                  { to: "/#gioi-thieu", label: "Giới thiệu", isHashLink: true },
                  { to: "/consulting", label: "Tư vấn", isHashLink: false },
                  { to: "/services", label: "Dịch vụ", isHashLink: false },
                ].map((item, index) => (
                  <li key={index} className="mb-2">
                    {item.isHashLink ? (
                      <HashLink smooth to={item.to} className="text-white text-decoration-none">
                        {item.label}
                      </HashLink>
                    ) : (
                      <Link to={item.to} className="text-white text-decoration-none">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-md-4">
              <h3 className="h5 mb-3 text-white">Theo dõi chúng tôi tại</h3>
              <div className="d-flex gap-3">
                {[
                  { href: "https://instagram.com", icon: <FaInstagram size={24} /> },
                  { href: "https://tiktok.com", icon: <FaTiktok size={24} /> },
                  { href: "https://pinterest.com", icon: <FaPinterest size={24} /> },
                  { href: "https://facebook.com", icon: <FaFacebook size={24} /> },
                  { href: "https://twitter.com", icon: <FaTwitter size={24} /> },
                  { href: "https://youtube.com", icon: <FaYoutube size={24} /> },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white"
                    aria-label={`Theo dõi chúng tôi trên ${social.href.split('.')[1]}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center mt-4 pt-4 border-top border-light">
            <p className="mb-2 text-white">Bản quyền bài viết thuộc về NekoKin.com</p>
            <p className="mb-2 text-white">PROTECTED DMCA</p>
            <p className="mb-0 text-white">Copyright © 2025 NekoKin | All Rights Reserved</p>
          </div>
        </div>
      </footer>

      <div
        className={`modal fade ${showModal ? 'show' : ''}`}
        id="authModal"
        tabIndex="-1"
        aria-labelledby="authModalLabel"
        aria-hidden={!showModal}
        style={{ display: showModal ? 'block' : 'none' }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="authModalLabel">
                {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {showMessage && message && (
                <div
                  className={`alert ${message.includes('thành công') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}
                  role="alert"
                >
                  {message}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowMessage(false)}
                    aria-label="Close"
                  ></button>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label fw-semibold">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username || ''}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-control"
                    required
                    placeholder="Nhập tên đăng nhập hoặc email"
                  />
                </div>
                {!isLogin && (
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email || ''}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control"
                      required
                      placeholder="Nhập email của bạn"
                    />
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-semibold">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password || ''}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                    required
                    placeholder="Nhập mật khẩu"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-semibold">
                  {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
                </button>
              </form>
              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-link text-primary"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setMessage('');
                    setShowMessage(false);
                  }}
                >
                  {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />}
    </div>
  );
};

export default Layout;