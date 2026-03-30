# 🚀 Polok Portfolio — Full Stack Setup Guide
**Developer: Md. Hasibul Bashar Polok | MERN Stack Developer**

---

## 📁 Full Project Structure

```
polok-portfolio/
├── backend/
│   ├── server.js                    # Main Express app entry
│   ├── package.json
│   ├── .env                         # (from .env.example)
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Project.model.js
│   │   ├── Skill.model.js
│   │   ├── Experience.model.js
│   │   ├── Blog.model.js
│   │   ├── Testimonial.model.js
│   │   ├── Contact.model.js
│   │   └── Site.model.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── project.controller.js
│   │   ├── skill.controller.js
│   │   ├── experience.controller.js
│   │   ├── blog.controller.js
│   │   ├── testimonial.controller.js
│   │   ├── contact.controller.js
│   │   ├── site.controller.js
│   │   └── upload.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── project.routes.js
│   │   ├── skill.routes.js
│   │   ├── experience.routes.js
│   │   ├── blog.routes.js
│   │   ├── testimonial.routes.js
│   │   ├── contact.routes.js
│   │   ├── site.routes.js
│   │   └── upload.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.js
│   │   ├── validate.middleware.js
│   │   └── upload.middleware.js
│   ├── utils/
│   │   ├── AppError.js
│   │   └── logger.js
│   ├── scripts/
│   │   └── seedAdmin.js
│   ├── uploads/                     # Local file storage
│   └── logs/                        # Log files
│
└── frontend/
    ├── package.json
    ├── .env.local                   # (from .env.example)
    ├── next.config.js
    ├── tsconfig.json
    ├── tailwind.config.js
    └── src/
        ├── app/
        │   ├── layout.tsx           # Root layout with metadata
        │   ├── page.tsx             # Public homepage
        │   ├── projects/
        │   │   ├── page.tsx         # All projects listing
        │   │   └── [slug]/page.tsx  # Project detail
        │   ├── blog/
        │   │   ├── page.tsx         # Blog listing
        │   │   └── [slug]/page.tsx  # Blog post
        │   └── admin/
        │       ├── layout.tsx       # Admin layout + guard
        │       ├── login/page.tsx
        │       ├── page.tsx         # Dashboard
        │       ├── projects/page.tsx
        │       ├── skills/page.tsx
        │       ├── experience/page.tsx
        │       ├── blogs/page.tsx
        │       ├── testimonials/page.tsx
        │       ├── contacts/page.tsx
        │       ├── site/page.tsx
        │       └── uploads/page.tsx
        ├── lib/
        │   └── api.ts               # Axios instance
        ├── store/
        │   └── authStore.ts         # Zustand auth
        ├── hooks/
        │   └── usePortfolio.ts      # All React Query hooks
        └── components/
            ├── common/
            │   ├── Navbar.tsx
            │   ├── Footer.tsx
            │   └── LoadingSpinner.tsx
            └── admin/
                └── AdminTable.tsx
```

---

## ⚙️ Step-by-Step Setup

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn

---

### 1️⃣ Clone & Setup

```bash
git clone <your-repo> polok-portfolio
cd polok-portfolio
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install

# Copy env
cp ../.env.example .env
# Edit .env with your values

# Create uploads and logs directories
mkdir uploads logs

# Seed admin user
npm run seed
# Output: Admin created: polok@admin.com / Admin@12345
```

Start backend:
```bash
npm run dev    # Development with nodemon
npm start      # Production
```

Backend runs at: http://localhost:5000

---

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install

# Create env file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

**Install dependencies:**
```bash
npm install next@14 react react-dom typescript @types/react @types/node
npm install tailwindcss postcss autoprefixer
npm install axios @tanstack/react-query zustand
npm install @tanstack/react-query-devtools
npx tailwindcss init -p
```

Start frontend:
```bash
npm run dev    # Runs on http://localhost:3000
```

---

### 4️⃣ Split Model Files (Production)

The `models/all.models.js` consolidates all schemas. In production, split like:

```js
// models/User.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// ... (User schema only)
module.exports = mongoose.model('User', userSchema);
```

Register all models in `server.js`:
```js
require('./models/User.model');
require('./models/Project.model');
// ... etc
```

---

### 5️⃣ Frontend next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-api-domain.com', 'res.cloudinary.com'],
  },
};
module.exports = nextConfig;
```

### 6️⃣ Frontend tailwind.config.js

```js
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

### 7️⃣ Frontend Providers Setup (src/app/layout.tsx)

