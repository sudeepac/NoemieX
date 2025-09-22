/**
 * Database Seeding Script for NoemieX Platform
 * 
 * This script creates initial data for development and testing environments.
 * It implements the multi-tenant architecture with proper role-based access control (RBAC)
 * as defined in business-rules.md and supports the development authentication system
 * described in DEV_AUTH_GUIDE.md.
 * 
 * MULTI-TENANCY ARCHITECTURE:
 * - Superadmin Portal: Platform-wide administration (NoemieX staff)
 * - Account Portal: Client company management (Demo Corp)
 * - Agency Portal: Marketing agency operations (Demo Agency)
 * 
 * SECURITY & RBAC:
 * - All entities are scoped to their respective accounts/agencies
 * - Role hierarchy: admin > manager > user within each portal
 * - Cross-portal access is strictly controlled
 * - Development authentication bypass available (see DEV_AUTH_GUIDE.md)
 * 
 * DEVELOPMENT AUTHENTICATION:
 * - Use DEV_BYPASS_AUTH=true to skip authentication
 * - Generate tokens with scripts/generate-dev-token.js
 * - Set DEV_ACCOUNT_ID and DEV_AGENCY_ID for entity scoping
 * 
 * AI-NOTE: Added comprehensive header comments explaining the multi-tenant architecture,
 * RBAC system, and development authentication integration
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

// Import models
const User = require('../src/models/user.model');
const Account = require('../src/models/account.model');
const Agency = require('../src/models/agency.model');

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/noemiex';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * SEED DATA STRUCTURE
 * 
 * This data represents the three-portal architecture:
 * 1. NoemieX Platform (Superadmin Portal) - Platform administration
 * 2. Demo Corp (Account Portal) - Client company
 * 3. Demo Agency (Agency Portal) - Marketing agency serving Demo Corp
 * 
 * BUSINESS RULES IMPLEMENTATION:
 * - Each account represents a separate tenant with isolated data
 * - Agencies are linked to specific accounts (Demo Agency → Demo Corp)
 * - Users are scoped to their portal type and associated account/agency
 * - Commission splits and business relationships are properly configured
 * 
 * DEVELOPMENT TESTING:
 * - These entities can be used with development authentication tokens
 * - Account IDs and Agency IDs match the development environment setup
 * - All users have predictable passwords for easy testing
 * 
 * AI-NOTE: Added detailed explanation of the seed data structure and its relationship
 * to the multi-tenant architecture and business rules
 */
