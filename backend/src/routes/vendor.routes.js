const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const vendorController = require('../controllers/vendor.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const validate = require('../middleware/validate.middleware');

// All routes require authentication and vendor role
router.use(authenticate);
router.use(authorize('vendor'));

// Validation
const updateServiceValidation = [
  body('name').optional().isString().withMessage('Name must be a string'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('basePrice').optional().isNumeric().withMessage('Base price must be a number'),
  body('duration').optional().isNumeric().withMessage('Duration must be a number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Routes
router.get('/dashboard', asyncHandler(vendorController.getDashboard));
router.get('/services', asyncHandler(vendorController.getServices));
router.get('/orders', asyncHandler(vendorController.getOrders));
router.get('/orders/:orderId', asyncHandler(vendorController.getOrderDetails));
router.get('/revenue', asyncHandler(vendorController.getRevenue));
router.patch('/services/:serviceId', updateServiceValidation, validate, asyncHandler(vendorController.updateService));

module.exports = router;
