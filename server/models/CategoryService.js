const mongoose = require('mongoose');

const categoryServiceSchema = new mongoose.Schema({
  _id: { type: Number, required: true }, 
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  description: { type: String }, 
  image: { type: String } 
}, { _id: false });

module.exports = mongoose.model('CategoryService', categoryServiceSchema);