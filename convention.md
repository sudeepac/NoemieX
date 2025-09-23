# MERN-Stack Model-Driven Convention v4.0

## Core Philosophy: Model-Driven Development

**Data Flow Traceability**: Every feature follows a predictable path:
```
Database Model → Backend Controller → Backend Route → Frontend API → Frontend Component → UI
```

**Naming Consistency**: All layers use the same base model name with consistent transformations.

**AI-NOTE: Updated to v4.0 with generic patterns for reusability across projects**

## Required Technology Stack

### Core MERN Dependencies
**Use latest stable versions (as of 2024). Recomended only not mandotary. :**
- **Frontend**: React 18+, React Router v6+, Redux Toolkit 2.0+, React Hook Form 7+
- **Backend**: Node.js 18+, Express 4.18+, Mongoose 8+
- **Database**: MongoDB 7+
- **State Management**: Redux Toolkit + RTK Query (server state), React Hook Form (form state)
- **Styling**: CSS Modules (component styles), Global CSS (base styles only)
- **Development**: Vite 5+ (build tool), ESLint 8+, Prettier 3+
- **Testing**: Jest 29+, React Testing Library 14+

### Technology Standards

#### Form Management (MANDATORY)
**React Hook Form ONLY** - No exceptions for form handling
```javascript
// ✅ REQUIRED Pattern
import { useForm } from 'react-hook-form';

const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('fieldName', { required: 'Field is required' })} />
      {errors.fieldName && <span>{errors.fieldName.message}</span>}
    </form>
  );
};
```

#### State Management Rules
- **Server State**: RTK Query ONLY (no axios, fetch, or manual HTTP clients)
- **Client State**: Redux Toolkit slices ONLY (UI state, auth tokens)
- **Form State**: React Hook Form ONLY (no useState for form data)
- **Component Styling**: CSS Modules ONLY (no global CSS for components)

## Global Naming Rules

### Base Model Transformation Matrix
| Layer | Pattern | Example (model: `{model}`) |
|-------|---------|----------------------------|
| **Database Model** | PascalCase | `{Model}` |
| **File Names** | kebab-case | `{model}.model.js` |
| **API Endpoints** | kebab-case plural | `/api/{models}` |
| **Code Variables** | camelCase | `{model}`, `{models}` |
| **Route Parameters** | camelCase + Id | `{model}Id` |
| **Frontend Folders** | kebab-case plural | `/{models}/` |
| **React Components** | PascalCase | `{Model}List.jsx` |

### File Extension Standards
- **Backend**: `.js` for all files
- **Frontend Components**: `.jsx` for React components
- **Frontend Utilities**: `.js` for pure functions
- **Styles**: `.css` or `.module.css`

## Backend Structure (Express + Mongoose)

```
backend/
├── controllers/
│   ├── index.js                    # Export all controllers
│   ├── auth.controller.js          # Authentication logic
│   ├── {models}.controller.js      # Model CRUD operations
│   └── ...
├── middleware/
│   ├── index.js                    # Export all middleware
│   ├── auth.middleware.js          # JWT verification
│   ├── validation.middleware.js    # Request validation
│   └── error.middleware.js         # Error handling
├── models/
│   ├── index.js                    # Export all models
│   ├── {Model}.model.js            # Model schema definitions
│   └── ...
├── routes/
│   ├── index.js                    # Export all routes
│   ├── auth.routes.js              # Authentication routes
│   ├── {models}.routes.js          # Model-specific routes
│   └── ...
├── utils/
│   ├── index.js                    # Export all utilities
│   ├── database.js                 # Database connection
│   ├── jwt.js                      # JWT utilities
│   └── validation.js               # Validation schemas
└── server.js                          # Express app configuration
```

