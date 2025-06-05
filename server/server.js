const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/products');
const newsRoutes = require('./routes/news');
const categoryServicesRoutes = require('./routes/categoryservices');
const serviceRoutes = require('./routes/services');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const petRoutes = require('./routes/pets');
const customerRoutes = require('./routes/customerRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const upload = require('./upload');
const path = require('path');

// Import các model cần thiết
const Service = require('./models/Service');
const News = require('./models/News');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Endpoint upload ảnh
app.post('/api/categoryservices/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không tìm thấy file ảnh' });
  }
  res.json({ image: req.file.filename });
});

app.post('/api/news/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không tìm thấy file ảnh' });
  }
  res.json({ image: req.file.filename });
});

app.post('/api/services/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không tìm thấy file ảnh' });
  }
  console.log('Uploaded file for service:', req.file.filename);
  res.json({ image: req.file.filename });
});

// Endpoint để tải ảnh từ backend
app.get('/api/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, 'public/images', filename);
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error('Error sending image:', err);
      res.status(404).json({ message: 'Ảnh không tồn tại' });
    }
  });
});

// Endpoint lấy số liệu tổng quan cho dashboard
app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const totalServices = await Service.countDocuments();
    const totalNews = await News.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    res.json({
      totalServices,
      totalNews,
      totalBookings,
      totalCustomers,
    });
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu thống kê:', error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu thống kê' });
  }
});

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categoryservices', categoryServicesRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/customers', customerRoutes);
app.use('/auth', authRoutes);

// Tạo router riêng cho admin
const adminRouter = express.Router();
adminRouter.get('/dashboard', authMiddleware, (req, res) => {
  res.json({ message: 'Truy cập thành công', user: req.user });
});
app.use('/admin', adminRouter);

app.get('/', (req, res) => {
  res.send('NekoKin Backend API');
});

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});