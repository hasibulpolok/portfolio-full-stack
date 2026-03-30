// ============================================================
// middleware/auth.middleware.js
// ============================================================
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) return next(new AppError('Not authenticated. Please log in.', 401));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const mongoose = require('mongoose');
    const User = mongoose.model('User');
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return next(new AppError('User not found or inactive', 401));
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return next(new AppError('Invalid token', 401));
    if (err.name === 'TokenExpiredError') return next(new AppError('Token expired', 401));
    next(err);
  }
};

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  next();
};

// Optional auth — attaches user if token present but doesn't block
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) token = req.headers.authorization.split(' ')[1];
    else if (req.cookies?.jwt) token = req.cookies.jwt;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const mongoose = require('mongoose');
      const User = mongoose.model('User');
      req.user = await User.findById(decoded.id);
    }
  } catch {}
  next();
};


// ============================================================
// middleware/errorHandler.js
// ============================================================
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `Duplicate ${field}: ${err.keyValue[field]} already exists`;
    error.statusCode = 400;
  }
  // Mongoose validation
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(e => e.message).join('. ');
    error.statusCode = 400;
  }
  // Mongoose cast error
  if (err.name === 'CastError') {
    error.message = `Invalid ${err.path}: ${err.value}`;
    error.statusCode = 400;
  }

  if (error.statusCode >= 500) {
    logger.error(`${req.method} ${req.path} - ${error.message}`, { stack: err.stack });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;


// ============================================================
// middleware/validate.middleware.js
// ============================================================
const Joi = require('joi');
const AppError = require('../utils/AppError');

const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  project: Joi.object({
    title: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).required(),
    shortDescription: Joi.string().max(200).required(),
    thumbnail: Joi.string().uri().required(),
    images: Joi.array().items(Joi.string().uri()),
    techStack: Joi.array().items(Joi.string()),
    category: Joi.string().valid('web', 'mobile', 'api', 'other'),
    status: Joi.string().valid('completed', 'in-progress', 'archived'),
    liveUrl: Joi.string().uri().allow(''),
    githubUrl: Joi.string().uri().allow(''),
    featured: Joi.boolean(),
    order: Joi.number(),
    isPublished: Joi.boolean(),
  }),
  contact: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    subject: Joi.string().min(3).max(200).required(),
    message: Joi.string().min(10).max(2000).required(),
    phone: Joi.string().allow('').optional(),
  }),
  skill: Joi.object({
    name: Joi.string().min(1).max(50).required(),
    icon: Joi.string().allow('').optional(),
    category: Joi.string().valid('frontend', 'backend', 'database', 'devops', 'design', 'tools', 'other').required(),
    proficiency: Joi.number().min(0).max(100),
    order: Joi.number(),
    isVisible: Joi.boolean(),
  }),
};

exports.validate = (schemaName) => (req, res, next) => {
  const schema = schemas[schemaName];
  if (!schema) return next();
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
  if (error) {
    const msg = error.details.map(d => d.message).join('. ');
    return next(new AppError(msg, 400));
  }
  next();
};


// ============================================================
// middleware/upload.middleware.js
// ============================================================
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/AppError');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new AppError('File type not allowed', 400), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

exports.uploadSingle = upload.single('file');
exports.uploadMultiple = upload.array('files', 10);


// ============================================================
// utils/AppError.js
// ============================================================
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;


// ============================================================
// utils/logger.js
// ============================================================
const winston = require('winston');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
const fs = require('fs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ] : []),
  ],
});

module.exports = logger;


// ============================================================
// routes/auth.routes.js
// ============================================================
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/all.controllers');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.post('/login', validate('login'), authCtrl.login);
router.post('/logout', authCtrl.logout);
router.get('/me', protect, authCtrl.getMe);
router.patch('/update-password', protect, authCtrl.updatePassword);

module.exports = router;


// ============================================================
// routes/project.routes.js
// ============================================================
const express2 = require('express');
const router2 = express2.Router();
const projectCtrl = require('../controllers/all.controllers');
const { protect: p2, optionalAuth } = require('../middleware/auth.middleware');
const { validate: v2 } = require('../middleware/validate.middleware');

router2.get('/', optionalAuth, projectCtrl.getAllProjects);
router2.get('/:slug', optionalAuth, projectCtrl.getProject);
router2.post('/', p2, v2('project'), projectCtrl.createProject);
router2.patch('/:id', p2, projectCtrl.updateProject);
router2.delete('/:id', p2, projectCtrl.deleteProject);

module.exports = router2;


