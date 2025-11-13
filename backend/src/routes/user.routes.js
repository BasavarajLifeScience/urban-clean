const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const { uploadMultiple, uploadSingle } = require('../middleware/upload.middleware');

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', asyncHandler(userController.getProfile));
router.put('/profile', asyncHandler(userController.updateProfile));

// Document routes
router.post('/profile/documents', uploadMultiple('documents', 5), asyncHandler(userController.uploadDocuments));
router.delete('/profile/documents/:documentId', asyncHandler(userController.deleteDocument));

module.exports = router;
