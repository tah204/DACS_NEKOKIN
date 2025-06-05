const CategoryService = require('../models/CategoryService');

exports.getAllCategoryServices = async (req, res) => {
  try {
    const categories = await CategoryService.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching category services:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh mục dịch vụ' });
  }
};

exports.getCategoryServiceById = async (req, res) => {
  try {
    const category = await CategoryService.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục dịch vụ' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching category service by ID:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh mục dịch vụ theo ID' });
  }
};

exports.createCategoryService = async (req, res) => {
  try {
    const { _id, name, description, image } = req.body;
    if (!name || !image) {
      return res.status(400).json({ message: 'Thiếu các trường bắt buộc' });
    }
    const category = new CategoryService({
      _id,
      name,
      description,
      image
    });
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category service:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateCategoryService = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const category = await CategoryService.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục dịch vụ để cập nhật' });
    }
    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;
    category.image = image || category.image;
    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category service:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCategoryService = async (req, res) => {
  try {
    const category = await CategoryService.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục dịch vụ để xóa' });
    }
    res.status(200).json({ message: 'Xóa danh mục dịch vụ thành công' });
  } catch (error) {
    console.error('Error deleting category service:', error);
    res.status(500).json({ message: error.message });
  }
};