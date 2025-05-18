const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/products');
const newsRoutes = require('./routes/news');
const serviceRoutes = require('./routes/services');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking'); // Thêm route booking
const authMiddleware = require('./middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public'))); // Serve static files từ public/images

// Cấu hình multer để lưu ảnh vào public/images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'public/images');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Tên file: timestamp + tên gốc
  }
});

const upload = multer({ storage: storage });

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes); // Thêm route booking
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

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { upload }; // Xuất upload để dùng trong routes