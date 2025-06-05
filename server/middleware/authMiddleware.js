const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Xác minh token

    // Kiểm tra vai trò (role) bắt buộc
    if (!decoded.role) {
      return res.status(401).json({ message: 'Token không chứa vai trò (role)' });
    }

    // Yêu cầu customerId chỉ khi role là customer
    if (decoded.role === 'customer' && !decoded.customerId) {
      return res.status(401).json({ message: 'Token của customer phải chứa customerId' });
    }

    // Gán thông tin user vào req
    req.user = {
      id: decoded.id, // Giữ id để các API khác sử dụng
      customerId: decoded.customerId || null, // customerId có thể null nếu là admin
      role: decoded.role
    };

    // Kiểm tra quyền truy cập admin
    if (req.path.startsWith('/admin') && decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin có quyền truy cập' });
    }

    next();
  } catch (error) {
    // Xử lý lỗi chi tiết hơn
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn, vui lòng đăng nhập lại' });
    }
    console.error('JWT verification error:', error.message); // Ghi log để debug
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

module.exports = authMiddleware;