import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import AwsController from '../controllers/AwsController';

const router = Router();

router.use(requireAuth);

router.get('/system-analytics', AwsController.getSystemAnalytics);
router.get('/health', AwsController.getServiceHealth);
router.get('/s3-storage', AwsController.getS3StorageInfo);
router.get('/ec2-instances', AwsController.getEc2Instances);
router.get('/lambda-functions', AwsController.getLambdaFunctions);
router.get('/rds-instances', AwsController.getRdsInstances);
router.get('/load-balancers', AwsController.getLoadBalancers);
router.get('/route53-zones', AwsController.getRoute53HostedZones);
router.get('/backups', AwsController.getAwsBackups);
router.get('/ec2-snapshots', AwsController.getEc2Snapshots);
router.get('/billing', AwsController.getBillingInfo);
router.get('/system-usage-history', AwsController.getSystemUsageHistory);
router.get('/resource-distribution', AwsController.getResourceDistribution);

export default router;