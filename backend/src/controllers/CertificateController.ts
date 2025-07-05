import { Request, Response } from 'express';
import { CertificateRepository } from '../repositories/CertificateRepository';
import { Certificate } from '../entities/Certificate';
import { BaseController } from './BaseController';

const certificateRepository = new CertificateRepository();

class CertificateController extends BaseController<Certificate> {
  constructor() {
    super(certificateRepository);
  }

  /**
   * Busca pública de certificados por CPF (últimos 3 dígitos) ou código de licença
   */
  async searchPublic(req: Request, res: Response) {
    try {
      const { cpf_last_digits, license_code } = req.query;

      // Validação dos parâmetros
      if (!cpf_last_digits && !license_code) {
        return res.status(400).json({
          success: false,
          message: 'É necessário informar o código da licença ou os últimos 3 dígitos do CPF'
        });
      }

      // Validar formato dos últimos dígitos do CPF
      if (cpf_last_digits && !/^\d{3}$/.test(cpf_last_digits as string)) {
        return res.status(400).json({
          success: false,
          message: 'Os últimos dígitos do CPF devem conter exatamente 3 números'
        });
      }

      let whereClause = '';
      let params: any[] = [];

      if (license_code) {
        whereClause = 'license_code = ?';
        params = [license_code];
      } else if (cpf_last_digits) {
        whereClause = 'RIGHT(document, 3) = ?';
        params = [cpf_last_digits];
      }

      const certificates = await certificateRepository.findByCondition(whereClause, params);

      // Retornar apenas informações públicas dos certificados
      const publicCertificates = certificates.map((cert: Certificate) => ({
        id: cert.id,
        license_code: cert.license_code,
        document: cert.document,
        tv_show_name: cert.tv_show_name,
        score: cert.score,
        date_created: cert.date_created,
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
}

export default new CertificateController();