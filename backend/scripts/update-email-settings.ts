import db from '../src/config/database';

async function updateEmailSettings(settings: Record<string, any>) {
  try {
    console.log('🔄 Updating email settings...');
    
    // Default Gmail SMTP settings
    const defaultSettings = {
      email_smtp_host: 'smtp.gmail.com',
      email_smtp_port: '587',
      email_smtp_secure: 'false', // Use STARTTLS instead of SSL
      email_smtp_user: settings.email_smtp_user || 'sabercon@sabercon.com.br',
      email_smtp_password: settings.email_smtp_password, // App password will be provided
      email_from_name: settings.email_from_name || 'Portal Educacional - Sabercon',
      email_from_address: settings.email_from_address || 'sabercon@sabercon.com.br'
    };

    // Merge provided settings with defaults
    const finalSettings = { ...defaultSettings, ...settings };
    
    for (const [key, value] of Object.entries(finalSettings)) {
      // Update each setting in the database
      await db('system_settings')
        .where('key', key)
        .where('category', 'email')
        .update({
          value: value,
          updated_at: new Date()
        });
      
      console.log(`✅ Updated ${key}`);
    }
    
    console.log('✅ Email settings updated successfully');
    
    // Verify the updates
    const updatedSettings = await db('system_settings')
      .select('key', 'value')
      .where('category', 'email');
    
    console.log('\nCurrent email settings:');
    updatedSettings.forEach(setting => {
      // Don't log the actual password value for security
      const value = setting.key === 'email_smtp_password' 
        ? '********' 
        : setting.value;
      console.log(`${setting.key}: ${value}`);
    });

  } catch (error) {
    console.log('❌ Error updating email settings:', error);
    throw error;
  } finally {
    // Close the database connection
    await db.destroy();
  }
}

// Example usage:
// npx ts-node update-email-settings.ts "your-app-password-here"
const appPassword = process.argv[2];

if (!appPassword) {
  console.log('❌ Please provide the app password as an argument');
  console.log('Usage: npx ts-node update-email-settings.ts "your-app-password-here"');
  process.exit(1);
}

// Update settings with the new app password and correct Gmail configuration
updateEmailSettings({
  email_smtp_password: appPassword
}).catch(error => {
  console.log('Failed to update settings:', error);
  process.exit(1);
});
