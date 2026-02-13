const router = require('express').Router();
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');
const { createCategoryValidator } = require('../validators/category');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
    .route('/')
    .get(getCategories)
    .post(authorize('admin'), createCategoryValidator, validate, createCategory);

router
    .route('/:id')
    .put(authorize('admin'), createCategoryValidator, validate, updateCategory)
    .delete(authorize('admin'), deleteCategory);

module.exports = router;
