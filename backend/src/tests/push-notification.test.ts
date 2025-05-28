import { pushSubscriptionController } from '../controllers/pushSubscriptionController';
import { db } from '../database';
import { Request, Response } from 'express';

describe('Push Notification System', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockUser = { id: 1, email: 'test@example.com', name: 'Test User', role: 'user' };

    beforeEach(() => {
        mockRequest = {
            body: {
                endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
                keys: {
                    p256dh: 'test-p256dh-key',
                    auth: 'test-auth-key'
                }
            },
            params: {},
            headers: {
                authorization: 'Bearer test-token'
            },
            user: mockUser
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(async () => {
        await db('push_subscriptions').where('user_id', mockUser.id).delete();
    });

    describe('subscribe', () => {
        it('should create a new subscription', async () => {
            await pushSubscriptionController.subscribe(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: true });

            const subscription = await db('push_subscriptions')
                .where('user_id', mockUser.id)
                .first();

            expect(subscription).toBeTruthy();
            expect(subscription.endpoint).toBe(mockRequest.body.endpoint);
            expect(subscription.p256dh).toBe(mockRequest.body.keys.p256dh);
            expect(subscription.auth).toBe(mockRequest.body.keys.auth);
            expect(subscription.active).toBe(true);
        });

        it('should update existing subscription', async () => {
            // Create initial subscription
            await pushSubscriptionController.subscribe(
                mockRequest as Request,
                mockResponse as Response
            );

            // Update with new keys
            mockRequest.body.keys = {
                p256dh: 'new-p256dh-key',
                auth: 'new-auth-key'
            };

            await pushSubscriptionController.subscribe(
                mockRequest as Request,
                mockResponse as Response
            );

            const subscription = await db('push_subscriptions')
                .where('user_id', mockUser.id)
                .first();

            expect(subscription.p256dh).toBe('new-p256dh-key');
            expect(subscription.auth).toBe('new-auth-key');
        });
    });

    describe('unsubscribe', () => {
        it('should deactivate subscription', async () => {
            // Create subscription first
            await pushSubscriptionController.subscribe(
                mockRequest as Request,
                mockResponse as Response
            );

            mockRequest.params = {
                endpoint: encodeURIComponent(mockRequest.body.endpoint)
            };

            await pushSubscriptionController.unsubscribe(
                mockRequest as Request,
                mockResponse as Response
            );

            const subscription = await db('push_subscriptions')
                .where('user_id', mockUser.id)
                .first();

            expect(subscription.active).toBe(false);
        });
    });

    describe('sendNotification', () => {
        it('should send notification to user', async () => {
            // Create subscription first
            await pushSubscriptionController.subscribe(
                mockRequest as Request,
                mockResponse as Response
            );

            const payload = {
                title: 'Test Notification',
                body: 'This is a test notification',
                icon: '/icons/icon-192x192.png'
            };

            const sentCount = await pushSubscriptionController.sendNotificationToUser(
                mockUser.id,
                payload
            );

            expect(sentCount).toBe(1);

            const subscription = await db('push_subscriptions')
                .where('user_id', mockUser.id)
                .first();

            expect(subscription.last_used).toBeTruthy();
        });
    });
});
