#!/usr/bin/env node

import { InstitutionService } from '../services/InstitutionService';
import { AppDataSource } from '../config/typeorm.config';
import { Institution } from '../entities/Institution';

async function main() {
  try {
    console.log('🔄 Iniciando correção de instituições...');
    
    // Inicializar conexão com o banco de dados
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    console.log('✅ Conexão com o banco de dados estabelecida');
    
    // Criar instância do serviço
    const institutionService = new InstitutionService();
    
    // Buscar todas as instituições
    console.log('🔍 Buscando instituições...');
    const result = await institutionService.findInstitutionsWithFilters({
      page: 1,
      limit: 1000
    });
    
    if (result) {
      console.log(`📊 Encontradas ${result.institutions?.length || 0} instituições`);
      
      // Verificar se há instituições para processar
      if (result.institutions && result.institutions.length > 0) {
        console.log('🔧 Processando instituições...');
        
        result.institutions.forEach((inst: any, index: number) => {
          console.log(`📝 Processando instituição ${index + 1}/${result.institutions.length}: ${inst.name}`);
          
          // Aqui você pode adicionar a lógica para corrigir problemas específicos nas instituições
          // Por exemplo:
          // - Corrigir campos vazios
          // - Padronizar formatos
          // - Atualizar relacionamentos
        });
        
        console.log('✅ Processamento concluído');
      } else {
        console.log('⚠️ Nenhuma instituição encontrada para processar');
      }
    } else {
      console.log('❌ InstitutionService retornou erro');
    }
    
    // Fechar conexão com o banco de dados
    await AppDataSource.destroy();
    console.log('👋 Conexão com o banco de dados encerrada');
    
  } catch (error) {
    console.error('❌ Erro durante a execução:', error);
  }
}

main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}); 