const seedData = {
  // ACCOUNTS: Represent separate tenant organizations in the multi-tenant system
  accounts: [
    // NoemieX Platform Account (Superadmin Portal)
    // This is the master platform account for NoemieX staff administration
    // Provides platform-wide oversight and system administration capabilities
    {
      name: 'NoemieX Superadmin Account',
      contactInfo: {
        email: 'superadmin@noemiex.com',
        phone: '+1-555-0001',
        address: {
          street: '123 Admin Street',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: '10001'
        }
      },
      subscription: {
        plan: 'enterprise',
        status: 'active'
      },
      settings: {
        timezone: 'America/New_York',
        currency: 'USD'
      }
    },
    // Demo Corp Account (Account Portal)
    // Client company account with isolated data and account-level user management
    // Represents a typical client organization using the platform
    {
      name: 'Demo Account Portal',
      contactInfo: {
        email: 'account@demo.com',
        phone: '+1-555-0002',
        address: {
          street: '456 Business Ave',
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA',
          zipCode: '90001'
        }
      },
      subscription: {
        plan: 'premium',
        status: 'active'
      },
      settings: {
        timezone: 'America/Los_Angeles',
        currency: 'USD'
      }
    },
    // Demo Agency Account (for Agency Portal)
    // Parent account for the marketing agency with agency-specific configurations
    // Enables agency portal access and commission tracking
    {
      name: 'Demo Agency Account',
      contactInfo: {
        email: 'agency@demo.com',
        phone: '+1-555-0003',
        address: {
          street: '789 Agency Blvd',
          city: 'Chicago',
          state: 'IL',
          country: 'USA',
          zipCode: '60601'
        }
      },
      subscription: {
        plan: 'basic',
        status: 'active'
      },
      settings: {
        timezone: 'America/Chicago',
        currency: 'USD'
      }
    }
  ],

  // AGENCIES: Marketing agencies that serve client accounts
  // Agencies are linked to specific accounts and have commission structures
  agencies: [
    // Demo Agency (linked to Demo Agency Corp account)
    // This agency serves Demo Corp and has a 15% commission split
    // Implements the agency-account relationship defined in business rules
    {
      name: 'Demo Marketing Agency',
      type: 'main',
      contactInfo: {
        email: 'contact@demoagency.com',
        phone: '+1-555-0100',
        address: {
          street: '100 Marketing Plaza',
          city: 'Chicago',
          state: 'IL',
          country: 'USA',
          zipCode: '60602'
        },
        website: 'https://demoagency.com'
      },
      commissionSplitPercent: 15, // Commission percentage for agency billing
      businessDetails: {
        registrationNumber: 'REG123456',
        taxId: 'TAX789012',
        licenseNumber: 'LIC345678',
        establishedDate: new Date('2020-01-01')
      }
    }
  ],

  // USERS: Represent different roles across the three portal types
  // Each user is scoped to their portal type and associated account/agency
  // Implements RBAC with role hierarchy: admin > manager > user
  users: [
    // SUPERADMIN PORTAL USERS
    // NoemieX platform staff with cross-tenant visibility and administration rights
    // (superadmin@noemiex.com is created separately in seedSuperadminUser function)
    {
      email: 'manager.super@noemiex.com',
      password: 'Manager123!', // Standard development password pattern
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'manager', // Platform operations manager role
      portalType: 'superadmin', // Access to superadmin portal
      profile: {
        phone: '+1-555-1002',
        department: 'Operations',
        jobTitle: 'Operations Manager',
        bio: 'Manages day-to-day operations across all accounts and agencies.'
      },
      emailVerified: true
    },
    {
      email: 'user.super@noemiex.com',
      password: 'User123!', // Standard development password pattern
      firstName: 'Mike',
      lastName: 'Davis',
      role: 'user', // Platform support user role
      portalType: 'superadmin', // Access to superadmin portal
      profile: {
        phone: '+1-555-1003',
        department: 'Support',
        jobTitle: 'Support Specialist',
        bio: 'Provides technical support and assistance to users across all portals.'
      },
      emailVerified: true
    },

    // ACCOUNT PORTAL USERS
    // Demo Corp employees with account-scoped access and data isolation
    {
      email: 'admin@demo.com',
      password: 'Admin123!', // Standard development password pattern
      firstName: 'John',
      lastName: 'Smith',
      role: 'admin', // Account administrator with full account access
      portalType: 'account', // Access to account portal only
      profile: {
        phone: '+1-555-2001',
        department: 'Administration',
        jobTitle: 'Account Administrator',
        bio: 'Manages account settings, billing, and user permissions.'
      },
      emailVerified: true
    },
    {
      email: 'manager@demo.com',
      password: 'Manager123!', // Standard development password pattern
      firstName: 'Emily',
      lastName: 'Wilson',
      role: 'manager', // Account manager with limited administrative access
      portalType: 'account', // Access to account portal only
      profile: {
        phone: '+1-555-2002',
        department: 'Business Development',
        jobTitle: 'Business Manager',
        bio: 'Oversees business operations and manages client relationships.'
      },
      emailVerified: true
    },
    {
      email: 'user@demo.com',
      password: 'User123!', // Standard development password pattern
      firstName: 'David',
      lastName: 'Brown',
      role: 'user', // Standard account user with basic access
      portalType: 'account', // Access to account portal only
      profile: {
        phone: '+1-555-2003',
        department: 'Sales',
        jobTitle: 'Sales Representative',
        bio: 'Handles client inquiries and manages sales processes.'
      },
      emailVerified: true
    },

    // AGENCY PORTAL USERS
    // Demo Agency employees with agency-scoped access and commission tracking
    {
      email: 'admin@demoagency.com',
      password: 'Admin123!', // Standard development password pattern
      firstName: 'Lisa',
      lastName: 'Garcia',
      role: 'admin', // Agency administrator with full agency access
      portalType: 'agency', // Access to agency portal only
      profile: {
        phone: '+1-555-3001',
        department: 'Agency Management',
        jobTitle: 'Agency Administrator',
        bio: 'Manages agency operations, staff, and client projects.'
      },
      emailVerified: true
    },
    {
      email: 'manager@demoagency.com',
      password: 'Manager123!', // Standard development password pattern
      firstName: 'Robert',
      lastName: 'Martinez',
      role: 'manager', // Agency manager with project oversight access
      portalType: 'agency', // Access to agency portal only
      profile: {
        phone: '+1-555-3002',
        department: 'Project Management',
        jobTitle: 'Project Manager',
        bio: 'Coordinates projects and manages team workflows.'
      },
      emailVerified: true
    },
    {
      email: 'user@demoagency.com',
      password: 'User123!', // Standard development password pattern
      firstName: 'Jennifer',
      lastName: 'Taylor',
      role: 'user', // Standard agency user with basic access
      portalType: 'agency', // Access to agency portal only
      profile: {
        phone: '+1-555-3003',
        department: 'Creative',
        jobTitle: 'Creative Specialist',
        bio: 'Creates marketing materials and manages creative campaigns.'
      },
      emailVerified: true
    }
  ]
};

