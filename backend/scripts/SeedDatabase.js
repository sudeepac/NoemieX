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

// Sample data for seeding
const seedData = {
  accounts: [
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

  agencies: [
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
      commissionSplitPercent: 15,
      businessDetails: {
        registrationNumber: 'REG123456',
        taxId: 'TAX789012',
        licenseNumber: 'LIC345678',
        establishedDate: new Date('2020-01-01')
      }
    }
  ],

  users: [
    // Superadmin Portal Users
    {
      email: 'superadmin@noemiex.com',
      password: 'SuperAdmin123!',
      firstName: 'Super',
      lastName: 'Administrator',
      role: 'admin',
      portalType: 'superadmin',
      profile: {
        phone: '+1-555-1001',
        department: 'System Administration',
        jobTitle: 'Super Administrator',
        bio: 'System-wide administrator with full access to all portals and features.'
      },
      emailVerified: true
    },
    {
      email: 'manager.super@noemiex.com',
      password: 'Manager123!',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'manager',
      portalType: 'superadmin',
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
      password: 'User123!',
      firstName: 'Mike',
      lastName: 'Davis',
      role: 'user',
      portalType: 'superadmin',
      profile: {
        phone: '+1-555-1003',
        department: 'Support',
        jobTitle: 'Support Specialist',
        bio: 'Provides technical support and assistance to users across all portals.'
      },
      emailVerified: true
    },

    // Account Portal Users
    {
      email: 'admin@demo.com',
      password: 'Admin123!',
      firstName: 'John',
      lastName: 'Smith',
      role: 'admin',
      portalType: 'account',
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
      password: 'Manager123!',
      firstName: 'Emily',
      lastName: 'Wilson',
      role: 'manager',
      portalType: 'account',
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
      password: 'User123!',
      firstName: 'David',
      lastName: 'Brown',
      role: 'user',
      portalType: 'account',
      profile: {
        phone: '+1-555-2003',
        department: 'Sales',
        jobTitle: 'Sales Representative',
        bio: 'Handles client inquiries and manages sales processes.'
      },
      emailVerified: true
    },

    // Agency Portal Users
    {
      email: 'admin@demoagency.com',
      password: 'Admin123!',
      firstName: 'Lisa',
      lastName: 'Garcia',
      role: 'admin',
      portalType: 'agency',
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
      password: 'Manager123!',
      firstName: 'Robert',
      lastName: 'Martinez',
      role: 'manager',
      portalType: 'agency',
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
      password: 'User123!',
      firstName: 'Jennifer',
      lastName: 'Taylor',
      role: 'user',
      portalType: 'agency',
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

// Clear existing data
const clearDatabase = async () => {
  try {
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Agency.deleteMany({});
    await Account.deleteMany({});
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

// Seed accounts
const seedAccounts = async () => {
  try {
    console.log('🏢 Seeding accounts...');
    const accounts = await Account.insertMany(seedData.accounts);
    console.log(`✅ Created ${accounts.length} accounts`);
    return accounts;
  } catch (error) {
    console.error('❌ Error seeding accounts:', error);
    throw error;
  }
};

// Seed agencies
const seedAgencies = async (accounts) => {
  try {
    console.log('🏪 Seeding agencies...');
    
    // Find the agency account (third account)
    const agencyAccount = accounts[2];
    
    // Add accountId to agency data
    const agencyData = {
      ...seedData.agencies[0],
      accountId: agencyAccount._id
    };
    
    const agencies = await Agency.insertMany([agencyData]);
    console.log(`✅ Created ${agencies.length} agencies`);
    return agencies;
  } catch (error) {
    console.error('❌ Error seeding agencies:', error);
    throw error;
  }
};

// Seed users
const seedUsers = async (accounts, agencies) => {
  try {
    console.log('👥 Seeding users...');
    
    const usersToCreate = [];
    
    for (const userData of seedData.users) {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Determine accountId based on portal type
      let accountId;
      let agencyId = null;
      
      switch (userData.portalType) {
        case 'superadmin':
          accountId = accounts[0]._id; // First account
          break;
        case 'account':
          accountId = accounts[1]._id; // Second account
          break;
        case 'agency':
          accountId = accounts[2]._id; // Third account
          agencyId = agencies[0]._id; // First agency
          break;
        default:
          accountId = accounts[0]._id;
      }
      
      // Create user object
      const user = {
        ...userData,
        hashedPassword,
        accountId,
        agencyId,
        isActive: true,
        lastLogin: new Date()
      };
      
      // Remove the plain password to avoid conflicts
      delete user.password;
      
      usersToCreate.push(user);
    }
    
    const users = await User.insertMany(usersToCreate);
    console.log(`✅ Created ${users.length} users`);
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

// Display seeded data summary
const displaySummary = (accounts, agencies, users) => {
  console.log('\n📊 SEEDING SUMMARY');
  console.log('==================');
  
  console.log('\n🏢 ACCOUNTS:');
  accounts.forEach((account, index) => {
    console.log(`${index + 1}. ${account.name} (${account.contactInfo.email})`);
  });
  
  console.log('\n🏪 AGENCIES:');
  agencies.forEach((agency, index) => {
    console.log(`${index + 1}. ${agency.name} (${agency.contactInfo.email})`);
  });
  
  console.log('\n👥 USERS BY PORTAL:');
  
  const superadminUsers = users.filter(u => u.portalType === 'superadmin');
  console.log('\n🔧 SUPERADMIN PORTAL:');
  superadminUsers.forEach(user => {
    console.log(`  • ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
  });
  
  const accountUsers = users.filter(u => u.portalType === 'account');
  console.log('\n🏢 ACCOUNT PORTAL:');
  accountUsers.forEach(user => {
    console.log(`  • ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
  });
  
  const agencyUsers = users.filter(u => u.portalType === 'agency');
  console.log('\n🏪 AGENCY PORTAL:');
  agencyUsers.forEach(user => {
    console.log(`  • ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
  });
  
  console.log('\n🔑 LOGIN CREDENTIALS:');
  console.log('All users have the following password pattern:');
  console.log('  • Admins: Admin123!');
  console.log('  • Managers: Manager123!');
  console.log('  • Users: User123!');
  console.log('  • Superadmin: SuperAdmin123!');
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await clearDatabase();
    
    // Seed data in order
    const accounts = await seedAccounts();
    const agencies = await seedAgencies(accounts);
    const users = await seedUsers(accounts, agencies);
    
    // Display summary
    displaySummary(accounts, agencies, users);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('🚀 You can now test the application with the seeded users.');
    
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n📦 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, clearDatabase };