// ============================================================
// routes/skill.routes.js
// ============================================================
const express3 = require('express');
const router3 = express3.Router();
const skillCtrl = require('../controllers/all.controllers');
const { protect: p3, optionalAuth: oa3 } = require('../middleware/auth.middleware');
const { validate: v3 } = require('../middleware/validate.middleware');

router3.get('/', oa3, skillCtrl.getAllSkills);
router3.post('/', p3, v3('skill'), skillCtrl.createSkill);
router3.patch('/:id', p3, skillCtrl.updateSkill);
router3.delete('/:id', p3, skillCtrl.deleteSkill);

module.exports = router3;


// ============================================================
// routes/experience.routes.js
// ============================================================
const express4 = require('express');
const router4 = express4.Router();
const expCtrl = require('../controllers/all.controllers');
const { protect: p4, optionalAuth: oa4 } = require('../middleware/auth.middleware');

router4.get('/', oa4, expCtrl.getAllExperience);
router4.post('/', p4, expCtrl.createExperience);
router4.patch('/:id', p4, expCtrl.updateExperience);
router4.delete('/:id', p4, expCtrl.deleteExperience);

module.exports = router4;


// ============================================================
// routes/blog.routes.js
// ============================================================
const express5 = require('express');
const router5 = express5.Router();
const blogCtrl = require('../controllers/all.controllers');
const { protect: p5, optionalAuth: oa5 } = require('../middleware/auth.middleware');

router5.get('/', oa5, blogCtrl.getAllBlogs);
router5.get('/:slug', oa5, blogCtrl.getBlog);
router5.post('/', p5, blogCtrl.createBlog);
router5.patch('/:id', p5, blogCtrl.updateBlog);
router5.delete('/:id', p5, blogCtrl.deleteBlog);

module.exports = router5;


// ============================================================
// routes/testimonial.routes.js
// ============================================================
const express6 = require('express');
const router6 = express6.Router();
const tCtrl = require('../controllers/all.controllers');
const { protect: p6, optionalAuth: oa6 } = require('../middleware/auth.middleware');

router6.get('/', oa6, tCtrl.getAllTestimonials);
router6.post('/', p6, tCtrl.createTestimonial);
router6.patch('/:id', p6, tCtrl.updateTestimonial);
router6.delete('/:id', p6, tCtrl.deleteTestimonial);

module.exports = router6;


// ============================================================
// routes/contact.routes.js
// ============================================================
const express7 = require('express');
const router7 = express7.Router();
const contactCtrl = require('../controllers/all.controllers');
const { protect: p7 } = require('../middleware/auth.middleware');
const { validate: v7 } = require('../middleware/validate.middleware');

router7.post('/', v7('contact'), contactCtrl.submitContact);
router7.get('/', p7, contactCtrl.getAllContacts);
router7.patch('/:id/status', p7, contactCtrl.updateContactStatus);

module.exports = router7;


// ============================================================
// routes/site.routes.js
// ============================================================
const express8 = require('express');
const router8 = express8.Router();
const siteCtrl = require('../controllers/all.controllers');
const { protect: p8 } = require('../middleware/auth.middleware');

router8.get('/', siteCtrl.getSiteSettings);
router8.patch('/', p8, siteCtrl.updateSiteSettings);

module.exports = router8;


// ============================================================
// routes/upload.routes.js
// ============================================================
const express9 = require('express');
const router9 = express9.Router();
const uploadCtrl = require('../controllers/all.controllers');
const { protect: p9 } = require('../middleware/auth.middleware');
const { uploadSingle, uploadMultiple } = require('../middleware/upload.middleware');

router9.post('/single', p9, uploadSingle, uploadCtrl.uploadFile);
router9.post('/multiple', p9, uploadMultiple, uploadCtrl.uploadMultiple);

module.exports = router9;


// ============================================================
// scripts/seedAdmin.js  (run once: node scripts/seedAdmin.js)
// ============================================================
const mongoose = require('mongoose');
require('dotenv').config();

// Register all models
require('../models/all.models');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = mongoose.model('User');
  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL || 'polok@admin.com' });
  if (existing) { console.log('Admin already exists'); process.exit(0); }
  
  await User.create({
    name: 'Md. Hasibul Bashar Polok',
    email: process.env.ADMIN_EMAIL || 'polok@admin.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    role: 'superadmin',
  });
  console.log('✅ Admin created successfully');
  console.log('Email:', process.env.ADMIN_EMAIL || 'polok@admin.com');
  console.log('Password:', process.env.ADMIN_PASSWORD || 'Admin@12345');
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
