import { db } from '../database';

export interface QueueJob<T = any> {
    id: number;
    type: string;
    data: T;
    priority: number;
    attempts: number;
    max_attempts: number;
    delay: number;
    created_at: Date;
    processed_at?: Date;
    completed_at?: Date;
    failed_at?: Date;
    error?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'delayed';
}

export interface QueueOptions {
    priority?: number;
    delay?: number;
    maxAttempts?: number;
    timeout?: number;
}

export type JobHandler<T = any> = (data: T) => Promise<void>;

export class QueueService {
    private static instance: QueueService;
    private handlers = new Map<string, JobHandler>();
    private isProcessing = false;
    private processingInterval: NodeJS.Timeout | null = null;
    private readonly pollInterval = 5000; // 5 seconds

    private constructor() {
        this.startProcessing();
    }

    public static getInstance(): QueueService {
        if (!QueueService.instance) {
            QueueService.instance = new QueueService();
        }
        return QueueService.instance;
    }

    async addJob<T>(
        type: string,
        data: T,
        options: QueueOptions = {}
    ): Promise<number> {
        const result = await db('queue_jobs').insert({
            type,
            data: JSON.stringify(data),
            priority: options.priority ?? 0,
            delay: options.delay ?? 0,
            max_attempts: options.maxAttempts ?? 3,
            attempts: 0,
            status: options.delay && options.delay > 0 ? 'delayed' : 'pending',
            created_at: new Date()
        }).returning('id');

        if (!result || result.length === 0) {
            throw new Error('Failed to create job');
        }

        return result[0].id;
    }

    registerHandler<T>(type: string, handler: JobHandler<T>): void {
        this.handlers.set(type, handler as JobHandler);
    }

    unregisterHandler(type: string): void {
        this.handlers.delete(type);
    }

    private async processJobs(): Promise<void> {
        if (this.isProcessing) return;

        this.isProcessing = true;

        try {
            // Get next batch of jobs
            const jobs = await db<QueueJob>('queue_jobs')
                .where(builder => 
                    builder
                        .where('status', 'pending')
                        .orWhere(builder => 
                            builder
                                .where('status', 'delayed')
                                .whereRaw('created_at + (delay * interval \'1 millisecond\') <= NOW()')
                        )
                )
                .orderBy('priority', 'desc')
                .orderBy('created_at', 'asc')
                .limit(10);

            // Process jobs in parallel
            await Promise.all(jobs.map(job => this.processJob(job)));
        } catch (error) {
            console.error('Error processing jobs:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    private async processJob(job: QueueJob): Promise<void> {
        const handler = this.handlers.get(job.type);
        if (!handler) {
            await this.markJobFailed(job.id, 'No handler registered for job type');
            return;
        }

        try {
            // Mark as processing
            await db('queue_jobs')
                .where('id', job.id)
                .update({
                    status: 'processing',
                    processed_at: new Date(),
                    attempts: job.attempts + 1
                });

            // Execute handler
            await handler(job.data);

            // Mark as completed
            await db('queue_jobs')
                .where('id', job.id)
                .update({
                    status: 'completed',
                    completed_at: new Date()
                });
        } catch (error) {
            console.error(`Error processing job ${job.id}:`, error);

            if (job.attempts + 1 >= job.max_attempts) {
                await this.markJobFailed(job.id, error instanceof Error ? error.message : 'Unknown error');
            } else {
                // Reset to pending for retry
                await db('queue_jobs')
                    .where('id', job.id)
                    .update({
                        status: 'pending',
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
            }
        }
    }

    private async markJobFailed(jobId: number, error: string): Promise<void> {
        await db('queue_jobs')
            .where('id', jobId)
            .update({
                status: 'failed',
                failed_at: new Date(),
                error
            });
    }

    private startProcessing(): void {
        if (this.processingInterval) return;

        this.processingInterval = setInterval(() => {
            this.processJobs().catch(error => {
                console.error('Error in job processing interval:', error);
            });
        }, this.pollInterval);
    }

    stopProcessing(): void {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
    }
}

// Job types
export const JobTypes = {
    NOTIFICATION_PUSH: 'notification:push',
    NOTIFICATION_EMAIL: 'notification:email',
    NOTIFICATION_SMS: 'notification:sms',
    NOTIFICATION_CLEANUP: 'notification:cleanup'
} as const;
