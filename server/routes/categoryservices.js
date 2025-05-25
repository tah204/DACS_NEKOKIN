const express = require('express');
const router = express.Router();
const categoryServiceController = require('../controllers/categoryServiceController');

router.get('/', categoryServiceController.getAllCategoryServices);
router.get('/:id', categoryServiceController.getCategoryServiceById);
router.post('/', categoryServiceController.createCategoryService);
router.put('/:id', categoryServiceController.updateCategoryService);
router.delete('/:id', categoryServiceController.deleteCategoryService);

module.exports = router;