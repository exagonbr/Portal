import nodemailer from 'nodemailer';
import db from '../src/config/database';

async function getEmailSettings() {
  try {
    const settings = await db('system_settings')
      .select('key', 'value')
      .where('category', 'email');
    
    // Convert array of settings to object
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  } catch (error) {
    console.log('Error fetching email settings:', error);
    throw error;
  }
}

async function testEmailConfiguration() {
  try {
    console.log('🔍 Fetching email settings...');
    const settings = await getEmailSettings();
    
    console.log('📧 Creating transporter with settings...');
    console.log('Current settings:', {
      host: settings.email_smtp_host,
      port: settings.email_smtp_port,
      secure: settings.email_smtp_secure,
      user: settings.email_smtp_user,
      pass: settings.email_smtp_password ? '********' : 'NOT SET'
    });
    
    // Fix Gmail SMTP configuration for port 587
    const smtpConfig = {
      host: settings.email_smtp_host,
      port: parseInt(settings.email_smtp_port),
      secure: false, // Use STARTTLS instead of SSL for port 587
      requireTLS: true, // Force STARTTLS
      auth: {
        user: settings.email_smtp_user,
        pass: settings.email_smtp_password
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    };
    
    console.log('Using corrected SMTP config for Gmail...');
    const transporter = nodemailer.createTransport(smtpConfig);

    console.log('🔄 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');

    // Optional: Send test email
    if (process.argv[2]) {
      console.log(`📨 Sending test email to ${process.argv[2]}...`);
      const info = await transporter.sendMail({
        from: settings.email_from_address || settings.email_smtp_user,
        to: process.argv[2],
        subject: 'Email Configuration Test',
        text: 'If you receive this email, the SMTP configuration is working correctly!',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Email Configuration Test</h2>
            <p>If you receive this email, the SMTP configuration is working correctly!</p>
            <p>Configuration details:</p>
            <ul>
              <li>SMTP Host: ${settings.email_smtp_host}</li>
              <li>SMTP Port: ${settings.email_smtp_port}</li>
              <li>Secure: false (using STARTTLS)</li>
              <li>From: ${settings.email_from_address || settings.email_smtp_user}</li>
            </ul>
            <p style="color: #666; margin-top: 20px;">
              Sent at: ${new Date().toLocaleString()}
            </p>
          </div>
        `
      });
      console.log('✅ Test email sent successfully!');
      console.log('📬 Message ID:', info.messageId);
    }

  } catch (error) {
    console.log('❌ Error testing email configuration:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

// Check if test email recipient was provided
if (process.argv[2]) {
  console.log(`ℹ️  Will send test email to: ${process.argv[2]}`);
} else {
  console.log('ℹ️  No email address provided - will only test SMTP connection');
}

// Run the test
testEmailConfiguration().catch(error => {
  console.log('Test failed:', error);
  process.exit(1);
});
