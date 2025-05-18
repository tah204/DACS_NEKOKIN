import React, { useState, useEffect } from 'react';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: '', price: '', description: '' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/services', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newService),
      });
      if (response.ok) {
        setShowModal(false);
        setNewService({ name: '', price: '', description: '' });
        fetchServices();
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  return (
    <div className="card p-4">
      <h2 className="card-title mb-4">Quản Lý Dịch Vụ</h2>
      <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
        Thêm Dịch Vụ
      </button>
      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Tên Dịch Vụ</th>
            <th>Giá</th>
            <th>Mô Tả</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service, index) => (
            <tr key={service._id}>
              <td>{index + 1}</td>
              <td>{service.name}</td>
              <td>{service.price.toLocaleString()} VNĐ</td>
              <td>{service.description}</td>
              <td>
                <button className="btn btn-warning btn-sm me-2">Sửa</button>
                <button className="btn btn-danger btn-sm">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Thêm Dịch Vụ */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Thêm Dịch Vụ</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddService}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Tên Dịch Vụ</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="price" className="form-label">Giá</label>
                  <input
                    type="number"
                    className="form-control"
                    id="price"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Mô Tả</label>
                  <textarea
                    className="form-control"
                    id="description"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">Thêm</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop fade show" />}
    </div>
  );
};

export default ServiceManagement;