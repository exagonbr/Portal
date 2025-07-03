const db = require('../src/config/database').default;

async function updateEmailSettings(settings) {
  try {
    console.log('🔄 Updating email settings...');
    
    for (const [key, value] of Object.entries(settings)) {
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
    console.error('❌ Error updating email settings:', error);
    throw error;
  } finally {
    // Close the database connection
    await db.destroy();
  }
}

// Example usage:
// node update-email-settings.js "your-app-password-here"
const appPassword = process.argv[2];

if (!appPassword) {
  console.error('❌ Please provide the app password as an argument');
  console.log('Usage: node update-email-settings.js "your-app-password-here"');
  process.exit(1);
}

// Update only the password setting
updateEmailSettings({
  'email_smtp_password': appPassword
}).catch(error => {
  console.error('Failed to update settings:', error);
  process.exit(1);
});
