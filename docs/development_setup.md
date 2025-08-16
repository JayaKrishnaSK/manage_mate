# Manage Mate - Development Setup Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Git

### 1. Clone and Install

```bash
git clone <repository-url>
cd manage_mate
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
# Minimum required:
# - MONGODB_URI
# - AUTH_SECRET
# - JWT_SECRET
# - JWT_REFRESH_SECRET
```

### 3. Generate Secrets

```bash
# Generate secure secrets for .env.local
node -e "console.log('AUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Database Setup

```bash
# If using local MongoDB, ensure it's running
# If using MongoDB Atlas, create a cluster and get connection string
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure Overview

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Main dashboard
│   ├── admin/            # Admin interfaces
│   └── ...               # Feature pages
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utilities and helpers
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database connection
│   ├── policies.ts       # RBAC permissions
│   └── validations/      # Zod schemas
├── models/               # MongoDB/Mongoose models
└── middleware.ts         # Next.js middleware
```

## 🔧 Available Scripts

```bash
npm run dev         # Start development server with Turbopack
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
```

## 🧪 First Time Setup Verification

### 1. Register First User

1. Go to `/register`
2. Create account with admin role
3. Login at `/login`

### 2. Test Core Features

- ✅ Authentication (login/logout)
- ✅ Dashboard access
- ✅ User management (admin)
- ✅ Profile management
- ⏳ Project creation (Phase 3)

## 🏗️ Current Development Status

### ✅ Completed Features

- User authentication and authorization
- Role-based access control (RBAC)
- User management with admin interface
- Activity logging and audit trail
- Profile management

### 🚧 In Development

- **Phase 3**: Projects and Modules (CURRENT PRIORITY)
- Project creation and team management
- Module organization and dependencies

### 📋 Pending Features

- Task management with Kanban boards
- Issue tracking and triage
- QA test management
- Real-time collaboration
- File uploads and attachments

## 🔍 Development Workflow

### 1. Feature Development Process

```bash
# 1. Create feature branch
git checkout -b feature/project-creation

# 2. Implement feature
# - Add/update models in src/models/
# - Create API routes in src/app/api/
# - Add validation schemas in src/lib/validations/
# - Build UI components in src/components/
# - Add pages in src/app/

# 3. Test functionality
npm run dev
# Manually test the feature

# 4. Commit and push
git add .
git commit -m "feat: implement project creation"
git push origin feature/project-creation
```

### 2. Database Model Development

```typescript
// 1. Define model in src/models/
export interface IProject extends Document {
  // ... interface definition
}

// 2. Add validation schema in src/lib/validations/
export const projectCreateSchema = z.object({
  // ... validation rules
});

// 3. Create API routes in src/app/api/projects/
export async function POST(request: NextRequest) {
  // ... API implementation
}

// 4. Build UI components
export function ProjectForm() {
  // ... component implementation
}
```

## 🐛 Common Issues and Solutions

### 1. MongoDB Connection Issues

```bash
# Check MongoDB is running
# Local: brew services start mongodb-community
# Or check Atlas connection string format
```

### 2. Authentication Issues

```bash
# Verify JWT secrets are set in .env.local
# Check NEXTAUTH_URL matches your domain
```

### 3. Build Issues

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📚 Key Technologies

- **Next.js 15**: App Router, Server Components, Server Actions
- **React 19**: Latest React features
- **TypeScript**: Type safety throughout
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library
- **MongoDB**: Database with Mongoose ODM
- **NextAuth.js**: Authentication
- **Zod**: Schema validation

## 🎯 Next Development Priorities

1. **Complete Projects API** (Week 1)
2. **Project UI Components** (Week 2)
3. **Module Management** (Week 3)
4. **Task Management UI** (Week 4-5)

## 📧 Need Help?

Check the development plan documents:

- `docs/development_plan.md` - Detailed roadmap
- `docs/manage_mate_project_plan.md` - Architecture overview
- `docs/current_status_review.md` - Current status assessment
