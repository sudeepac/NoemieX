# Store Setup Reference - RTK Query Pattern

**📖 AI Coders: Read this first to understand our store architecture**

## Our Store Structure (STRICT - Follow This Pattern)
```
/store
├── apiSlice.js          # Main API slice - base config & auth
├── store.js             # Store setup - imports everything
├── /api                 # Server data endpoints ONLY
│   ├── index.js         # ⚠️ REQUIRED: Centralized exports
│   └── *Api.js          # Domain endpoints (injectEndpoints pattern)
└── /slices              # Client state ONLY (no server data)
    ├── auth.slice.js    # Auth tokens/user data/UI state
    └── *Ui.slice.js     # Component local state (filters/pagination)
```

## Key Rules for AI Coders

### 🔴 NEVER Do This:
- Put server data in `/slices` (use RTK Query instead)
- Create new API slices (extend the main `apiSlice.js`)
- Remove `/api/index.js` (needed for centralized imports)
- Mix server state with client state

### ✅ ALWAYS Do This:
- Server data → RTK Query endpoints in `/api`
- Client state → Slices in `/slices`
- Import APIs via: `import { useGetUsersQuery } from '../store/api'`
- Use `injectEndpoints` pattern for new API endpoints

## File Purposes

### `apiSlice.js` - Main API Configuration
- Base URL, auth headers, token refresh logic
- Single source of truth for all server communication

### `/api/*Api.js` - Domain Endpoints
```javascript
// Pattern: Inject into main slice
export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({ query: () => '/users' })
  })
});
```

### `/slices/auth.slice.js` - Client Auth State
- Tokens, user data, login UI state
- NOT for server calls (use authApi.js)

### `/slices/*Ui.slice.js` - Component Local State
**Use for**: filters, pagination, sorting, selected items, modal states
**Don't use for**: server data, simple useState cases

## Data Flow Pattern
```javascript
// 1. UI slice manages local state
const { filters } = useSelector(selectTableFilters);

// 2. RTK Query fetches based on UI state
const { data } = useGetDataQuery(filters);

// 3. Component renders both
```

## Quick Reference
- **New API endpoint?** → Add to `/api/domainApi.js` using `injectEndpoints`
- **Component state?** → Use `*Ui.slice.js` if it persists across navigation
- **Simple form?** → Use `useState` in component
- **Server data?** → Always use RTK Query, never slices

**🎯 Goal**: Clear separation between server data (RTK Query) and client state (slices)

// AI-NOTE: Concise reference for AI coders - our strict RTK Query setup pattern