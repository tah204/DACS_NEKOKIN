import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import ProductManagement from './components/admin/ProductManagement';
import ServiceManagement from './components/admin/ServiceManagement';
import NewsManagement from './components/admin/NewsManagement';
import UserManagement from './components/admin/UserManagement';
import Home from './pages/Home';
import About from './pages/About';
import Product from './pages/Products';
import Services from './pages/Services';
import News from './pages/News';
import Consulting from './pages/Consulting';
import NewsDetail from './pages/NewsDetail'; // Thêm import
import ProductDetail from './pages/ProductDetail'; // Thêm import
import ServiceDetail from './pages/ServiceDetail'; // Thêm import

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="products" element={<Product />} />
          <Route path="products/:id" element={<ProductDetail />} /> {/* Thêm route cho chi tiết sản phẩm */}
          <Route path="services" element={<Services />} />
          <Route path="services/:id" element={<ServiceDetail />} /> {/* Thêm route cho chi tiết dịch vụ */}
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<NewsDetail />} /> {/* Thêm route cho chi tiết tin tức */}
          <Route path="consulting" element={<Consulting />} />
        </Route>
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="news" element={<NewsManagement />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;