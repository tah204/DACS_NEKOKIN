// server/controllers/serviceController.js
const Service = require('../models/Service');

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service', error: error.message });
  }
};

exports.createService = async (req, res) => {
  const { name, price, description, image } = req.body;
  const service = new Service({
    name,
    price,
    description,
    image: image || '', // Lưu base64 hoặc URL ảnh
  });

  try {
    const newService = await service.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { name, price, description, image } = req.body;
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }
    service.name = name || service.name;
    service.price = price || service.price;
    service.description = description || service.description;
    if (image) service.image = image; // Cập nhật ảnh nếu có
    const updatedService = await service.save();
    res.json(updatedService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }
    await service.remove();
    res.json({ message: 'Dịch vụ đã được xóa' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};