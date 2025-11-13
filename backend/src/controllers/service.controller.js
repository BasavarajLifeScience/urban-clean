const Service = require('../models/Service');
const Category = require('../models/Category');
const Favorite = require('../models/Favorite');
const { sendSuccess, sendPaginated } = require('../utils/response.utils');
const { getPagination } = require('../utils/helpers');
const { NotFoundError } = require('../utils/errors');

/**
 * Get all services with filters
 */
const getServices = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, rating, page, limit } = req.query;
    const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

    // Build query
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
    }

    if (rating) {
      query.averageRating = { $gte: parseFloat(rating) };
    }

    // Get services
    const services = await Service.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ averageRating: -1, bookingCount: -1 });

    const total = await Service.countDocuments(query);

    return sendPaginated(res, services, pageNum, limitNum, total, 'Services retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get service by ID
 */
const getServiceById = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findById(serviceId);

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    return sendSuccess(res, 200, 'Service retrieved successfully', {
      service,
      averageRating: service.averageRating,
      reviewCount: service.totalRatings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all categories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });

    return sendSuccess(res, 200, 'Categories retrieved successfully', { categories });
  } catch (error) {
    next(error);
  }
};

/**
 * Add service to favorites
 */
const addToFavorites = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { serviceId } = req.body;

    // Check if service exists
    const service = await Service.findById(serviceId);

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    // Create or update favorite
    await Favorite.findOneAndUpdate(
      { userId, serviceId },
      { userId, serviceId },
      { upsert: true, new: true }
    );

    return sendSuccess(res, 200, 'Service added to favorites');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user favorites
 */
const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const favorites = await Favorite.find({ userId }).populate('serviceId');

    const services = favorites.map(fav => fav.serviceId).filter(service => service !== null);

    return sendSuccess(res, 200, 'Favorites retrieved successfully', { favorites: services });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove service from favorites
 */
const removeFromFavorites = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { serviceId } = req.params;

    await Favorite.deleteOne({ userId, serviceId });

    return sendSuccess(res, 200, 'Service removed from favorites');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  getCategories,
  addToFavorites,
  getFavorites,
  removeFromFavorites,
};
