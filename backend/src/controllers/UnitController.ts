import { Request, Response } from 'express';
import { UnitRepository } from '../repositories/UnitRepository';
import { BaseController } from './BaseController';
import { Unit } from '../entities/Unit';
import { CreateUnitDto, UpdateUnitDto, UnitResponseDto } from '../dto/UnitDto';

const unitRepository = new UnitRepository();

export class UnitController extends BaseController<Unit> {
  private unitRepository: UnitRepository;
    constructor() {
    const repository = new UnitRepository();
    super(repository);
    this.unitRepository = repository;
        super(unitRepository);
    }

    /**
     * Sobrescrever o método getAll para incluir paginação e filtros específicos
     */
    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                institution_id,
                type,
                active,
                deleted,
                sortBy = 'name',
                sortOrder = 'asc'
            } = req.query;

            // Converter parâmetros para tipos corretos
            const pageNum = parseInt(page as string, 10);
            const limitNum = parseInt(limit as string, 10);
            const institutionIdNum = institution_id ? parseInt(institution_id as string, 10) : undefined;
            const activeBool = active === 'true' ? true : active === 'false' ? false : undefined;
            const deletedBool = deleted === 'true' ? true : deleted === 'false' ? false : undefined;

            const filters = {
                page: pageNum,
                limit: limitNum,
                search: search as string,
                institution_id: institutionIdNum,
                type: type as string,
                active: activeBool,
                deleted: deletedBool,
                sortBy: sortBy as keyof Unit,
                sortOrder: sortOrder as 'asc' | 'desc'
            };

            const result = await unitRepository.findWithFilters(filters);

            // Mapear dados para o formato de resposta esperado pelo frontend
            const mappedItems = result.data.map(unit => this.mapToResponseDto(unit));

            return res.status(200).json({
                success: true,
                items: mappedItems,
                total: result.total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(result.total / limitNum)
            });
        } catch (error) {
            console.error(`Error in getAll units: ${error}`);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor ao buscar unidades',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }

    /**
     * Buscar unidade por ID
     */
    async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const unit = await unitRepository.findById(id);
            
            if (!unit) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Unidade não encontrada' 
                });
            }

            const mappedUnit = this.mapToResponseDto(unit);
            return res.status(200).json({ 
                success: true, 
                data: mappedUnit 
            });
        } catch (error) {
            console.error(`Error in getById unit: ${error}`);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor ao buscar unidade',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }

    /**
     * Criar nova unidade
     */
    async create(req: Request, res: Response): Promise<Response> {
        try {
            const createDto: CreateUnitDto = req.body;

            // Validações básicas
            if (!createDto.name || !createDto.institution_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome e ID da instituição são obrigatórios'
                });
            }

            // Verificar se já existe uma unidade com o mesmo nome na mesma instituição
            const existingUnit = await unitRepository.findByNameAndInstitution(
                createDto.name, 
                parseInt(createDto.institution_id)
            );

            if (existingUnit) {
                return res.status(409).json({
                    success: false,
                    message: 'Já existe uma unidade com este nome nesta instituição'
                });
            }

            const unitData = {
                name: createDto.name,
                institutionId: parseInt(createDto.institution_id),
                institutionName: createDto.institution_name,
                type: createDto.type,
                description: createDto.description,
                status: createDto.active !== false ? 'active' : 'inactive',
                deleted: createDto.deleted || false,
                dateCreated: new Date(),
                lastUpdated: new Date()
            };

            const newUnit = await unitRepository.create(unitData);
            const mappedUnit = this.mapToResponseDto(newUnit);

            return res.status(201).json({
                success: true,
                data: mappedUnit,
                message: 'Unidade criada com sucesso'
            });
        } catch (error) {
            console.error(`Error in create unit: ${error}`);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor ao criar unidade',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }

    /**
     * Atualizar unidade existente
     */
    async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const updateDto: UpdateUnitDto = req.body;

            // Verificar se a unidade existe
            const existingUnit = await unitRepository.findById(id);
            if (!existingUnit) {
                return res.status(404).json({
                    success: false,
                    message: 'Unidade não encontrada'
                });
            }

            // Se estiver alterando o nome, verificar duplicatas
            if (updateDto.name && updateDto.name !== existingUnit.name) {
                const institutionId = updateDto.institution_id 
                    ? parseInt(updateDto.institution_id) 
                    : existingUnit.institutionId;

                const duplicateUnit = await unitRepository.findByNameAndInstitution(
                    updateDto.name, 
                    institutionId
                );

                if (duplicateUnit && duplicateUnit.id !== existingUnit.id) {
                    return res.status(409).json({
                        success: false,
                        message: 'Já existe uma unidade com este nome nesta instituição'
                    });
                }
            }

            const updateData: any = {
                lastUpdated: new Date()
            };

            if (updateDto.name) updateData.name = updateDto.name;
            if (updateDto.institution_id) updateData.institutionId = parseInt(updateDto.institution_id);
            if (updateDto.institution_name) updateData.institutionName = updateDto.institution_name;
            if (updateDto.type) updateData.type = updateDto.type;
            if (updateDto.description !== undefined) updateData.description = updateDto.description;
            if (updateDto.active !== undefined) updateData.status = updateDto.active ? 'active' : 'inactive';
            if (updateDto.deleted !== undefined) updateData.deleted = updateDto.deleted;

            const updatedUnit = await unitRepository.update(id, updateData);
            
            if (!updatedUnit) {
                return res.status(404).json({
                    success: false,
                    message: 'Erro ao atualizar unidade'
                });
            }

            const mappedUnit = this.mapToResponseDto(updatedUnit);

            return res.status(200).json({
                success: true,
                data: mappedUnit,
                message: 'Unidade atualizada com sucesso'
            });
        } catch (error) {
            console.error(`Error in update unit: ${error}`);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor ao atualizar unidade',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }

    /**
     * Excluir unidade (hard delete)
     */
    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            
            const success = await unitRepository.delete(id);
            
            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Unidade não encontrada'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Unidade excluída com sucesso'
            });
        } catch (error) {
            console.error(`Error in delete unit: ${error}`);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor ao excluir unidade',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }

    /**
     * Buscar unidades por termo de pesquisa
     */
    async search(req: Request, res: Response): Promise<Response> {
        try {
            const { q, limit = 10 } = req.query;
            
            if (!q) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Parâmetro de busca "q" é obrigatório' 
                });
            }
            
            const units = await unitRepository.findByName(q as string, parseInt(limit as string));
            const mappedUnits = units.map(unit => this.mapToResponseDto(unit));
            
            return res.status(200).json({ 
                success: true, 
                data: mappedUnits 
            });
        } catch (error) {
            console.error(`Error in search units: ${error}`);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor ao buscar unidades',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }

    /**
     * Buscar apenas unidades ativas
     */
    async getActive(req: Request, res: Response): Promise<Response> {
        try {
            const { limit = 100 } = req.query;
            const units = await unitRepository.findActive(parseInt(limit as string));
            const mappedUnits = units.map(unit => this.mapToResponseDto(unit));
            
            return res.status(200).json({ 
                success: true, 
                data: mappedUnits 
            });
        } catch (error) {
            console.error(`Error in getActive units: ${error}`);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor ao buscar unidades ativas',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }

    /**
     * Buscar unidades por instituição
     */
    async getByInstitution(req: Request, res: Response): Promise<Response> {
        try {
            const { institutionId } = req.params;
            const { includeInactive = false } = req.query;
            
            const institutionIdNumber = parseInt(institutionId);
            
            if (isNaN(institutionIdNumber)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'ID da instituição deve ser um número válido' 
                });
            }
            
            const units = await unitRepository.findByInstitution(
                institutionIdNumber, 
                includeInactive === 'true'
            );
            const mappedUnits = units.map(unit => this.mapToResponseDto(unit));
            
            return res.status(200).json({ 
                success: true, 
                data: mappedUnits 
            });
        } catch (error) {
            console.error(`Error in getByInstitution units: ${error}`);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor ao buscar unidades por instituição',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }

    /**
     * Soft delete - marcar como excluída
     */
    async softDelete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const success = await unitRepository.softDelete(id);
            
            if (!success) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Unidade não encontrada' 
                });
            }
            
            return res.status(200).json({ 
                success: true, 
                message: 'Unidade marcada como inativa com sucesso' 
            });
        } catch (error) {
            console.error(`Error in softDelete unit: ${error}`);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor ao desativar unidade',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }

    /**
     * Alternar status da unidade (ativa/inativa)
     */
    async toggleStatus(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const updatedUnit = await unitRepository.toggleStatus(id);
            
            if (!updatedUnit) {
                return res.status(404).json({
                    success: false,
                    message: 'Unidade não encontrada'
                });
            }

            const mappedUnit = this.mapToResponseDto(updatedUnit);

            return res.status(200).json({
                success: true,
                data: mappedUnit,
                message: `Unidade ${updatedUnit.active ? 'ativada' : 'desativada'} com sucesso`
            });
        } catch (error) {
            console.error(`Error in toggleStatus unit: ${error}`);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor ao alterar status da unidade',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }

    /**
     * Mapear entidade Unit para DTO de resposta
     */
    private mapToResponseDto(unit: Unit): UnitResponseDto {
        return {
            id: String(unit.id),
            version: unit.version,
            date_created: unit.dateCreated?.toISOString(),
            deleted: unit.deleted || false,
            institution_id: String(unit.institutionId),
            last_updated: unit.lastUpdated?.toISOString(),
            name: unit.name,
            institution_name: unit.institutionName,
            type: unit.type,
            description: unit.description,
            active: unit.active,
            created_at: unit.dateCreated?.toISOString(),
            updated_at: unit.lastUpdated?.toISOString()
        };
    }
}

export default new UnitController();