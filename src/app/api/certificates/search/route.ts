import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portal.sabercon.com.br/api';

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

    // Construir URL com parâmetros de busca
    const params = new URLSearchParams();
    
    if (licenseCode) {
      params.set('license_code', licenseCode);
    }
    
    if (cpfLastDigits) {
      params.set('cpf_last_digits', cpfLastDigits);
    }

    // Buscar certificados no backend
    const response = await fetch(`${API_BASE_URL}/api/certificates/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Retornar apenas informações públicas dos certificados
    const publicCertificates = data.data?.map((cert: any) => ({
      id: cert.id,
      license_code: cert.license_code,
      document: cert.document,
      tv_show_name: cert.tv_show_name,
      score: cert.score,
      date_created: cert.date_created,
      path: cert.path,
      user: {
        id: cert.user?.id,
        full_name: cert.user?.full_name,
        email: cert.user?.email
      }
    })) || [];

    return NextResponse.json({
      success: true,
      data: publicCertificates,
      message: publicCertificates.length > 0 
        ? `${publicCertificates.length} certificado(s) encontrado(s)` 
        : 'Nenhum certificado encontrado'
    });

  } catch (error) {
    console.log('Erro ao buscar certificados:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao buscar certificados',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}