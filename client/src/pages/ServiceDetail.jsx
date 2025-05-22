import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [pets, setPets] = useState([]); // Lấy danh sách thú cưng
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [isValidBooking, setIsValidBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    bookingDate: '',
    bookingTime: '',
    serviceId: id,
    subServiceId: '', // Thêm trường để chọn subService
    petId: '', // Chọn từ danh sách thú cưng
    checkIn: '', // Chỉ cho hotel
    checkOut: '', // Chỉ cho hotel
  });
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });
  const [user, setUser] = useState(null); // Lưu thông tin người dùng sau khi đăng nhập

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!id) {
        if (mounted) setError('ID không hợp lệ. Vui lòng thử lại.');
        return;
      }

      try {
        // Lấy thông tin dịch vụ
        const serviceResponse = await axios.get(`http://localhost:5000/api/services/${id}`);
        if (mounted && (!serviceResponse.data || !serviceResponse.data.name)) {
          setError('Dữ liệu dịch vụ không hợp lệ.');
        } else if (mounted) {
          setService(serviceResponse.data);
          setBookingForm((prev) => ({
            ...prev,
            subServiceId: serviceResponse.data.subServices?.[0]?._id || '',
          }));
        }

        // Lấy thông tin người dùng từ localStorage hoặc API
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (mounted) setUser(userData);
          console.log('User data from localStorage:', userData); // Debug
        }

        const token = localStorage.getItem('token');
        if (token) {
          try {
            const userResponse = await axios.get('http://localhost:5000/auth/user/profile', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (mounted) {
              setUser(userResponse.data);
              console.log('User data from API:', userResponse.data); // Debug
              localStorage.setItem('user', JSON.stringify(userResponse.data));
            }
          } catch (error) {
            console.error('Error fetching user profile:', error.response?.data?.message || error.message);
            if (error.response?.status === 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setShowLoginModal(true);
              setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
          }

          const petResponse = await axios.get('http://localhost:5000/api/pets', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (mounted) {
            setPets(petResponse.data);
            if (petResponse.data.length > 0) {
              setBookingForm((prev) => ({
                ...prev,
                petId: petResponse.data[0]._id,
              }));
            }
          }
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

  const validateBookingTime = (date, time, checkIn, checkOut) => {
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

    if (service?.type === 'hotel') {
      if (!checkIn || !checkOut) {
        setBookingError('Vui lòng chọn ngày check-in và check-out.');
        setIsValidBooking(false);
        return;
      }
      if (new Date(checkOut) <= new Date(checkIn)) {
        setBookingError('Ngày check-out phải sau ngày check-in.');
        setIsValidBooking(false);
        return;
      }
      if (new Date(checkIn) < new Date(currentDate)) {
        setBookingError('Ngày check-in không thể là ngày đã qua.');
        setIsValidBooking(false);
        return;
      }
    }

    setBookingError('');
    setIsValidBooking(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => {
      const updatedForm = { ...prev, [name]: value };
      if (name === 'bookingDate' || name === 'bookingTime' || name === 'checkIn' || name === 'checkOut') {
        validateBookingTime(
          name === 'bookingDate' ? value : updatedForm.bookingDate,
          name === 'bookingTime' ? value : updatedForm.bookingTime,
          name === 'checkIn' ? value : updatedForm.checkIn,
          name === 'checkOut' ? value : updatedForm.checkOut
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

    console.log('Current user state before booking:', user); // Debug

    if (!isValidBooking) return;

    // Thử lấy lại user từ API nếu chưa sẵn sàng
    if (!user || !user.customerId) {
      try {
        const userResponse = await axios.get('http://localhost:5000/auth/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data);
        console.log('Refetched user data:', userResponse.data); // Debug
        localStorage.setItem('user', JSON.stringify(userResponse.data));
      } catch (error) {
        console.error('Error refetching user:', error.response?.data?.message || error.message);
        setBookingError('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
        setShowLoginModal(true);
        return;
      }
    }

    if (!user.customerId) {
      console.log('User data missing fields:', user); // Debug
      setBookingError('Thông tin người dùng không đầy đủ (thiếu customerId). Vui lòng đăng nhập lại.');
      setShowLoginModal(true);
      return;
    }

    // Kiểm tra dữ liệu trước khi gửi
    if (!bookingForm.petId || !bookingForm.serviceId) {
      setBookingError('Vui lòng chọn thú cưng và dịch vụ.');
      return;
    }

    if (service?.type === 'hotel' && (!bookingForm.checkIn || !bookingForm.checkOut)) {
      setBookingError('Vui lòng chọn ngày check-in và check-out.');
      return;
    }

    const bookingDateTime = new Date(`${bookingForm.bookingDate}T${bookingForm.bookingTime}:00+07:00`);
    if (isNaN(bookingDateTime)) {
      setBookingError('Ngày đặt không hợp lệ.');
      return;
    }

    try {
      const bookingData = {
        customerId: user.customerId,
        bookingDate: bookingDateTime.toISOString(),
        serviceId: bookingForm.serviceId,
        subServiceId: bookingForm.subServiceId || undefined,
        petId: bookingForm.petId,
        ...(service?.type === 'hotel' && {
          checkIn: new Date(bookingForm.checkIn).toISOString(),
          checkOut: new Date(bookingForm.checkOut).toISOString(),
        }),
      };

      console.log('Booking data sent:', bookingData); // Debug

      const response = await axios.post('http://localhost:5000/api/bookings', bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowBookingModal(false);
      setBookingForm({
        bookingDate: '',
        bookingTime: '',
        serviceId: id,
        subServiceId: service?.subServices?.[0]?._id || '',
        petId: pets.length > 0 ? pets[0]._id : '',
        checkIn: '',
        checkOut: '',
      });
      setBookingError('');
      setIsValidBooking(false);
      alert('Đặt lịch thành công! Vui lòng kiểm tra tại "Dịch vụ đang đặt".');
    } catch (error) {
      console.error('Error booking:', error.response?.data || error.message);
      setBookingError(error.response?.data?.message || 'Đặt lịch thất bại. Vui lòng thử lại.');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/auth/login', loginForm);
      localStorage.setItem('token', response.data.token);
      const userData = response.data.user;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData); // Cập nhật thông tin người dùng
      console.log('User data after login:', userData); // Debug
      setShowLoginModal(false);
      setShowBookingModal(true);

      // Lấy danh sách thú cưng sau khi đăng nhập
      const petResponse = await axios.get('http://localhost:5000/api/pets', {
        headers: { Authorization: `Bearer ${response.data.token}` },
      });
      setPets(petResponse.data);
      if (petResponse.data.length > 0) {
        setBookingForm((prev) => ({
          ...prev,
          petId: petResponse.data[0]._id,
        }));
      }
    } catch (error) {
      console.error('Error logging in:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || 'Đăng nhập thất bại.');
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
              src={service.image ? `/images/${service.image}` : '/images/default_service.jpg'}
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
                <p className="card-text text-muted mb-2">
                  <strong>Loại dịch vụ:</strong>{' '}
                  {service.type === 'health' ? 'Sức khỏe' : service.type === 'grooming' ? 'Grooming' : 'Khách sạn'}
                </p>
                <p className="card-text text-muted mb-2">
                  <strong>Thời gian thực hiện:</strong> {service.duration}
                </p>
                <p className="card-text text-muted mb-4">
                  <strong>Mô tả dịch vụ:</strong> {service.description}
                </p>
                {service.subServices && service.subServices.length > 0 && (
                  <>
                    <h5 className="mb-3">Dịch vụ con:</h5>
                    <ul className="list-group mb-4">
                      {service.subServices.map((subService) => (
                        <li key={subService._id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{subService.name}</strong>
                            <p className="mb-0 text-muted">{subService.description}</p>
                          </div>
                          <span className="text-primary">{subService.price.toLocaleString()} VNĐ</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
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
                    <label htmlFor="petId" className="form-label">
                      Thú cưng
                    </label>
                    <select
                      className="form-control"
                      id="petId"
                      name="petId"
                      value={bookingForm.petId}
                      onChange={handleInputChange}
                      required
                    >
                      {pets.length === 0 ? (
                        <option value="">Không có thú cưng nào</option>
                      ) : (
                        pets.map((pet) => (
                          <option key={pet._id} value={pet._id}>
                            {pet.name} ({pet.type})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  {service.subServices && service.subServices.length > 0 && (
                    <div className="mb-3">
                      <label htmlFor="subServiceId" className="form-label">
                        Chọn dịch vụ con
                      </label>
                      <select
                        className="form-control"
                        id="subServiceId"
                        name="subServiceId"
                        value={bookingForm.subServiceId}
                        onChange={handleInputChange}
                        required
                      >
                        {service.subServices.map((subService) => (
                          <option key={subService._id} value={subService._id}>
                            {subService.name} - {subService.price.toLocaleString()} VNĐ
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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
                  {service.type === 'hotel' && (
                    <>
                      <div className="mb-3">
                        <label htmlFor="checkIn" className="form-label">
                          Ngày check-in
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="checkIn"
                          name="checkIn"
                          value={bookingForm.checkIn}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="checkOut" className="form-label">
                          Ngày check-out
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="checkOut"
                          name="checkOut"
                          value={bookingForm.checkOut}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </>
                  )}
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
                  {error && <div className="alert alert-danger">{error}</div>}
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