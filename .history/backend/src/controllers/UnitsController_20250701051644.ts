import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import db from '../config/database';
import {
  CreateUnitRequest,
  UpdateUnitRequest,
  UnitFilters,
  createApiResponse,
  createPaginatedResponse,
  formatUnitResponse
} from '../types/api-responses';

export class UnitsController {
  
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        institution_id, 
        active,
        type 
      } = req.query as UnitFilters;

      let query = db('unit')
        .leftJoin('institution', 'unit.institution_id', 'institution.id')
        .select(
          'unit.*',
          'institution.name as institution_name',
          'institution.date_created as institution_created_at',
          'institution.last_updated as institution_updated_at'
        );

      // Aplicar filtros
      if (search) {
        query = query.where(function() {
          this.where('unit.name', 'ilike', `%${search}%`)
              .orWhere('institution.name', 'ilike', `%${search}%`);
        });
      }

      if (institution_id) {
        query = query.where('unit.institution_id', institution_id);
      }

      if (active !== undefined) {
        const isActive = typeof active === 'string' ? active === 'true' : active;
        query = query.where('unit.deleted', isActive ? false : true);
      }

      if (type) {
        query = query.where('unit.type', type);
      }

      // Contar total de registros
      const countQuery = query.clone();
      const totalResult = await countQuery.count('unit.id as count').first();
      const total = parseInt(totalResult?.count as string) || 0;

      // Aplicar paginação
      const pageNum = parseInt(page?.toString() || '1');
      const limitNum = parseInt(limit?.toString() || '10');
      const offset = (pageNum - 1) * limitNum;

      query = query.limit(limitNum).offset(offset);

      // Ordenar por nome
      query = query.orderBy('unit.name', 'asc');

      const units = await query;

      const formattedUnits = units.map(formatUnitResponse);

      const pagination = {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      };

      return res.json(createPaginatedResponse(formattedUnits, pagination, 'Units retrieved successfully'));
    } catch (error) {
      console.log('Error retrieving units:', error);
      return res.status(500).json(createApiResponse(
        false,
        undefined,
        'Error retrieving units',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json(createApiResponse(
          false,
          undefined,
          'Unit ID is required'
        ));
      }

      const unit = await db('unit')
        .leftJoin('institution', 'unit.institution_id', 'institution.id')
        .select(
          'unit.*',
          'institution.name as institution_name',
          'institution.date_created as institution_created_at',
          'institution.last_updated as institution_updated_at'
        )
        .where('unit.id', id)
        .first();

      if (!unit) {
        return res.status(404).json(createApiResponse(
          false,
          undefined,
          'Unit not found'
        ));
      }

      const formattedUnit = formatUnitResponse(unit);

      return res.json(createApiResponse(
        true,
        formattedUnit,
        'Unit retrieved successfully'
      ));
    } catch (error) {
      console.log('Error retrieving unit:', error);
      return res.status(500).json(createApiResponse(
        false,
        undefined,
        'Error retrieving unit',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(createApiResponse(
          false,
          undefined,
          'Validation failed',
          JSON.stringify(errors.array())
        ));
      }

      const unitData: CreateUnitRequest = req.body;

      // Verificar se a instituição existe
      const institution = await db('institution')
        .where('id', unitData.institution_id)
        .first();

      if (!institution) {
        return res.status(400).json(createApiResponse(
          false,
          undefined,
          'Institution not found'
        ));
      }

      const newUnit = {
        name: unitData.name,
        institution_id: unitData.institution_id,
        institution_name: institution.name,
        description: unitData.description || null,
        type: unitData.type || 'school',
        version: 1,
        date_created: new Date(),
        last_updated: new Date(),
        deleted: false
      };

      const [createdUnit] = await db('unit').insert(newUnit).returning('*');

      const formattedUnit = formatUnitResponse({
        ...createdUnit,
        institution_name: institution.name
      });

      return res.status(201).json(createApiResponse(
        true,
        formattedUnit,
        'Unit created successfully'
      ));
    } catch (error) {
      console.log('Error creating unit:', error);
      return res.status(500).json(createApiResponse(
        false,
        undefined,
        'Error creating unit',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(createApiResponse(
          false,
          undefined,
          'Validation failed',
          JSON.stringify(errors.array())
        ));
      }

      const { id } = req.params;
      const updateData: UpdateUnitRequest = req.body;

      if (!id) {
        return res.status(400).json(createApiResponse(
          false,
          undefined,
          'Unit ID is required'
        ));
      }

      // Verificar se a unidade existe
      const existingUnit = await db('unit').where('id', id).first();
      if (!existingUnit) {
        return res.status(404).json(createApiResponse(
          false,
          undefined,
          'Unit not found'
        ));
      }

      // Se institution_id foi fornecido, verificar se a instituição existe
      let institutionName = existingUnit.institution_name;
      if (updateData.institution_id && updateData.institution_id !== existingUnit.institution_id) {
        const institution = await db('institution')
          .where('id', updateData.institution_id)
          .first();

        if (!institution) {
          return res.status(400).json(createApiResponse(
            false,
            undefined,
            'Institution not found'
          ));
        }
        institutionName = institution.name;
      }

      const updatedFields: any = {
        last_updated: new Date(),
        version: existingUnit.version + 1
      };

      if (updateData.name !== undefined) updatedFields.name = updateData.name;
      if (updateData.institution_id !== undefined) {
        updatedFields.institution_id = updateData.institution_id;
        updatedFields.institution_name = institutionName;
      }
      if (updateData.description !== undefined) updatedFields.description = updateData.description;
      if (updateData.type !== undefined) updatedFields.type = updateData.type;
      if (updateData.active !== undefined) updatedFields.deleted = !updateData.active;

      await db('unit').where('id', id).update(updatedFields);

      // Buscar a unidade atualizada com dados da instituição
      const updatedUnit = await db('unit')
        .leftJoin('institution', 'unit.institution_id', 'institution.id')
        .select(
          'unit.*',
          'institution.name as institution_name',
          'institution.date_created as institution_created_at',
          'institution.last_updated as institution_updated_at'
        )
        .where('unit.id', id)
        .first();

      const formattedUnit = formatUnitResponse(updatedUnit);

      return res.json(createApiResponse(
        true,
        formattedUnit,
        'Unit updated successfully'
      ));
    } catch (error) {
      console.log('Error updating unit:', error);
      return res.status(500).json(createApiResponse(
        false,
        undefined,
        'Error updating unit',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(createApiResponse(
          false,
          undefined,
          'Unit ID is required'
        ));
      }

      const existingUnit = await db('unit').where('id', id).first();
      if (!existingUnit) {
        return res.status(404).json(createApiResponse(
          false,
          undefined,
          'Unit not found'
        ));
      }

      // Soft delete - marcar como deletado
      await db('unit')
        .where('id', id)
        .update({
          deleted: true,
          last_updated: new Date(),
          version: existingUnit.version + 1
        });

      return res.json(createApiResponse(
        true,
        null,
        'Unit deleted successfully'
      ));
    } catch (error) {
      console.log('Error deleting unit:', error);
      return res.status(500).json(createApiResponse(
        false,
        undefined,
        'Error deleting unit',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }

  async restore(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(createApiResponse(
          false,
          undefined,
          'Unit ID is required'
        ));
      }

      const existingUnit = await db('unit').where('id', id).first();
      if (!existingUnit) {
        return res.status(404).json(createApiResponse(
          false,
          undefined,
          'Unit not found'
        ));
      }

      if (!existingUnit.deleted) {
        return res.status(400).json(createApiResponse(
          false,
          undefined,
          'Unit is not deleted'
        ));
      }

      // Restaurar unidade
      await db('unit')
        .where('id', id)
        .update({
          deleted: false,
          last_updated: new Date(),
          version: existingUnit.version + 1
        });

      // Buscar a unidade restaurada
      const restoredUnit = await db('unit')
        .leftJoin('institution', 'unit.institution_id', 'institution.id')
        .select(
          'unit.*',
          'institution.name as institution_name',
          'institution.date_created as institution_created_at',
          'institution.last_updated as institution_updated_at'
        )
        .where('unit.id', id)
        .first();

      const formattedUnit = formatUnitResponse(restoredUnit);

      return res.json(createApiResponse(
        true,
        formattedUnit,
        'Unit restored successfully'
      ));
    } catch (error) {
      console.log('Error restoring unit:', error);
      return res.status(500).json(createApiResponse(
        false,
        undefined,
        'Error restoring unit',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }

  async getByInstitution(req: Request, res: Response): Promise<Response> {
    try {
      const { institutionId } = req.params;
      const { active = 'true' } = req.query;

      if (!institutionId) {
        return res.status(400).json(createApiResponse(
          false,
          undefined,
          'Institution ID is required'
        ));
      }

      let query = db('unit')
        .leftJoin('institution', 'unit.institution_id', 'institution.id')
        .select(
          'unit.*',
          'institution.name as institution_name',
          'institution.date_created as institution_created_at',
          'institution.last_updated as institution_updated_at'
        )
        .where('unit.institution_id', institutionId);

      if (active !== undefined) {
        query = query.where('unit.deleted', active === 'true' ? false : true);
      }

      query = query.orderBy('unit.name', 'asc');

      const units = await query;
      const formattedUnits = units.map(formatUnitResponse);

      return res.json(createApiResponse(
        true,
        formattedUnits,
        'Units retrieved successfully'
      ));
    } catch (error) {
      console.log('Error retrieving units by institution:', error);
      return res.status(500).json(createApiResponse(
        false,
        undefined,
        'Error retrieving units by institution',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }
}