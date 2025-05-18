const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập' });
    }

    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Sử dụng biến môi trường
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
        }
        req.user = decoded; // Lưu thông tin user vào req
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
};

module.exports = authMiddleware;