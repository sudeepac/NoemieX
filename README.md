# NoemieX - Multi-Tenant Billing System for Study Abroad Agencies

## Overview
NoemieX is a comprehensive MERN stack billing system designed specifically for study abroad agencies. It features a multi-tenant architecture with three distinct portals: Superadmin, Account (Tenant) Admin, and Agency portals.

## Architecture
- **Multi-tenant**: Each Account is a separate organization with complete data isolation
- **Three Portals**: Superadmin, Account Admin, and Agency portals with role-based access
- **RBAC**: Hierarchical role system (Admin > Manager > User) within each portal
- **Data Isolation**: Complete separation between tenants and agencies

## Key Features
- Commission tracking and management
- Invoice generation and payment scheduling
- Multi-currency support
- Document management for offer letters and billing
- Real-time payment tracking
- Automated billing workflows
- Mobile-responsive design

## Tech Stack
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React.js, Redux Toolkit, RTK Query
- **Authentication**: JWT with role-based access control
- **Styling**: CSS Modules with mobile-first responsive design

## Project Structure
```
noemiex/
├── backend/                 # Express.js API server
├── frontend/               # React.js client application
├── shared/                 # Shared utilities and types
└── docs/                   # Documentation
```

## Quick Start
1. Install dependencies: `npm run install-deps`
2. Start development servers: `npm run dev`
3. Access portals:
   - Superadmin: http://localhost:3000/superadmin
   - Account: http://localhost:3000/account
   - Agency: http://localhost:3000/agency

## Development Guidelines
- Follow the conventions defined in `convention.md`
- Use kebab-case for files, PascalCase for React components
- Implement proper error handling and validation
- Maintain data isolation between tenants
- Follow mobile-first responsive design principles

## License
MIT License