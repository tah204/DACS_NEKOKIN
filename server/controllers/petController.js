const Pet = require('../models/Pet');
const Customer = require('../models/Customer');

exports.getPets = async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const pets = await Pet.find({ customerId });
    res.json(pets);
  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

exports.createPet = async (req, res) => {
  const { name, type, ageRange } = req.body;
  try {
    const customerId = req.user.customerId;
    const pet = await Pet.create({ name, type, ageRange, customerId });
    await Customer.findByIdAndUpdate(customerId, { $push: { pets: pet._id } });
    res.json(pet);
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

exports.updatePet = async (req, res) => {
  const { name, type, ageRange } = req.body;
  const petId = req.params.id;
  try {
    const pet = await Pet.findByIdAndUpdate(petId, { name, type, ageRange }, { new: true });
    if (!pet || pet.customerId.toString() !== req.user.customerId) {
      return res.status(404).json({ message: 'Thú cưng không tồn tại hoặc không thuộc về bạn' });
    }
    res.json(pet);
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

exports.deletePet = async (req, res) => {
  const petId = req.params.id;
  try {
    const pet = await Pet.findById(petId);
    if (!pet || pet.customerId.toString() !== req.user.customerId) {
      return res.status(404).json({ message: 'Thú cưng không tồn tại hoặc không thuộc về bạn' });
    }
    await Pet.findByIdAndDelete(petId);
    await Customer.findByIdAndUpdate(req.user.customerId, { $pull: { pets: petId } });
    res.json({ message: 'Thú cưng đã được xóa' });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};