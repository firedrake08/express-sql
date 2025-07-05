const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const tutorials = require('../controllers/tutorial.controller.js');

// Rate limiting for different operations
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 create requests per windowMs
  message: {
    error: 'Too many tutorials created, please try again later.',
    retryAfter: 15 * 60 * 1000
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: 15 * 60 * 1000
  }
});

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// Validation rules
const createTutorialValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters')
    .notEmpty()
    .withMessage('Title is required'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean value'),
  body('author')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Author name must be between 2 and 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters')
];

const updateTutorialValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean value'),
  body('author')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Author name must be between 2 and 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
];

const queryValidation = [
  query('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title query must be between 1 and 255 characters'),
  query('author')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author query must be between 1 and 100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['title', 'created_at', 'updated_at', 'view_count'])
    .withMessage('Sort must be one of: title, created_at, updated_at, view_count'),
  query('order')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Order must be ASC or DESC')
];

module.exports = (app) => {
  // Apply general rate limiting to all tutorial routes
  app.use('/api/tutorials', generalLimiter);

  /**
   * @route   POST /api/tutorials
   * @desc    Create a new tutorial
   * @access  Public
   * @body    { title, description?, published?, author?, tags? }
   */
  router.post('/', 
    createLimiter,
    createTutorialValidation,
    handleValidationErrors,
    tutorials.create
  );

  /**
   * @route   GET /api/tutorials
   * @desc    Retrieve all tutorials with optional filtering and pagination
   * @access  Public
   * @query   { title?, author?, page?, limit?, sort?, order? }
   */
  router.get('/', 
    queryValidation,
    handleValidationErrors,
    tutorials.findAll
  );

  /**
   * @route   GET /api/tutorials/published
   * @desc    Retrieve all published tutorials
   * @access  Public
   * @query   { page?, limit?, sort?, order? }
   */
  router.get('/published', 
    queryValidation,
    handleValidationErrors,
    tutorials.findAllPublished
  );

  /**
   * @route   GET /api/tutorials/search
   * @desc    Search tutorials by title or description
   * @access  Public
   * @query   { q, page?, limit?, sort?, order? }
   */
  router.get('/search',
    query('q')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Search query must be between 1 and 255 characters'),
    queryValidation,
    handleValidationErrors,
    tutorials.search
  );

  /**
   * @route   GET /api/tutorials/slug/:slug
   * @desc    Retrieve a tutorial by slug
   * @access  Public
   * @param   slug - Tutorial slug
   */
  router.get('/slug/:slug',
    param('slug')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
    handleValidationErrors,
    tutorials.findBySlug
  );

  /**
   * @route   GET /api/tutorials/:id
   * @desc    Retrieve a single tutorial by ID
   * @access  Public
   * @param   id - Tutorial ID
   */
  router.get('/:id', 
    idValidation,
    handleValidationErrors,
    tutorials.findOne
  );

  /**
   * @route   PUT /api/tutorials/:id
   * @desc    Update a tutorial by ID
   * @access  Public
   * @param   id - Tutorial ID
   * @body    { title?, description?, published?, author?, tags? }
   */
  router.put('/:id', 
    updateTutorialValidation,
    handleValidationErrors,
    tutorials.update
  );

  /**
   * @route   DELETE /api/tutorials/:id
   * @desc    Delete a tutorial by ID
   * @access  Public
   * @param   id - Tutorial ID
   */
  router.delete('/:id', 
    idValidation,
    handleValidationErrors,
    tutorials.delete
  );

  /**
   * @route   DELETE /api/tutorials
   * @desc    Delete all tutorials
   * @access  Public
   */
  router.delete('/', tutorials.deleteAll);

  /**
   * @route   POST /api/tutorials/:id/view
   * @desc    Increment view count for a tutorial
   * @access  Public
   * @param   id - Tutorial ID
   */
  router.post('/:id/view',
    idValidation,
    handleValidationErrors,
    tutorials.incrementViewCount
  );

  // Mount the router
  app.use('/api/tutorials', router);
};