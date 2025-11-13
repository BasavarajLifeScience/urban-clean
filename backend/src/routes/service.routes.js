const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');

// Public routes (no auth required)
router.get('/', asyncHandler(serviceController.getServices));
router.get('/categories', asyncHandler(serviceController.getCategories));
router.get('/:serviceId', asyncHandler(serviceController.getServiceById));

// Protected routes (auth required)
router.post('/favorites', authenticate, asyncHandler(serviceController.addToFavorites));
router.get('/user/favorites', authenticate, asyncHandler(serviceController.getFavorites));
router.delete('/favorites/:serviceId', authenticate, asyncHandler(serviceController.removeFromFavorites));

module.exports = router;
