# Node.js Tutorial REST API

A robust, production-ready REST API for managing tutorials built with Node.js, Express, Sequelize, and MySQL.

## ✨ Features

- **Complete CRUD Operations**: Create, read, update, and delete tutorials
- **Advanced Search & Filtering**: Search by title/description, filter by author, publication status
- **Pagination**: Efficient pagination with customizable page sizes
- **Input Validation**: Comprehensive validation using express-validator
- **Error Handling**: Centralized error handling with detailed error responses
- **Security**: Rate limiting, CORS, Helmet security headers
- **Logging**: Structured logging with Winston
- **Database**: MySQL with Sequelize ORM, connection pooling, soft deletes
- **Code Quality**: ESLint, Prettier, comprehensive test setup
- **Environment Configuration**: Secure environment variable management

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- MySQL >= 5.7
- npm >= 8.0.0

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nodejs-express-sequelize-mysql
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and configuration
   ```

4. **Database Setup**
   ```bash
   # Create your MySQL database
   mysql -u root -p
   CREATE DATABASE testdb;
   ```

5. **Start the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 🛠️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=8080
CORS_ORIGIN=http://localhost:8081

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=testdb
DB_DIALECT=mysql

# Database Pool Configuration
DB_POOL_MAX=5
DB_POOL_MIN=0
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api/tutorials
```

### Endpoints

#### Create Tutorial
```http
POST /api/tutorials
Content-Type: application/json

{
  "title": "Tutorial Title",
  "description": "Tutorial description",
  "published": false,
  "author": "Author Name",
  "tags": ["tag1", "tag2"]
}
```

#### Get All Tutorials
```http
GET /api/tutorials?page=1&limit=10&sort=created_at&order=DESC&title=search&author=author
```

#### Get Published Tutorials
```http
GET /api/tutorials/published?page=1&limit=10
```

#### Search Tutorials
```http
GET /api/tutorials/search?q=search_term&page=1&limit=10
```

#### Get Tutorial by ID
```http
GET /api/tutorials/:id
```

#### Get Tutorial by Slug
```http
GET /api/tutorials/slug/:slug
```

#### Update Tutorial
```http
PUT /api/tutorials/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "published": true
}
```

#### Delete Tutorial
```http
DELETE /api/tutorials/:id
```

#### Delete All Tutorials
```http
DELETE /api/tutorials
```

#### Increment View Count
```http
POST /api/tutorials/:id/view
```

### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort field (`title`, `created_at`, `updated_at`, `view_count`)
- `order`: Sort order (`ASC`, `DESC`)
- `title`: Filter by title (partial match)
- `author`: Filter by author (partial match)
- `q`: Search query (searches title and description)

### Response Format

All endpoints return JSON responses with the following structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "pagination": {
    "totalItems": 100,
    "totalPages": 10,
    "currentPage": 1,
    "itemsPerPage": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2023-12-01T12:00:00.000Z"
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🎯 Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format
```

## 📊 Database Schema

### Tutorial Model

| Field | Type | Constraints |
|-------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT |
| title | VARCHAR(255) | NOT NULL, 3-255 characters |
| description | TEXT | Optional, max 2000 characters |
| published | BOOLEAN | DEFAULT false |
| slug | VARCHAR(300) | UNIQUE, auto-generated |
| author | VARCHAR(100) | Optional, 2-100 characters |
| tags | JSON | Optional, array of strings |
| view_count | INTEGER | DEFAULT 0 |
| created_at | DATETIME | AUTO |
| updated_at | DATETIME | AUTO |
| deleted_at | DATETIME | Soft delete |

### Indexes

- `title` - For search performance
- `published` - For filtering
- `slug` - For slug-based queries
- `author` - For author filtering
- `created_at` - For sorting
- `published, created_at` - Composite index

## 🔒 Security Features

- **Rate Limiting**: IP-based rate limiting
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Comprehensive validation and sanitization
- **SQL Injection Prevention**: Parameterized queries via Sequelize
- **Environment Variables**: Secure configuration management

## 📝 Logging

The application uses Winston for structured logging:

- **Error logs**: `logs/error.log`
- **Combined logs**: `logs/combined.log`
- **Console**: Development mode only

Log levels: error, warn, info, verbose, debug, silly

## 🏗️ Architecture

```
├── app/
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Request handlers and business logic
│   ├── models/          # Database models and associations
│   └── routes/          # API routes and middleware
├── tests/               # Test files and configuration
├── logs/                # Application logs
├── server.js            # Application entry point
└── package.json         # Dependencies and scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, please open an issue in the repository or contact the maintainers.

---

**Happy coding! 🚀**