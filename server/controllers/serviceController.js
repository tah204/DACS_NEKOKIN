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
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin dịch vụ', error: error.message });
  }
};

exports.createService = async (req, res) => {
  const { name, description, image, type, totalRooms, subServices } = req.body;

  // Kiểm tra các trường bắt buộc theo schema
  if (!name || !description || !image || !type) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: name, description, image, type.' });
  }

  // Kiểm tra totalRooms nếu type là 'hotel'
  if (type === 'hotel' && (totalRooms === undefined || totalRooms < 0)) {
    return res.status(400).json({ message: 'Vui lòng cung cấp số lượng phòng hợp lệ cho dịch vụ khách sạn.' });
  }

  // Kiểm tra subServices nếu có
  if (subServices && subServices.length > 0) {
    try {
      const parsedSubServices = typeof subServices === 'string' ? JSON.parse(subServices) : subServices;
      for (const subService of parsedSubServices) {
        if (!subService.name || !subService.price || subService.price < 0) {
          return res.status(400).json({ message: 'Mỗi subService cần có tên và giá hợp lệ.' });
        }
        // Kiểm tra các trường tùy chọn
        if (subService.description && typeof subService.description !== 'string') {
          return res.status(400).json({ message: 'Mô tả của subService phải là chuỗi.' });
        }
        if (subService.image && typeof subService.image !== 'string') {
          return res.status(400).json({ message: 'Hình ảnh của subService phải là chuỗi.' });
        }
      }
    } catch (error) {
      return res.status(400).json({ message: 'Dữ liệu subServices không hợp lệ.' });
    }
  }

  try {
    const service = new Service({
      name,
      description,
      image,
      type,
      totalRooms: type === 'hotel' ? totalRooms : undefined,
      subServices: subServices ? (typeof subServices === 'string' ? JSON.parse(subServices) : subServices) : []
    });

    const newService = await service.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi tạo dịch vụ: ' + error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { name, description, image, type, totalRooms, subServices } = req.body;
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }

    // Cập nhật các trường, giữ nguyên giá trị cũ nếu không có dữ liệu mới
    service.name = name || service.name;
    service.description = description || service.description;
    service.image = image || service.image;
    service.type = type || service.type;

    // Xử lý totalRooms dựa trên type
    if (type && type === 'hotel') {
      if (totalRooms === undefined || totalRooms < 0) {
        return res.status(400).json({ message: 'Vui lòng cung cấp số lượng phòng hợp lệ cho dịch vụ khách sạn.' });
      }
      service.totalRooms = totalRooms;
    } else if (type && type !== 'hotel') {
      service.totalRooms = undefined; // Xóa totalRooms nếu type không phải 'hotel'
    }

    // Xử lý subServices nếu có
    if (subServices !== undefined) {
      const parsedSubServices = typeof subServices === 'string' ? JSON.parse(subServices) : subServices;
      if (parsedSubServices && parsedSubServices.length > 0) {
        for (const subService of parsedSubServices) {
          if (!subService.name || !subService.price || subService.price < 0) {
            return res.status(400).json({ message: 'Mỗi subService cần có tên và giá hợp lệ.' });
          }
          if (subService.description && typeof subService.description !== 'string') {
            return res.status(400).json({ message: 'Mô tả của subService phải là chuỗi.' });
          }
          if (subService.image && typeof subService.image !== 'string') {
            return res.status(400).json({ message: 'Hình ảnh của subService phải là chuỗi.' });
          }
        }
        service.subServices = parsedSubServices;
      } else {
        service.subServices = []; // Đặt lại subServices thành mảng rỗng nếu không có dữ liệu
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