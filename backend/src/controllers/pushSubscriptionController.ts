import { Request, Response } from 'express';
import { db } from '../database';
import { getUserFromRequest } from '../utils/auth';
import webpush from 'web-push';
import { CreatePushSubscriptionDto, PushSubscription, WebPushPayload } from '../types/pushSubscription';
import { env } from '../config/env';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
    `mailto:${env.VAPID_EMAIL}`,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
);

export class PushSubscriptionController {
    async subscribe(req: Request, res: Response): Promise<Response> {
        try {
            const user = await getUserFromRequest(req);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const { endpoint, keys }: CreatePushSubscriptionDto = req.body;

            if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid subscription data'
                });
            }

            // Check if subscription already exists
            const existingSubscription = await db<PushSubscription>('push_subscriptions')
                .where({ user_id: user.id, endpoint })
                .first();

            if (existingSubscription) {
                // Update existing subscription
                await db<PushSubscription>('push_subscriptions')
                    .where({ user_id: user.id, endpoint })
                    .update({
                        p256dh_key: keys.p256dh,
                        auth_key: keys.auth,
                        is_active: true,
                        last_used: new Date()
                    });
            } else {
                // Create new subscription
                await db<PushSubscription>('push_subscriptions').insert({
                    user_id: user.id,
                    endpoint,
                    p256dh_key: keys.p256dh,
                    auth_key: keys.auth,
                    is_active: true,
                    created_at: new Date(),
                    last_used: new Date()
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Push subscription registered successfully',
                data: {}
            });
        } catch (error) {
            console.error('Error registering push subscription:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to register push subscription'
            });
        }
    }

    async unsubscribe(req: Request, res: Response): Promise<Response> {
        try {
            const user = await getUserFromRequest(req);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const { endpoint } = req.params;

            await db<PushSubscription>('push_subscriptions')
                .where({ user_id: user.id, endpoint })
                .update({ is_active: false });

            return res.status(200).json({
                success: true,
                message: 'Push subscription removed successfully',
                data: {}
            });
        } catch (error) {
            console.error('Error removing push subscription:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to remove push subscription'
            });
        }
    }

    async sendNotification(subscription: PushSubscription, payload: WebPushPayload): Promise<boolean> {
        try {
            await webpush.sendNotification({
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.p256dh_key,
                    auth: subscription.auth_key
                }
            }, JSON.stringify(payload));

            // Update last_used timestamp
            await db<PushSubscription>('push_subscriptions')
                .where('endpoint', subscription.endpoint)
                .update({ last_used: new Date() });

            return true;
        } catch (error: any) {
            if (error.statusCode === 404 || error.statusCode === 410) {
                // Subscription is expired or invalid
                await db<PushSubscription>('push_subscriptions')
                    .where('endpoint', subscription.endpoint)
                    .update({ is_active: false });
            }
            throw error;
        }
    }

    async sendNotificationToUser(userId: string, payload: WebPushPayload): Promise<number> {
        try {
            const subscriptions = await db<PushSubscription>('push_subscriptions')
                .where('user_id', userId)
                .where('is_active', true);

            let sentCount = 0;
            
            for (const subscription of subscriptions) {
                try {
                    await this.sendNotification(subscription, payload);
                    sentCount++;
                } catch (error) {
                    console.error(`Error sending notification to subscription ${subscription.endpoint}:`, error);
                }
            }

            return sentCount;
        } catch (error) {
            console.error('Error sending notification to user:', error);
            throw error;
        }
    }

    async sendNotificationToUsers(userIds: string[], payload: WebPushPayload): Promise<number> {
        try {
            let totalSent = 0;
            
            for (const userId of userIds) {
                const sent = await this.sendNotificationToUser(userId, payload);
                totalSent += sent;
            }

            return totalSent;
        } catch (error) {
            console.error('Error sending notifications to users:', error);
            throw error;
        }
    }

    async sendBulkNotification(req: Request, res: Response): Promise<Response> {
        try {
            const user = await getUserFromRequest(req);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const { title, body, data, userIds, icon, badge } = req.body;

            if (!title || !body) {
                return res.status(400).json({
                    success: false,
                    message: 'Title and body are required'
                });
            }

            const payload: WebPushPayload = {
                title,
                body,
                icon: icon || '/icons/icon-192x192.png',
                badge: badge || '/icons/icon.svg',
                data: data || {}
            };

            let sentCount = 0;
            
            if (userIds && Array.isArray(userIds)) {
                // Send to specific users
                sentCount = await this.sendNotificationToUsers(userIds, payload);
            } else {
                // Send to all active subscriptions
                const subscriptions = await db<PushSubscription>('push_subscriptions')
                    .where('is_active', true);

                for (const subscription of subscriptions) {
                    try {
                        await this.sendNotification(subscription, payload);
                        sentCount++;
                    } catch (error) {
                        console.error(`Error sending notification to subscription ${subscription.endpoint}:`, error);
                    }
                }
            }

            return res.status(200).json({
                success: true,
                message: `Notification sent to ${sentCount} subscriptions`,
                data: { sentCount }
            });
        } catch (error) {
            console.error('Error sending bulk notification:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send bulk notification'
            });
        }
    }
}

export const pushSubscriptionController = new PushSubscriptionController();
