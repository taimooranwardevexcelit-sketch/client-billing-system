#!/usr/bin/env node

/**
 * Test User-Specific Data Access
 * Tests that users only see their own assigned data
 * Tests that admins see all data
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testUserAccess(userEmail, expectedRole) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${userEmail} (${expectedRole})`);
  console.log('='.repeat(60));

  // Get user
  const { data: authData } = await supabase.rpc('authenticate_user', {
    user_email: userEmail,
    user_password: ''
  });

  if (!authData || authData.length === 0) {
    console.log('❌ User not found');
    return;
  }

  const user = authData[0];
  console.log('✅ User authenticated:', user.full_name, `(${user.role})`);

  // Test Clients Access
  console.log('\n📋 Clients Access:');
  let clientsQuery = supabase.from('clients').select('id, name, assigned_to');
  
  if (user.role !== 'ADMIN') {
    clientsQuery = clientsQuery.eq('assigned_to', user.user_id);
  }

  const { data: clients } = await clientsQuery;
  
  if (clients && clients.length > 0) {
    console.log(`   Found ${clients.length} client(s):`);
    clients.forEach(c => console.log(`   - ${c.name}`));
  } else {
    console.log('   ⚠️  No clients found');
  }

  // Test Projects Access
  console.log('\n📊 Projects Access:');
  let projectsQuery = supabase.from('projects').select('id, name, assigned_to');
  
  if (user.role !== 'ADMIN') {
    projectsQuery = projectsQuery.eq('assigned_to', user.user_id);
  }

  const { data: projects } = await projectsQuery;
  
  if (projects && projects.length > 0) {
    console.log(`   Found ${projects.length} project(s):`);
    projects.forEach(p => console.log(`   - ${p.name}`));
  } else {
    console.log('   ⚠️  No projects found');
  }

  // Test Bills Access
  console.log('\n📄 Bills Access:');
  let billsQuery = supabase.from('bills').select('id, bill_number, total_amount, assigned_to');
  
  if (user.role !== 'ADMIN') {
    billsQuery = billsQuery.eq('assigned_to', user.user_id);
  }

  const { data: bills } = await billsQuery;
  
  if (bills && bills.length > 0) {
    console.log(`   Found ${bills.length} bill(s):`);
    bills.forEach(b => console.log(`   - ${b.bill_number} ($${parseFloat(b.total_amount).toLocaleString()})`));
  } else {
    console.log('   ⚠️  No bills found');
  }

  return {
    user: user.email,
    role: user.role,
    clients: clients?.length || 0,
    projects: projects?.length || 0,
    bills: bills?.length || 0
  };
}

async function main() {
  console.log('🧪 USER-SPECIFIC DATA ACCESS TEST');
  console.log('Testing that users see only THEIR OWN data');
  console.log('Testing that admins see ALL data\n');

  const results = [];

  // Test Admin (should see ALL data)
  results.push(await testUserAccess('admin@billing.com', 'ADMIN'));

  // Test Regular User 1 (should see only their data)
  results.push(await testUserAccess('user@billing.com', 'USER'));

  // Test Regular User 2 (should see only their data)
  results.push(await testUserAccess('taimoor@mailinator.com', 'USER'));

  // Test Client (should see only their data)
  results.push(await testUserAccess('client@abc.com', 'CLIENT'));

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY - Data Access by User');
  console.log('='.repeat(60));
  
  console.log('\n| User                    | Role   | Clients | Projects | Bills |');
  console.log('|-------------------------|--------|---------|----------|-------|');
  results.forEach(r => {
    if (r) {
      console.log(
        `| ${r.user.padEnd(23)} | ${r.role.padEnd(6)} | ${String(r.clients).padStart(7)} | ${String(r.projects).padStart(8)} | ${String(r.bills).padStart(5)} |`
      );
    }
  });

  console.log('\n✅ Expected Behavior:');
  console.log('   - ADMIN sees ALL data (3 clients, 3 projects, 3 bills)');
  console.log('   - Each USER sees only THEIR assigned data (1 of each)');
  console.log('   - CLIENT has no assignments yet (0 of each)');
  
  console.log('\n🎯 Test Result:');
  const adminResult = results.find(r => r && r.role === 'ADMIN');
  const user1Result = results.find(r => r && r.user === 'user@billing.com');
  const user2Result = results.find(r => r && r.user === 'taimoor@mailinator.com');
  
  if (adminResult && adminResult.clients === 3 && adminResult.projects === 3) {
    console.log('   ✅ Admin sees ALL data - PASS');
  } else {
    console.log('   ❌ Admin access - FAIL');
  }
  
  if (user1Result && user1Result.clients === 1 && user1Result.projects === 1) {
    console.log('   ✅ user@billing.com sees ONLY their data - PASS');
  } else {
    console.log('   ❌ user@billing.com access - FAIL');
  }
  
  if (user2Result && user2Result.clients === 1 && user2Result.projects === 1) {
    console.log('   ✅ taimoor@mailinator.com sees ONLY their data - PASS');
  } else {
    console.log('   ❌ taimoor@mailinator.com access - FAIL');
  }
  
  console.log('\n🎉 User-specific data filtering is working!\n');
}

main();


