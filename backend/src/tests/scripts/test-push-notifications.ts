import { pushSubscriptionController } from '../../controllers/pushSubscriptionController';
import { db } from '../../database';
import { env } from '../../config/env';

async function testPushNotifications() {
    try {
        // Create a test user if not exists
        const [testUser] = await db('users')
            .insert({
                email: 'test@example.com',
                name: 'Test User',
                role: 'user'
            })
            .onConflict('email')
            .merge()
            .returning('*');

        // Test subscription data
        const subscription = {
            endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
            keys: {
                p256dh: 'test-p256dh-key',
                auth: 'test-auth-key'
            }
        };

        // Test notification payload
        const payload = {
            title: 'Test Notification',
            body: 'This is a test notification',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon.svg',
            data: {
                url: '/notifications'
            }
        };

        console.log('Testing push notification system...');

        // Test subscription
        console.log('1. Testing subscription...');
        const mockReq = {
            user: testUser,
            body: subscription
        };
        const mockRes = {
            status: (code: number) => ({
                json: (data: any) => {
                    console.log(`Response (${code}):`, data);
                    return data;
                }
            })
        };

        await pushSubscriptionController.subscribe(mockReq as any, mockRes as any);

        // Test sending notification
        console.log('\n2. Testing notification sending...');
        const sentCount = await pushSubscriptionController.sendNotificationToUser(
            testUser.id,
            payload
        );
        console.log(`Notifications sent: ${sentCount}`);

        // Test unsubscribe
        console.log('\n3. Testing unsubscription...');
        const mockUnsubReq = {
            user: testUser,
            params: {
                endpoint: encodeURIComponent(subscription.endpoint)
            }
        };
        await pushSubscriptionController.unsubscribe(mockUnsubReq as any, mockRes as any);

        // Verify database state
        console.log('\n4. Verifying database state...');
        const dbSubscription = await db('push_subscriptions')
            .where('user_id', testUser.id)
            .first();
        
        console.log('Subscription in database:', dbSubscription);

        console.log('\nAll tests completed successfully!');
    } catch (error) {
        console.error('Error during testing:', error);
    } finally {
        // Clean up
        await db.destroy();
    }
}

// Run tests
testPushNotifications();
