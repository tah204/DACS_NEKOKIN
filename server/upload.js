const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'public/images');
    console.log('__dirname:', __dirname); // Debug
    console.log('Upload path:', uploadPath); // Debug
    fs.mkdirSync(uploadPath, { recursive: true }); // Tạo thư mục nếu chưa tồn tại
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + file.originalname;
    console.log('Saving file as:', filename); // Debug
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif)'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;