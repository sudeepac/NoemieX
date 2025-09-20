# Development Authentication Bypass Guide

This guide explains how to use the development authentication bypass system for testing controllers and API endpoints during development.

## 🚀 Quick Start

### 1. Use the Pre-Generated Token

The system comes with a pre-generated development token that you can use immediately:

```bash
# In your API requests, use this header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRldi11c2VyLWlkLTEyMzQ1IiwiZW1haWwiOiJkZXZAdGVzdC5jb20iLCJwb3J0YWxUeXBlIjoic3VwZXJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1ODM2MDc4NSwiZXhwIjoxNzg5ODk2Nzg1fQ.ub44Lv_NrP7oz0uHGyd91gsMeqxBmkBvw-VrNhzzztA
```

### 2. Test the System

```bash
# Run the test script to verify everything works
node scripts/test-dev-auth.js
```

## 🔧 How It Works

### Environment Configuration

The system uses these environment variables in `.env`:

```env
NODE_ENV=development
DEV_STATIC_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DEV_ACCOUNT_ID=your_test_account_id_here  # Optional
DEV_AGENCY_ID=your_test_agency_id_here    # Optional
```

### Authentication Bypass Logic

When `NODE_ENV=development` and the token matches `DEV_STATIC_TOKEN`, the middleware:

1. ✅ Bypasses normal JWT verification
2. 📋 Decodes the token to extract user information
3. 🔨 Creates a mock user object with full permissions
4. ➡️ Continues to the protected route

## 🎭 Testing Different Portal Types

### Method 1: Generate New Tokens (Recommended)

1. **Edit the token generator:**
   ```bash
   # Edit scripts/generate-dev-token.js
   # Change the portalType in the payload:
   const devPayload = {
     id: 'dev-user-id-12345',
     email: 'dev@test.com',
     portalType: 'account', // Change this: 'superadmin', 'account', 'agency'
     role: 'admin',
     // ... rest of payload
   };
   ```

2. **Generate new token:**
   ```bash
   node scripts/generate-dev-token.js
   ```

3. **Update .env file:**
   ```bash
   # Copy the new token to .env
   DEV_STATIC_TOKEN=new_generated_token_here
   ```

4. **Restart the server:**
   ```bash
   # Stop and restart npm start
   ```

### Method 2: Set Account/Agency IDs

For testing account and agency portals, set these in `.env`:

```env
DEV_ACCOUNT_ID=68ce6e28ad24ba1277ff8098
DEV_AGENCY_ID=68ce6e28ad24ba1277ff8099
```

## 📝 Example Usage

### Using curl

```bash
# Test auth endpoint
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     http://localhost:5000/api/auth/me

# Test protected endpoint
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     http://localhost:5000/api/accounts
```

### Using Postman

1. Create a new request
2. Set Authorization type to "Bearer Token"
3. Paste the DEV_STATIC_TOKEN
4. Test any protected endpoint

### Using JavaScript/Axios

```javascript
const axios = require('axios');

const config = {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  }
};

// Test any protected endpoint
const response = await axios.get('http://localhost:5000/api/auth/me', config);
console.log(response.data);
```

## 🔍 Debugging

### Check Server Logs

When using the development token, you'll see these logs:

```
🚨 DEVELOPMENT MODE: Using DEV_STATIC_TOKEN bypass for authentication
📋 Development token payload: {
  id: 'dev-user-id-12345',
  email: 'dev@test.com',
  portalType: 'superadmin',
  role: 'admin',
  iat: 1758360785,
  exp: 1789896785
}
```

### Common Issues

1. **Token not working?**
   - Ensure `NODE_ENV=development` in `.env`
   - Restart the server after changing `.env`
   - Check the token is exactly as generated (no line breaks)

2. **Wrong portal type?**
   - Generate a new token with the correct `portalType`
   - Update `DEV_STATIC_TOKEN` in `.env`
   - Restart the server

3. **Account/Agency access issues?**
   - Set `DEV_ACCOUNT_ID` and `DEV_AGENCY_ID` in `.env`
   - Use actual IDs from your database

## ⚠️ Security Notes

### IMPORTANT: Production Safety

1. **This bypass ONLY works when `NODE_ENV=development`**
2. **The bypass is clearly marked in the code for easy removal**
3. **Always remove this code before production deployment**

### Code Location

The bypass is implemented in:
- `src/middleware/auth.middleware.js` (lines 22-58)

Look for comments:
```javascript
// DEVELOPMENT BYPASS: Check for DEV_STATIC_TOKEN (REMOVE IN PRODUCTION)
// ... bypass code ...
// END DEVELOPMENT BYPASS
```

## 🧪 Testing Scripts

### Available Scripts

1. **`scripts/test-dev-auth.js`** - Test the authentication bypass
2. **`scripts/generate-dev-token.js`** - Generate new development tokens

### Running Tests

```bash
# Test authentication bypass
node scripts/test-dev-auth.js

# Generate new token
node scripts/generate-dev-token.js
```

## 🚀 Benefits

1. **No JWT headaches** - Skip complex token generation during development
2. **Easy role testing** - Quickly switch between portal types
3. **Realistic tokens** - Uses actual JWT format for realistic testing
4. **Safe for production** - Only works in development mode
5. **Easy to remove** - Clearly marked code sections

---

**Happy Testing! 🎉**

Remember to remove the development bypass before going to production!