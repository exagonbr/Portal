import { NextRequest, NextResponse } from 'next/server';

// Simulação de dados de certificados (em produção, viria do banco de dados)
const MOCK_CERTIFICATES = [
  {
    id: '1',
    license_code: 'CERT-2024-001',
    document: '123.456.789-01',
    tv_show_name: 'Curso de JavaScript Avançado',
    score: 95,
    date_created: '2024-01-15T10:30:00Z',
    path: '/certificates/cert-001.pdf',
    user: {
      id: '1',
      full_name: 'João Silva Santos',
      email: 'joao.silva@email.com'
    }
  },
  {
    id: '2',
    license_code: 'CERT-2024-002',
    document: '987.654.321-09',
    tv_show_name: 'Curso de React e Next.js',
    score: 88,
    date_created: '2024-01-20T14:15:00Z',
    path: '/certificates/cert-002.pdf',
    user: {
      id: '2',
      full_name: 'Maria Oliveira Costa',
      email: 'maria.oliveira@email.com'
    }
  },
  {
    id: '3',
    license_code: 'CERT-2024-003',
    document: '456.789.123-45',
    tv_show_name: 'Curso de Python para Data Science',
    score: 92,
    date_created: '2024-01-25T09:45:00Z',
    path: '/certificates/cert-003.pdf',
    user: {
      id: '3',
      full_name: 'Pedro Henrique Lima',
      email: 'pedro.lima@email.com'
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parâmetros de busca
    const licenseCode = searchParams.get('license_code');
    const cpfLastDigits = searchParams.get('cpf_last_digits');
    
    if (!licenseCode && !cpfLastDigits) {
      return NextResponse.json(
        {
          success: false,
          message: 'É necessário informar o número da licença ou os últimos 3 dígitos do CPF'
        },
        { status: 400 }
      );
    }

    // Validar formato dos últimos dígitos do CPF
    if (cpfLastDigits && !/^\d{3}$/.test(cpfLastDigits)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Os últimos dígitos do CPF devem conter exatamente 3 números'
        },
        { status: 400 }
      );
    }

    console.log(`🔍 [CERTIFICATES] Buscando certificados - License: ${licenseCode}, CPF: ${cpfLastDigits}`);

    // Filtrar certificados baseado nos critérios de busca
    let filteredCertificates = MOCK_CERTIFICATES;

    if (licenseCode) {
      filteredCertificates = filteredCertificates.filter(cert =>
        cert.license_code.toLowerCase().includes(licenseCode.toLowerCase())
      );
    }

    if (cpfLastDigits) {
      filteredCertificates = filteredCertificates.filter(cert =>
        cert.document.replace(/\D/g, '').endsWith(cpfLastDigits)
      );
    }

    // Retornar apenas informações públicas dos certificados
    const publicCertificates = filteredCertificates.map(cert => ({
      id: cert.id,
      license_code: cert.license_code,
      document: cert.document.replace(/(\d{3})\.\d{3}\.(\d{3})-(\d{2})/, '$1.***.***-$3'), // Mascarar CPF
      tv_show_name: cert.tv_show_name,
      score: cert.score,
      date_created: cert.date_created,
      path: cert.path,
      user: {
        id: cert.user.id,
        full_name: cert.user.full_name,
        email: cert.user.email.replace(/(.{2}).*(@.*)/, '$1***$2') // Mascarar email
      }
    }));

    console.log(`✅ [CERTIFICATES] Encontrados ${publicCertificates.length} certificados`);

    return NextResponse.json({
      success: true,
      data: publicCertificates,
      message: publicCertificates.length > 0
        ? `${publicCertificates.length} certificado(s) encontrado(s)`
        : 'Nenhum certificado encontrado',
      meta: {
        total: publicCertificates.length,
        searchCriteria: {
          license_code: licenseCode,
          cpf_last_digits: cpfLastDigits
        }
      }
    });

  } catch (error) {
    console.error('❌ [CERTIFICATES] Erro ao buscar certificados:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno ao buscar certificados',
        code: 'SEARCH_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {
      success: true,
      message: 'API de busca de certificados ativa',
      methods: ['GET', 'OPTIONS'],
      timestamp: new Date().toISOString()
    }
  );
}