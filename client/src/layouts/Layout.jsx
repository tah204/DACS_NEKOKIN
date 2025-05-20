import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
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
      timer = setTimeout(() => setShowMessage(false), 2000);
    }
    return () => clearTimeout(timer);
  }, [showMessage]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

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
    } catch {
      setMessage('Lỗi kết nối máy chủ');
      setShowMessage(true);
    }
  }, [isLogin, username, password, email]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setShowToast(false);
  };

  const handleClose = () => {
    setShowModal(false);
    setMessage('');
    setShowMessage(false);
    setUsername('');
    setPassword('');
    setEmail('');
  };

  const handleAdminAccess = () => navigate('/admin/dashboard');

  return (
    <div className="d-flex flex-column min-vh-100">
      {user && showToast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="toast show bg-success text-white" role="alert">
            <div className="toast-header">
              <strong className="me-auto">Thông báo</strong>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowToast(false)} />
            </div>
            <div className="toast-body">Chào mừng {user.username}!</div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <header className="navbar navbar-expand-lg navbar-light fixed-top" style={{ backgroundColor: '#FAF7F1' }}>

        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand d-flex align-items-center fw-bold " to="/home" style={{ color: '#8B0000' }}>
            <img src="/images/logo.jpg" alt="NekoKin Logo" style={{ height: 40 }} className="me-2" />
            NekoKin
          </Link>

          {/* Mobile toggle */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Menu và nút */}
          <div className="collapse navbar-collapse" id="navbarNav" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            <ul className="navbar-nav mx-auto">
              <li className="nav-item"><Link className="nav-link fw-semibold" to="/home">Trang chủ</Link></li>
              <li className="nav-item"><Link className="nav-link fw-semibold" to="/about">Giới thiệu</Link></li>
              <li className="nav-item"><Link className="nav-link fw-semibold" to="/products">Sản phẩm</Link></li>
              <li className="nav-item"><Link className="nav-link fw-semibold" to="/services">Dịch vụ</Link></li>
              <li className="nav-item"><Link className="nav-link fw-semibold" to="/news">Tin tức</Link></li>
            </ul>

            <div className="d-flex align-items-center">
              {user ? (
                <>
                  <span className="me-3 text-muted">Xin chào, {user.username}</span>
                  <button
                    className="btn btn-sm"
                    style={{ backgroundColor: '#8B0000', color: 'white' }}
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: '#8B0000', color: 'white' }}
                  onClick={() => setShowModal(true)}
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>
      </header>



      {/* TRANG NỘI DUNG */}
      <main className="flex-grow-1" >
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="text-white py-5 mt-auto" style={{ backgroundColor: '#0d2554' }}>
        <div className="container">
          <div className="row gy-4 text-center"> {/* 👈 Căn giữa toàn hàng */}
            {/* Cột 1: Giới thiệu */}
            <div className="col-12 col-md-4">
              <p className="text-white-50 mx-auto" style={{ lineHeight: '1.8', fontSize: '15px', maxWidth: '300px' }}>
                <strong>NekoKin</strong> là cộng đồng cung cấp sản phẩm và dịch vụ chăm sóc thú cưng tốt nhất – nơi bạn có thể tin tưởng hoàn toàn cho bé cưng của mình.
              </p>
            </div>

            {/* Cột 2: Liên kết nhanh */}
            <div className="col-12 col-md-4">
              <h5 className="mb-3 fw-bold" style={{ fontFamily: 'Quicksand, sans-serif', letterSpacing: '1px' }}>Liên kết nhanh</h5>
              <ul className="list-unstyled d-flex flex-column gap-2 align-items-center">
                <li><Link to="/about" className="text-white text-decoration-none">Giới thiệu</Link></li>
                <li><Link to="/services" className="text-white text-decoration-none">Dịch vụ</Link></li>
                <li><Link to="/consulting" className="text-white text-decoration-none">Tư vấn</Link></li>
              </ul>
            </div>

            {/* Cột 3: Mạng xã hội */}
            <div className="col-12 col-md-4">
              <h5 className="mb-3 fw-bold" style={{ fontFamily: 'Quicksand, sans-serif', letterSpacing: '1px' }}>Mạng xã hội</h5>
              <div className="d-flex justify-content-center gap-3">
                {[FaFacebook, FaInstagram, FaTiktok, FaYoutube].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <Icon size={24} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Dòng dưới cùng */}
          <div className="text-center mt-4 border-top pt-3 text-white-50 small" style={{ fontSize: '13px' }}>
            © 2025 NekoKin. All rights reserved.
          </div>
        </div>
      </footer>



      {/* MODAL ĐĂNG NHẬP */}
      {showModal && (
        <>
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">{isLogin ? 'Đăng Nhập' : 'Đăng Ký'}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={handleClose} />
                </div>
                <div className="modal-body">
                  {showMessage && (
                    <div className={`alert ${message.includes('thành công') ? 'alert-success' : 'alert-danger'}`}>
                      {message}
                      <button type="button" className="btn-close" onClick={() => setShowMessage(false)} />
                    </div>
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Tên đăng nhập</label>
                      <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    {!isLogin && (
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label">Mật khẩu</label>
                      <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</button>
                  </form>
                  <div className="text-center mt-3">
                    <button className="btn btn-link text-primary" onClick={() => {
                      setIsLogin(!isLogin);
                      setMessage('');
                      setShowMessage(false);
                    }}>
                      {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Layout;
