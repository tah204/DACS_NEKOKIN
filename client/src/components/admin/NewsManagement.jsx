import React, { useState, useEffect } from 'react';
import axios from 'axios';


const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [newNews, setNewNews] = useState({ title: '', content: '' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/news', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const handleAddNews = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newNews),
      });
      if (response.ok) {
        setShowModal(false);
        setNewNews({ title: '', content: '' });
        fetchNews();
      }
    } catch (error) {
      console.error('Error adding news:', error);
    }
  };

  const [topics, setTopics] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/news')
      .then((response) => {
        const sortedNews = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNews(sortedNews);

        const extractedTopics = [...new Set(response.data.map(item => item.topic))];
        setTopics(extractedTopics);
      })
      .catch((error) => console.error('Error fetching news:', error));
  }, []);

  const [selectedTopic, setSelectedTopic] = useState('Tất cả');

  const filteredNews = selectedTopic === 'Tất cả'
    ? news
    : news.filter(item => item.topic === selectedTopic);


  return (
    <div className="card p-4">
      <h2 className="card-title mb-4">Quản Lý Tin Tức</h2>
      <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
        Thêm Tin Tức
      </button>
      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Tiêu Đề</th>
            <th>Ngày Đăng</th>
            <th>Nội Dung</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {news.map((item, index) => (
            <tr key={item._id}>
              <td>{index + 1}</td>
              <td>{item.title}</td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td>{item.content.substring(0, 50)}...</td>
              <td>
                <button className="btn btn-warning btn-sm me-2">Sửa</button>
                <button className="btn btn-danger btn-sm">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Thêm Tin Tức */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Thêm Tin Tức</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddNews}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Tiêu Đề</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    value={newNews.title}
                    onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="content" className="form-label">Nội Dung</label>
                  <textarea
                    className="form-control"
                    id="content"
                    value={newNews.content}
                    onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                    required
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

export default NewsManagement;