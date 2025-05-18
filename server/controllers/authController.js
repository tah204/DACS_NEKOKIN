const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { username, password, email, role = 'user' } = req.body;
    console.log('Register attempt:', { username, email, role });
    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc email đã tồn tại' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await new User({ username, password: hashedPassword, email, role }).save();
        console.log('User saved:', user);

        // Tạo token
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET, // Sử dụng biến môi trường
            { expiresIn: '1d' }    // Tăng thời gian hết hạn
        );

        res.status(201).json({
            message: 'Đăng ký thành công',
            user: { username: user.username, email: user.email, role: user.role },
            token
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username });
    try {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
        const query = isEmail ? { email: username } : { username: username };

        const user = await User.findOne(query);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Tên đăng nhập, email hoặc mật khẩu không đúng' });
        }

        // Tạo token
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET, // Sử dụng biến môi trường
            { expiresIn: '1d' }    // Tăng thời gian hết hạn
        );

        console.log('Login successful:', user);
        res.json({
            message: 'Đăng nhập thành công',
            user: { username: user.username, email: user.email, role: user.role },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

exports.logout = (req, res) => {
    // Logout không cần token server-side, client tự xóa token
    res.json({ message: 'Đăng xuất thành công' });
};