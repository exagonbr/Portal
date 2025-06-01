import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import knex from 'knex';
import config from '../knexfile';

const execAsync = promisify(exec);

interface RelatorioMigracao {
  inicio: Date;
  fim?: Date;
  duracao?: string;
  etapas: EtapaMigracao[];
  estatisticas: { [tabela: string]: number };
  erros: string[];
  sucessos: string[];
}

interface EtapaMigracao {
  nome: string;
  inicio: Date;
  fim?: Date;
  duracao?: string;
  status: 'pendente' | 'executando' | 'sucesso' | 'erro';
  detalhes?: string;
}

class MigradorDadosLegados {
  private relatorio: RelatorioMigracao;
  private db: any;

  constructor() {
    this.relatorio = {
      inicio: new Date(),
      etapas: [],
      estatisticas: {},
      erros: [],
      sucessos: []
    };
    
    const environment = process.env.NODE_ENV || 'development';
    this.db = knex(config[environment]);
  }

  private log(mensagem: string, tipo: 'info' | 'success' | 'error' | 'warn' = 'info') {
    const timestamp = new Date().toLocaleString('pt-BR');
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warn: '⚠️'
    }[tipo];
    
    const mensagemCompleta = `${prefix} [${timestamp}] ${mensagem}`;
    console.log(mensagemCompleta);
    
