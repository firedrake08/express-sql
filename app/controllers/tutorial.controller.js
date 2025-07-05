const db = require('../models');
const { Op } = require('sequelize');
const winston = require('winston');

// Get Tutorial model
const Tutorial = db.Tutorial;

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'tutorial-controller' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Helper function to build pagination
const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};

// Helper function to build paginated response
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: tutorials } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    tutorials,
    pagination: {
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage: limit,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    }
  };
};

// Helper function to build sort order
const getSortOrder = (sort, order) => {
  const validSortFields = ['title', 'created_at', 'updated_at', 'view_count'];
  const sortField = validSortFields.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';
  return [[sortField, sortOrder]];
};

// Create and Save a new Tutorial
exports.create = async (req, res) => {
  try {
    logger.info('Creating new tutorial', { body: req.body });

    // Create tutorial object
    const tutorialData = {
      title: req.body.title,
      description: req.body.description || null,
      published: req.body.published || false,
      author: req.body.author || null,
      tags: req.body.tags || []
    };

    // Create Tutorial in the database
    const tutorial = await Tutorial.create(tutorialData);

    logger.info('Tutorial created successfully', { id: tutorial.id });

    res.status(201).json({
      success: true,
      message: 'Tutorial created successfully',
      data: tutorial,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error creating tutorial', { error: error.message, stack: error.stack });
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        })),
        timestamp: new Date().toISOString()
      });
    }

    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        error: 'Duplicate entry',
        message: 'A tutorial with this slug already exists',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while creating the tutorial',
      timestamp: new Date().toISOString()
    });
  }
};

// Retrieve all Tutorials with optional filtering and pagination
exports.findAll = async (req, res) => {
  try {
    const { title, author, page, limit, sort, order } = req.query;
    
    logger.info('Fetching tutorials', { query: req.query });

    // Build where condition
    let whereCondition = {};
    
    if (title) {
      whereCondition.title = { [Op.like]: `%${title}%` };
    }
    
    if (author) {
      whereCondition.author = { [Op.like]: `%${author}%` };
    }

    // Build pagination
    const { limit: queryLimit, offset } = getPagination(page, limit);
    
    // Build sort order
    const orderBy = getSortOrder(sort, order);

    // Execute query
    const data = await Tutorial.findAndCountAll({
      where: whereCondition,
      limit: queryLimit,
      offset,
      order: orderBy,
      distinct: true
    });

    // Build response
    const response = getPagingData(data, page, queryLimit);

    logger.info('Tutorials fetched successfully', { 
      count: data.count,
      page: page || 1,
      limit: queryLimit
    });

    res.status(200).json({
      success: true,
      message: 'Tutorials retrieved successfully',
      data: response.tutorials,
      pagination: response.pagination,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching tutorials', { error: error.message, stack: error.stack });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while retrieving tutorials',
      timestamp: new Date().toISOString()
    });
  }
};

// Find a single Tutorial with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    logger.info('Fetching tutorial by ID', { id });

    const tutorial = await Tutorial.findByPk(id);

    if (!tutorial) {
      logger.warn('Tutorial not found', { id });
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Tutorial with id ${id} not found`,
        timestamp: new Date().toISOString()
      });
    }

    // Increment view count
    await tutorial.incrementViewCount();

    logger.info('Tutorial fetched successfully', { id });

    res.status(200).json({
      success: true,
      message: 'Tutorial retrieved successfully',
      data: tutorial,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching tutorial', { error: error.message, stack: error.stack });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: `Error retrieving tutorial with id ${req.params.id}`,
      timestamp: new Date().toISOString()
    });
  }
};

// Find a Tutorial by slug
exports.findBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    
    logger.info('Fetching tutorial by slug', { slug });

    const tutorial = await Tutorial.findBySlug(slug);

    if (!tutorial) {
      logger.warn('Tutorial not found', { slug });
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Tutorial with slug '${slug}' not found`,
        timestamp: new Date().toISOString()
      });
    }

    // Increment view count
    await tutorial.incrementViewCount();

    logger.info('Tutorial fetched successfully', { slug });

    res.status(200).json({
      success: true,
      message: 'Tutorial retrieved successfully',
      data: tutorial,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching tutorial by slug', { error: error.message, stack: error.stack });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: `Error retrieving tutorial with slug ${req.params.slug}`,
      timestamp: new Date().toISOString()
    });
  }
};

