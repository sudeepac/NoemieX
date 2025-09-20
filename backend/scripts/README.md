# Database Scripts

This folder contains utility scripts for database management.

## SeedDatabase.js

Seeds the MongoDB database with example users for all three portals.

### Usage

```bash
# Run directly with Node.js
node scripts/SeedDatabase.js

# Or use the npm script
npm run seed
```

### What it creates

The script creates:

**3 Accounts:**
- NoemieX Superadmin Account
- Demo Account Portal  
- Demo Agency Account

**1 Agency:**
- Demo Marketing Agency (linked to Demo Agency Account)

**9 Users (3 per portal):**

#### Superadmin Portal Users:
- **Super Administrator** (superadmin@noemiex.com) - Role: admin - Password: SuperAdmin123!
- **Sarah Johnson** (manager.super@noemiex.com) - Role: manager - Password: Manager123!
- **Mike Davis** (user.super@noemiex.com) - Role: user - Password: User123!

#### Account Portal Users:
- **John Smith** (admin@demo.com) - Role: admin - Password: Admin123!
- **Emily Wilson** (manager@demo.com) - Role: manager - Password: Manager123!
- **David Brown** (user@demo.com) - Role: user - Password: User123!

#### Agency Portal Users:
- **Lisa Garcia** (admin@demoagency.com) - Role: admin - Password: Admin123!
- **Robert Martinez** (manager@demoagency.com) - Role: manager - Password: Manager123!
- **Jennifer Taylor** (user@demoagency.com) - Role: user - Password: User123!

### Features

- ✅ Connects to MongoDB and verifies connection
- ✅ Clears existing data before seeding
- ✅ Creates accounts, agencies, and users with proper relationships
- ✅ Hashes passwords securely
- ✅ Sets up proper role-based access control
- ✅ Provides detailed summary of created data
- ✅ Handles errors gracefully

### Testing Login

After running the seed script, you can test the application by:

1. Visit http://localhost:3000
2. Click "Sign In"
3. Use any of the email/password combinations listed above
4. Select the appropriate portal type during login

### Environment Requirements

Make sure your `.env` file has the correct MongoDB connection string:

```
MONGODB_URI=mongodb://localhost:27017/noemiex
```