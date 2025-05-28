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
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const subscription: CreatePushSubscriptionDto = req.body;
            if (!subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
                return res.status(400).json({ error: 'Invalid subscription data' });
            }

            // Check if subscription already exists
            const existing = await db<PushSubscription>('push_subscriptions')
                .where('endpoint', subscription.endpoint)
                .first();

            if (existing) {
                // Update if exists
                await db<PushSubscription>('push_subscriptions')
                    .where('endpoint', subscription.endpoint)
                    .update({
                        user_id: user.id,
                        p256dh: subscription.keys.p256dh,
                        auth: subscription.keys.auth,
                        active: true,
                        last_used: new Date(),
                        updated_at: new Date()
                    });
            } else {
                // Create new subscription
                await db<PushSubscription>('push_subscriptions').insert({
                    user_id: user.id,
                    endpoint: subscription.endpoint,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                    active: true,
                    last_used: new Date()
                });
            }

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error saving push subscription:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async unsubscribe(req: Request, res: Response): Promise<Response> {
        try {
            const user = await getUserFromRequest(req);
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { endpoint } = req.params;
            if (!endpoint) {
                return res.status(400).json({ error: 'Endpoint is required' });
            }

            const decodedEndpoint = decodeURIComponent(endpoint);
            
            await db<PushSubscription>('push_subscriptions')
                .where({ endpoint: decodedEndpoint, user_id: user.id })
                .update({ active: false });

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error removing push subscription:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async sendNotification(subscription: PushSubscription, payload: WebPushPayload): Promise<boolean> {
        try {
            await webpush.sendNotification({
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.p256dh,
                    auth: subscription.auth
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
                    .update({ active: false });
            }
            throw error;
        }
    }

    async sendNotificationToUser(userId: number, payload: WebPushPayload): Promise<number> {
        const subscriptions = await db<PushSubscription>('push_subscriptions')
            .where({ user_id: userId, active: true });

        const results = await Promise.allSettled(
            subscriptions.map(sub => this.sendNotification(sub, payload))
        );

        return results.filter(r => r.status === 'fulfilled').length;
    }

    async sendNotificationToUsers(userIds: number[], payload: WebPushPayload): Promise<number> {
        const subscriptions = await db<PushSubscription>('push_subscriptions')
            .whereIn('user_id', userIds)
            .where('active', true);

        const results = await Promise.allSettled(
            subscriptions.map(sub => this.sendNotification(sub, payload))
        );

        return results.filter(r => r.status === 'fulfilled').length;
    }
}

export const pushSubscriptionController = new PushSubscriptionController();
