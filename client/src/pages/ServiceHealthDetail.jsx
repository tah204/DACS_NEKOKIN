import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BookingModal from '../components/BookingModal'; // Import BookingModal

const ServiceHealthDetail = () => {
    const { id: categoryId } = useParams();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    // Lấy thông tin danh mục
    useEffect(() => {
        const fetchCategoryDetails = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`http://localhost:5000/api/categoryservices/${categoryId}`);
                setCategory(response.data);
            } catch (err) {
                console.error('Error fetching category:', err);
                setError('Không thể tải thông tin danh mục dịch vụ.');
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchCategoryDetails();
        }
    }, [categoryId]);


    const openBookingModal = () => {
        setIsBookingModalOpen(true);
    };

    const closeBookingModal = () => {
        setIsBookingModalOpen(false);
    };

    if (loading) return <div className="text-center py-5">Đang tải thông tin danh mục...</div>;
    if (error) return <div className="alert alert-danger text-center py-5">{error}</div>;
    if (!category) return <div className="alert alert-info text-center py-5">Không tìm thấy danh mục dịch vụ.</div>;

    return (
        <section className="services-section py-5 bg-light">
            <div className="container">
                {/* Section 1: Cá nhân hóa và lắng nghe */}
                <div className="row align-items-center mb-5 bg-white p-5 rounded shadow-sm">
                    <div className="col-12 col-md-6 order-md-2">
                        <img
                            src={category.imageUrl || '/images/default_service.jpg'}
                            alt={category.name}
                            className="img-fluid rounded shadow"
                            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                            onError={(e) => (e.target.src = '/images/default_service.jpg')}
                        />
                    </div>
                    <div className="col-12 col-md-6 order-md-1">
                        <h1 className="h2 font-weight-bold text-center text-primary mb-4">
                            {category.name}
                        </h1>
                        <p className="text-center text-secondary mb-4">
                            {category.description}
                        </p>
                    </div>
                </div>

                {/* Section 2: Video hoặc nội dung nổi bật */}
                <div className="row align-items-center mb-5 py-5 bg-primary text-white rounded shadow-sm">
                    <div className="col-12 text-center">
                        <h2 className="h3 font-weight-bold mb-4">CHĂM SÓC SỨC KHỎE TOÀN DIỆN CHO THÚ CƯNG!</h2>
                        <div
                            className="mx-auto bg-gray-300 rounded-lg flex items-center justify-center"
                            style={{ width: '80%', height: '250px', backgroundColor: '#d1d1d1' }} // Placeholder cho video
                        >
                            {/* Thêm iframe YouTube hoặc video player ở đây */}
                            <p className="text-dark">Video giới thiệu dịch vụ</p>
                        </div>
                        <p className="mt-4 text-sm">
                            Vui lòng nhấp vào đây để biết thêm thông tin về cách chúng tôi chăm sóc sức khỏe thú cưng của bạn.
                        </p>
                    </div>
                </div>

                {/* PHẦN DANH SÁCH DỊCH VỤ CHI TIẾT VÀ PHÂN TRANG BỊ XÓA BỎ */}

                {/* Section 4: Đừng chần chừ nữa! (Nút đặt lịch duy nhất) */}
                <div className="row align-items-center mb-5 py-5 bg-white rounded shadow-sm text-center">
                    <div className="col-12">
                        <h2 className="h3 font-weight-bold text-primary mb-4">Đừng chần chừ nữa!</h2>
                        <p className="text-secondary mb-4">Hãy đặt lịch khám sức khỏe ngay hôm nay!</p>
                        <div className="d-flex justify-content-center space-x-4 mb-4">
                            {/* Bạn có thể thay thế các div placeholder này bằng hình ảnh hoặc icon */}
                            <div className="rounded-lg d-flex align-items-center justify-content-center bg-light shadow-sm" style={{ width: '120px', height: '120px' }}>
                                <i className="fas fa-heartbeat fa-3x text-danger"></i> {/* Ví dụ icon */}
                            </div>
                            <div className="rounded-lg d-flex align-items-center justify-content-center bg-light shadow-sm" style={{ width: '120px', height: '120px' }}>
                                <i className="fas fa-syringe fa-3x text-success"></i>
                            </div>
                            <div className="rounded-lg d-flex align-items-center justify-content-center bg-light shadow-sm" style={{ width: '120px', height: '120px' }}>
                                <i className="fas fa-stethoscope fa-3x text-info"></i>
                            </div>
                        </div>
                        <button className="btn btn-danger btn-lg rounded-pill px-5 py-3" onClick={openBookingModal}>
                            Đặt hẹn ngay
                        </button>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={closeBookingModal}
                initialCategoryId={categoryId} // Truyền categoryId vào modal
            />
        </section>
    );
};

export default ServiceHealthDetail;