// ============================================================
// models/User.model.js
// ============================================================
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  avatar: { type: String, default: '' },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);


// ============================================================
// models/Project.model.js
// ============================================================
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  shortDescription: { type: String, required: true, maxlength: 200 },
  thumbnail: { type: String, required: true },
  images: [{ type: String }],
  techStack: [{ type: String }],
  category: { type: String, enum: ['web', 'mobile', 'api', 'other'], default: 'web' },
  status: { type: String, enum: ['completed', 'in-progress', 'archived'], default: 'completed' },
  liveUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  meta: {
    title: String,
    description: String,
    keywords: [String],
  },
}, { timestamps: true });

projectSchema.index({ slug: 1, featured: 1, isPublished: 1 });
module.exports = mongoose.model('Project', projectSchema);


// ============================================================
// models/Skill.model.js
// ============================================================
const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: '' },
  category: {
    type: String,
    enum: ['frontend', 'backend', 'database', 'devops', 'design', 'tools', 'other'],
    required: true,
  },
  proficiency: { type: Number, min: 0, max: 100, default: 80 },
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);


// ============================================================
// models/Experience.model.js
// ============================================================
const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  companyUrl: { type: String, default: '' },
  companyLogo: { type: String, default: '' },
  location: { type: String, default: '' },
  type: { type: String, enum: ['full-time', 'part-time', 'freelance', 'contract', 'internship'], default: 'freelance' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, required: true },
  responsibilities: [{ type: String }],
  techStack: [{ type: String }],
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema);


// ============================================================
// models/Blog.model.js
// ============================================================
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true, maxlength: 300 },
  coverImage: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
  category: { type: String, default: 'general' },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  readTime: { type: Number, default: 5 }, // minutes
  meta: {
    title: String,
    description: String,
    keywords: [String],
  },
  publishedAt: { type: Date },
}, { timestamps: true });

blogSchema.index({ slug: 1, status: 1, featured: 1 });
module.exports = mongoose.model('Blog', blogSchema);


// ============================================================
// models/Testimonial.model.js
// ============================================================
const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  title: { type: String, required: true },
  company: { type: String, default: '' },
  avatar: { type: String, default: '' },
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  projectRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  isApproved: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  platform: { type: String, enum: ['fiverr', 'upwork', 'linkedin', 'direct', 'other'], default: 'direct' },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);


// ============================================================
// models/Contact.model.js
// ============================================================
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  phone: { type: String, default: '' },
  status: { type: String, enum: ['new', 'read', 'replied', 'archived'], default: 'new' },
  ipAddress: { type: String },
  userAgent: { type: String },
  repliedAt: { type: Date },
  replyNote: { type: String, default: '' },
}, { timestamps: true });

contactSchema.index({ status: 1, createdAt: -1 });
module.exports = mongoose.model('Contact', contactSchema);


// ============================================================
// models/Site.model.js  (Single document for site settings)
// ============================================================
const siteSchema = new mongoose.Schema({
  hero: {
    greeting: { type: String, default: "Hi, I'm" },
    name: { type: String, default: 'Md. Hasibul Bashar Polok' },
    roles: [{ type: String }],
    bio: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    ctaText: { type: String, default: 'View My Work' },
    ctaLink: { type: String, default: '#projects' },
  },
  about: {
    title: { type: String, default: 'About Me' },
    description: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    yearsOfExperience: { type: Number, default: 0 },
    projectsCompleted: { type: Number, default: 0 },
    clientsSatisfied: { type: Number, default: 0 },
    availability: { type: String, enum: ['available', 'busy', 'not-available'], default: 'available' },
  },
  contact: {
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    address: { type: String, default: 'Bangladesh' },
    timezone: { type: String, default: 'Asia/Dhaka' },
  },
  social: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    fiverr: { type: String, default: '' },
    upwork: { type: String, default: '' },
  },
  seo: {
    title: { type: String, default: 'Md. Hasibul Bashar Polok | MERN Stack Developer' },
    description: { type: String, default: '' },
    keywords: [{ type: String }],
    ogImage: { type: String, default: '' },
  },
  maintenance: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Site', siteSchema);