### Backend Naming Matrix
| Artifact | File Pattern | Export Pattern | Route Pattern | Parameter |
|----------|--------------|----------------|---------------|----------|
| **Model** | `{model}.model.js` | `PascalCase` | — | — |
| **Controller** | `{models}.controller.js` | `camelCase functions` | — | `{model}Id` |
| **Route** | `{models}.routes.js` | `router` | `/api/{models}` | `{model}Id` |
| **Middleware** | `{purpose}.middleware.js` | `camelCase functions` | — | — |
| **Utility** | `{purpose}.util.js` | `camelCase functions` | — | — |

### Backend Implementation Rules

1. **Model Files**: Export single PascalCase model
   ```javascript
   // {model}.model.js
   const {Model} = mongoose.model('{Model}', {model}Schema);
   module.exports = {Model};
   ```

2. **Controller Files**: Export object with CRUD functions
   ```javascript
   // {models}.controller.js
   const get{Models} = async (req, res) => { /* ... */ };
   const create{Model} = async (req, res) => { /* ... */ };
   module.exports = { get{Models}, create{Model}, /* ... */ };
   ```

3. **Route Files**: Use controller functions with RESTful patterns
   ```javascript
   // {models}.routes.js
   router.get('/{models}', get{Models});
   router.post('/{models}', create{Model});
   router.get('/{models}/:{model}Id', get{Model});
   ```

## Frontend Structure (React + Redux Toolkit)

```
frontend/src/
├── store/                          # State management
│   ├── store.js                    # Store configuration
│   ├── apiSlice.js                 # Base RTK Query API slice
│   ├── api/                        # Server data endpoints ONLY
│   │   ├── index.js                # ⚠️ REQUIRED: Centralized exports
│   │   ├── {models}Api.js          # RTK Query endpoints per model
│   │   └── authApi.js              # Authentication endpoints
│   └── slices/                     # Client state ONLY (no server data)
│       ├── authSlice.js            # Auth tokens/user data/UI state
│       └── {models}UiSlice.js      # Component local state (filters/pagination)
├── components/                     # Domain-organized reusable components
│   ├── common/                     # Shared components
│   │   ├── LoadingSpinner.jsx
│   │   ├── LoadingSpinner.module.css
│   │   └── ProtectedRoute.jsx
│   └── {models}/                   # Model-specific components
│       ├── {Model}List.jsx
│       ├── {Model}List.module.css
│       ├── {Model}Form.jsx
│       ├── {Model}Form.module.css
│       ├── {Model}Detail.jsx
│       └── {Model}Card.jsx
├── pages/                          # Route-level components by domain
│   ├── auth/                       # Authentication pages
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Auth.module.css
│   ├── common/                     # Shared dashboard pages
│   │   ├── Dashboard.jsx
│   │   └── Settings.jsx
│   └── {models}/                   # Model-specific pages
│       ├── {Models}Management.jsx
│       └── {Models}Analytics.jsx
├── router/                         # React Router v6 structure
│   ├── index.js                    # Centralized exports
│   ├── AppRoutes.jsx               # Main application router
│   ├── shared/                     # Shared routing components
│   │   ├── ProtectedRoute.jsx      # Authentication wrapper
│   │   └── LazyComponents.js       # Centralized lazy imports
│   ├── public/                     # Public routes (no auth)
│   │   └── PublicRoutes.jsx        # Landing, login, register
│   └── models/                     # Model-based CRUD routes
│       └── {Models}Routes.jsx      # One route file per model
├── shared/                         # Reusable hooks and utilities
│   ├── index.js                    # Centralized exports
│   └── hooks/                      # Custom hooks only
│       ├── index.js
│       ├── usePermissions.js
│       ├── useDebounce.js
 │       └─ useLocalStorage.js
 ├─ /types                        # Type definitions and constants
 │   ├─ {model}.types.js          # Model-related constants and helpers
 │   └─ common.types.js           # Shared type definitions
 ├─ /utils                        # Pure utility functions
 │   ├─ formatters.js             # Date, currency, text formatters
 │   ├─ validators.js             # Client-side validation
 │   └─ api.js                    # API utility functions
 ├─ /styles                       # Global styles
 │   └─ index.css
 ├─ App.js                        # Main app component
 └─ index.js                      # React app entry point
```

