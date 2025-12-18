# Email Send Test Script
# Usage: .\test-email-send.ps1

Write-Host "Testing email sending functionality..." -ForegroundColor Cyan
Write-Host ""

# 1. Check configuration
Write-Host "Step 1: Checking configuration..." -ForegroundColor Yellow
try {
    $config = Invoke-RestMethod -Uri 'http://localhost:3000/api/test/email' -Method GET
    Write-Host "✓ API server connected successfully" -ForegroundColor Green
    Write-Host "  Configuration:" -ForegroundColor Gray
    Write-Host "  - API Key configured: $($config.config.hasApiKey)" -ForegroundColor $(if ($config.config.hasApiKey) { "Green" } else { "Red" })
    Write-Host "  - From email: $($config.config.defaultFrom)" -ForegroundColor Gray
    Write-Host "  - Test email: $($config.testEmail)" -ForegroundColor Gray
    Write-Host ""
    
    if (-not $config.config.hasApiKey) {
        Write-Host "ERROR: RESEND_API_KEY not configured!" -ForegroundColor Red
        Write-Host "  Please configure RESEND_API_KEY in .env.local file" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "ERROR: Cannot connect to API server" -ForegroundColor Red
    Write-Host "  Please ensure 'npm run dev:api' is running" -ForegroundColor Yellow
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Send test email
Write-Host "Step 2: Sending test email..." -ForegroundColor Yellow
$testEmail = $config.testEmail
if (-not $testEmail -or $testEmail -eq "未配置") {
    Write-Host "WARNING: TEST_EMAIL not configured, please specify email address" -ForegroundColor Yellow
    $testEmail = Read-Host "Enter test email address"
}

$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$body = @{
    type = "simple"
    to = $testEmail
    subject = "Email Test - $timestamp"
    html = "<p>This is a test email.</p><p>If you receive this email, the email functionality is working correctly!</p><p>Sent at: $timestamp</p>"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/test/email' -Method POST -ContentType 'application/json' -Body $body
    Write-Host ""
    Write-Host "✓ Request sent" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 10)
    Write-Host ""
    
    if ($response.ok) {
        if ($response.result.ok) {
            Write-Host "SUCCESS: Email sent successfully!" -ForegroundColor Green
            Write-Host "  Email ID: $($response.result.id)" -ForegroundColor Gray
            if ($response.diagnosis) {
                Write-Host ""
                Write-Host "Next steps:" -ForegroundColor Yellow
                foreach ($step in $response.diagnosis.nextSteps) {
                    Write-Host "  $step" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "FAILED: Email sending failed" -ForegroundColor Red
            if ($response.result.reason) {
                Write-Host "  Reason: $($response.result.reason)" -ForegroundColor Red
            }
            if ($response.result.error) {
                Write-Host "  Error: $($response.result.error)" -ForegroundColor Red
            }
            if ($response.diagnosis) {
                Write-Host ""
                Write-Host "Suggestions:" -ForegroundColor Yellow
                foreach ($suggestion in $response.diagnosis.suggestions) {
                    Write-Host "  $suggestion" -ForegroundColor Gray
                }
            }
        }
    } else {
        Write-Host "FAILED: Request failed" -ForegroundColor Red
        if ($response.error) {
            Write-Host "  Error: $($response.error)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "ERROR: Failed to send request" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Cyan






