import { Request, Response } from 'express';
import { UnitRepository } from '../repositories/UnitRepository';
import { BaseController } from './BaseController';
import { Unit } from '../entities/Unit';

const unitRepository = new UnitRepository();

class UnitController extends BaseController<Unit> {
    constructor() {
        super(unitRepository);
    }

    async search(req: Request, res: Response) {
        try {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
            }
            
            const units = await unitRepository.findByName(q as string);
            return res.status(200).json({ success: true, data: units });
        } catch (error) {
            console.error(`Error in search units: ${error}`);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    async getActive(req: Request, res: Response) {
        try {
            const units = await unitRepository.findActive();
            return res.status(200).json({ success: true, data: units });
        } catch (error) {
            console.error(`Error in getActive: ${error}`);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    async getByInstitution(req: Request, res: Response) {
        try {
            const { institutionId } = req.params;
            const institutionIdNumber = parseInt(institutionId);
            
            if (isNaN(institutionIdNumber)) {
                return res.status(400).json({ success: false, message: 'Institution ID must be a number' });
            }
            
            const units = await unitRepository.findByInstitution(institutionIdNumber);
            return res.status(200).json({ success: true, data: units });
        } catch (error) {
            console.error(`Error in getByInstitution: ${error}`);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    async softDelete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const success = await unitRepository.softDelete(id);
            
            if (!success) {
                return res.status(404).json({ success: false, message: 'Unit not found' });
            }
            
    async delete(req: Request, res: Response) {
        res.status(204).send();
    }
}

export default new UnitController();