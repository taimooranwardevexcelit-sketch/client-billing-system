#!/usr/bin/env node

/**
 * Automated Supabase Setup Script
 * This will create a test user and verify the setup
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Make sure you have:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL');
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Supabase Setup Wizard\n');
console.log('Project:', supabaseUrl);
console.log('─'.repeat(60));

async function checkTables() {
  console.log('\n📋 Step 1: Checking tables...');
  
  const tables = ['users', 'clients', 'projects', 'bills', 'payments'];
  const results = {};
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    results[table] = !error;
    console.log(`  ${!error ? '✅' : '❌'} ${table}`);
  }
  
  return Object.values(results).every(v => v);
}

async function checkFunctions() {
  console.log('\n🔐 Step 2: Checking authentication functions...');
  
  const { error: authError } = await supabase.rpc('authenticate_user', {
    user_email: 'test@test.com',
    user_password: ''
  });
  
  if (authError && authError.code === 'PGRST202') {
    console.log('  ❌ authenticate_user function not found');
    return false;
  }
  
  console.log('  ✅ authenticate_user function exists');
  return true;
}

async function createTestUser() {
  console.log('\n👤 Step 3: Creating test user...');
  
  const email = 'admin@billing.com';
  const password = 'admin123';
  const fullName = 'Admin User';
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Try to insert user
  const { data, error } = await supabase
    .from('users')
    .upsert({
      email: email,
      password_hash: passwordHash,
      full_name: fullName
    }, {
      onConflict: 'email'
    })
    .select();
  
  if (error) {
    console.log('  ❌ Failed to create user:', error.message);
    return false;
  }
  
  console.log('  ✅ Test user created/updated');
  console.log('     Email:', email);
  console.log('     Password:', password);
  return true;
}

async function verifyLogin() {
  console.log('\n🧪 Step 4: Testing authentication...');
  
  const { data, error } = await supabase.rpc('authenticate_user', {
    user_email: 'admin@billing.com',
    user_password: ''
  });
  
  if (error) {
    console.log('  ❌ Authentication test failed:', error.message);
    return false;
  }
  
  if (data && data.length > 0) {
    console.log('  ✅ Authentication working!');
    console.log('     User:', data[0].email);
    return true;
  }
  
  console.log('  ❌ No user found');
  return false;
}

async function main() {
  try {
    const tablesOk = await checkTables();
    const functionsOk = await checkFunctions();
    
    if (!tablesOk || !functionsOk) {
      console.log('\n⚠️  Setup incomplete!\n');
      console.log('📝 You need to run the SQL setup first:');
      console.log('   1. Go to: https://app.supabase.com/project/ktswcmfksterrlvwkhrr/sql/new');
      console.log('   2. Copy all content from: SETUP_SUPABASE.sql');
      console.log('   3. Paste and click "Run"');
      console.log('   4. Then run this script again\n');
      process.exit(1);
    }
    
    await createTestUser();
    await verifyLogin();
    
    console.log('\n' + '═'.repeat(60));
    console.log('✨ Setup Complete!');
    console.log('═'.repeat(60));
    console.log('\n🎉 You can now login with:');
    console.log('   Email: admin@billing.com');
    console.log('   Password: admin123\n');
    console.log('🌐 Start your app:');
    console.log('   npm run dev\n');
    console.log('🔗 Then visit:');
    console.log('   http://localhost:3000/auth/login\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();


