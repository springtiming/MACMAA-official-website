// Email Send Test Script
// Usage: node test-email-send.js

const http = require('http');

console.log('Testing email sending functionality...\n');

// Step 1: Check configuration
console.log('Step 1: Checking configuration...');
const checkConfig = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/api/test/email', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const config = JSON.parse(data);
          console.log('✓ API server connected successfully');
          console.log('  Configuration:');
          console.log(`  - API Key configured: ${config.config.hasApiKey}`);
          console.log(`  - From email: ${config.config.defaultFrom}`);
          console.log(`  - Test email: ${config.testEmail}`);
          console.log('');
          resolve(config);
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
  });
};

// Step 2: Send test email
const sendTestEmail = (testEmail) => {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString();
    const body = JSON.stringify({
      type: 'simple',
      to: testEmail,
      subject: `Email Test - ${timestamp}`,
      html: `<p>This is a test email.</p><p>If you receive this email, the email functionality is working correctly!</p><p>Sent at: ${timestamp}</p>`
    });

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
          const response = JSON.parse(data);
          resolve(response);
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

// Main execution
(async () => {
  try {
    // Check config
    const config = await checkConfig();
    
    if (!config.config.hasApiKey) {
      console.error('ERROR: RESEND_API_KEY not configured!');
      console.error('  Please configure RESEND_API_KEY in .env.local file');
      process.exit(1);
    }

    // Send test email
    console.log('Step 2: Sending test email...');
    let testEmail = config.testEmail;
    if (!testEmail || testEmail === '未配置') {
      console.log('WARNING: TEST_EMAIL not configured');
      testEmail = process.argv[2] || '1985406328@qq.com';
      console.log(`Using email: ${testEmail}`);
    }

    const response = await sendTestEmail(testEmail);
    
    console.log('');
    console.log('✓ Request sent');
    console.log('');
    console.log('Response:');
    console.log(JSON.stringify(response, null, 2));
    console.log('');

    if (response.ok) {
      if (response.result && response.result.ok) {
        console.log('✅ SUCCESS: Email sent successfully!');
        console.log(`  Email ID: ${response.result.id}`);
        if (response.diagnosis && response.diagnosis.nextSteps) {
          console.log('');
          console.log('Next steps:');
          response.diagnosis.nextSteps.forEach(step => {
            console.log(`  ${step}`);
          });
        }
      } else {
        console.error('❌ FAILED: Email sending failed');
        if (response.result && response.result.reason) {
          console.error(`  Reason: ${response.result.reason}`);
        }
        if (response.result && response.result.error) {
          console.error(`  Error: ${response.result.error}`);
        }
        if (response.diagnosis && response.diagnosis.suggestions) {
          console.log('');
          console.log('Suggestions:');
          response.diagnosis.suggestions.forEach(suggestion => {
            console.log(`  ${suggestion}`);
          });
        }
      }
    } else {
      console.error('❌ FAILED: Request failed');
      if (response.error) {
        console.error(`  Error: ${response.error}`);
      }
    }
  } catch (err) {
    console.error('ERROR:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('  Cannot connect to API server');
      console.error('  Please ensure "npm run dev:api" is running');
    }
    process.exit(1);
  }
  
  console.log('');
  console.log('Test completed!');
})();






