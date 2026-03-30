const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const skillRoutes = require('./routes/skill.routes');
const experienceRoutes = require('./routes/experience.routes');
const blogRoutes = require('./routes/blog.routes');
const testimonialRoutes = require('./routes/testimonial.routes');
const contactRoutes = require('./routes/contact.routes');
const siteRoutes = require('./routes/site.routes');
const uploadRoutes = require('./routes/upload.routes');

const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Connect DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => logger.info('MongoDB connected'))
.catch(err => { logger.error('MongoDB error:', err); process.exit(1); });

// Security & Parsing
app.use(helmet());
app.use(mongoSanitize());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: msg => logger.http(msg.trim()) } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { success: false, message: 'Too many requests. Try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts.' },
});
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

module.exports = app;