### Frontend Naming Matrix
| Artifact | File Pattern | Component Name | Import Pattern |
|----------|--------------|----------------|----------------|
| **API Slice** | `{models}Api.js` | `use{Action}{Models}Query` | `from '../store/api'` |
| **UI Slice** | `{models}Ui.slice.js` | `{models}Ui` | `from '../store/slices/{models}Ui.slice'` |
| **Component** | `{ModelName}{Type}.jsx` | `{ModelName}{Type}` | `from './{ModelName}{Type}'` |
| **Page** | `{ModelName}Management.jsx` | `{ModelName}Management` | `from './{ModelName}Management'` |
| **Route** | `{ModelNames}Routes.jsx` | `{ModelNames}Routes` | `from './{ModelNames}Routes'` |
| **Hook** | `use{Purpose}.js` | `use{Purpose}` | `from '../../shared'` |
| **Type** | `{model}.types.js` | `{MODEL}_CONSTANTS` | `from '../types/{model}.types'` |

## Frontend Styling Standards

### CSS Modules Approach (REQUIRED)

**All component styling must use CSS Modules** for scoped, maintainable styles.

#### File Naming Convention
```
{ComponentName}.jsx     # React component
{ComponentName}.module.css  # CSS Modules stylesheet
```

#### CSS Modules Implementation
```javascript
// ✅ CORRECT - Import CSS Modules
import styles from './UserProfileCard.module.css';

const UserProfileCard = () => {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>User Profile</h3>
      <div className={`${styles.content} ${styles.highlighted}`}>
        Content here
      </div>
    </div>
  );
};
```

#### CSS Class Naming in Modules
- **Use camelCase** for class names in CSS Modules
- **Be descriptive** and component-specific
- **Avoid generic names** like `.container`, `.wrapper`

```css
/* UserProfileCard.module.css */
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
}

.title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.content {
  color: #666;
  line-height: 1.5;
}

.highlighted {
  background-color: #f8f9fa;
  border-left: 3px solid #007bff;
  padding-left: 12px;
}
```

#### Global vs Module Styles

**Global Styles** (`/styles/index.css`):
- CSS reset/normalize
- Typography base styles
- Color variables
- Utility classes (if absolutely necessary)

**CSS Modules** (component-specific):
- All component styling
- Layout and positioning
- Component states and variants
- Responsive design


#### Styling Standards

- **No inline styles** except for dynamic values
- **Use CSS custom properties** for theming
- **Mobile-first responsive design**
- **Consistent spacing scale** (4px, 8px, 12px, 16px, 24px, 32px)
- **Semantic color naming** in CSS variables

```css
/* Global variables in /styles/index.css */
:root {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-xxl: 32px;
  
  --border-radius: 4px;
  --border-radius-lg: 8px;
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

#### Component Styling Checklist

- ✅ Uses CSS Modules (`.module.css` extension)
- ✅ CamelCase class names in modules
- ✅ Component-specific, descriptive class names
- ✅ No global class dependencies
- ✅ Responsive design implemented
- ✅ Uses CSS custom properties for consistent values
- ✅ No inline styles (except dynamic values)
- ✅ Follows spacing and color standards

**AI-NOTE: CSS Modules migration pattern proven successful - converts kebab-case global classes to camelCase modules, eliminates style conflicts, improves maintainability**



## Implementation Patterns

### 1. Store API Centralization (REQUIRED)
```javascript
// /store/api/index.js - REQUIRED for centralized imports
export * from './{models}Api';
export * from './authApi';
// ... all API exports
```

### 2. Model-Driven API Implementation
```javascript
// {models}Api.js - Follow RTK Query patterns
import { apiSlice } from '../apiSlice';

export const {models}Api = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    get{Models}: builder.query({
      query: (params) => ({
        url: '/{models}',
        params,
      }),
      providesTags: ['{Models}'],
    }),
    create{Model}: builder.mutation({
      query: (data) => ({
        url: '/{models}',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['{Models}'],
    }),
    // ... other CRUD operations
  }),
});

