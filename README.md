# B2B Tender Management Platform

A comprehensive full-stack web application for managing B2B tenders, enabling companies to post tender requirements and bidders to submit proposals efficiently.

## 🌟 Features

### For Companies

- **Company Profile Management**: Create and manage detailed company profiles with logos, descriptions, and contact information
- **Tender Creation**: Post tenders with detailed requirements, budgets, deadlines, and categories
- **Application Management**: Review and manage applications from potential bidders
- **Dashboard Analytics**: Track tender performance and application statistics

### For Bidders

- **Browse Opportunities**: Discover available tenders across various categories
- **Application Submission**: Submit detailed proposals with quoted prices
- **Application Tracking**: Monitor the status of submitted applications
- **Company Discovery**: Search and view company profiles

### General Features

- **Advanced Search**: Find tenders and companies using smart search functionality
- **Real-time Status Updates**: Track tender and application statuses in real-time
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Secure Authentication**: JWT-based authentication with role-based access control

## 🚀 Tech Stack

### Frontend

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **Axios**: HTTP client for API requests

### Backend

- **Express.js**: Node.js web framework
- **TypeScript**: Type-safe backend development
- **PostgreSQL**: Relational database
- **Knex.js**: Query builder and migrations
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing
- **Joi**: Data validation
- **Cors**: Cross-origin resource sharing
- **Helmet**: Security middleware

### Database

- **PostgreSQL**: Primary database
- **Knex Migrations**: Database schema management
- **Seed Data**: Sample data for development

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🛠 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd b2b-tender-platform
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Update .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=b2b_tender_db
# DB_USER=your_username
# DB_PASSWORD=your_password
# JWT_SECRET=your-jwt-secret

# Run database migrations
npm run migrate

# Seed sample data (optional)
npm run seed

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Start development server
npm run dev
```

### 4. Database Setup

Create a PostgreSQL database and update the `.env` file with your credentials:

```sql
CREATE DATABASE b2b_tender_db;
```

## 🎯 Usage

### Development

1. Start the backend server: `cd backend && npm run dev`
2. Start the frontend server: `cd frontend && npm run dev`
3. Open http://localhost:3000 in your browser

### Demo Credentials

Use these demo credentials for testing:

**Company Account:**

- Email: company@demo.com
- Password: password123

**Bidder Account:**

- Email: bidder@demo.com
- Password: password123

### Key Workflows

#### For Companies:

1. Register as a company account
2. Complete company profile setup
3. Create and publish tenders
4. Review incoming applications
5. Manage tender status and awards

#### For Bidders:

1. Register as a bidder account
2. Browse available tenders
3. Submit applications with proposals
4. Track application status
5. Search for companies and opportunities

## 📁 Project Structure

```
b2b-tender-platform/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and API client
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Express.js backend application
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── middleware/      # Express middleware
│   │   └── routes/          # API route handlers
│   ├── migrations/          # Database migrations
│   ├── seeds/               # Database seed files
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Companies

- `GET /api/companies` - List companies
- `GET /api/companies/:id` - Get company details
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company
- `POST /api/companies/:id/logo` - Upload company logo

### Tenders

- `GET /api/tenders` - List tenders
- `GET /api/tenders/:id` - Get tender details
- `POST /api/tenders` - Create tender
- `PUT /api/tenders/:id` - Update tender
- `DELETE /api/tenders/:id` - Delete tender

### Applications

- `GET /api/applications` - List applications
- `GET /api/applications/:id` - Get application details
- `POST /api/applications` - Submit application
- `PUT /api/applications/:id/status` - Update application status

### Search

- `GET /api/search/companies` - Search companies
- `GET /api/search/tenders` - Search tenders

## 🗄 Database Schema

### Core Tables

- **users**: User accounts and authentication
- **companies**: Company profiles and information
- **tenders**: Tender posts and requirements
- **applications**: Bid applications and proposals
- **goods_services**: Company service offerings

### Key Relationships

- Users can have one company profile
- Companies can create multiple tenders
- Companies can submit applications to tenders
- Applications link companies to specific tenders

## 🚀 Deployment

### Using Docker (Recommended)

The easiest way to deploy the entire stack is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd b2b-tender-platform

# Start all services
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: localhost:5432
```

### Manual Deployment

#### Backend Deployment (Node.js)

**1. Prepare the environment:**

```bash
cd backend
npm install
npm run build
```

**2. Set environment variables:**

```bash
export NODE_ENV=production
export PORT=5000
export DB_HOST=your-db-host
export DB_NAME=your-db-name
export DB_USER=your-db-user
export DB_PASSWORD=your-db-password
export JWT_SECRET=your-production-jwt-secret
export SUPABASE_URL=your-supabase-url
export SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
```

**3. Run migrations and start:**

```bash
npm run migrate
npm start
```

#### Frontend Deployment (Next.js)

**For Vercel (Recommended):**

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api`
3. Deploy automatically on push to main branch

**For other platforms:**

```bash
cd frontend
npm install
npm run build

# For static export (if needed)
npm run export

# Start production server
npm start
```

#### Database Setup

**PostgreSQL (Production):**

1. Create a production PostgreSQL database
2. Run migrations: `npm run migrate`
3. Optionally seed data: `npm run seed`

**Supabase Setup (for file storage):**

1. Create a Supabase project
2. Create a storage bucket named 'uploads'
3. Set bucket to public
4. Configure CORS if needed
5. Get your project URL and service role key

### Environment Variables Reference

**Backend (.env):**

```env
NODE_ENV=production
PORT=5000
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend-domain.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Frontend (.env.local):**

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

### Deployment Platforms

**Recommended Platforms:**

- **Frontend**: Vercel, Netlify, or AWS Amplify
- **Backend**: Railway, Render, Digital Ocean, or AWS EC2
- **Database**: Railway, Render, AWS RDS, or Digital Ocean Managed Databases
- **File Storage**: Supabase Storage, AWS S3, or Cloudinary

### Performance Optimization

- Enable gzip compression on your server
- Use a CDN for static assets
- Implement database connection pooling
- Set up proper caching headers
- Monitor application performance with tools like New Relic or DataDog

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Input validation with Joi
- SQL injection prevention with parameterized queries
- CORS configuration
- Security headers with Helmet

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation for common solutions
- Review the API endpoints and examples

## 🎯 Future Enhancements

- [ ] File upload for tender documents
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Email notification system
- [ ] Mobile app development
- [ ] Integration with payment gateways
- [ ] Multi-language support
- [ ] Advanced reporting features

---

Built with ❤️ using Next.js, Express.js, and PostgreSQL
