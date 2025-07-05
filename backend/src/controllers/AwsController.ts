import { Request, Response } from 'express';
import { awsRepository } from '../repositories/AwsRepository';

class AwsController {
    async getSystemAnalytics(req: Request, res: Response) {
        const data = await awsRepository.getSystemAnalytics();
        res.json(data);
    }
    async getServiceHealth(req: Request, res: Response) {
        const data = await awsRepository.getServiceHealth(req.query.region as string);
        res.json(data);
    }
    async getS3StorageInfo(req: Request, res: Response) {
        const data = await awsRepository.getS3StorageInfo();
        res.json(data);
    }
    // ... e assim por diante para os outros métodos
    getEc2Instances(req: Request, res: Response) { res.json({ message: 'getEc2Instances - not implemented' }); }
    getLambdaFunctions(req: Request, res: Response) { res.json({ message: 'getLambdaFunctions - not implemented' }); }
    getRdsInstances(req: Request, res: Response) { res.json({ message: 'getRdsInstances - not implemented' }); }
    getLoadBalancers(req: Request, res: Response) { res.json({ message: 'getLoadBalancers - not implemented' }); }
    getRoute53HostedZones(req: Request, res: Response) { res.json({ message: 'getRoute53HostedZones - not implemented' }); }
    getAwsBackups(req: Request, res: Response) { res.json({ message: 'getAwsBackups - not implemented' }); }
    getEc2Snapshots(req: Request, res: Response) { res.json({ message: 'getEc2Snapshots - not implemented' }); }
    getBillingInfo(req: Request, res: Response) { res.json({ message: 'getBillingInfo - not implemented' }); }
    getSystemUsageHistory(req: Request, res: Response) { res.json({ message: 'getSystemUsageHistory - not implemented' }); }
    getResourceDistribution(req: Request, res: Response) { res.json({ message: 'getResourceDistribution - not implemented' }); }
}

export default new AwsController();