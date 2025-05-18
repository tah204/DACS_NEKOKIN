import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const News = () => {
  const [news, setNews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 8;

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/news')
      .then((response) => {
        const sortedNews = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNews(sortedNews);
      })
      .catch((error) => console.error('Error fetching news:', error));
  }, []);

  useEffect(() => {
    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      console.log('Scrolled to top successfully');
    } catch (error) {
      console.error('Error scrolling to top:', error);
      window.scrollTo(0, 0);
    }
  }, [currentPage]);

  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = news.slice(indexOfFirstNews, indexOfLastNews);

  const totalPages = Math.ceil(news.length / newsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <section className="news-section py-5 bg-light">
      <div className="container">
        {/* Tiêu đề */}
        <h2 className="text-center mb-5">Tin tức</h2>

        {/* Danh sách tin tức */}
        <div className="row g-4">
          {currentNews.length > 0 ? (
            currentNews.map((item) => (
              <div className="col-12 col-md-6 col-lg-4" key={item._id}>
                <Link to={`/news/${item._id}`} className="text-decoration-none text-dark">
                  <div className="card h-100 shadow-sm">
                    <img
                      src={`/images/${item.image}`}
                      alt={item.title}
                      className="card-img-top img-fluid"
                      onError={(e) => (e.target.src = '/images/default_news.jpg')}
                      style={{ objectFit: 'cover', height: '200px' }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h3 className="card-title">{item.title}</h3>
                      <p className="card-text text-muted">{item.content}</p>
                      <p className="mt-auto text-muted small">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p className="text-muted">Không tìm thấy tin tức.</p>
            </div>
          )}
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="row mt-4">
            <div className="col-12 text-center">
              <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={goToPreviousPage}
                    >
                      Trước
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <li
                      key={index + 1}
                      className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => paginate(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={goToNextPage}
                    >
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default News;