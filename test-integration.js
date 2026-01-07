#!/usr/bin/env node

/**
 * Complete Integration Test Suite
 * Tests all functionality of the billing system
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAuthentication() {
  console.log('\n📝 TEST 1: Authentication Flow');
  console.log('-'.repeat(60));
  
  try {
    // Test authenticate_user function
    const { data: authData, error: authError } = await supabase.rpc('authenticate_user', {
      user_email: 'admin@billing.com',
      user_password: ''
    });
    
    if (authError) throw authError;
    console.log('✅ User lookup successful');
    
    // Test get_user_password function
    const { data: pwData, error: pwError } = await supabase.rpc('get_user_password', {
      user_id: authData[0].user_id
    });
    
    if (pwError) throw pwError;
    
    // Verify password
    const isValid = await bcrypt.compare('admin123', pwData[0].password_hash);
    if (!isValid) throw new Error('Password verification failed');
    
    console.log('✅ Password verification successful');
    console.log('✅ Authentication: PASS');
    return true;
  } catch (error) {
    console.log('❌ Authentication: FAIL -', error.message);
    return false;
  }
}

async function testClients() {
  console.log('\n📝 TEST 2: Clients Operations');
  console.log('-'.repeat(60));
  
  try {
    // Read
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (error) throw error;
    console.log('✅ Fetched', clients.length, 'clients');
    clients.forEach(c => console.log('   -', c.name));
    
    console.log('✅ Clients: PASS');
    return true;
  } catch (error) {
    console.log('❌ Clients: FAIL -', error.message);
    return false;
  }
}

async function testProjects() {
  console.log('\n📝 TEST 3: Projects with Relations');
  console.log('-'.repeat(60));
  
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(name, phone)
      `);
    
    if (error) throw error;
    console.log('✅ Fetched', projects.length, 'projects with client relations');
    projects.forEach(p => {
      console.log('   -', p.name);
      console.log('     Client:', p.client.name);
      console.log('     Area:', p.area, 'sq ft');
      console.log('     Total:', '$' + parseFloat(p.total_amount).toLocaleString());
    });
    
    console.log('✅ Projects: PASS');
    return true;
  } catch (error) {
    console.log('❌ Projects: FAIL -', error.message);
    return false;
  }
}

async function testBills() {
  console.log('\n📝 TEST 4: Bills with Full Relations');
  console.log('-'.repeat(60));
  
  try {
    const { data: bills, error } = await supabase
      .from('bills')
      .select(`
        *,
        client:clients(name),
        project:projects(name),
        payments(*)
      `)
      .order('bill_number');
    
    if (error) throw error;
    console.log('✅ Fetched', bills.length, 'bills with all relations');
    
    bills.forEach(b => {
      console.log('   -', b.bill_number, '-', b.status);
      console.log('     Client:', b.client.name);
      console.log('     Project:', b.project ? b.project.name : 'N/A');
      console.log('     Total: $' + parseFloat(b.total_amount).toLocaleString());
      console.log('     Paid: $' + parseFloat(b.paid_amount).toLocaleString());
      console.log('     Outstanding: $' + parseFloat(b.outstanding_amount).toLocaleString());
      console.log('     Payments:', b.payments.length);
    });
    
    console.log('✅ Bills: PASS');
    return true;
  } catch (error) {
    console.log('❌ Bills: FAIL -', error.message);
    return false;
  }
}

async function testPayments() {
  console.log('\n📝 TEST 5: Payments');
  console.log('-'.repeat(60));
  
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        bill:bills(bill_number)
      `)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    console.log('✅ Fetched', payments.length, 'payments');
    
    payments.forEach(p => {
      console.log('   - $' + parseFloat(p.amount).toLocaleString(), '-', p.method);
      console.log('     Bill:', p.bill.bill_number);
      console.log('     Date:', new Date(p.payment_date).toLocaleDateString());
    });
    
    console.log('✅ Payments: PASS');
    return true;
  } catch (error) {
    console.log('❌ Payments: FAIL -', error.message);
    return false;
  }
}

async function generateStatistics() {
  console.log('\n📝 TEST 6: Business Statistics');
  console.log('-'.repeat(60));
  
  try {
    const { data: bills } = await supabase
      .from('bills')
      .select('total_amount, paid_amount, outstanding_amount, status');
    
    const { data: clients } = await supabase
      .from('clients')
      .select('id');
    
    const { data: projects } = await supabase
      .from('projects')
      .select('id');
    
    const totalRevenue = bills.reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
    const totalPaid = bills.reduce((sum, b) => sum + parseFloat(b.paid_amount), 0);
    const totalOutstanding = bills.reduce((sum, b) => sum + parseFloat(b.outstanding_amount), 0);
    
    const statusCounts = bills.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('✅ Statistics Generated:');
    console.log('   Clients:', clients.length);
    console.log('   Projects:', projects.length);
    console.log('   Bills:', bills.length);
    console.log('   Total Revenue: $' + totalRevenue.toLocaleString());
    console.log('   Total Paid: $' + totalPaid.toLocaleString());
    console.log('   Total Outstanding: $' + totalOutstanding.toLocaleString());
    console.log('   Payment Rate:', ((totalPaid / totalRevenue) * 100).toFixed(1) + '%');
    console.log('   Bill Status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log('     -', status + ':', count);
    });
    
    console.log('✅ Statistics: PASS');
    return true;
  } catch (error) {
    console.log('❌ Statistics: FAIL -', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 COMPLETE INTEGRATION TEST SUITE');
  console.log('='.repeat(60));
  console.log('Testing Supabase integration...\n');
  
  const results = {
    authentication: await testAuthentication(),
    clients: await testClients(),
    projects: await testProjects(),
    bills: await testBills(),
    payments: await testPayments(),
    statistics: await generateStatistics()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = Object.values(results).filter(v => v).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    console.log((result ? '✅' : '❌'), test.toUpperCase());
  });
  
  console.log('\n' + '='.repeat(60));
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED (' + passed + '/' + total + ')');
    console.log('✨ Your billing system is fully integrated!');
  } else {
    console.log('⚠️  SOME TESTS FAILED (' + passed + '/' + total + ' passed)');
  }
  console.log('='.repeat(60));
  
  console.log('\n📝 Quick Start:');
  console.log('   1. Start dev server: npm run dev');
  console.log('   2. Visit: http://localhost:3000/auth/login');
  console.log('   3. Login: admin@billing.com / admin123');
  console.log('');
}

runAllTests();


