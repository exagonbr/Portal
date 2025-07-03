import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface DumpParserOptions {
  dumpDirectory: string;
  defaultInstitutionId?: string;
  defaultBucket?: string;
}

export class DumpParser {
  private dumpDir: string;
  private defaultInstitutionId: string;
  private defaultBucket: string;

  constructor(options: DumpParserOptions) {
    this.dumpDir = options.dumpDirectory;
    this.defaultInstitutionId = options.defaultInstitutionId || '';
    this.defaultBucket = options.defaultBucket || 'portal-educacional';
  }

  // Método auxiliar para extrair dados SQL de INSERT statements
  private extractInsertData(sqlContent: string, tableName: string): any[] {
    const results: any[] = [];
    
    // Primeiro, extrair a definição das colunas
    const createTableMatch = sqlContent.match(new RegExp(`CREATE TABLE \`${tableName}\`[^;]+;`, 's'));
    let columns: string[] = [];
    
    if (createTableMatch) {
      const tableDefinition = createTableMatch[0];
      const columnMatches = tableDefinition.match(/\s+\`([^`]+)\`\s+[^,\n]+/g);
      if (columnMatches) {
        columns = columnMatches.map(match => {
          const columnMatch = match.match(/\`([^`]+)\`/);
          return columnMatch ? columnMatch[1] : '';
        }).filter(col => col && col !== 'PRIMARY' && col !== 'KEY');
      }
    }

    // Se não encontrou colunas na definição, tentar extrair do INSERT
    if (columns.length === 0) {
      // Procurar por INSERT INTO com lista de colunas
      const insertWithColumnsMatch = sqlContent.match(new RegExp(`INSERT INTO \`${tableName}\`\\s*\\(([^)]+)\\)\\s+VALUES`, 'i'));
      if (insertWithColumnsMatch) {
        columns = insertWithColumnsMatch[1]
          .replace(/`/g, '')
          .split(',')
          .map(col => col.trim())
          .filter(col => col);
      }
    }

    // Se ainda não encontrou, usar colunas padrão baseado na tabela
    if (columns.length === 0) {
      columns = this.getDefaultColumns(tableName);
    }

    // Extrair os dados dos INSERTs
    const insertPattern = new RegExp(`INSERT INTO \`${tableName}\`[^V]*VALUES\\s*([^;]+);`, 'gs');
    let insertMatch;

    while ((insertMatch = insertPattern.exec(sqlContent)) !== null) {
      const valuesString = insertMatch[1].trim();
      
      // Parse das linhas de valores
      const valueRows = this.parseSQLValuesImproved(valuesString);
      
      valueRows.forEach(values => {
        if (values.length > 0) {
          const row: any = {};
          columns.forEach((col, index) => {
            if (index < values.length) {
              row[col] = this.convertSQLValue(values[index]);
            }
          });
          results.push(row);
        }
      });
    }

    return results;
  }

  // Método melhorado para parsear valores SQL
  private parseSQLValuesImproved(valuesString: string): any[][] {
    const rows: any[][] = [];
    let currentPos = 0;
    
    while (currentPos < valuesString.length) {
      // Pular espaços e pular para o próximo '('
      while (currentPos < valuesString.length && valuesString[currentPos] !== '(') {
        currentPos++;
      }
      
      if (currentPos >= valuesString.length) break;
      
      // Encontrar o ')' correspondente
      let parenCount = 0;
      let startPos = currentPos;
      let endPos = currentPos;
      
      for (let i = currentPos; i < valuesString.length; i++) {
        if (valuesString[i] === '(') parenCount++;
        if (valuesString[i] === ')') parenCount--;
        
        if (parenCount === 0) {
          endPos = i;
          break;
        }
      }
      
      if (parenCount === 0) {
        // Extrair valores entre parênteses
        const rowString = valuesString.substring(startPos + 1, endPos);
        const values = this.parseRowValues(rowString);
        if (values.length > 0) {
          rows.push(values);
        }
      }
      
      currentPos = endPos + 1;
    }
    
    return rows;
  }

  // Parse de valores de uma linha específica
  private parseRowValues(rowString: string): any[] {
    const values: any[] = [];
    let currentValue = '';
    let inQuotes = false;
    let quoteChar = '';
    let i = 0;
    
    while (i < rowString.length) {
      const char = rowString[i];
      
      if (!inQuotes) {
        if (char === "'" || char === '"') {
          inQuotes = true;
          quoteChar = char;
          currentValue += char;
        } else if (char === ',') {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      } else {
        currentValue += char;
        if (char === quoteChar) {
          // Verificar se é escape
          if (i + 1 < rowString.length && rowString[i + 1] === quoteChar) {
            // É escape, pular o próximo
            i++;
            currentValue += quoteChar;
          } else {
            // Fim da string
            inQuotes = false;
            quoteChar = '';
          }
        }
      }
      
      i++;
    }
    
    // Adicionar último valor
    if (currentValue.trim()) {
      values.push(currentValue.trim());
    }
    
    return values;
  }

  // Converter valores SQL para tipos apropriados
  private convertSQLValue(value: string): any {
    const trimmed = value.trim();
    
    if (trimmed === 'NULL') return null;
    if (trimmed === "_binary '\\0'" || trimmed === "b'0'") return false;
    if (trimmed === "_binary ''" || trimmed === "b'1'") return true;
    
    // Remover aspas externas
    if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || 
        (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      let stringValue = trimmed.slice(1, -1);
      // Desfazer escapes
      stringValue = stringValue.replace(/''/g, "'").replace(/\\'/g, "'");
      return stringValue;
    }
    
    // Tentar converter para número
    if (/^\d+$/.test(trimmed)) return parseInt(trimmed);
    if (/^\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
    
    return trimmed;
  }

  // Colunas padrão para tabelas conhecidas
  private getDefaultColumns(tableName: string): string[] {
    const defaultColumns: { [key: string]: string[] } = {
      'tv_show': ['id', 'api_id', 'imdb_id', 'tmdb_id', 'poster_path', 'first_air_date', 'date_created', 'deleted', 'air_date', 'backdrop_path', 'last_updated', 'is_active', 'vote_count', 'external_link', 'name', 'homepage', 'overview', 'popularity', 'vote_average', 'original_language', 'producer', 'original_name', 'video_url', 'total_load'],
      'user': ['id', 'account_expired', 'account_locked', 'address', 'certificate_path', 'date_created', 'deleted', 'email', 'enabled', 'full_name', 'invitation_sent', 'language', 'last_updated', 'password', 'phone', 'reset_password', 'type', 'username', 'uuid', 'is_admin', 'is_manager'],
      'file': ['id', 'content_type', 'date_created', 'extension', 'is_default', 'is_subtitled', 'label', 'last_updated', 'local_file', 'name', 'original_filename', 'quality', 'sha256hex', 'size', 'subtitle_label', 'subtitle_src_lang', 'external_link'],
      'author': ['id', 'date_created', 'description', 'email', 'is_active', 'last_updated', 'name'],
      'video': ['id', 'api_id', 'imdb_id', 'poster_path', 'date_created', 'deleted', 'last_updated', 'vote_count', 'title', 'homepage', 'overview', 'popularity', 'vote_average', 'intro_start', 'intro_end', 'outro_start'],
      'institution': ['id', 'name', 'code', 'description', 'email', 'phone', 'website', 'address', 'city', 'state', 'zip_code']
    };
    
    return defaultColumns[tableName] || ['id', 'name'];
  }

  // Parse TV Shows
  async parseTvShows(): Promise<any[]> {
    const filePath = path.join(this.dumpDir, 'sabercon_tv_show.sql');
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf8');
    const rawData = this.extractInsertData(content, 'tv_show');
    
    return rawData.map(row => ({
      id: uuidv4(),
      legacy_id: row.id,
      title: row.name || '',
      synopsis: row.overview ? row.overview.substring(0, 500) : null,
      description: row.overview || null,
      cover_image_url: row.poster_path || null,
      banner_image_url: row.backdrop_path || null,
      trailer_url: null,
      total_episodes: 0, // será calculado depois
      total_seasons: 1,
      total_duration: 0, // será calculado depois
      release_date: row.first_air_date ? new Date(row.first_air_date) : null,
      genre: null, // será mapeado das tabelas de relacionamento
      target_audience: null,
      content_rating: null,
      created_by: null,
      institution_id: this.defaultInstitutionId,
      education_cycle: null,
      subjects: [],
      authors: [],
      tags: [],
      language: row.original_language || 'pt-BR',
      difficulty_level: 'basic',
      is_public: true,
      is_premium: false,
      is_featured: false,
      status: row.deleted ? 'archived' : 'published',
      views_count: 0,
      likes_count: 0,
      favorites_count: 0,
      rating_average: row.vote_average || 0,
      rating_count: row.vote_count || 0,
      production_info: {
        producer: row.producer || null,
        api_id: row.api_id,
        imdb_id: row.imdb_id,
        popularity: row.popularity
      },
      technical_specs: {
        total_load: row.total_load
      },
      created_at: row.date_created ? new Date(row.date_created) : new Date(),
      updated_at: row.last_updated ? new Date(row.last_updated) : new Date()
    }));
  }

  // Parse Videos
  async parseVideos(): Promise<any[]> {
    const filePath = path.join(this.dumpDir, 'sabercon_video.sql');
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf8');
    const rawData = this.extractInsertData(content, 'video');
    
    return rawData.map(row => ({
      id: uuidv4(),
      legacy_id: row.id,
      name: row.title || `Video ${row.id}`,
      description: row.overview || null,
      video_url: '', // será preenchido com dados dos arquivos
      thumbnail_url: row.poster_path || null,
      duration: 0, // será calculado dos arquivos
      quality: 'HD',
      format: 'mp4',
      file_size: null,
      resolution: null,
      module_id: null,
      collection_id: null,
      created_by: null,
      education_cycle: null,
      authors: [],
      tags: [],
      subject: null,
      difficulty_level: 'basic',
      is_public: true,
      is_premium: false,
      status: row.deleted ? 'archived' : 'published',
      views_count: 0,
      likes_count: 0,
      rating_average: row.vote_average || 0,
      rating_count: row.vote_count || 0,
      intro_start: row.intro_start,
      intro_end: row.intro_end,
      outro_start: row.outro_start,
      created_at: row.date_created ? new Date(row.date_created) : new Date(),
      updated_at: row.last_updated ? new Date(row.last_updated) : new Date()
    }));
  }

  // Parse Users
  async parseUsers(): Promise<any[]> {
    const filePath = path.join(this.dumpDir, 'sabercon_user.sql');
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf8');
    const rawData = this.extractInsertData(content, 'user');
    
    return rawData.map(row => ({
      id: uuidv4(),
      legacy_id: row.id,
      email: row.email,
      name: row.full_name,
      username: row.username || row.email,
      password: row.password || '$2b$12$defaulthash', // será resetado
      phone: row.phone || null,
      address: row.address || null,
      language: row.language || 'pt-BR',
      is_admin: row.is_admin || false,
      is_manager: row.is_manager || false,
      account_expired: row.account_expired || false,
      account_locked: row.account_locked || false,
      enabled: row.enabled !== false,
      invitation_sent: row.invitation_sent || false,
      reset_password: row.reset_password !== false,
      uuid: row.uuid,
      certificate_path: row.certificate_path,
      type: row.type,
      deleted: row.deleted || false,
      created_at: row.date_created ? new Date(row.date_created) : new Date(),
      updated_at: row.last_updated ? new Date(row.last_updated) : new Date()
    }));
  }

  // Parse Files
  async parseFiles(): Promise<any[]> {
    const filePath = path.join(this.dumpDir, 'sabercon_file.sql');
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf8');
    const rawData = this.extractInsertData(content, 'file');
    
    return rawData.map(row => ({
      id: uuidv4(),
      legacy_id: row.id,
      name: row.name || row.original_filename || `file_${row.id}`,
      original_name: row.original_filename || row.name || `file_${row.id}`,
      type: row.content_type || 'application/octet-stream',
      size: row.size || 0,
      size_formatted: this.formatFileSize(row.size || 0),
      bucket: this.defaultBucket,
      s3_key: row.local_file || `${row.id}`,
      s3_url: row.external_link || `https://${this.defaultBucket}.s3.amazonaws.com/${row.local_file || row.id}`,
      description: row.label || null,
      category: this.determineCategoryFromType(row.content_type || ''),
      metadata: {
        quality: row.quality,
        extension: row.extension,
        is_default: row.is_default,
        subtitle_label: row.subtitle_label,
        subtitle_src_lang: row.subtitle_src_lang,
        is_subtitled: row.is_subtitled
      },
      checksum: row.sha256hex || null,
      uploaded_by: null,
      is_active: true,
      tags: [],
      created_at: row.date_created ? new Date(row.date_created) : new Date(),
      updated_at: row.last_updated ? new Date(row.last_updated) : new Date()
    }));
  }

  // Parse Authors
  async parseAuthors(): Promise<any[]> {
    const filePath = path.join(this.dumpDir, 'sabercon_author.sql');
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf8');
    const rawData = this.extractInsertData(content, 'author');
    
    return rawData.map(row => ({
      id: uuidv4(),
      legacy_id: row.id,
      name: row.name,
      email: row.email || null,
      bio: row.description || null,
      avatar_url: null,
      website: null,
      social_links: {},
      specialization: null,
      type: 'internal',
      is_active: row.is_active !== false,
      created_at: new Date(),
      updated_at: new Date()
    }));
  }

  // Parse relacionamentos
  async parseGenres(): Promise<any[]> {
    const filePath = path.join(this.dumpDir, 'sabercon_genre.sql');
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf8');
    return this.extractInsertData(content, 'genre');
  }

  async parseTvShowGenres(): Promise<any[]> {
    const filePath = path.join(this.dumpDir, 'sabercon_genre_tv_show.sql');
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf8');
    return this.extractInsertData(content, 'genre_tv_show');
  }

  async parseTvShowAuthors(): Promise<any[]> {
    const filePath = path.join(this.dumpDir, 'sabercon_tv_show_author.sql');
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf8');
    return this.extractInsertData(content, 'tv_show_author');
  }

  async parseVideoAuthors(): Promise<any[]> {
    const filePath = path.join(this.dumpDir, 'sabercon_video_author.sql');
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf8');
    return this.extractInsertData(content, 'video_author');
  }

  async parseVideoFiles(): Promise<any[]> {
    const filePath = path.join(this.dumpDir, 'sabercon_video_file.sql');
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf8');
    return this.extractInsertData(content, 'video_file');
  }

  async parseInstitutions(): Promise<any[]> {
    const filePath = path.join(this.dumpDir, 'sabercon_institution.sql');
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf8');
    const rawData = this.extractInsertData(content, 'institution');
    
    return rawData.map(row => ({
      id: uuidv4(),
      legacy_id: row.id,
      name: row.name,
      code: row.code || `INST_${row.id}`,
      type: 'PUBLIC',
      description: row.description || null,
      email: row.email || null,
      phone: row.phone || null,
      website: row.website || null,
      address: row.address || null,
      city: row.city || null,
      state: row.state || null,
      zip_code: row.zip_code || null,
      logo_url: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }));
  }

  // Métodos auxiliares
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private determineCategoryFromType(contentType: string): string {
    if (contentType.startsWith('video/')) return 'video';
    if (contentType.startsWith('image/')) return 'image';
    if (contentType.includes('pdf') || contentType.includes('document')) return 'document';
    return 'document';
  }

  // Método principal para processar todos os dados
  async parseAll(): Promise<{
    tvShows: any[];
    videos: any[];
    users: any[];
    files: any[];
    authors: any[];
    genres: any[];
    institutions: any[];
    relationships: {
      tvShowGenres: any[];
      tvShowAuthors: any[];
      videoAuthors: any[];
      videoFiles: any[];
    };
  }> {
    console.log('Iniciando parse completo do dump...');
    
    const [
      tvShows,
      videos,
      users,
      files,
      authors,
      genres,
      institutions,
      tvShowGenres,
      tvShowAuthors,
      videoAuthors,
      videoFiles
    ] = await Promise.all([
      this.parseTvShows(),
      this.parseVideos(),
      this.parseUsers(),
      this.parseFiles(),
      this.parseAuthors(),
      this.parseGenres(),
      this.parseInstitutions(),
      this.parseTvShowGenres(),
      this.parseTvShowAuthors(),
      this.parseVideoAuthors(),
      this.parseVideoFiles()
    ]);

    console.log(`Parse concluído:
      - TV Shows: ${tvShows.length}
      - Videos: ${videos.length}
      - Users: ${users.length}
      - Files: ${files.length}
      - Authors: ${authors.length}
      - Genres: ${genres.length}
      - Institutions: ${institutions.length}
      - Relacionamentos: ${tvShowGenres.length + tvShowAuthors.length + videoAuthors.length + videoFiles.length}
    `);

    return {
      tvShows,
      videos,
      users,
      files,
      authors,
      genres,
      institutions,
      relationships: {
        tvShowGenres,
        tvShowAuthors,
        videoAuthors,
        videoFiles
      }
    };
  }
} 