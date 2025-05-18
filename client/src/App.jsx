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
import NewsDetail from './pages/NewsDetail';
import ProductDetail from './pages/ProductDetail';
import ServiceDetail from './pages/ServiceDetail';
import ActiveBookings from './pages/ActiveBookings'; 
import BookingHistory from './pages/BookingHistory'; 

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token || !allowedRoles.includes(user.role)) {
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
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:id" element={<ServiceDetail />} />
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<NewsDetail />} />
          <Route path="consulting" element={<Consulting />} />
          <Route
            path="active-bookings"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <ActiveBookings />
              </ProtectedRoute>
            }
          /> {/* Route cho dịch vụ đang đặt, chỉ cho user */}
          <Route
            path="booking-history"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <BookingHistory />
              </ProtectedRoute>
            }
          /> {/* Route cho lịch sử, chỉ cho user */}
        </Route>
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
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