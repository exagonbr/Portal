import { Request, Response } from 'express';
import { CertificateRepository, CertificateFilter } from '../repositories/CertificateRepository';
import { Certificate } from '../entities/Certificate';
import { BaseController } from './BaseController';

const certificateRepository = new CertificateRepository();

class CertificateController extends BaseController<Certificate> {
  constructor() {
    const repository = new CertificateRepository();
    super(repository);
    this.certificateRepository = repository;
    super(certificateRepository);
  }

  /**
   * Busca paginada de certificados com filtros avançados
   */
  async findAll(req: Request, res: Response) {
    try {
      const {
        user_id,
        tv_show_id,
        tv_show_name,
        document,
        license_code,
        recreate,
        search,
        page = '1',
        limit = '10',
        sort_by = 'id',
        sort_order = 'desc'
      } = req.query;

      // Converter parâmetros para os tipos corretos
      const filters: CertificateFilter = {
        user_id: user_id ? Number(user_id) : undefined,
        tv_show_id: tv_show_id ? Number(tv_show_id) : undefined,
        tv_show_name: tv_show_name as string,
        document: document as string,
        license_code: license_code as string,
        recreate: recreate !== undefined ? recreate === 'true' : undefined,
        search: search as string,
        page: Number(page),
        limit: Number(limit),
        sort_by: sort_by as string,
        sort_order: (sort_order as 'asc' | 'desc') || 'desc'
      };

      const result = await certificateRepository.findWithFilters(filters);

      return res.status(200).json({
        success: true,
        data: {
          items: result.items,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
            hasNext: result.page < result.totalPages,
            hasPrev: result.page > 1
          }
        },
        message: `${result.total} certificado(s) encontrado(s)`
      });
    } catch (error) {
      console.error('Erro ao buscar certificados:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Busca pública de certificados por CPF (últimos 4 dígitos) ou código de licença
   */
  async searchPublic(req: Request, res: Response) {
    try {
      const { cpf_last_digits, license_code } = req.query;

      // Validação dos parâmetros
      if (!cpf_last_digits && !license_code) {
        return res.status(400).json({
          success: false,
          message: 'É necessário informar o código da licença ou os últimos 4 dígitos do CPF'
        });
      }

      // Validar formato dos últimos dígitos do CPF
      if (cpf_last_digits && !/^\d{4}$/.test(cpf_last_digits as string)) {
        return res.status(400).json({
          success: false,
          message: 'Os últimos dígitos do CPF devem conter exatamente 4 números'
        });
      }

      let whereClause = '';
      let params: any[] = [];

      if (license_code) {
        whereClause = 'license_code = ?';
        params = [license_code];
      } else if (cpf_last_digits) {
        // Buscar pelos últimos 4 dígitos do CPF, considerando diferentes formatos
        // 1. Busca removendo formatação (pontos, hífens, espaços)
        // 2. Busca também com formatação (ex: -90 para 6890)
        const digits = cpf_last_digits as string;
        const lastTwoDigits = digits.slice(-2); // Últimos 2 dígitos (ex: 90)
        
        whereClause = `(
          RIGHT(REPLACE(REPLACE(REPLACE(document, '.', ''), '-', ''), ' ', ''), 4) = ? 
          OR document LIKE ?
        )`;
        params = [digits, `%-${lastTwoDigits}`];
      }

      const certificates = await certificateRepository.findByCondition(whereClause, params);

      // Retornar apenas informações públicas dos certificados
      const publicCertificates = certificates.map((cert: Certificate) => ({
        id: cert.id,
        license_code: cert.licenseCode,
        document: cert.document,
        tv_show_name: cert.tvShowName,
        score: cert.score,
        date_created: cert.dateCreated,
        path: cert.path
      }));

      return res.status(200).json({
        success: true,
        data: publicCertificates,
        message: publicCertificates.length > 0 
          ? `${publicCertificates.length} certificado(s) encontrado(s)` 
          : 'Nenhum certificado encontrado'
      });

    } catch (error) {
      console.error('Erro ao buscar certificados:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obtém estatísticas dos certificados
   */
  async getStats(req: Request, res: Response) {
    try {
      const stats = await certificateRepository.getStats();
      
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de certificados:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Cria um novo certificado
   */
  async create(req: Request, res: Response) {
    try {
      const certificateData = req.body;
      
      // Validação básica
      if (!certificateData.document || !certificateData.license_code) {
        return res.status(400).json({
          success: false,
          message: 'Documento e código de licença são obrigatórios'
        });
      }

      // Verificar se já existe certificado com o mesmo código de licença
      const existingCertificate = await certificateRepository.findOne({
        licenseCode: certificateData.license_code
      } as any);

      if (existingCertificate) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um certificado com este código de licença'
        });
      }

      // Mapear dados para o formato da entidade
      const newCertificateData = {
        document: certificateData.document,
        licenseCode: certificateData.license_code,
        tvShowId: certificateData.tv_show_id,
        tvShowName: certificateData.tv_show_name,
        userId: certificateData.user_id,
        score: certificateData.score,
        path: certificateData.path,
        recreate: certificateData.recreate !== undefined ? certificateData.recreate : true,
        dateCreated: new Date(),
        lastUpdated: new Date()
      };

      const newCertificate = await certificateRepository.create(newCertificateData as any);

      return res.status(201).json({
        success: true,
        data: newCertificate,
        message: 'Certificado criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar certificado:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Atualiza um certificado existente
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const certificateData = req.body;

      // Verificar se o certificado existe
      const existingCertificate = await certificateRepository.findById(id);
      if (!existingCertificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificado não encontrado'
        });
      }

      // Verificar se está tentando atualizar para um código de licença já existente
      if (certificateData.license_code && certificateData.license_code !== existingCertificate.licenseCode) {
        const duplicateLicense = await certificateRepository.findOne({
          licenseCode: certificateData.license_code
        } as any);

        if (duplicateLicense && duplicateLicense.id !== existingCertificate.id) {
          return res.status(409).json({
            success: false,
            message: 'Já existe um certificado com este código de licença'
          });
        }
      }

      // Mapear dados para o formato da entidade
      const updateData = {
        document: certificateData.document,
        licenseCode: certificateData.license_code,
        tvShowId: certificateData.tv_show_id,
        tvShowName: certificateData.tv_show_name,
        userId: certificateData.user_id,
        score: certificateData.score,
        path: certificateData.path,
        recreate: certificateData.recreate !== undefined ? certificateData.recreate : existingCertificate.recreate,
        lastUpdated: new Date()
      };

      // Remover campos undefined
      Object.keys(updateData).forEach(key => 
        (updateData as any)[key] === undefined && delete (updateData as any)[key]
      );

      const updatedCertificate = await certificateRepository.update(id, updateData as any);

      return res.status(200).json({
        success: true,
        data: updatedCertificate,
        message: 'Certificado atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar certificado:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Exclui um certificado
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verificar se o certificado existe
      const existingCertificate = await certificateRepository.findById(id);
      if (!existingCertificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificado não encontrado'
        });
      }

      await certificateRepository.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Certificado excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir certificado:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}

export default new CertificateController();