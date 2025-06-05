import React, { useState, useEffect } from 'react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    petType: 'both',
    ageRange: 'all',
  });
  const [editProduct, setEditProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token, vui lòng đăng nhập');
      const response = await fetch('http://localhost:5000/api/products', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Lỗi khi lấy danh sách sản phẩm');
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching products:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token, vui lòng đăng nhập');

      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('price', newProduct.price);
      formData.append('description', newProduct.description);
      formData.append('petType', newProduct.petType);
      formData.append('ageRange', newProduct.ageRange);
      if (newProduct.image && !(newProduct.image instanceof File)) {
        formData.append('image', newProduct.image.split('/').pop()); // Chỉ gửi tên file
      } else if (newProduct.image instanceof File) {
        formData.append('image', newProduct.image);
      }

      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi thêm sản phẩm');
      }

      const data = await response.json();
      setProducts((prev) => [...prev, data]);
      setNewProduct({ name: '', price: '', description: '', image: '', petType: 'both', ageRange: 'all' });
      setShowAddModal(false);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error adding product:', error);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editProduct?._id) throw new Error('ID sản phẩm không hợp lệ');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token, vui lòng đăng nhập');
      const formData = new FormData();
      formData.append('name', editProduct.name);
      formData.append('price', editProduct.price);
      formData.append('description', editProduct.description);
      formData.append('petType', editProduct.petType);
      formData.append('ageRange', editProduct.ageRange);
      if (editProduct.image instanceof File) {
        formData.append('image', editProduct.image);
      } else if (editProduct.image) {
        formData.append('image', editProduct.image.split('/').pop()); // Chỉ gửi tên file
      }

      const response = await fetch(`http://localhost:5000/api/products/${editProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi cập nhật sản phẩm');
      }
      setShowEditModal(false);
      setEditProduct(null);
      fetchProducts();
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token, vui lòng đăng nhập');
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi xóa sản phẩm');
      }
      fetchProducts();
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error deleting product:', error);
    }
  };

  const handleImageUpload = async (e, setData, setError) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Không tìm thấy token, vui lòng đăng nhập');

        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:5000/api/products/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) throw new Error('Lỗi khi upload ảnh');

        const data = await response.json();
        setData((prev) => ({ ...prev, image: data.image }));
        setError(null);
      } catch (error) {
        setError('Lỗi khi upload ảnh: ' + error.message);
        console.error('Error uploading image:', error);
      }
    }
  };

  return (
    <div className="card p-4">
      <h2 className="card-title mb-4">Quản Lý Sản Phẩm</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button className="btn btn-primary mb-3" onClick={() => setShowAddModal(true)}>
        Thêm Sản Phẩm
      </button>
      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Tên Sản Phẩm</th>
            <th>Giá</th>
            <th>Mô Tả</th>
            <th>Ảnh</th>
            <th>Loại Thú Cưng</th>
            <th>Độ Tuổi</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product._id}>
              <td>{index + 1}</td>
              <td>{product.name}</td>
              <td>{product.price.toLocaleString()} VNĐ</td>
              <td>{product.description}</td>
              <td>
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name || 'Product image'}
                    style={{ maxWidth: '100px', height: 'auto' }}
                    onError={(e) => (e.target.src = 'http://localhost:5000/public/images/placeholder.jpg')}
                  />
                )}
              </td>
              <td>
                {(() => {
                  let petTypeDisplay;
                  if (product.petType === 'dog') {
                    petTypeDisplay = 'Chó';
                  } else if (product.petType === 'cat') {
                    petTypeDisplay = 'Mèo';
                  } else {
                    petTypeDisplay = 'Cả hai';
                  }
                  return petTypeDisplay;
                })()}
              </td>
              <td>
                {(() => {
                  let ageRangeDisplay;
                  if (product.ageRange === 'under_2_months') {
                    ageRangeDisplay = 'Dưới 2 tháng';
                  } else if (product.ageRange === '2_to_6_months') {
                    ageRangeDisplay = '2-6 tháng';
                  } else if (product.ageRange === '6_to_12_months') {
                    ageRangeDisplay = '6-12 tháng';
                  } else if (product.ageRange === '1_to_7_years') {
                    ageRangeDisplay = '1-7 năm';
                  } else if (product.ageRange === 'over_7_years') {
                    ageRangeDisplay = 'Trên 7 năm';
                  } else {
                    ageRangeDisplay = 'Tất cả';
                  }
                  return ageRangeDisplay;
                })()}
              </td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => {
                    setEditProduct(product);
                    setShowEditModal(true);
                  }}
                >
                  Sửa
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteProduct(product._id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Thêm Sản Phẩm */}
      <div className={`modal fade ${showAddModal ? 'show' : ''}`} style={{ display: showAddModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Thêm Sản Phẩm</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowAddModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddProduct}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Tên Sản Phẩm</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="price" className="form-label">Giá</label>
                  <input
                    type="number"
                    className="form-control"
                    id="price"
                    value={newProduct.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value >= 0 || value === '') {
                        setNewProduct({ ...newProduct, price: value });
                      }
                    }}
                    required
                    placeholder="Nhập giá (VNĐ)"
                    min="0"
                  />
                  {newProduct.price < 0 && <p className="text-danger small">Giá phải là số dương!</p>}
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Mô Tả</label>
                  <textarea
                    className="form-control"
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Nhập mô tả sản phẩm"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="petType" className="form-label">Loại Thú Cưng</label>
                  <select
                    className="form-control"
                    id="petType"
                    value={newProduct.petType}
                    onChange={(e) => setNewProduct({ ...newProduct, petType: e.target.value })}
                    required
                  >
                    <option value="dog">Chó</option>
                    <option value="cat">Mèo</option>
                    <option value="both">Cả hai</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="ageRange" className="form-label">Độ Tuổi</label>
                  <select
                    className="form-control"
                    id="ageRange"
                    value={newProduct.ageRange}
                    onChange={(e) => setNewProduct({ ...newProduct, ageRange: e.target.value })}
                    required
                  >
                    <option value="under_2_months">Dưới 2 tháng</option>
                    <option value="2_to_6_months">2-6 tháng</option>
                    <option value="6_to_12_months">6-12 tháng</option>
                    <option value="1_to_7_years">1-7 năm</option>
                    <option value="over_7_years">Trên 7 năm</option>
                    <option value="all">Tất cả</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="image" className="form-label">Ảnh</label>
                  <input
                    type="file"
                    className="form-control"
                    id="image"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, setNewProduct, setError)}
                  />
                  {error && <p className="text-danger small">{error}</p>}
                  {/* {newProduct.image && (
                    <img
                      src={
                        newProduct.image instanceof File
                          ? URL.createObjectURL(newProduct.image)
                          : newProduct.image
                      }
                      alt="Preview"
                      style={{ maxWidth: '100px', marginTop: '10px' }}
                      onError={(e) => (e.target.src = 'http://localhost:5000/public/images/placeholder.jpg')}
                    />
                  )} */}
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={!newProduct.name || !newProduct.price}>
                  Thêm
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {showAddModal && <div className="modal-backdrop fade show" />}

      {/* Modal Sửa Sản Phẩm */}
      <div className={`modal fade ${showEditModal ? 'show' : ''}`} style={{ display: showEditModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Sửa Sản Phẩm</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateProduct}>
                <div className="mb-3">
                  <label htmlFor="edit-name" className="form-label">Tên Sản Phẩm</label>
                  <input
                    type="text"
                    className="form-control"
                    id="edit-name"
                    value={editProduct?.name || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-price" className="form-label">Giá</label>
                  <input
                    type="number"
                    className="form-control"
                    id="edit-price"
                    value={editProduct?.price || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-description" className="form-label">Mô Tả</label>
                  <textarea
                    className="form-control"
                    id="edit-description"
                    value={editProduct?.description || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-petType" className="form-label">Loại Thú Cưng</label>
                  <select
                    className="form-control"
                    id="edit-petType"
                    value={editProduct?.petType || 'both'}
                    onChange={(e) => setEditProduct({ ...editProduct, petType: e.target.value })}
                    required
                  >
                    <option value="dog">Chó</option>
                    <option value="cat">Mèo</option>
                    <option value="both">Cả hai</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-ageRange" className="form-label">Độ Tuổi</label>
                  <select
                    className="form-control"
                    id="edit-ageRange"
                    value={editProduct?.ageRange || 'all'}
                    onChange={(e) => setEditProduct({ ...editProduct, ageRange: e.target.value })}
                    required
                  >
                    <option value="under_2_months">Dưới 2 tháng</option>
                    <option value="2_to_6_months">2-6 tháng</option>
                    <option value="6_to_12_months">6-12 tháng</option>
                    <option value="1_to_7_years">1-7 năm</option>
                    <option value="over_7_years">Trên 7 năm</option>
                    <option value="all">Tất cả</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-image" className="form-label">Ảnh</label>
                  <input
                    type="file"
                    className="form-control"
                    id="edit-image"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, setEditProduct, setError)}
                  />
                  {/* {editProduct?.image && (
                    <img
                      src={editProduct.image instanceof File ? URL.createObjectURL(editProduct.image) : editProduct.image}
                      alt="Current"
                      style={{ maxWidth: '100px', marginTop: '10px' }}
                      onError={(e) => (e.target.src = 'http://localhost:5000/public/images/placeholder.jpg')}
                    />
                  )} */}
                </div>
                <button type="submit" className="btn btn-primary w-100">Cập Nhật</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {showEditModal && <div className="modal-backdrop fade show" />}
    </div>
  );
};

export default ProductManagement;