export const {
  useGet{Models}Query,
  useCreate{Model}Mutation,
  // ... other hooks
} = {models}Api;
```

### 3. Component Import Patterns
```javascript
// ✅ CORRECT - Use centralized API imports
import { useGet{Models}Query } from '../../store/api';

// ✅ CORRECT - Use main utils for formatters
import { formatDate, formatCurrency } from '../../utils/formatters';

// ✅ CORRECT - Use shared hooks
import { usePermissions } from '../../shared';
```

## Development Standards & Best Practices

### Core Development Guidelines

1. **Follow Official Documentation**: Only use patterns from official package documentation
2. **Model-First Approach**: Always start with data model, then build layers outward
3. **Consistent Naming**: Use transformation matrix for all naming decisions
4. **Centralized Exports**: Always use index.js files for clean imports
5. **Context Comments**: Add `// AI-NOTE: what & why` for future reference

### File Organization Rules

1. **Domain Grouping**: Organize by data model, not by file type
2. **Co-location**: Keep related files (component + styles + tests) together
3. **Consistent Extensions**: Follow extension standards strictly
4. **No Duplication**: Centralize utilities, avoid duplicate functions
5. **Clear Separation**: Server data (RTK Query) vs Client state (Redux slices)

### Anti-Patterns & Best Practices

#### ❌ NEVER Do This
- Duplicate utility functions across folders
- Global CSS for component styling (use CSS Modules)
- Manual form state with useState (use React Hook Form)
- Direct API calls outside RTK Query
- Multiple HTTP clients (RTK Query handles all server communication)
- Custom form validation (use React Hook Form validation)
- Inline styles for static styling (use CSS Modules)

#### ✅ ALWAYS Do This
- Use CSS Modules for all component styling
- Use React Hook Form for all form management
- Use RTK Query for all server state
- Use Redux Toolkit slices for client state only
- Centralize utilities in /utils (pure functions)
- Group code by data model, not file type
- Add AI-NOTE comments for complex implementations

## Project Setup Guide

### Backend Setup Checklist
1. Create data models in `/models/{Model}.model.js`
2. Create controllers in `/controllers/{models}.controller.js`
3. Create routes in `/routes/{models}.routes.js`
4. Add centralized exports in each index.js
5. Configure middleware and utilities

### Frontend Setup Checklist
1. Create RTK Query API in `/store/api/{models}Api.js`
2. Add API exports to `/store/api/index.js`
3. Create components in `/components/{models}/`
4. Create pages in `/pages/{models}/`
5. Add routes in `/router/models/{Models}Routes.jsx`
6. Create type definitions in `/types/{model}.types.js`

### Quality Validation Checklist
- ✅ Can trace data flow from URL to database and back
- ✅ All naming follows transformation matrix
- ✅ All imports use centralized exports
- ✅ No duplicate code across domains
- ✅ All server data uses RTK Query
- ✅ All forms use React Hook Form
- ✅ All components use CSS Modules

## Migration & Success Patterns

### Proven Migration Strategies
1. **Forms**: useState → React Hook Form (improves validation, reduces boilerplate)
2. **Styling**: Global CSS → CSS Modules (eliminates conflicts, improves maintainability)
3. **State**: Manual API calls → RTK Query (automatic caching, loading states)

### Benefits of This Convention
- **Predictable Structure**: Every file location follows the same patterns
- **Reduced Cognitive Load**: Developers know exactly where to find/place code
- **AI-Friendly**: Clear patterns enable reliable AI assistance and code generation
- **Maintainable**: Centralized exports and consistent naming prevent technical debt
- **Scalable**: Model-driven approach grows naturally with application complexity

---

**AI-NOTE: This convention ensures consistent, traceable, and maintainable MERN stack applications that can be understood and extended reliably by any developer or AI system. Updated to v4.0 for maximum reusability across projects.**
