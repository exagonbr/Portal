import { Request, Response } from 'express';
import { UnitRepository } from '../repositories/UnitRepository';

const unitRepository = new UnitRepository();

class UnitController {
    async getAll(req: Request, res: Response) {
        try {
            const units = await unitRepository.findAll();
            return res.status(200).json({ success: true, data: units });
        } catch (error) {
            console.error(`Erro ao listar unidades: ${error}`);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const unit = await unitRepository.findById(id);
            
            if (!unit) {
                return res.status(404).json({ success: false, message: 'Unidade não encontrada' });
            }

            return res.status(200).json({ success: true, data: unit });
        } catch (error) {
            console.error(`Erro ao buscar unidade: ${error}`);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { name, institutionId } = req.body;
            
            if (!name || !institutionId) {
                return res.status(400).json({ success: false, message: 'Nome e ID da instituição são obrigatórios' });
            }

            const unit = await unitRepository.create({ name, institutionId });
            return res.status(201).json({ success: true, data: unit });
        } catch (error) {
            console.error(`Erro ao criar unidade: ${error}`);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const unit = await unitRepository.update(id, updateData);
            
            if (!unit) {
                return res.status(404).json({ success: false, message: 'Unidade não encontrada' });
            }

            return res.status(200).json({ success: true, data: unit });
        } catch (error) {
            console.error(`Erro ao atualizar unidade: ${error}`);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const success = await unitRepository.delete(id);
            
            if (!success) {
                return res.status(404).json({ success: false, message: 'Unidade não encontrada' });
            }

            return res.status(200).json({ success: true, message: 'Unidade excluída com sucesso' });
        } catch (error) {
            console.error(`Erro ao excluir unidade: ${error}`);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }

    async search(req: Request, res: Response) {
        try {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({ success: false, message: 'Parâmetro de busca "q" é obrigatório' });
            }
            
            const units = await unitRepository.findByName(q as string);
            return res.status(200).json({ success: true, data: units });
        } catch (error) {
            console.error(`Erro na busca de unidades: ${error}`);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }

    async getActive(req: Request, res: Response) {
        try {
            const units = await unitRepository.findActive();
            return res.status(200).json({ success: true, data: units });
        } catch (error) {
            console.error(`Erro ao buscar unidades ativas: ${error}`);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }

    async getByInstitution(req: Request, res: Response) {
        try {
            const { institutionId } = req.params;
            const institutionIdNumber = parseInt(institutionId);
            
            if (isNaN(institutionIdNumber)) {
                return res.status(400).json({ success: false, message: 'ID da instituição deve ser um número' });
            }
            
            const units = await unitRepository.findByInstitution(institutionIdNumber);
            return res.status(200).json({ success: true, data: units });
        } catch (error) {
            console.error(`Erro ao buscar unidades da instituição: ${error}`);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }

    async softDelete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const success = await unitRepository.softDelete(id);
            
            if (!success) {
                return res.status(404).json({ success: false, message: 'Unidade não encontrada' });
            }
            
            return res.status(200).json({ success: true, message: 'Unidade desativada com sucesso' });
        } catch (error) {
            console.error(`Erro ao desativar unidade: ${error}`);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }
}

export default new UnitController();