```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
  }));
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

---

## 🔗 API Endpoints Reference

### AUTH
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | ❌ | Admin login → returns JWT |
| POST | /api/auth/logout | ❌ | Clear cookie |
| GET | /api/auth/me | ✅ | Get current admin |
| PATCH | /api/auth/update-password | ✅ | Change password |

### PROJECTS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/projects | ❌ | List (public: published only) |
| GET | /api/projects/:slug | ❌ | Get by slug (+view count) |
| POST | /api/projects | ✅ | Create |
| PATCH | /api/projects/:id | ✅ | Update |
| DELETE | /api/projects/:id | ✅ | Delete |

**Query params:** `page`, `limit`, `category`, `featured`, `status`, `search`

### SKILLS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/skills | ❌ | List visible skills |
| POST | /api/skills | ✅ | Create |
| PATCH | /api/skills/:id | ✅ | Update |
| DELETE | /api/skills/:id | ✅ | Delete |

### EXPERIENCE
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/experience | ❌ | List |
| POST | /api/experience | ✅ | Create |
| PATCH | /api/experience/:id | ✅ | Update |
| DELETE | /api/experience/:id | ✅ | Delete |

### BLOGS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/blogs | ❌ | List published posts |
| GET | /api/blogs/:slug | ❌ | Get post by slug |
| POST | /api/blogs | ✅ | Create |
| PATCH | /api/blogs/:id | ✅ | Update |
| DELETE | /api/blogs/:id | ✅ | Delete |

**Query params:** `page`, `limit`, `tag`, `category`, `featured`, `search`

### TESTIMONIALS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/testimonials | ❌ | List approved |
| POST | /api/testimonials | ✅ | Create |
| PATCH | /api/testimonials/:id | ✅ | Update / approve |
| DELETE | /api/testimonials/:id | ✅ | Delete |

### CONTACT
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/contact | ❌ | Submit form |
| GET | /api/contact | ✅ | Admin: list all |
| PATCH | /api/contact/:id/status | ✅ | Update read/replied |

### SITE SETTINGS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/site | ❌ | Get all settings |
| PATCH | /api/site | ✅ | Update settings |

### UPLOADS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/upload/single | ✅ | Upload one file |
| POST | /api/upload/multiple | ✅ | Upload up to 10 |

---

## 🔐 Authentication Flow

```
1. Admin visits /admin/login
2. Submits email + password
3. POST /api/auth/login
4. Server: bcrypt.compare(password, hash) → success
5. Server returns JWT token (7d expiry)
6. Frontend: stores token in localStorage + Zustand
7. All admin API calls: Authorization: Bearer <token>
8. Server middleware: jwt.verify() → attaches req.user
9. Protected routes: check req.user presence
10. Token expired → auto redirect to /admin/login
```

---

## 🔧 Environment Variables List

### Backend (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| NODE_ENV | ✅ | development / production |
| PORT | ✅ | Server port (default: 5000) |
| MONGO_URI | ✅ | MongoDB connection string |
| JWT_SECRET | ✅ | Secret key (min 32 chars) |
| JWT_EXPIRES_IN | ✅ | Token expiry (e.g., 7d) |
| ADMIN_EMAIL | ✅ | Seed admin email |
| ADMIN_PASSWORD | ✅ | Seed admin password |
| CLIENT_URL | ✅ | Frontend URL (CORS) |
| API_URL | ✅ | Backend URL (for file URLs) |
| SMTP_HOST | ❌ | Email server host |
| SMTP_PORT | ❌ | Email server port |
| SMTP_USER | ❌ | Email username |
| SMTP_PASS | ❌ | Email password |
| LOG_LEVEL | ❌ | Logging level (default: info) |

### Frontend (.env.local)
| Variable | Required | Description |
|----------|----------|-------------|
| NEXT_PUBLIC_API_URL | ✅ | Backend API URL |

---

## 🌐 Production Deployment

### Backend (Render / Railway / VPS)
```bash
# Set NODE_ENV=production in env
# Ensure MONGO_URI is Atlas URI
npm start
```

### Frontend (Vercel)
```bash
# Set NEXT_PUBLIC_API_URL to your production API URL
vercel deploy
```

### MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Create database user
3. Whitelist your server IP (or 0.0.0.0/0 for all)
4. Get connection string → set as MONGO_URI

---

## 📌 First Run Checklist

- [ ] MongoDB running (local or Atlas)
- [ ] `npm install` in backend
- [ ] `.env` configured
- [ ] `npm run seed` → creates admin user
- [ ] `npm run dev` → backend on :5000
- [ ] `npm install` in frontend
- [ ] `.env.local` configured
- [ ] `npm run dev` → frontend on :3000
- [ ] Login at http://localhost:3000/admin/login
- [ ] Credentials: polok@admin.com / Admin@12345
- [ ] Update site settings in admin panel
- [ ] Add projects, skills, experience
- [ ] Change admin password from Site Settings

---

## 🔒 Security Checklist for Production

- [ ] Change JWT_SECRET to a strong random value (use: `openssl rand -hex 32`)
- [ ] Change admin password from seed default
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set proper CORS origin (not *)
- [ ] Enable rate limiting (already included)
- [ ] Review file upload restrictions
- [ ] Set up automated MongoDB backups

---

*Built for Md. Hasibul Bashar Polok — MERN Stack Developer, Bangladesh*
