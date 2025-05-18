// server/controllers/newsController.js
const News = require('../models/News');

exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find();
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'Tin tức không tồn tại' });
    }
    res.status(200).json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createNews = async (req, res) => {
  const { title, content, image } = req.body;
  const news = new News({
    title,
    content,
    image: image || '',
  });

  try {
    const newNews = await news.save();
    res.status(201).json(newNews);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { title, content, image } = req.body;
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'Tin tức không tồn tại' });
    }
    news.title = title || news.title;
    news.content = content || news.content;
    if (image) news.image = image;
    const updatedNews = await news.save();
    res.json(updatedNews);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'Tin tức không tồn tại' });
    }
    await news.remove();
    res.json({ message: 'Tin tức đã được xóa' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

