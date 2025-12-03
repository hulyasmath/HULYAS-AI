const path = require('path');
const mongoose = require('mongoose');
const { User } = require('@librechat/data-schemas').createModels(mongoose);
require('module-alias')({ base: path.resolve(__dirname, 'api') });
const { registerUser } = require('~/server/services/AuthService');
const connect = require('./config/connect');

(async () => {
  try {
    await connect();
    
    const email = 'info@hulyas.org';
    const password = 'admin123';
    const name = 'Admin User';
    const username = 'admin';
    
    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      console.log('User already exists!');
      process.exit(0);
    }
    
    const user = { 
      email, 
      password, 
      name, 
      username, 
      confirm_password: password 
    };
    
    const result = await registerUser(user, { emailVerified: true });
    
    if (result.status !== 200) {
      console.error('Error: ' + result.message);
      process.exit(1);
    }
    
    const userCreated = await User.findOne({ $or: [{ email }, { username }] });
    if (userCreated) {
      console.log('✅ Admin user created successfully!');
      console.log(`Email: ${email}`);
      console.log(`Username: ${username}`);
      console.log(`Email verified: ${userCreated.emailVerified}`);
      process.exit(0);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

