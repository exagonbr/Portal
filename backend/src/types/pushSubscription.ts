export interface PushSubscription {
    id: number;
    user_id: number;
    endpoint: string;
    p256dh_key: string;
    auth_key: string;
    is_active: boolean;
    last_used: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface CreatePushSubscriptionDto {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export interface WebPushPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    actions?: Array<{
        action: string;
        title: string;
        icon?: string;
    }>;
}
