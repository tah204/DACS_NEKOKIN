const Service = require('../models/Service');

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách dịch vụ', error: error.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id); // Xóa .populate('category') vì category là số
    if (!service) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin dịch vụ', error: error.message });
  }
};

exports.getServicesByCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'categoryId phải là một số hợp lệ' });
    }
    const services = await Service.find({ category: categoryId });
    if (!services || services.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ nào thuộc danh mục này' });
    }
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy dịch vụ theo danh mục', error: error.message });
  }
};

exports.createService = async (req, res) => {
  const { name, description, image, category, price, totalRooms } = req.body;

  if (!name || !description || !image || !category || !price) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: name, description, image, category, price.' });
  }

  if (category === 3 && (totalRooms === undefined || totalRooms < 0)) {
    return res.status(400).json({ message: 'Vui lòng cung cấp số lượng phòng hợp lệ cho dịch vụ khách sạn.' });
  }

  try {
    const service = new Service({
      name,
      description,
      image,
      price,
      category,
      totalRooms: category === 3 ? totalRooms : undefined,
    });

    const newService = await service.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi tạo dịch vụ: ' + error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { name, description, image, category, price, totalRooms } = req.body;
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }

    service.name = name || service.name;
    service.description = description || service.description;
    service.image = image || service.image;
    service.category = category || service.category;
    service.price = price || service.price;

    if (category !== undefined) {
      if (category === 3) {
        if (totalRooms === undefined || totalRooms < 0) {
          return res.status(400).json({ message: 'Vui lòng cung cấp số lượng phòng hợp lệ cho dịch vụ khách sạn.' });
        }
        service.totalRooms = totalRooms;
      } else {
        service.totalRooms = undefined;
      }
    } else if (totalRooms !== undefined) {
      if (service.category === 3) {
        if (totalRooms < 0) {
          return res.status(400).json({ message: 'Số lượng phòng không hợp lệ.' });
        }
        service.totalRooms = totalRooms;
      }
    }

    const updatedService = await service.save();
    res.json(updatedService);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi cập nhật dịch vụ: ' + error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }
    await service.deleteOne();
    res.json({ message: 'Dịch vụ đã được xóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa dịch vụ: ' + error.message });
  }
};