// Update a Tutorial by the id in the request
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;
    
    logger.info('Updating tutorial', { id, updateData });

    // Find the tutorial first
    const tutorial = await Tutorial.findByPk(id);

    if (!tutorial) {
      logger.warn('Tutorial not found for update', { id });
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Tutorial with id ${id} not found`,
        timestamp: new Date().toISOString()
      });
    }

    // Update the tutorial
    await tutorial.update(updateData);

    logger.info('Tutorial updated successfully', { id });

    res.status(200).json({
      success: true,
      message: 'Tutorial updated successfully',
      data: tutorial,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error updating tutorial', { error: error.message, stack: error.stack });
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        })),
        timestamp: new Date().toISOString()
      });
    }

    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        error: 'Duplicate entry',
        message: 'A tutorial with this slug already exists',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: `Error updating tutorial with id ${req.params.id}`,
      timestamp: new Date().toISOString()
    });
  }
};

// Delete a Tutorial with the specified id in the request
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    logger.info('Deleting tutorial', { id });

    const tutorial = await Tutorial.findByPk(id);

    if (!tutorial) {
      logger.warn('Tutorial not found for deletion', { id });
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Tutorial with id ${id} not found`,
        timestamp: new Date().toISOString()
      });
    }

    await tutorial.destroy();

    logger.info('Tutorial deleted successfully', { id });

    res.status(200).json({
      success: true,
      message: 'Tutorial deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error deleting tutorial', { error: error.message, stack: error.stack });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: `Could not delete tutorial with id ${req.params.id}`,
      timestamp: new Date().toISOString()
    });
  }
};

// Delete all Tutorials from the database
exports.deleteAll = async (req, res) => {
  try {
    logger.info('Deleting all tutorials');

    const deletedCount = await Tutorial.destroy({
      where: {},
      truncate: false
    });

    logger.info('All tutorials deleted successfully', { count: deletedCount });

    res.status(200).json({
      success: true,
      message: `${deletedCount} tutorials deleted successfully`,
      data: { deletedCount },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error deleting all tutorials', { error: error.message, stack: error.stack });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while deleting all tutorials',
      timestamp: new Date().toISOString()
    });
  }
};

// Find all published Tutorials
exports.findAllPublished = async (req, res) => {
  try {
    const { page, limit, sort, order } = req.query;
    
    logger.info('Fetching published tutorials', { query: req.query });

    // Build pagination
    const { limit: queryLimit, offset } = getPagination(page, limit);
    
    // Build sort order
    const orderBy = getSortOrder(sort, order);

    // Execute query using scope
    const data = await Tutorial.scope('published').findAndCountAll({
      limit: queryLimit,
      offset,
      order: orderBy,
      distinct: true
    });

    // Build response
    const response = getPagingData(data, page, queryLimit);

    logger.info('Published tutorials fetched successfully', { 
      count: data.count,
      page: page || 1,
      limit: queryLimit
    });

    res.status(200).json({
      success: true,
      message: 'Published tutorials retrieved successfully',
      data: response.tutorials,
      pagination: response.pagination,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching published tutorials', { error: error.message, stack: error.stack });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while retrieving published tutorials',
      timestamp: new Date().toISOString()
    });
  }
};

// Search tutorials by title or description
exports.search = async (req, res) => {
  try {
    const { q: query, page, limit, sort, order } = req.query;
    
    logger.info('Searching tutorials', { query, page, limit });

    // Build pagination
    const { limit: queryLimit, offset } = getPagination(page, limit);
    
    // Build sort order
    const orderBy = getSortOrder(sort, order);

    // Execute search using model method
    const data = await Tutorial.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } }
        ]
      },
      limit: queryLimit,
      offset,
      order: orderBy,
      distinct: true
    });

    // Build response
    const response = getPagingData(data, page, queryLimit);

    logger.info('Tutorial search completed', { 
      query,
      count: data.count,
      page: page || 1,
      limit: queryLimit
    });

    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: response.tutorials,
      pagination: response.pagination,
      searchQuery: query,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error searching tutorials', { error: error.message, stack: error.stack });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while searching tutorials',
      timestamp: new Date().toISOString()
    });
  }
};

// Increment view count for a tutorial
exports.incrementViewCount = async (req, res) => {
  try {
    const id = req.params.id;
    
    logger.info('Incrementing view count', { id });

    const tutorial = await Tutorial.findByPk(id);

    if (!tutorial) {
      logger.warn('Tutorial not found for view increment', { id });
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Tutorial with id ${id} not found`,
        timestamp: new Date().toISOString()
      });
    }

    await tutorial.incrementViewCount();

    logger.info('View count incremented successfully', { id, newCount: tutorial.view_count });

    res.status(200).json({
      success: true,
      message: 'View count incremented successfully',
      data: {
        id: tutorial.id,
        view_count: tutorial.view_count
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error incrementing view count', { error: error.message, stack: error.stack });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: `Error incrementing view count for tutorial with id ${req.params.id}`,
      timestamp: new Date().toISOString()
    });
  }
};
