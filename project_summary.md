# Project Summary: Node.js Tutorial REST API

## Overview
This is a **Node.js REST API** project that provides a complete CRUD (Create, Read, Update, Delete) system for managing tutorials. The project is built using modern web technologies and follows a clean, organized architecture pattern.

## Technology Stack
- **Backend Framework**: Express.js (Node.js)
- **Database**: MySQL
- **ORM**: Sequelize (for database interactions)
- **CORS**: Cross-Origin Resource Sharing support
- **Port**: Runs on port 8080 (or environment-specified port)

## Project Architecture

### Directory Structure
```
├── server.js              # Main application entry point
├── package.json           # Dependencies and project configuration
├── app/
│   ├── config/
│   │   └── db.config.js   # Database configuration
│   ├── models/
│   │   ├── index.js       # Database connection and model initialization
│   │   └── tutorial.model.js # Tutorial data model
│   ├── controllers/
│   │   └── tutorial.controller.js # Business logic for tutorial operations
│   └── routes/
│       └── turorial.routes.js # API endpoint definitions
```

## Data Model
The application manages **Tutorial** objects with the following attributes:
- `title` (String) - Required field
- `description` (String) - Optional description
- `published` (Boolean) - Publication status (defaults to false)

## API Endpoints

The API provides the following RESTful endpoints under `/api/tutorials`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tutorials` | Create a new tutorial |
| GET | `/api/tutorials` | Retrieve all tutorials (with optional title search) |
| GET | `/api/tutorials/published` | Retrieve all published tutorials |
| GET | `/api/tutorials/:id` | Retrieve a specific tutorial by ID |
| PUT | `/api/tutorials/:id` | Update a tutorial by ID |
| DELETE | `/api/tutorials/:id` | Delete a tutorial by ID |
| DELETE | `/api/tutorials` | Delete all tutorials |

## Key Features

### 1. **Complete CRUD Operations**
- Create new tutorials with title, description, and publication status
- Read tutorials with search functionality (by title)
- Update existing tutorials
- Delete individual tutorials or all tutorials

### 2. **Search and Filter**
- Search tutorials by title using SQL LIKE queries
- Filter tutorials by publication status

### 3. **Error Handling**
- Comprehensive error handling for all operations
- Proper HTTP status codes (400, 404, 500)
- Informative error messages

### 4. **Database Integration**
- Uses Sequelize ORM for database operations
- Automatic database synchronization
- Connection pooling for performance

### 5. **CORS Support**
- Configured to allow cross-origin requests
- Default origin set to `http://localhost:8081`

## Database Configuration
- **Host**: localhost
- **User**: root
- **Password**: 123456
- **Database**: testdb
- **Connection Pool**: Max 5 connections, 30s acquire timeout

## How to Use

1. **Setup**: Install dependencies and configure MySQL database
2. **Start**: Run the server using `node server.js`
3. **Access**: API available at `http://localhost:8080`
4. **Test**: Use the root endpoint `/` for a welcome message

## Use Cases
This API is perfect for:
- Tutorial management systems
- Educational content platforms
- Blog or article management
- Any application requiring basic content CRUD operations

## Note
There's a minor typo in the routes filename (`turorial.routes.js` should be `tutorial.routes.js`), but the functionality works correctly.