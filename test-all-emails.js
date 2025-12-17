// Test All Email Types
// Usage: node test-all-emails.js

const http = require('http');

const testEmail = process.argv[2] || '1985406328@qq.com';

console.log('Testing all email types...\n');
console.log(`Test email: ${testEmail}\n`);

const sendEmail = (type, payload) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ type, to: testEmail, ...payload });
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/test/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

const testResults = [];

const runTest = async (name, type, payload) => {
  console.log(`Testing: ${name}...`);
  try {
    const response = await sendEmail(type, payload);
    if (response.ok) {
      // Check result structure - some emails return {user, admin} object
      let success = false;
      let emailId = null;
      let error = null;
      
      if (response.result) {
        if (response.result.ok) {
          // Single result (member-approved, simple)
          success = true;
          emailId = response.result.id;
        } else if (response.result.user || response.result.admin) {
          // Multiple results (member-application, event-registration)
          const userResult = response.result.user;
          const adminResult = response.result.admin;
          
          if (userResult && userResult.ok) {
            success = true;
            emailId = userResult.id || 'user email sent';
            if (adminResult && adminResult.ok) {
              emailId += ` + admin (${adminResult.id || 'admin email sent'})`;
            } else if (adminResult && !adminResult.ok) {
              emailId += ` (admin: ${adminResult.reason || adminResult.error || 'not sent'})`;
            }
          } else if (userResult && !userResult.ok) {
            error = `User email: ${userResult.reason || userResult.error || 'failed'}`;
          } else {
            error = 'No user email result';
          }
        } else {
          error = response.result.error || response.result.reason || 'Unknown error';
        }
      } else {
        error = 'No result in response';
      }
      
      if (success) {
        console.log(`  ✅ SUCCESS - Email ID: ${emailId}`);
        testResults.push({ name, status: 'SUCCESS', id: emailId });
      } else {
        console.log(`  ❌ FAILED - ${error}`);
        testResults.push({ name, status: 'FAILED', error });
      }
    } else {
      console.log(`  ❌ FAILED - ${response.error || 'Request failed'}`);
      testResults.push({ name, status: 'FAILED', error: response.error || 'Request failed' });
    }
  } catch (err) {
    console.log(`  ❌ ERROR - ${err.message}`);
    testResults.push({ name, status: 'ERROR', error: err.message });
  }
  console.log('');
};

(async () => {
  try {
    // Test 1: Simple email
    await runTest('Simple Email', 'simple', {
      subject: '测试 - 简单邮件',
      html: '<p>这是一封简单的测试邮件</p>'
    });

    // Test 2: Member application email
    await runTest('Member Application Email', 'member-application', {
      chineseName: '测试用户',
      englishName: 'Test User',
      phone: '1234567890',
      applyDate: new Date().toISOString()
    });

    // Test 3: Member approved email
    await runTest('Member Approved Email', 'member-approved', {
      chinese_name: '测试用户',
      english_name: 'Test User'
    });

    // Test 4: Event registration email
    await runTest('Event Registration Email', 'event-registration', {
      eventTitleZh: '测试活动',
      eventTitleEn: 'Test Event',
      name: '测试用户',
      tickets: 2,
      paymentMethod: 'card',
      notes: '这是一条测试备注'
    });

    // Summary
    console.log('='.repeat(50));
    console.log('Test Summary:');
    console.log('='.repeat(50));
    testResults.forEach(result => {
      const icon = result.status === 'SUCCESS' ? '✅' : '❌';
      console.log(`${icon} ${result.name}: ${result.status}`);
      if (result.id) {
        console.log(`   Email ID: ${result.id}`);
      }
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    console.log('='.repeat(50));
    
    const successCount = testResults.filter(r => r.status === 'SUCCESS').length;
    const totalCount = testResults.length;
    
    console.log(`\nResults: ${successCount}/${totalCount} tests passed`);
    
    if (successCount === totalCount) {
      console.log('\n🎉 All email types are working correctly!');
      console.log('\nNext steps:');
      console.log('1. Check your inbox for all test emails');
      console.log('2. Verify the email content and formatting');
      console.log('3. Check spam folder if any emails are missing');
    } else {
      console.log('\n⚠️  Some email types failed. Please check the errors above.');
    }
    
  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  }
})();



