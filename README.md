# FreshCart E-commerce API

A RESTful API for managing an online store's products, categories, subcategories, brands, and product reviews, with secure authentication and admin dashboard functionality.

🔗 **[Documentation]()**

## Features

- Complete CRUD operations for products, categories, subcategories, brands, and product reviews.
- Admin dashboard endpoints for store management.
- Public endpoints for displaying products on storefront.
- JWT authentication with access and refresh tokens.
- Secure API with token rotation.
- Extended sucerity mechanism per user accounts (2FA, verified accounts).

## Tech Stack

- Node.js
- NestJS
- MongoDB
- Helmet
- Bcrypt
- Class-Validator/Class-Transformer
- JWT (authentication)

## API Endpoints

### Authentication

- User registration and login
- Token refresh mechanism
- Secure session management

### Products

- Create, read, update, delete products
- Filter and search products
- Category-based & Subcategory-based product listing

### Categories

- Manage product categories
- Hierarchical category structure

### Sub-Categories

- Manage which subcategory a product belongs to.
- each category is divided into 1+ subcategories.

### Brands

- List of merchants and their brands.

## Documentation

All endpoints are documented with request/response examples. See the `/docs` endpoint for detailed API documentation.
Note: json-based documentation is available via `/docs-json` endpoint.

## Security

- JWT access tokens with short expiration
- Refresh token rotation for extended sessions
- Protected admin routes
- Input validation and sanitization
