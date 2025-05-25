const CategoryService = require('../models/CategoryService');

// Lấy tất cả danh mục
exports.getAllCategoryServices = async (req, res) => {
  try {
    const categories = await CategoryService.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching category services:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh mục dịch vụ' });
  }
};

// Lấy danh mục theo ID
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

// Tạo danh mục mới
exports.createCategoryService = async (req, res) => {
  try {
    const { _id, name, description, image } = req.body;
    const category = new CategoryService({ _id, name, description, image });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category service:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo danh mục dịch vụ' });
  }
};

// Cập nhật danh mục
exports.updateCategoryService = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const category = await CategoryService.findByIdAndUpdate(
      req.params.id,
      { name, description, image },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục dịch vụ để cập nhật' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Error updating category service:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật danh mục dịch vụ' });
  }
};

// Xóa danh mục
exports.deleteCategoryService = async (req, res) => {
  try {
    const category = await CategoryService.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục dịch vụ để xóa' });
    }
    res.status(200).json({ message: 'Xóa danh mục dịch vụ thành công' });
  } catch (error) {
    console.error('Error deleting category service:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa danh mục dịch vụ' });
  }
};