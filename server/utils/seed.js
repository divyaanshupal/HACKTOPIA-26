/**
 * Database Seeder - Creates initial admin user and desk
 * Run this once to set up your first admin account
 * 
 * Usage: node server/utils/seed.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { User, Desk } = require('../models');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@patan.gov.in' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@patan.gov.in');
      process.exit(0);
    }

    // Create initial desk for admin
    const adminDesk = await Desk.create({
      office: 'District Panchayat, Patan',
      branch: 'General',
      designation: 'District Development Officer',
      userAssigned: true
    });
    console.log('Created admin desk:', adminDesk.designation);

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin DDO',
      email: 'admin@patan.gov.in',
      password: 'admin123',  // Change this after first login!
      role: 'Admin',
      currentDesk: adminDesk._id,
      onDesk: true
    });
    console.log('Created admin user:', adminUser.name);

    // Update desk with user reference
    await Desk.findByIdAndUpdate(adminDesk._id, { user: adminUser._id });

    console.log('\n========================================');
    console.log('✅ Database seeded successfully!');
    console.log('========================================');
    console.log('\n📋 Login Credentials:');
    console.log('   Email:    admin@patan.gov.in');
    console.log('   Password: admin123');
    console.log('   Role:     Higher Authority (Admin)');
    console.log('\n⚠️  Please change the password after first login!');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