/**
 * CLEAR DATABASE FUNCTION
 * 
 * Removes all existing data to ensure clean seeding environment.
 * This is essential for development and testing to avoid data conflicts
 * and ensure consistent multi-tenant data structure.
 * 
 * SECURITY NOTE: This function should NEVER be used in production
 * as it will delete all tenant data across all accounts and agencies.
 * 
 * AI-NOTE: Added warning about production usage and explanation of purpose
 */
const clearDatabase = async () => {
  try {
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({}); // Remove all users across all portals
    await Agency.deleteMany({}); // Remove all agencies
    await Account.deleteMany({}); // Remove all accounts (tenant organizations)
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

/**
 * SEED SUPERADMIN USER FUNCTION
 * 
 * Creates the master superadmin user who has platform-wide access.
 * This user is created first because it's required for the 'createdBy' field
 * in other entities, maintaining proper audit trails as defined in business rules.
 * 
 * SUPERADMIN CAPABILITIES:
 * - Cross-tenant visibility and administration
 * - Platform-wide system configuration
 * - User management across all portals
 * - Audit and compliance oversight
 * 
 * DEVELOPMENT AUTHENTICATION:
 * - This user can be used with development tokens
 * - Provides full platform access for testing
 * - Email: superadmin@noemiex.com, Password: SuperAdmin123!
 * 
 * AI-NOTE: Added comprehensive explanation of superadmin role and capabilities
 * in the context of multi-tenant architecture and business rules
 */
const seedSuperadminUser = async () => {
  try {
    console.log('👤 Seeding superadmin user...');
    
    const superadminData = {
      email: 'superadmin@noemiex.com',
      hashedPassword: 'SuperAdmin123!', // Standard development password - will be hashed by model middleware
      firstName: 'Super',
      lastName: 'Administrator',
      role: 'admin', // Highest role level in superadmin portal
      portalType: 'superadmin', // Platform-wide access portal
      profile: {
        phone: '+1-555-1001',
        department: 'System Administration',
        jobTitle: 'Super Administrator',
        bio: 'System-wide administrator with full access to all portals and features.'
      },
      emailVerified: true // Pre-verified for development convenience
    };

    const superadminUser = await User.create(superadminData);
    console.log(`✅ Created superadmin user: ${superadminUser.email}`);
    return superadminUser; // Return for use as createdBy in other entities
  } catch (error) {
    console.error('❌ Error seeding superadmin user:', error);
    throw error;
  }
};

/**
 * SEED ACCOUNTS FUNCTION
 * 
 * Creates the three main tenant accounts that represent the multi-tenant architecture:
 * 1. NoemieX Platform - Superadmin portal for platform administration
 * 2. Demo Corp - Account portal for client company management
 * 3. Demo Agency Corp - Agency portal parent account
 * 
 * MULTI-TENANCY IMPLEMENTATION:
 * - Each account represents a separate tenant with isolated data
 * - Account types determine portal access and capabilities
 * - Proper audit trails maintained with createdBy field
 * 
 * BUSINESS RULES COMPLIANCE:
 * - Accounts are the top-level entities in the tenant hierarchy
 * - All users and data are scoped to their respective accounts
 * - Settings and configurations are account-specific
 * 
 * AI-NOTE: Added detailed explanation of account seeding in context of
 * multi-tenant architecture and business rules implementation
 */
const seedAccounts = async (createdBy) => {
  try {
    console.log('🏢 Seeding accounts...');
    
    // Add createdBy to each account for proper audit trails
    const accountsWithCreatedBy = seedData.accounts.map(account => ({
      ...account,
      createdBy: createdBy // Superadmin user ID for audit compliance
    }));
    
    const accounts = await Account.insertMany(accountsWithCreatedBy);
    console.log(`✅ Created ${accounts.length} accounts`);
    return accounts; // Return for linking to users and agencies
  } catch (error) {
    console.error('❌ Error seeding accounts:', error);
    throw error;
  }
};

/**
 * SEED AGENCIES FUNCTION
 * 
 * Creates marketing agencies that serve client accounts.
 * Agencies are linked to specific accounts and implement the business
 * relationship model defined in business rules.
 * 
 * AGENCY-ACCOUNT RELATIONSHIP:
 * - Demo Agency is linked to Demo Agency Corp account (third account)
 * - Agencies have commission structures for billing calculations
 * - Agency users are scoped to both account and agency for data isolation
 * 
 * BUSINESS RULES IMPLEMENTATION:
 * - Commission splits are configured (15% for Demo Agency)
 * - Business details include registration and tax information
 * - Proper audit trails maintained with createdBy field
 * 
 * DEVELOPMENT TESTING:
 * - Agency ID can be used with DEV_AGENCY_ID environment variable
 * - Enables testing of agency-specific features and data scoping
 * 
 * AI-NOTE: Added comprehensive explanation of agency seeding and its role
 * in the business relationship model and commission structure
 */
const seedAgencies = async (accounts, createdBy) => {
  try {
    console.log('🏪 Seeding agencies...');
    
    // Find the agency account (third account - Demo Agency Corp)
    const agencyAccount = accounts[2];
    
    // Add accountId and createdBy to agency data for proper linking and audit
    const agencyData = {
      ...seedData.agencies[0],
      accountId: agencyAccount._id, // Link agency to its parent account
      createdBy: createdBy // Superadmin user ID for audit compliance
    };
    
    const agencies = await Agency.insertMany([agencyData]);
    console.log(`✅ Created ${agencies.length} agencies`);
    return agencies; // Return for linking to agency users
  } catch (error) {
    console.error('❌ Error seeding agencies:', error);
    throw error;
  }
};

/**
 * SEED USERS FUNCTION
 * 
 * Creates users across all three portal types with proper role-based access control.
 * Users are scoped to their respective accounts and agencies according to business rules.
 * 
 * PORTAL TYPE MAPPING:
 * - superadmin: NoemieX Platform account (platform administration)
 * - account: Demo Corp account (client company users)
 * - agency: Demo Agency Corp account + Demo Agency (agency users)
 * 
 * RBAC IMPLEMENTATION:
 * - Role hierarchy: admin > manager > user within each portal
 * - Users can only access data within their account/agency scope
 * - Cross-portal access is prevented by portalType restrictions
 * 
 * DEVELOPMENT AUTHENTICATION:
 * - All users have predictable passwords for easy testing
 * - Can be used with development tokens and bypass authentication
 * - Account/Agency IDs are properly set for entity scoping
 * 
 * PASSWORD SECURITY:
 * - Passwords are hashed by User model pre-save middleware
 * - Development passwords follow consistent pattern for testing
 * 
 * AI-NOTE: Added comprehensive explanation of user seeding, RBAC implementation,
 * and development authentication integration
 */
const seedUsers = async (accounts, agencies) => {
  try {
    console.log('👥 Seeding users...');
    
    const usersToCreate = [];
    
    for (const userData of seedData.users) {
      // Use plain password - User model middleware will handle hashing
      const hashedPassword = userData.password;
      
      // Determine accountId and agencyId based on portal type for proper data scoping
      let accountId;
      let agencyId = null;
      
      switch (userData.portalType) {
        case 'superadmin':
          accountId = accounts[0]._id; // NoemieX Platform account
          break;
        case 'account':
          accountId = accounts[1]._id; // Demo Corp account
          break;
        case 'agency':
          accountId = accounts[2]._id; // Demo Agency Corp account
          agencyId = agencies[0]._id; // Demo Marketing Agency
          break;
        default:
          accountId = accounts[0]._id; // Default to platform account
      }
      
      // Create user object with proper scoping and metadata
      const user = {
        ...userData,
        hashedPassword, // Will be hashed by model middleware
        accountId, // Account scope for multi-tenancy
        agencyId, // Agency scope (null for non-agency users)
        isActive: true, // Active by default for development
        lastLogin: new Date() // Set initial login date
      };
      
      // Remove the plain password to avoid conflicts with hashedPassword
      delete user.password;
      
      usersToCreate.push(user);
    }
    
    // Use create() to trigger pre-save middleware for password hashing
    const users = await User.create(usersToCreate);
    console.log(`✅ Created ${users.length} users`);
    return users; // Return for summary display
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

/**
 * DISPLAY SUMMARY FUNCTION
 * 
 * Provides a comprehensive overview of the seeded multi-tenant data structure.
 * This summary helps developers understand the created entities and their relationships
 * for development and testing purposes.
 * 
 * SUMMARY INCLUDES:
 * - Account hierarchy and contact information
 * - Agency details and commission structures
 * - User distribution across portal types with role assignments
 * - Development login credentials for easy testing
 * 
 * DEVELOPMENT USAGE:
 * - Use displayed credentials for manual testing
 * - Account/Agency IDs can be used with development tokens
 * - Portal separation is clearly shown for testing different access levels
 * 
 * AI-NOTE: Added explanation of summary function's role in development workflow
 * and its relationship to the multi-tenant architecture
 */
const displaySummary = (accounts, agencies, users) => {
  console.log('\n📊 SEEDING SUMMARY');
  console.log('==================');
  
  console.log('\n🏢 ACCOUNTS (Tenant Organizations):');
  accounts.forEach((account, index) => {
    console.log(`${index + 1}. ${account.name} (${account.contactInfo.email})`);
  });
  
  console.log('\n🏪 AGENCIES (Marketing Partners):');
  agencies.forEach((agency, index) => {
    console.log(`${index + 1}. ${agency.name} (${agency.contactInfo.email}) - Commission: ${agency.commissionSplitPercent}%`);
  });
  
  console.log('\n👥 USERS BY PORTAL TYPE:');
  
  const superadminUsers = users.filter(u => u.portalType === 'superadmin');
  console.log('\n🔧 SUPERADMIN PORTAL (Platform Administration):');
  superadminUsers.forEach(user => {
    console.log(`  • ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
  });
  
  const accountUsers = users.filter(u => u.portalType === 'account');
  console.log('\n🏢 ACCOUNT PORTAL (Client Company):');
  accountUsers.forEach(user => {
    console.log(`  • ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
  });
  
  const agencyUsers = users.filter(u => u.portalType === 'agency');
  console.log('\n🏪 AGENCY PORTAL (Marketing Agency):');
  agencyUsers.forEach(user => {
    console.log(`  • ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
  });
  
  console.log('\n🔑 DEVELOPMENT LOGIN CREDENTIALS:');
  console.log('All users follow consistent password patterns for easy testing:');
  console.log('  • Admins: Admin123!');
  console.log('  • Managers: Manager123!');
  console.log('  • Users: User123!');
  console.log('  • Superadmin: SuperAdmin123!');
  console.log('\n💡 DEVELOPMENT TIPS:');
  console.log('  • Use DEV_BYPASS_AUTH=true to skip authentication');
  console.log('  • Generate tokens with scripts/generate-dev-token.js');
  console.log('  • Set DEV_ACCOUNT_ID and DEV_AGENCY_ID for entity scoping');
};

/**
 * MAIN SEEDING FUNCTION
 * 
 * Orchestrates the complete database seeding process for the NoemieX platform.
 * Creates a fully functional multi-tenant environment with proper data relationships
 * and audit trails as required by business rules.
 * 
 * SEEDING ORDER (Critical for referential integrity):
 * 1. Superadmin user (required for createdBy audit fields)
 * 2. Accounts (tenant organizations)
 * 3. Agencies (linked to accounts)
 * 4. Users (scoped to accounts/agencies)
 * 
 * BUSINESS RULES COMPLIANCE:
 * - Maintains proper audit trails with createdBy fields
 * - Implements multi-tenant data isolation
 * - Establishes role-based access control hierarchy
 * - Creates commission structures for agency billing
 * 
 * DEVELOPMENT ENVIRONMENT:
 * - Provides complete test data for all portal types
 * - Enables development authentication testing
 * - Creates predictable data structure for automated testing
 * 
 * SECURITY CONSIDERATIONS:
 * - Should only be used in development/testing environments
 * - Clears all existing data before seeding
 * - Creates users with development-friendly passwords
 * 
 * AI-NOTE: Added comprehensive explanation of the main seeding function's role
 * in creating a complete multi-tenant development environment
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting NoemieX Platform database seeding...\n');
    console.log('Creating multi-tenant environment with RBAC and business rules compliance\n');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data (DEVELOPMENT ONLY)
    await clearDatabase();
    
    // Seed superadmin user first (required for audit trail createdBy fields)
    const superadminUser = await seedSuperadminUser();
    
    // Seed data in proper order to maintain referential integrity
    const accounts = await seedAccounts(superadminUser._id);
    const agencies = await seedAgencies(accounts, superadminUser._id);
    const users = await seedUsers(accounts, agencies);
    
    // Display comprehensive summary for development reference
    displaySummary(accounts, agencies, users);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('🚀 Multi-tenant environment ready for development and testing.');
    console.log('📖 See DEV_AUTH_GUIDE.md for authentication setup instructions.');
    
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    console.error('Please check your database connection and model schemas.');
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n📦 Database connection closed');
    process.exit(0);
  }
};

/**
 * SCRIPT EXECUTION AND MODULE EXPORTS
 * 
 * This script can be run directly or imported as a module:
 * 
 * DIRECT EXECUTION:
 * - Run: node backend/scripts/SeedDatabase.js
 * - Creates complete multi-tenant development environment
 * - Automatically connects to database and closes connection
 * 
 * MODULE IMPORT:
 * - Import: const { seedDatabase, clearDatabase } = require('./SeedDatabase.js')
 * - Use seedDatabase() for full seeding
 * - Use clearDatabase() for data cleanup
 * 
 * DEVELOPMENT WORKFLOW:
 * 1. Run this script to create initial development data
 * 2. Use generated credentials for manual testing
 * 3. Configure development authentication as per DEV_AUTH_GUIDE.md
 * 4. Test multi-tenant features with different portal types
 * 
 * AI-NOTE: Added comprehensive usage instructions and development workflow guidance
 */

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

// Export functions for use in other scripts or tests
module.exports = { 
  seedDatabase,    // Complete database seeding with multi-tenant structure
  clearDatabase    // Database cleanup (DEVELOPMENT ONLY)
};

// AI-NOTE: Completed comprehensive documentation of SeedDatabase.js incorporating
// knowledge from DEV_AUTH_GUIDE.md and business-rules.md, explaining multi-tenant
// architecture, RBAC implementation, development authentication integration,
// and business rules compliance throughout the seeding process