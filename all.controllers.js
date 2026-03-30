// ============================================================
// controllers/auth.controller.js
// ============================================================
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/all.models').User || require('mongoose').model('User');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// NOTE: In the split-file version, import each model separately.
// Here we reference them by name since all schemas are in one file for brevity.
// In production, split into individual files.

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({ success: true, token, data: { user } });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(new AppError('Email and password required', 400));

    const mongoose = require('mongoose');
    const User = mongoose.model('User');
    const user = await User.findOne({ email, isActive: true }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid credentials', 401));
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    logger.info(`Admin login: ${user.email}`);
    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: { user: req.user } });
  } catch (err) { next(err); }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const User = mongoose.model('User');
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }
    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', { expires: new Date(Date.now() + 1000), httpOnly: true });
  res.json({ success: true, message: 'Logged out' });
};


// ============================================================
// controllers/project.controller.js
// ============================================================
const slugify = require('slugify');

exports.getAllProjects = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Project = mongoose.model('Project');
    const { page = 1, limit = 10, category, status, featured, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (featured) query.featured = featured === 'true';
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } },
    ];
    // Public route only shows published
    if (!req.user) query.isPublished = true;

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: projects,
    });
  } catch (err) { next(err); }
};

exports.getProject = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Project = mongoose.model('Project');
    const { slug } = req.params;
    const project = await Project.findOneAndUpdate(
      { slug, ...(req.user ? {} : { isPublished: true }) },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!project) return next(new AppError('Project not found', 404));
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

exports.createProject = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Project = mongoose.model('Project');
    const slug = slugify(req.body.title, { lower: true, strict: true });
    const project = await Project.create({ ...req.body, slug });
    res.status(201).json({ success: true, data: project });
  } catch (err) { next(err); }
};

exports.updateProject = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Project = mongoose.model('Project');
    if (req.body.title) req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return next(new AppError('Project not found', 404));
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Project = mongoose.model('Project');
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return next(new AppError('Project not found', 404));
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
};


// ============================================================
// controllers/skill.controller.js
// ============================================================
exports.getAllSkills = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Skill = mongoose.model('Skill');
    const query = req.user ? {} : { isVisible: true };
    if (req.query.category) query.category = req.query.category;
    const skills = await Skill.find(query).sort({ order: 1, category: 1 });
    res.json({ success: true, data: skills });
  } catch (err) { next(err); }
};

exports.createSkill = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Skill = mongoose.model('Skill');
    const skill = await Skill.create(req.body);
    res.status(201).json({ success: true, data: skill });
  } catch (err) { next(err); }
};

exports.updateSkill = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Skill = mongoose.model('Skill');
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!skill) return next(new AppError('Skill not found', 404));
    res.json({ success: true, data: skill });
  } catch (err) { next(err); }
};

exports.deleteSkill = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Skill = mongoose.model('Skill');
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Skill deleted' });
  } catch (err) { next(err); }
};


// ============================================================
// controllers/experience.controller.js
// ============================================================
exports.getAllExperience = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Experience = mongoose.model('Experience');
    const query = req.user ? {} : { isVisible: true };
    const experiences = await Experience.find(query).sort({ isCurrent: -1, startDate: -1 });
    res.json({ success: true, data: experiences });
  } catch (err) { next(err); }
};

exports.createExperience = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Experience = mongoose.model('Experience');
    const exp = await Experience.create(req.body);
    res.status(201).json({ success: true, data: exp });
  } catch (err) { next(err); }
};

exports.updateExperience = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Experience = mongoose.model('Experience');
    const exp = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!exp) return next(new AppError('Experience not found', 404));
    res.json({ success: true, data: exp });
  } catch (err) { next(err); }
};

exports.deleteExperience = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Experience = mongoose.model('Experience');
    await Experience.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Experience deleted' });
  } catch (err) { next(err); }
};


// ============================================================
// controllers/blog.controller.js
// ============================================================
exports.getAllBlogs = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Blog = mongoose.model('Blog');
    const { page = 1, limit = 10, tag, category, featured, search } = req.query;
    const query = {};
    if (!req.user) query.status = 'published';
    if (tag) query.tags = tag;
    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
    ];

    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .populate('author', 'name avatar')
      .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-content');

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), data: blogs });
  } catch (err) { next(err); }
};

exports.getBlog = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Blog = mongoose.model('Blog');
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, ...(req.user ? {} : { status: 'published' }) },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name avatar');
    if (!blog) return next(new AppError('Blog post not found', 404));
    res.json({ success: true, data: blog });
  } catch (err) { next(err); }
};

