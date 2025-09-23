# Router Structure Documentation

## Overview

This directory contains the application's routing structure, organized following React Router v6 best practices and component-based routing patterns.

## Directory Structure

```
/router
├── index.js                 # Main exports for all routing components
├── AppRoutes.jsx            # Main application router
├── README.md               # This documentation
├── /shared                 # Shared routing components
│   ├── ProtectedRoute.jsx  # Authentication wrapper
│   └── LazyComponents.js   # Centralized lazy imports
├── /public                 # Public routes (no auth required)
│   └── PublicRoutes.jsx    # Landing, login, register routes
├── /portals               # Portal-specific routes
│   ├── SuperadminRoutes.jsx # Superadmin portal routes
│   ├── AccountRoutes.jsx   # Account portal routes
│   └── AgencyRoutes.jsx    # Agency portal routes
└── /models                # Model-based CRUD routes
    ├── UsersRoutes.jsx
    ├── AccountsRoutes.jsx
    ├── AgenciesRoutes.jsx
    ├── OfferLettersRoutes.jsx
    ├── PaymentSchedulesRoutes.jsx
    ├── BillingTransactionsRoutes.jsx
    └── BillingEventHistoriesRoutes.jsx
```

## Key Principles

### 1. Separation of Concerns
- **Public Routes**: Authentication and landing pages
- **Portal Routes**: Portal-specific layouts and navigation
- **Model Routes**: CRUD operations for each data model
- **Shared Components**: Reusable routing utilities

### 2. Portal-Based Access Control
- Each portal has its own route file with appropriate access restrictions
- Model routes are included in portals based on user permissions
- ProtectedRoute component handles authentication and portal access

### 3. Model-Driven Architecture
- One route file per data model (Users, Accounts, Agencies, etc.)
- Consistent RESTful URL patterns for all models
- Aligned with Redux slice structure and API endpoints

### 4. Performance Optimization
- All components are lazy-loaded for optimal bundle splitting
- Centralized lazy imports in LazyComponents.js
- Suspense boundaries for loading states

## Route Patterns

### Model Routes (RESTful)
```
/{model}           -> List view
/{model}/create    -> Create form
/{model}/:id       -> Detail view
/{model}/:id/edit  -> Edit form
```

### Portal Routes
```
/superadmin/*      -> Superadmin portal (full access)
/account/*         -> Account portal (account-scoped)
/agency/*          -> Agency portal (agency-scoped)
```

### Public Routes
```
/                  -> Landing page
/login             -> Login form
/register          -> Registration form
/forgot-password   -> Password reset
```

## Usage Examples

### Importing Routes
```javascript
// Import main router
import { AppRoutes } from '../router';

// Import specific route components
import { UsersRoutes, ProtectedRoute } from '../router';

// Import lazy components
import { UsersList, UserDetail } from '../router';
```

### Adding New Model Routes
1. Create new route file in `/models/` directory
2. Add lazy imports to `LazyComponents.js`
3. Include in appropriate portal routes
4. Export from `index.js`

### Adding New Portal
1. Create new route file in `/portals/` directory
2. Add portal-specific lazy imports
3. Include in `AppRoutes.jsx`
4. Update `ProtectedRoute` for new portal type

## Migration Notes

### From /routes to /router
- Renamed folder to follow React Router v6 community conventions
- Consolidated redundant route files
- Separated concerns by feature/domain
- Improved lazy loading organization

### Key Changes
- `routes/index.js` → `router/index.js` (centralized exports)
- `routes/AppRoutes.jsx` → `router/AppRoutes.jsx` (main router)
- `routes/LazyRoutes.jsx` → `router/shared/LazyComponents.js` (lazy imports)
- `routes/ProtectedRoute.jsx` → `router/shared/ProtectedRoute.jsx` (auth wrapper)
- Portal routes consolidated and organized by access level
- Model routes separated into individual files

## Best Practices

1. **Always use lazy loading** for route components
2. **Follow RESTful patterns** for model routes
3. **Use ProtectedRoute** for authenticated routes
4. **Organize by feature/domain** rather than technical concerns
5. **Keep route files focused** on routing logic only
6. **Document route changes** in this README

## AI-NOTE: Router refactoring completed following React Router v6 best practices.
## Organized by portal access levels and model-driven architecture.
## All components lazy-loaded with proper authentication checks.