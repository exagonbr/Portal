#!/usr/bin/env node

import { db } from '../database/index';
import { checkInstitutionsTable, testInstitutionService, fixCommonIssues as fixInstitutionsIssues } from './fix-institutions-error';
import { checkUnitsTable, testUnitController, fixCommonIssues as fixUnitsIssues } from './fix-units-error';
import { checkUsersTable, testUserService, fixCommonIssues as fixUsersIssues } from './fix-users-error';

interface ApiDiagnosticResult {
  name: string;
  tableOk: boolean;
  serviceOk: boolean;
  fixed: boolean;
  success: boolean;
}

async function runInstitutionsDiagnostic(): Promise<ApiDiagnosticResult> {
  console.log('🏢 === DIAGNÓSTICO DE INSTITUIÇÕES ===\n');
  
  try {
    const tableOk = await checkInstitutionsTable();
    if (!tableOk) {
      return { name: 'Institutions', tableOk: false, serviceOk: false, fixed: false, success: false };
    }

    let serviceOk = await testInstitutionService();
    let fixed = false;

    if (!serviceOk) {
      console.log('\n🔧 Tentando corrigir problemas de instituições...');
      fixed = await fixInstitutionsIssues();
      
      if (fixed) {
        console.log('\n🔄 Testando novamente após correções...');
        serviceOk = await testInstitutionService();
      }
    }

    return { 
      name: 'Institutions', 
      tableOk, 
      serviceOk, 
      fixed, 
      success: serviceOk 
    };

  } catch (error: any) {
    console.error('❌ Erro crítico no diagnóstico de instituições:', error.message);
    return { name: 'Institutions', tableOk: false, serviceOk: false, fixed: false, success: false };
  }
}

async function runUnitsDiagnostic(): Promise<ApiDiagnosticResult> {
  console.log('\n🏫 === DIAGNÓSTICO DE UNIDADES ===\n');
  
  try {
    const tableOk = await checkUnitsTable();
    if (!tableOk) {
      return { name: 'Units', tableOk: false, serviceOk: false, fixed: false, success: false };
    }

    let serviceOk = await testUnitService();
    let fixed = false;

    if (!serviceOk) {
      console.log('\n🔧 Tentando corrigir problemas de unidades...');
      fixed = await fixUnitsIssues();
      
      if (fixed) {
        console.log('\n🔄 Testando novamente após correções...');
        serviceOk = await testUnitService();
      }
    }

    return { 
      name: 'Units', 
      tableOk, 
      serviceOk, 
      fixed, 
      success: serviceOk 
    };

  } catch (error: any) {
    console.error('❌ Erro crítico no diagnóstico de unidades:', error.message);
    return { name: 'Units', tableOk: false, serviceOk: false, fixed: false, success: false };
  }
}

async function runUsersDiagnostic(): Promise<ApiDiagnosticResult> {
  console.log('\n👥 === DIAGNÓSTICO DE USUÁRIOS ===\n');
  
  try {
    const tableOk = await checkUsersTable();
    if (!tableOk) {
      return { name: 'Users', tableOk: false, serviceOk: false, fixed: false, success: false };
    }

    let serviceOk = await testUserService();
    let fixed = false;

    if (!serviceOk) {
      console.log('\n🔧 Tentando corrigir problemas de usuários...');
      fixed = await fixUsersIssues();
      
      if (fixed) {
        console.log('\n🔄 Testando novamente após correções...');
        serviceOk = await testUserService();
      }
    }

    return { 
      name: 'Users', 
      tableOk, 
      serviceOk, 
      fixed, 
      success: serviceOk 
    };

  } catch (error: any) {
    console.error('❌ Erro crítico no diagnóstico de usuários:', error.message);
    return { name: 'Users', tableOk: false, serviceOk: false, fixed: false, success: false };
  }
}

function printSummary(results: ApiDiagnosticResult[]) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO GERAL DO DIAGNÓSTICO');
  console.log('='.repeat(60));

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}:`);
    console.log(`   📋 Tabela: ${result.tableOk ? '✅' : '❌'}`);
    console.log(`   🔧 Serviço: ${result.serviceOk ? '✅' : '❌'}`);
    if (result.fixed) {
      console.log(`   🛠️ Correções aplicadas: ✅`);
    }
    console.log('');
  });

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`📈 Taxa de sucesso: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  
  if (successCount === totalCount) {
    console.log('🎉 Todas as APIs estão funcionando corretamente!');
  } else {
    console.log('⚠️ Algumas APIs precisam de atenção adicional.');
  }
}

async function main(): Promise<void> {
  console.log('🚀 DIAGNÓSTICO COMPLETO DAS APIS DO SISTEMA\n');
  console.log('Este script irá verificar e corrigir problemas nas seguintes APIs:');
  console.log('- 🏢 Institutions (Instituições)');
  console.log('- 🏫 Units (Unidades)');
  console.log('- 👥 Users (Usuários)');
  console.log('\n' + '='.repeat(60) + '\n');

  const results: ApiDiagnosticResult[] = [];

  try {
    // Executar diagnósticos em sequência
    results.push(await runInstitutionsDiagnostic());
    results.push(await runUnitsDiagnostic());
    results.push(await runUsersDiagnostic());

    // Mostrar resumo final
    printSummary(results);

  } catch (error: any) {
    console.error('\n❌ Erro crítico durante o diagnóstico:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

export { runInstitutionsDiagnostic, runUnitsDiagnostic, runUsersDiagnostic }; 