exports.createBlog = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Blog = mongoose.model('Blog');
    const slug = slugify(req.body.title, { lower: true, strict: true });
    const readTime = Math.ceil(req.body.content.split(' ').length / 200);
    const publishedAt = req.body.status === 'published' ? new Date() : null;
    const blog = await Blog.create({ ...req.body, slug, readTime, publishedAt, author: req.user._id });
    res.status(201).json({ success: true, data: blog });
  } catch (err) { next(err); }
};

exports.updateBlog = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Blog = mongoose.model('Blog');
    if (req.body.title) req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    if (req.body.content) req.body.readTime = Math.ceil(req.body.content.split(' ').length / 200);
    if (req.body.status === 'published' && !req.body.publishedAt) req.body.publishedAt = new Date();
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!blog) return next(new AppError('Blog not found', 404));
    res.json({ success: true, data: blog });
  } catch (err) { next(err); }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Blog = mongoose.model('Blog');
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blog deleted' });
  } catch (err) { next(err); }
};


// ============================================================
// controllers/testimonial.controller.js
// ============================================================
exports.getAllTestimonials = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Testimonial = mongoose.model('Testimonial');
    const query = req.user ? {} : { isApproved: true };
    if (req.query.featured) query.isFeatured = req.query.featured === 'true';
    const testimonials = await Testimonial.find(query)
      .populate('projectRef', 'title slug')
      .sort({ isFeatured: -1, order: 1 });
    res.json({ success: true, data: testimonials });
  } catch (err) { next(err); }
};

exports.createTestimonial = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Testimonial = mongoose.model('Testimonial');
    const t = await Testimonial.create(req.body);
    res.status(201).json({ success: true, data: t });
  } catch (err) { next(err); }
};

exports.updateTestimonial = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Testimonial = mongoose.model('Testimonial');
    const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!t) return next(new AppError('Testimonial not found', 404));
    res.json({ success: true, data: t });
  } catch (err) { next(err); }
};

exports.deleteTestimonial = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Testimonial = mongoose.model('Testimonial');
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};


// ============================================================
// controllers/contact.controller.js
// ============================================================
const nodemailer = require('nodemailer');

exports.submitContact = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Contact = mongoose.model('Contact');
    const { name, email, subject, message, phone } = req.body;
    const contact = await Contact.create({
      name, email, subject, message, phone,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Send notification email (if configured)
    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `New Contact: ${subject}`,
        html: `<h2>New message from ${name}</h2><p>Email: ${email}</p><p>${message}</p>`,
      }).catch(err => logger.warn('Email send failed:', err.message));
    }

    res.status(201).json({ success: true, message: 'Message sent successfully!', data: { id: contact._id } });
  } catch (err) { next(err); }
};

exports.getAllContacts = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Contact = mongoose.model('Contact');
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, total, data: contacts });
  } catch (err) { next(err); }
};

exports.updateContactStatus = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Contact = mongoose.model('Contact');
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, replyNote: req.body.replyNote, repliedAt: req.body.status === 'replied' ? new Date() : undefined },
      { new: true }
    );
    res.json({ success: true, data: contact });
  } catch (err) { next(err); }
};


// ============================================================
// controllers/site.controller.js
// ============================================================
exports.getSiteSettings = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Site = mongoose.model('Site');
    let site = await Site.findOne();
    if (!site) {
      site = await Site.create({
        hero: { roles: ['MERN Stack Developer', 'Backend Engineer', 'Freelancer'] },
        about: { description: 'Full-stack developer from Bangladesh...' },
      });
    }
    res.json({ success: true, data: site });
  } catch (err) { next(err); }
};

exports.updateSiteSettings = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Site = mongoose.model('Site');
    let site = await Site.findOneAndUpdate({}, req.body, { new: true, upsert: true, runValidators: true });
    res.json({ success: true, data: site });
  } catch (err) { next(err); }
};


// ============================================================
// controllers/upload.controller.js
// ============================================================
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file uploaded', 400));
    const fileUrl = `${process.env.API_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    res.json({ success: true, url: fileUrl, filename: req.file.filename });
  } catch (err) { next(err); }
};

exports.uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files?.length) return next(new AppError('No files uploaded', 400));
    const urls = req.files.map(f => ({
      url: `${process.env.API_URL || 'http://localhost:5000'}/uploads/${f.filename}`,
      filename: f.filename,
    }));
    res.json({ success: true, data: urls });
  } catch (err) { next(err); }
};
