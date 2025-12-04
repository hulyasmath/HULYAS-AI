#!/usr/bin/env node
const crypto = require('crypto');
console.log('\n🔐 Generating secrets for Railway deployment...\n');
const jwtSecret = crypto.randomBytes(32).toString('base64');
const jwtRefreshSecret = crypto.randomBytes(32).toString('base64');
const credsKey = crypto.randomBytes(32).toString('hex');
const credsIV = crypto.randomBytes(16).toString('hex');
console.log('Copy these to Railway Variables:\n');
console.log('JWT_SECRET=' + jwtSecret);
console.log('JWT_REFRESH_SECRET=' + jwtRefreshSecret);
console.log('CREDS_KEY=' + credsKey);
console.log('CREDS_IV=' + credsIV);
console.log('\n');
