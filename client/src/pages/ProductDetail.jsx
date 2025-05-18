import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Kiểm tra id hợp lệ
    if (!id) {
      setError('ID không hợp lệ. Vui lòng thử lại.');
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:5000/api/products/${id}`)
      .then((response) => {
        console.log('Product Detail Response:', response.data);
        setProduct(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching product:', error.response ? error.response.data : error.message);
        setError('Không thể tải thông tin sản phẩm');
        setLoading(false);
      });
  }, [id]);

  const formatPetType = (petType) => {
    switch (petType) {
      case 'dog':
        return 'Chó';
      case 'cat':
        return 'Mèo';
      case 'both':
        return 'Chó và Mèo';
      default:
        return 'Không xác định';
    }
  };

  const formatAgeRange = (ageRange) => {
    switch (ageRange) {
      case 'under_2_months':
        return 'Dưới 2 tháng';
      case '2_to_6_months':
        return 'Từ 2-6 tháng';
      case '6_to_12_months':
        return 'Từ 6-12 tháng';
      case '1_to_7_years':
        return 'Từ 1-7 năm';
      case 'over_7_years':
        return 'Trên 7 năm';
      case 'all':
        return 'Tất cả độ tuổi';
      default:
        return 'Không xác định';
    }
  };

  if (loading) {
    return <div className="text-center py-5">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-5">{error}</div>;
  }

  if (!product) {
    return <div className="text-center py-5">Sản phẩm không tồn tại</div>;
  }

  return (
    <section className="product-detail-section py-5 bg-light">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-6 mb-4">
            <img
              src={`/images/${product.image}`}
              alt={product.name}
              className="img-fluid rounded shadow"
              style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
              onError={(e) => (e.target.src = '/images/default_product.jpg')}
            />
          </div>
          <div className="col-12 col-md-6">
            <div className="product-detail-info">
              <h2 className="mb-3">{product.name}</h2>
              <p className="price text-primary fs-4 mb-2">
                {product.price.toLocaleString('vi-VN')} VNĐ
              </p>
              <p className="pet-type text-muted mb-2">
                <strong>Dành cho:</strong> {formatPetType(product.petType)}
              </p>
              <p className="age-group text-muted mb-4">
                <strong>Độ tuổi:</strong> {formatAgeRange(product.ageRange)}
              </p>
              <h3 className="mb-3">Mô tả sản phẩm</h3>
              <p className="text-muted mb-4">{product.description}</p>
              <div className="text-center">
                <Link to="/products" className="btn btn-primary">
                  Quay lại danh sách sản phẩm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;