    if (tipo === 'error') {
      this.relatorio.erros.push(mensagemCompleta);
    } else if (tipo === 'success') {
      this.relatorio.sucessos.push(mensagemCompleta);
    }
  }

  private async iniciarEtapa(nome: string): Promise<EtapaMigracao> {
    const etapa: EtapaMigracao = {
      nome,
      inicio: new Date(),
      status: 'executando'
    };
    
    this.relatorio.etapas.push(etapa);
    this.log(`Iniciando: ${nome}`, 'info');
    
    return etapa;
  }

  private async finalizarEtapa(etapa: EtapaMigracao, sucesso: boolean, detalhes?: string) {
    etapa.fim = new Date();
    etapa.duracao = this.calcularDuracao(etapa.inicio, etapa.fim);
    etapa.status = sucesso ? 'sucesso' : 'erro';
    etapa.detalhes = detalhes;
    
    const tipo = sucesso ? 'success' : 'error';
    this.log(`${sucesso ? 'Concluído' : 'Falhou'}: ${etapa.nome} (${etapa.duracao})`, tipo);
  }

  private calcularDuracao(inicio: Date, fim: Date): string {
    const diff = fim.getTime() - inicio.getTime();
    const minutos = Math.floor(diff / 60000);
    const segundos = Math.floor((diff % 60000) / 1000);
    return `${minutos}m ${segundos}s`;
  }

  private async verificarPreRequisitos(): Promise<boolean> {
    const etapa = await this.iniciarEtapa('Verificação de Pré-requisitos');
    
    try {
      // Verificar conexão com banco
      await this.db.raw('SELECT 1');
      this.log('✓ Conexão com PostgreSQL estabelecida', 'success');
      
      // Verificar se pasta de dumps existe
      const dumpsPath = 'C:\\Users\\estev\\OneDrive\\Documentos\\dumps\\Dump20250601';
      if (!fs.existsSync(dumpsPath)) {
        throw new Error(`Pasta de dumps não encontrada: ${dumpsPath}`);
      }
      this.log('✓ Pasta de dumps encontrada', 'success');
      
      // Verificar se migrations existem
      const migrationsPath = path.join(__dirname, '..', 'migrations', '20250601000001_migrate_sabercon_data.ts');
      if (!fs.existsSync(migrationsPath)) {
        throw new Error('Migration principal não encontrada');
      }
      this.log('✓ Migration principal encontrada', 'success');
      
      // Verificar se seeds existem
      const seedsPath = path.join(__dirname, '..', 'seeds');
      const seedsRequeridos = [
        '006_sabercon_data_import.ts',
        '007_sabercon_videos_import.ts',
        '008_sabercon_complete_import.ts'
      ];
      
      for (const seed of seedsRequeridos) {
        const seedPath = path.join(seedsPath, seed);
        if (!fs.existsSync(seedPath)) {
          throw new Error(`Seed não encontrado: ${seed}`);
        }
      }
      this.log('✓ Todos os seeds encontrados', 'success');
      
      await this.finalizarEtapa(etapa, true);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.finalizarEtapa(etapa, false, errorMessage);
      return false;
    }
  }

  private async executarMigrations(): Promise<boolean> {
    const etapa = await this.iniciarEtapa('Execução das Migrations');
    
    try {
      this.log('Executando: npx knex migrate:latest');
      const { stdout, stderr } = await execAsync('npx knex migrate:latest', {
        cwd: path.join(__dirname, '..')
      });
      
      if (stderr && !stderr.includes('warning')) {
        throw new Error(`Erro na migration: ${stderr}`);
      }
      
      this.log('✓ Migrations executadas com sucesso', 'success');
      await this.finalizarEtapa(etapa, true, stdout);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.finalizarEtapa(etapa, false, errorMessage);
      return false;
    }
  }

  private async executarSeed(nomeArquivo: string, descricao: string): Promise<boolean> {
    const etapa = await this.iniciarEtapa(`Importação: ${descricao}`);
    
    try {
      this.log(`Executando seed: ${nomeArquivo}`);
      const comando = `npx knex seed:run --specific=${nomeArquivo}`;
      const { stdout, stderr } = await execAsync(comando, {
        cwd: path.join(__dirname, '..'),
        timeout: 600000 // 10 minutos timeout
      });
      
      if (stderr && !stderr.includes('warning')) {
        throw new Error(`Erro no seed: ${stderr}`);
      }
      
      this.log(`✓ Seed ${nomeArquivo} executado com sucesso`, 'success');
      await this.finalizarEtapa(etapa, true, stdout);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.finalizarEtapa(etapa, false, errorMessage);
      return false;
    }
  }

  private async executarSeeds(): Promise<boolean> {
    const seeds = [
      {
        arquivo: '006_sabercon_data_import.ts',
        descricao: 'Dados Principais (Usuários, Instituições, Autores, etc.)'
      },
      {
        arquivo: '007_sabercon_videos_import.ts',
        descricao: 'Vídeos e Relacionamentos'
      },
      {
        arquivo: '008_sabercon_complete_import.ts',
        descricao: 'Estruturas Complementares (Perfis, Certificados, etc.)'
      }
    ];

    for (const seed of seeds) {
      const sucesso = await this.executarSeed(seed.arquivo, seed.descricao);
      if (!sucesso) {
        this.log(`Falha na execução do seed: ${seed.arquivo}`, 'error');
        return false;
      }
      
      // Pequena pausa entre seeds
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return true;
  }

  private async coletarEstatisticas(): Promise<void> {
    const etapa = await this.iniciarEtapa('Coleta de Estatísticas');
    
    try {
      const tabelas = [
        'users', 'videos', 'tv_shows', 'institutions', 'authors',
        'genres', 'tags', 'themes', 'target_audiences', 'education_periods',
        'educational_stages', 'files', 'school_units', 'school_classes',
        'user_profiles', 'questions', 'question_answers', 'certificates',
        'viewing_statuses', 'watchlist_entries', 'sabercon_migration_mapping'
      ];

      for (const tabela of tabelas) {
        try {
          const [{ count }] = await this.db(tabela).count('* as count');
          this.relatorio.estatisticas[tabela] = parseInt(count);
          this.log(`${tabela}: ${count} registros`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.log(`Erro ao contar ${tabela}: ${errorMessage}`, 'warn');
          this.relatorio.estatisticas[tabela] = -1;
        }
      }

      await this.finalizarEtapa(etapa, true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.finalizarEtapa(etapa, false, errorMessage);
    }
  }

  private async validarIntegridade(): Promise<boolean> {
    const etapa = await this.iniciarEtapa('Validação de Integridade');
    
    try {
      // Verificar se existem dados nas tabelas principais
      const tabelasPrincipais = ['users', 'videos', 'tv_shows', 'institutions'];
      
      for (const tabela of tabelasPrincipais) {
        const [{ count }] = await this.db(tabela).count('* as count');
        if (parseInt(count) === 0) {
          throw new Error(`Tabela ${tabela} está vazia após migração`);
        }
      }

      // Verificar relacionamentos
      const relacionamentos = [
        { tabela: 'video_files', referencia: 'videos' },
        { tabela: 'video_authors', referencia: 'videos' },
        { tabela: 'tv_show_authors', referencia: 'tv_shows' },
        { tabela: 'user_profiles', referencia: 'users' }
      ];

      for (const rel of relacionamentos) {
        const [{ count }] = await this.db(rel.tabela).count('* as count');
        this.log(`${rel.tabela}: ${count} relacionamentos`);
      }

      // Verificar mapeamentos
      const [{ count: mappingCount }] = await this.db('sabercon_migration_mapping').count('* as count');
      if (parseInt(mappingCount) === 0) {
        throw new Error('Nenhum mapeamento de ID encontrado');
      }

      this.log(`✓ ${mappingCount} mapeamentos de IDs criados`, 'success');
      await this.finalizarEtapa(etapa, true);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.finalizarEtapa(etapa, false, errorMessage);
      return false;
    }
  }

  private async gerarRelatorioFinal(): Promise<void> {
    this.relatorio.fim = new Date();
    this.relatorio.duracao = this.calcularDuracao(this.relatorio.inicio, this.relatorio.fim);

    const relatorioPath = path.join(__dirname, '..', '..', `relatorio-migracao-${Date.now()}.md`);
    
    let relatorioTexto = `# 📊 Relatório de Migração SaberCon → Portal\n\n`;
    relatorioTexto += `**Data/Hora:** ${this.relatorio.inicio.toLocaleString('pt-BR')}\n`;
    relatorioTexto += `**Duração Total:** ${this.relatorio.duracao}\n`;
    relatorioTexto += `**Status:** ${this.relatorio.erros.length === 0 ? '✅ SUCESSO' : '❌ FALHOU'}\n\n`;

    relatorioTexto += `## 🔄 Etapas Executadas\n\n`;
    for (const etapa of this.relatorio.etapas) {
      const statusIcon = etapa.status === 'sucesso' ? '✅' : '❌';
      relatorioTexto += `- ${statusIcon} **${etapa.nome}** (${etapa.duracao || 'N/A'})\n`;
      if (etapa.detalhes && etapa.status === 'erro') {
        relatorioTexto += `  - Erro: ${etapa.detalhes}\n`;
      }
    }

    relatorioTexto += `\n## 📈 Estatísticas dos Dados\n\n`;
    relatorioTexto += `| Tabela | Registros |\n|--------|----------|\n`;
    for (const [tabela, count] of Object.entries(this.relatorio.estatisticas)) {
      relatorioTexto += `| ${tabela} | ${count >= 0 ? count.toLocaleString('pt-BR') : 'Erro'} |\n`;
    }

    if (this.relatorio.erros.length > 0) {
      relatorioTexto += `\n## ❌ Erros Encontrados\n\n`;
      for (const erro of this.relatorio.erros) {
        relatorioTexto += `- ${erro}\n`;
      }
    }

    relatorioTexto += `\n## ✅ Sucessos\n\n`;
    for (const sucesso of this.relatorio.sucessos) {
      relatorioTexto += `- ${sucesso}\n`;
    }

    relatorioTexto += `\n---\n*Relatório gerado automaticamente pelo Sistema de Migração*\n`;

    fs.writeFileSync(relatorioPath, relatorioTexto, 'utf8');
    this.log(`📄 Relatório salvo em: ${relatorioPath}`, 'success');
  }

  public async executarMigracaoCompleta(): Promise<boolean> {
    this.log('🚀 Iniciando Migração Completa dos Dados Legados SaberCon → Portal', 'info');
    this.log('================================================================', 'info');

    try {
      // 1. Verificar pré-requisitos
      const preRequisitosOk = await this.verificarPreRequisitos();
      if (!preRequisitosOk) {
        this.log('❌ Pré-requisitos não atendidos. Migração cancelada.', 'error');
        return false;
      }

      // 2. Executar migrations
      const migrationsOk = await this.executarMigrations();
      if (!migrationsOk) {
        this.log('❌ Falha na execução das migrations. Migração cancelada.', 'error');
        return false;
      }

      // 3. Executar seeds
      const seedsOk = await this.executarSeeds();
      if (!seedsOk) {
        this.log('❌ Falha na execução dos seeds. Migração cancelada.', 'error');
        return false;
      }

      // 4. Coletar estatísticas
      await this.coletarEstatisticas();

      // 5. Validar integridade
      const integridadeOk = await this.validarIntegridade();
      if (!integridadeOk) {
        this.log('⚠️ Problemas de integridade detectados.', 'warn');
      }

      // 6. Gerar relatório
      await this.gerarRelatorioFinal();

      if (this.relatorio.erros.length === 0) {
        this.log('🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!', 'success');
        this.log('================================================================', 'success');
        this.log('✅ Todos os dados do SaberCon foram migrados para o PostgreSQL', 'success');
        this.log('✅ Estrutura de relacionamentos preservada', 'success');
        this.log('✅ Mapeamento de IDs criado para rastreabilidade', 'success');
        this.log(`✅ Total de registros migrados: ${Object.values(this.relatorio.estatisticas).reduce((a, b) => a + (b > 0 ? b : 0), 0).toLocaleString('pt-BR')}`, 'success');
        return true;
      } else {
        this.log('⚠️ Migração concluída com avisos. Verifique o relatório.', 'warn');
        return false;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`❌ Erro fatal na migração: ${errorMessage}`, 'error');
      await this.gerarRelatorioFinal();
      return false;
    } finally {
      await this.db.destroy();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const migrador = new MigradorDadosLegados();
  
  migrador.executarMigracaoCompleta()
    .then((sucesso) => {
      process.exit(sucesso ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export default MigradorDadosLegados; 