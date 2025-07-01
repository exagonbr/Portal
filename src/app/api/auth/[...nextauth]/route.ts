// NextAuth desabilitado - usando sistema de autenticação customizado
// Esta rota foi desabilitada para evitar conflitos com o AuthContext customizado

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'NextAuth foi desabilitado. Use o sistema de autenticação customizado.' },
    { status: 404 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'NextAuth foi desabilitado. Use o sistema de autenticação customizado.' },
    { status: 404 }
  );
}