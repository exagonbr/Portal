import { CertificateRepository, Certificate } from '../repositories/CertificateRepository';
import { BaseController } from './BaseController';

const certificateRepository = new CertificateRepository();

class CertificateController extends BaseController<Certificate> {
  constructor() {
    super(certificateRepository);
  }
}

export default new CertificateController();