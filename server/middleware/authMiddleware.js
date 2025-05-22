const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Xác minh token

    // Kiểm tra các trường cần thiết trong payload
    if (!decoded.customerId || !decoded.role) {
      return res.status(401).json({ message: 'Token không chứa thông tin cần thiết (customerId, role)' });
    }

    // Gán thông tin user vào req
    req.user = {
      id: decoded.id, // Giữ id để các API khác có thể sử dụng
      customerId: decoded.customerId,
      role: decoded.role
    };

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