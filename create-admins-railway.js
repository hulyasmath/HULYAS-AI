const path = require('path');
require('module-alias')({ base: path.resolve(__dirname, 'api') });
const mongoose = require('mongoose');
const { User } = require('@librechat/data-schemas').createModels(mongoose);
const { registerUser } = require('~/server/services/AuthService');
const { SystemRoles } = require('librechat-data-provider');
const { connectDb } = require('~/db/connect');
const { updateUser } = require('~/models');

// Generate a complex password
function generateComplexPassword() {
  const length = 16;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

const accounts = [
  {
    email: 'admin1@hulyas.org',
    username: 'admin1',
    name: 'Admin User 1',
    password: 'SJ&w&CB!%IH447d0', // Pre-generated
  },
  {
    email: 'admin2@hulyas.org',
    username: 'admin2',
    name: 'Admin User 2',
    password: 'l@Ot%NLIz$3MQaYk', // Pre-generated
  },
  {
    email: 'admin3@hulyas.org',
    username: 'admin3',
    name: 'Admin User 3',
    password: '$c6Hw#LXYAu38pz!', // Pre-generated
  },
];

(async () => {
  try {
    await connectDb();
    console.log('✅ Connected to database\n');
    
    const createdAccounts = [];
    
    for (const account of accounts) {
      // Check if user already exists
      const userExists = await User.findOne({ $or: [{ email: account.email }, { username: account.username }] });
      if (userExists) {
        console.log(`⚠️  User ${account.email} already exists, updating to admin...`);
        // Update existing user to admin
        await updateUser(userExists._id, { role: SystemRoles.ADMIN, emailVerified: true });
        createdAccounts.push({
          email: account.email,
          username: account.username,
          password: '*** (user already existed, password unchanged)',
          name: account.name,
        });
        continue;
      }
      
      const user = { 
        email: account.email, 
        password: account.password, 
        name: account.name, 
        username: account.username, 
        confirm_password: account.password 
      };
      
      const result = await registerUser(user, { emailVerified: true });
      
      if (result.status !== 200) {
        console.error(`❌ Error creating ${account.email}: ${result.message}`);
        continue;
      }
      
      // Get the created user and set admin role
      const userCreated = await User.findOne({ $or: [{ email: account.email }, { username: account.username }] });
      if (userCreated) {
        // Set admin role explicitly
        await updateUser(userCreated._id, { role: SystemRoles.ADMIN });
        
        createdAccounts.push({
          email: account.email,
          username: account.username,
          password: account.password,
          name: account.name,
        });
        
        console.log(`✅ Created admin account: ${account.email}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 ADMIN ACCOUNT CREDENTIALS');
    console.log('='.repeat(60) + '\n');
    
    if (createdAccounts.length === 0) {
      console.log('⚠️  No new accounts were created. All accounts may already exist.');
    } else {
      createdAccounts.forEach((acc, index) => {
        console.log(`\nAccount ${index + 1}:`);
        console.log(`  Email:    ${acc.email}`);
        console.log(`  Username: ${acc.username}`);
        console.log(`  Password: ${acc.password}`);
        console.log(`  Name:     ${acc.name}`);
      });
      
      console.log('\n' + '='.repeat(60));
      console.log('🔐 IMPORTANT: Save these credentials securely!');
      console.log('='.repeat(60) + '\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

