import React, { useState, useEffect } from 'react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', image: '' });
  const [editProduct, setEditProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });
      if (response.ok) {
        setShowAddModal(false);
        setNewProduct({ name: '', price: '', description: '', image: '' });
        fetchProducts();
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${editProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editProduct),
      });
      if (response.ok) {
        setShowEditModal(false);
        setEditProduct(null);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleImageChange = (e, setData) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData((prev) => ({ ...prev, image: reader.result })); // Chuyển ảnh thành base64
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="card p-4">
      <h2 className="card-title mb-4">Quản Lý Sản Phẩm</h2>
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
                {product.image && <img src={product.image} alt={product.name} style={{ maxWidth: '100px' }} />}
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
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
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
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="price" className="form-label">Giá</label>
                  <input
                    type="number"
                    className="form-control"
                    id="price"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Mô Tả</label>
                  <textarea
                    className="form-control"
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="image" className="form-label">Ảnh</label>
                  <input
                    type="file"
                    className="form-control"
                    id="image"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setNewProduct)}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">Thêm</button>
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
                  <label htmlFor="edit-image" className="form-label">Ảnh</label>
                  <input
                    type="file"
                    className="form-control"
                    id="edit-image"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setEditProduct)}
                  />
                  {editProduct?.image && <img src={editProduct.image} alt="Current" style={{ maxWidth: '100px', marginTop: '10px' }} />}
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