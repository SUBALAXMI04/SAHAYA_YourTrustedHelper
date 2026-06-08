# SAHAYA — Your Trusted Helper

Enterprise-grade service marketplace for connecting users with verified professionals through secure booking, payments, reviews, real-time chat, and administration.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Running the Application](#running-the-application)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Developer Reference](#developer-reference)
- [Admin Access](#admin-access)
- [Production Notes](#production-notes)
- [License](#license)

---

## Overview

SAHAYA is a full-stack service marketplace built with Node.js, Express, and SQLite. It supports three user roles — end-users, service providers, and administrators — and includes booking management, checkout flows, reviews, provider earnings, real-time chat, and role-based dashboards.

The application is designed for rapid deployment and local evaluation while maintaining a production-ready architecture.

---

## Features

- Role-based authentication for users, providers, and admins
- Secure JWT authentication and password hashing
- Service discovery and provider profile browsing
- Booking lifecycle with status tracking and cancellation
- Payment processing with online and COD-ready flows
- Ratings and review system for service feedback
- Real-time chat between users and providers
- Saved professionals and favorites management
- Provider earnings dashboard and performance metrics
- Admin user/provider/booking management
- Responsive UI with a modern glassmorphism theme

---

## Architecture

The application follows a modular architecture with clearly separated concerns:

- Presentation layer: static web UI served from `public/`
- API layer: Express routes in `routes/`
- Persistence layer: SQLite database managed by `database.js`
- Authentication layer: JWT and middleware in `middleware/`
- Realtime layer: WebSocket/chat support in `sockets/`

This structure simplifies maintenance, testing, and future extension.

---

## Technology Stack

- Node.js
- Express.js
- SQLite3
- JSON Web Tokens (JWT)
- bcryptjs
- Vanilla HTML, CSS, and JavaScript
- WebSockets for realtime chat

---

## Project Structure

```
SAHAYA_YourTrustedHelper/
├── config/
│   └── db.js
├── models/
├── routes/
├── sockets/
├── public/
│   ├── index.html
│   ├── landing.html
│   ├── user-login.html
│   ├── provider-login.html
│   ├── admin-login.html
│   ├── find-service.html
│   ├── provider-profile.html
│   ├── my-bookings.html
│   ├── payment.html
│   ├── give-review.html
│   ├── chat.html
│   └── style.css
├── database.js
├── server.js
├── package.json
└── README.md
```

- `server.js` — Application entry point and route registration
- `database.js` — Database initialization and schema creation
- `config/db.js` — Database connection settings
- `routes/` — REST API endpoint implementations
- `models/` — Data model interfaces
- `public/` — Front-end pages and static assets
- `sockets/` — Real-time chat implementation

---

## Installation

### Prerequisites

- Node.js v14 or later
- npm

### Setup

```bash
cd c:\Users\DELL\PROJECTS\SAHAYA_YourTrustedHelper
npm install
```

---

## Quick Start

### Start the Server

```bash
cd c:\Users\DELL\PROJECTS\SAHAYA_YourTrustedHelper
npm start
```

Expected output:

- `Database connected`
- `SAHAYA server running on http://localhost:3000`

Open the application in your browser:

```text
http://localhost:3000
```

### Alternate Start

```bash
node server.js
```

---

## Running the Application

Start the development server:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

Alternatively:

```bash
node server.js
```

---

## Configuration

The application uses local configuration by default. For production deployments, configure:

- `PORT`
- database file path in `config/db.js`
- JWT secret and expiration
- admin password replacement

Review `server.js` and `config/db.js` before deploying to a shared or production environment.

---

## API Reference

### Authentication

- `POST /auth/register` — Register a user or provider
- `POST /auth/login` — Authenticate and receive JWT
- `POST /auth/admin-login` — Admin authentication

### Services

- `GET /services/all` — Retrieve all services
- `GET /services/:id` — Retrieve service details

### Bookings

- `POST /bookings/create` — Create a booking
- `GET /bookings/user/:id` — User bookings
- `GET /bookings/provider/:id` — Provider bookings
- `POST /bookings/:id/cancel` — Cancel a booking

### Payments

- `POST /payments/:id/pay` — Process payment
- `GET /payments/:id/status` — Retrieve payment status

### Reviews

- `POST /reviews/create` — Submit a review
- `GET /reviews/provider/:id` — Provider reviews
- `GET /reviews/user/:id` — User reviews

### Chat

- `POST /chat/:id/message` — Send a message
- `GET /chat/:id/messages` — Retrieve chat history

### Admin

- `GET /admin/users` — List users
- `GET /admin/providers` — List providers
- `GET /admin/bookings` — List bookings

> See `routes/` for full implementation details and route behavior.

---

## Database Schema

Key tables include:

- `users`
- `providers`
- `bookings`
- `reviews`
- `chats`
- `messages`
- `notifications`
- `saved_professionals`
- `payments`
- `service_tracking`
- `admin`

The database schema initializes automatically on startup.

---

## Testing

### Role-Based Workflows

- User flow: signup/login → `find-service.html`
- Provider flow: signup/login → `dashboard2.html`
- Admin flow: login → `admin-panel.html`

### Validation Scenarios

#### Positive cases
- Valid signup with all required fields
- Successful login with correct credentials
- Dashboard data loads correctly after authentication
- Logout clears session data and redirects appropriately
- Navigation between pages works for the assigned role

#### Negative cases
- Signup with missing required fields
- Signup with weak or invalid password
- Login with incorrect credentials
- Duplicate registration attempts for the same email
- Unauthorized page access from a different role

### Sample Test Accounts

- **User**
  - Email: `john@example.com`
  - Password: `Test@123`
- **Provider**
  - Email: `john.smith@example.com`
  - Password: `Test@123`

### Test Data Notes

Service and user data are created dynamically during signup. Use browser DevTools to inspect local storage and network activity while testing.

---

## Troubleshooting

### Common Issues

#### Cannot GET /user-signup
- Confirm the correct URL is used:
  - `http://localhost:3000/user-signup.html`
  - `http://localhost:3000/provider-signup.html`

#### Fetch error during signup or login
- Ensure the server is running on port 3000
- Check browser console for API response details
- Confirm backend routes are available in `routes/`

#### Page not updating after signup
- Clear browser cache
- Hard refresh the page
- Inspect `localStorage` for stale authentication data

#### Port 3000 already in use
- Locate the blocking process and stop it

```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
Stop-Process -Id <PID>
```

---

## Developer Reference

### File Locations & Features

#### Frontend
- `index.html` — Home page and role selection
- `user-login.html` — User login
- `provider-login.html` — Provider login
- `user-signup.html` — User registration
- `provider-signup.html` — Provider registration
- `dashboard1.html` — User dashboard
- `dashboard2.html` — Provider dashboard

#### Backend
- `server.js` — Application bootstrap
- `database.js` — SQLite initialization and schema definition
- `routes/auth.js` — Authentication endpoints
- `routes/bookings.js` — Booking endpoints
- `routes/payments.js` — Payment endpoints
- `routes/reviews.js` — Review endpoints
- `routes/chat.js` — Chat endpoints

### Browser DevTools Tips

- Open DevTools with `F12`
- Use the **Application** tab to inspect `localStorage`
- Use the **Network** tab to review API requests and responses
- Use the **Console** tab to capture runtime errors

### Database Location

The SQLite database file is located in the project root as `database.db`.

Inspect data with:

```bash
sqlite3 database.db
.tables
SELECT * FROM users;
SELECT * FROM providers;
```

---

## Admin Access

- Admin login page: `http://localhost:3000/admin-login.html`
- Default admin password: `SAHO9`

> Replace the default password before deploying in a production environment.

---

## Production Notes

- Use environment variables for sensitive values
- Replace the default admin credential
- Configure a persistent SQLite path or migrate to a managed database
- Add a payment gateway for production checkout
- Add email/SMS services for notifications

---

## License

This repository does not include a license file. Add an appropriate license before sharing or publishing.

### Authentication Testing
```javascript
localStorage.getItem('token')
localStorage.getItem('userType')
localStorage.getItem('user')
```
Clear auth data with `localStorage.clear()` and confirm protected routes redirect correctly.

---

## Fixes and Improvements Included

- Fixed login requests to include `role` for user/provider authentication
- Simplified admin login to password-only flow
- Standardized colors across all pages using royal blue and moonlight theme
- Removed promotional/boastful content for a professional tone
- Fixed chat auto-open behavior so chat only starts when a `chat_id` is present
- Prevented payment page from showing amounts without a valid booking
- Added role-based page protection and redirects
- Implemented dark mode support with theme persistence
- Added consistent logo integration across pages

---

## File Structure Snapshot

```
SAHAYA_YourTrustedHelper/
├── server.js
├── database.js
├── package.json
├── config/db.js
├── routes/
├── models/
├── sockets/
├── public/
│   ├── index.html
│   ├── landing.html
│   ├── user-login.html
│   ├── user-signup.html
│   ├── provider-login.html
│   ├── provider-signup.html
│   ├── admin-login.html
│   ├── admin-panel.html
│   ├── find-service.html
│   ├── provider-profile.html
│   ├── my-bookings.html
│   ├── payment.html
│   ├── give-review.html
│   ├── reviews-page.html
│   ├── saved-professionals.html
│   ├── chat.html
│   ├── profile-settings.html
│   └── style.css
```

---

## Production Notes

- Use environment variables for `PORT`, database path, and JWT secrets
- Replace the default admin password before deployment
- Add payment gateway credentials for real-money checkout
- Configure email/SMS services for notifications

---

## Contact

For questions or support, inspect the route files in `routes/`, the DB initialization in `database.js`, and the front-end pages in `public/`.

---

