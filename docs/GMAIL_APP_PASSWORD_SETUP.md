# Gmail App Password Setup Guide

## Problem
The system is getting a "534-5.7.9 Application-specific password required" error when trying to send emails through Gmail SMTP. This happens because Gmail requires application-specific passwords instead of regular account passwords for SMTP authentication when 2-factor authentication is enabled.

## Solution Steps

### Step 1: Generate Gmail App Password

1. **Go to your Google Account settings:**
   - Visit: https://myaccount.google.com/
   - Sign in with the account: `sabercon@sabercon.com.br`

2. **Navigate to Security:**
   - Click on "Security" in the left sidebar
   - Scroll down to "Signing in to Google"

3. **Enable 2-Step Verification (if not already enabled):**
   - Click on "2-Step Verification"
   - Follow the setup process if it's not already enabled
   - **Note:** App passwords are only available when 2-Step Verification is enabled

4. **Generate App Password:**
   - Go back to Security settings
   - Click on "App passwords" (this appears only after 2-Step Verification is enabled)
   - Select "Mail" as the app
   - Select "Other (custom name)" as the device
   - Enter a name like "Portal Educacional SMTP"
   - Click "Generate"
   - **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 2: Update the System Configuration

#### Option A: Using the Update Script (Recommended)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Run the update script:**
   ```bash
   node scripts/update-email-settings.js "your-16-character-app-password"
   ```
   
   Replace `your-16-character-app-password` with the actual app password from Step 1.

#### Option B: Manual Database Update

1. **Connect to your database** and run:
   ```sql
   UPDATE system_settings 
   SET value = 'your-16-character-app-password', updated_at = NOW()
   WHERE key = 'email_smtp_password' AND category = 'email';
   ```

### Step 3: Restart the Backend Service

After updating the password, restart your backend service to reload the email configuration:

```bash
# If using PM2
pm2 restart backend

# If running directly
# Stop the current process and restart it
```

### Step 4: Test Email Functionality

1. **Test the email service** by triggering an email action in your application (like password reset)

2. **Check the backend logs** for successful email sending:
   ```bash
   # If using PM2
   pm2 logs backend

   # Look for messages like:
   # ✅ Email enviado com sucesso
   # ✅ Servidor de email configurado com sucesso
   ```

## Troubleshooting

### Common Issues:

1. **"Invalid credentials" error:**
   - Double-check the app password was copied correctly
   - Ensure there are no extra spaces in the password
   - Verify 2-Step Verification is enabled on the Gmail account

2. **"Less secure app access" error:**
   - This shouldn't happen with app passwords, but if it does:
   - Go to https://myaccount.google.com/lesssecureapps
   - Turn ON "Allow less secure apps" (not recommended, use app passwords instead)

3. **Connection timeout:**
   - Check if your server's firewall allows outbound connections on port 587
   - Verify the SMTP settings are correct:
     - Host: `smtp.gmail.com`
     - Port: `587`
     - Security: `TLS/STARTTLS`

### Verification Commands:

Test SMTP connection manually:
```bash
# Test SMTP connection using telnet
telnet smtp.gmail.com 587

# Or using openssl
openssl s_client -connect smtp.gmail.com:587 -starttls smtp
```

## Current Email Configuration

The system is configured with these SMTP settings:
- **Host:** smtp.gmail.com
- **Port:** 587
- **Security:** TLS/STARTTLS
- **Username:** sabercon@sabercon.com.br
- **Password:** [App Password - to be updated]

## Security Notes

- **Never share app passwords** - they provide full access to the email account
- **Use unique app passwords** for each application
- **Revoke unused app passwords** from your Google Account security settings
- **Monitor email sending** for any suspicious activity

## Alternative Email Providers

If Gmail continues to cause issues, consider these alternatives:

1. **SendGrid** (recommended for production)
2. **Amazon SES**
3. **Mailgun**
4. **Outlook/Hotmail SMTP**

Each would require updating the SMTP configuration in the system settings.
