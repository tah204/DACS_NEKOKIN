import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BookingModal from '../components/BookingModal'; // Import BookingModal

const ServiceGroomDetail = () => {
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
                // API để lấy thông tin chi tiết của CategoryService
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

    // Dữ liệu giả lập cho các điểm chú thích (có thể thay bằng API nếu cần)
    const groomingHighlights = [
        { id: 1, text: 'An toàn', className: 'position-absolute top-0 start-0 translate-middle text-info' },
        { id: 2, text: 'Chất lượng cao', className: 'position-absolute top-50 start-0 translate-middle-y text-info' },
        { id: 3, text: 'Thời gian nhanh', className: 'position-absolute bottom-0 start-0 translate-middle-x translate-middle-y text-info' },
        { id: 4, text: 'Thoa mịn', className: 'position-absolute top-0 end-0 translate-middle text-info' },
        { id: 5, text: 'Chăm sóc sâu', className: 'position-absolute top-50 end-0 translate-middle-y text-info' },
        { id: 6, text: 'Sức khỏe và vệ sinh', className: 'position-absolute bottom-0 end-0 translate-middle-x translate-middle-y text-info' },
    ];

    if (loading) return <div className="text-center py-5">Đang tải thông tin danh mục...</div>;
    if (error) return <div className="alert alert-danger text-center py-5">{error}</div>;
    if (!category) return <div className="alert alert-info text-center py-5">Không tìm thấy danh mục dịch vụ.</div>;


    return (
        <div className="bg-light font-sans" style={{ minHeight: '100vh' }}>
            {/* Phần mô tả dịch vụ */}
            <section className="bg-white py-5 text-center">
                <div className="container">
                    <h1 className="h2 font-weight-bold text-primary mb-4">{category.name}</h1> {/* Sử dụng tên category động */}
                    <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '600px' }}>
                        {category.description} {/* Sử dụng mô tả category động */}
                    </p>
                    <div className="position-relative mx-auto" style={{ width: '250px', height: '250px' }}>
                        <img
                            src={category.imageUrl || '/images/grooming-dog.jpg'} // Sử dụng imageUrl từ category
                            alt={category.name}
                            className="img-fluid rounded-circle shadow-sm w-100 h-100 object-fit-cover"
                            onError={(e) => (e.target.src = '/images/default_service.jpg')}
                        />
                        {groomingHighlights.map((highlight) => (
                            <div key={highlight.id} className={highlight.className}>
                                <small className="font-weight-bold">{highlight.text}</small>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Phần hình ảnh dịch vụ (giữ nguyên hoặc tùy chỉnh theo ý bạn) */}
            <section className="py-5 bg-light">
                <div className="container">
                    <h2 className="h3 font-weight-bold text-center text-primary mb-5">Một số hình ảnh về dịch vụ {category.name}</h2>
                    <div className="row g-4">
                        <div className="col-12 col-sm-6 col-md-4">
                            <img src="/images/grooming1.jpg" alt="Grooming 1" className="img-fluid rounded shadow-sm w-100 h-100 object-fit-cover" style={{ minHeight: '200px' }} onError={(e) => (e.target.src = '/images/default_service.jpg')} />
                        </div>
                        <div className="col-12 col-sm-6 col-md-4">
                            <img src="/images/grooming2.jpg" alt="Grooming 2" className="img-fluid rounded shadow-sm w-100 h-100 object-fit-cover" style={{ minHeight: '200px' }} onError={(e) => (e.target.src = '/images/default_service.jpg')} />
                        </div>
                        <div className="col-12 col-sm-6 col-md-4">
                            <img src="/images/grooming3.jpg" alt="Grooming 3" className="img-fluid rounded shadow-sm w-100 h-100 object-fit-cover" style={{ minHeight: '200px' }} onError={(e) => (e.target.src = '/images/default_service.jpg')} />
                        </div>
                        <div className="col-12 col-sm-6 col-md-4">
                            <img src="/images/grooming4.jpg" alt="Grooming 4" className="img-fluid rounded shadow-sm w-100 h-100 object-fit-cover" style={{ minHeight: '200px' }} onError={(e) => (e.target.src = '/images/default_service.jpg')} />
                        </div>
                        <div className="col-12 col-sm-6 col-md-4">
                            <img src="/images/grooming5.jpg" alt="Grooming 5" className="img-fluid rounded shadow-sm w-100 h-100 object-fit-cover" style={{ minHeight: '200px' }} onError={(e) => (e.target.src = '/images/default_service.jpg')} />
                        </div>
                        <div className="col-12 col-sm-6 col-md-4">
                            <img src="/images/grooming6.jpg" alt="Grooming 6" className="img-fluid rounded shadow-sm w-100 h-100 object-fit-cover" style={{ minHeight: '200px' }} onError={(e) => (e.target.src = '/images/default_service.jpg')} />
                        </div>
                    </div>
                </div>
            </section>

            {/* PHẦN DANH SÁCH DỊCH VỤ CHI TIẾT VÀ PHÂN TRANG BỊ XÓA BỎ */}

            {/* Phần "Đừng chần chừ nữa!" với nút đặt lịch duy nhất */}
            <section className="py-5 bg-white text-center">
                <div className="container">
                    <h2 className="h3 font-weight-bold text-primary mb-4">Sẵn sàng để thú cưng của bạn được chăm sóc tốt nhất?</h2>
                    <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '600px' }}>
                        Hãy đặt lịch hẹn ngay hôm nay để trải nghiệm dịch vụ {category.name} chuyên nghiệp của chúng tôi!
                    </p>
                    <button className="btn btn-danger btn-lg rounded-pill px-5 py-3" onClick={openBookingModal}>
                        Đặt Lịch Ngay
                    </button>
                </div>
            </section>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={closeBookingModal}
                initialCategoryId={categoryId} // Truyền categoryId vào modal
            />
        </div>
    );
};

export default ServiceGroomDetail;