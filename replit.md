# Membership Platform Backend API

## Overview

This is a Node.js/Express backend API for a membership platform that handles user registration, authentication, payment processing via PayPal, and event management. The system supports a multi-step registration process where users select a membership plan, complete payment through PayPal, and then receive account access. The platform includes role-based access control with member and admin roles, where admins can manage users and events through dedicated administrative endpoints.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Framework and Structure
- **Backend Framework**: Express.js with ES6 modules
- **Database**: MongoDB with Mongoose ODM for schema definition and data modeling
- **Authentication**: JWT-based authentication with separate access and refresh tokens
- **Security**: Helmet for security headers, CORS for cross-origin requests, bcryptjs for password hashing

### Data Models and Relationships
- **User Model**: Core user entity with membership details, contact information, and role-based access
- **PendingRegistration Model**: Temporary storage for incomplete registrations with TTL expiration (48 hours)
- **Payment Model**: Transaction records linking users to completed PayPal payments
- **Event Model**: Admin-managed events with image storage and user tracking

### Authentication and Authorization
- **JWT Strategy**: Access tokens (15min) for API requests, refresh tokens (7d) for token renewal
- **Role-Based Access**: Two-tier system (member/admin) with middleware-enforced permissions
- **Password Security**: Bcrypt hashing with configurable salt rounds (default 12)

### Payment Processing Architecture
- **PayPal Integration**: Server-side order creation and webhook verification for payment completion
- **Two-Phase Registration**: Intent creation (no account) → PayPal payment → Webhook creates account
- **Account Creation Policy**: Only paid users via webhook get accounts - no unpaid registrations become users
- **Email Notifications**: Welcome emails sent exclusively to users with completed payments
- **Pricing Management**: Server-side pricing table prevents client-side manipulation
- **Webhook Security**: PayPal webhook signature verification for payment status updates

### API Design Patterns
- **Modular Routing**: Separated route handlers for auth, payments, admin functions, and user profiles
- **Middleware Pipeline**: Authentication, validation, error handling, and raw body parsing for webhooks
- **Input Validation**: Joi schema validation for all endpoints with detailed error responses
- **Error Handling**: Centralized error middleware with consistent response format

### File Upload and Storage
- **Image Handling**: Multer for memory-based file uploads with size and type restrictions
- **Database Storage**: Binary image data stored directly in MongoDB with metadata
- **Content Delivery**: Direct database serving with proper content-type headers

### Email System
- **Email Service**: Nodemailer with console transport for development (production-ready structure)
- **Automated Notifications**: Welcome emails and password reset functionality
- **Template System**: HTML email templates for user communications

## External Dependencies

### Payment Processing
- **PayPal APIs**: Checkout Server SDK and PayPal Server SDK for order management and webhook handling
- **Webhook Integration**: Real-time payment status updates via PayPal webhook events

### Database and Storage
- **MongoDB**: Primary database for user data, registrations, payments, and events
- **Mongoose**: ODM for schema validation, indexing, and query optimization

### Authentication and Security
- **JSON Web Tokens**: JWT token generation and verification for stateless authentication
- **bcryptjs**: Password hashing and comparison for secure credential storage

### Communication Services
- **Nodemailer**: Email delivery system with SMTP transport capability (currently using console transport)

### Development and Validation
- **Joi**: Schema validation for API request validation and data integrity
- **Multer**: File upload middleware for image handling in events
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers and protection middleware

### Environment Configuration
- **dotenv**: Environment variable management for configuration and secrets
- **Express**: Web framework with built-in middleware support

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register-intent` - Create pending registration with membership plan selection (no account created yet)
- `GET /payment-status/:pendingRegistrationId` - Check payment status and account creation status
- `POST /login` - User authentication with email/password (only for paid users with active accounts)
- `POST /refresh` - Refresh access token using refresh token
- `POST /logout` - User logout (token invalidation)

### PayPal Routes (`/api/paypal`)
- `POST /create-order` - Create PayPal payment order for pending registration
- `POST /webhook` - Handle PayPal webhook events for payment completion

### User Profile Routes (`/api/me`)
- `GET /` - Get current user profile information
- `PUT /` - Update user profile (basic information only)

### Admin User Management (`/api/admin/users`)
- `GET /` - List all users with pagination and filtering
- `GET /:id` - Get specific user details
- `POST /` - Create new user account
- `PATCH /:id` - Update user information including membership status
- `PATCH /:id/password` - Reset user password
- `POST /:id/expire` - Expire user membership
- `DELETE /:id` - Delete user account

### Admin Event Management (`/api/admin/events`)
- `GET /` - List all events with pagination
- `GET /:id` - Get specific event details
- `GET /:id/image` - Retrieve event image (public endpoint)
- `POST /` - Create new event with optional image upload
- `PATCH /:id` - Update event with optional image upload
- `DELETE /:id` - Delete event

## Recent Changes

**August 26, 2025**
- ✓ Complete Node.js backend API implementation with ES modules
- ✓ MongoDB integration with Mongoose ODM and proper indexing
- ✓ PayPal payment processing with webhook handling
- ✓ JWT-based authentication with role-based access control
- ✓ Payment-gated registration system - accounts only created for paid users
- ✓ Payment status tracking endpoint for frontend integration
- ✓ Enhanced welcome emails sent exclusively to paid members
- ✓ Admin panels for user and event management
- ✓ File upload support for event images
- ✓ Input validation with Joi schemas
- ✓ Comprehensive error handling and logging
- ✓ Server running on port 80 with MongoDB on port 27017