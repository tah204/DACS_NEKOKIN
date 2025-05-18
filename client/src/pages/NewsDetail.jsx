import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const NewsDetail = () => {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Kiểm tra id hợp lệ
    if (!id) {
      setError('ID không hợp lệ. Vui lòng thử lại.');
      return;
    }

    axios
      .get(`http://localhost:5000/api/news/${id}`)
      .then((response) => {
        console.log('News Detail Response:', response.data);
        setNewsItem(response.data);
        setError(null);
      })
      .catch((error) => {
        console.error('Error fetching news item:', error.response ? error.response.data : error.message);
        setError('Không thể tải tin tức. Vui lòng thử lại sau.');
      });
  }, [id]);

  if (error) return <div className="text-center py-5">{error}</div>;
  if (!newsItem) return <div className="text-center py-5">Đang tải...</div>;

  return (
    <section className="news-detail-section py-5 bg-light">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h2 className="text-center mb-4">{newsItem.title}</h2>
            <div className="text-center mb-4">
              <img
                src={`/images/${newsItem.image}`}
                alt={newsItem.title}
                className="img-fluid rounded shadow"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
                onError={(e) => (e.target.src = '/images/default_news.jpg')}
              />
            </div>
            <p className="text-muted text-center mb-4">
              <small>{new Date(newsItem.date).toLocaleDateString()}</small>
            </p>
            {newsItem.fullContent ? (
              <div dangerouslySetInnerHTML={{ __html: newsItem.fullContent }} className="text-muted" />
            ) : (
              <p className="text-muted">{newsItem.content}</p>
            )}
            <div className="text-center mt-4">
              <Link to="/news" className="btn btn-primary">
                Quay lại
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsDetail;