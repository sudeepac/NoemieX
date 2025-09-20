const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('./src/models/user.model');

async function checkAgencyUsers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/noemiex_dev');
    console.log('Connected to MongoDB');

    // Find all agency users
    const agencyUsers = await User.find({ portalType: 'agency' });
    
    console.log('\n=== AGENCY USERS IN DATABASE ===');
    console.log(`Found ${agencyUsers.length} agency users:`);
    
    agencyUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Portal: ${user.portalType}`);
      console.log(`   Account ID: ${user.accountId}`);
      console.log(`   Agency ID: ${user.agencyId}`);
      console.log(`   Is Active: ${user.isActive}`);
      console.log(`   Password Hash: ${user.password ? 'Present' : 'Missing'}`);
    });

    // Also check if agencies exist
    const Agency = require('./src/models/agency.model');
    const agencies = await Agency.find({});
    
    console.log('\n=== AGENCIES IN DATABASE ===');
    console.log(`Found ${agencies.length} agencies:`);
    
    agencies.forEach((agency, index) => {
      console.log(`\n${index + 1}. ${agency.name}`);
      console.log(`   ID: ${agency._id}`);
      console.log(`   Account ID: ${agency.accountId}`);
      console.log(`   Is Active: ${agency.isActive}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

checkAgencyUsers();