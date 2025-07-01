import knex from '../config/database';

export interface EmailTemplateDTO {
  id?: number;
  name: string;
  subject: string;
  html: string;
  text?: string;
  category?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface EmailTemplateFilters {
  category?: string;
  is_active?: boolean;
  search?: string;
}

export class EmailTemplateService {
  private static tableName = 'email_templates';

  /**
   * Buscar todos os templates com filtros opcionais
   */
  static async getAll(filters: EmailTemplateFilters = {}): Promise<EmailTemplateDTO[]> {
    try {
      let query = knex(this.tableName).select('*');

      // Aplicar filtros
      if (filters.category) {
        query = query.where('category', filters.category);
      }

      if (filters.is_active !== undefined) {
        query = query.where('is_active', filters.is_active);
      }

      if (filters.search) {
        query = query.where(function() {
          this.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('subject', 'ilike', `%${filters.search}%`);
        });
      }

      const templates = await query.orderBy('updated_at', 'desc');
      
      console.log(`✅ [EmailTemplateService] Encontrados ${templates.length} templates`);
      return templates;
    } catch (error) {
      console.log('❌ [EmailTemplateService] Erro ao buscar templates:', error);
      throw new Error('Erro ao buscar templates de email');
    }
  }

  /**
   * Buscar template por ID
   */
  static async getById(id: number): Promise<EmailTemplateDTO | null> {
    try {
      const template = await knex(this.tableName)
        .select('*')
        .where('id', id)
        .first();

      if (!template) {
        console.log(`⚠️ [EmailTemplateService] Template com ID ${id} não encontrado`);
        return null;
      }

      console.log(`✅ [EmailTemplateService] Template encontrado: ${template.name}`);
      return template;
    } catch (error) {
      console.log(`❌ [EmailTemplateService] Erro ao buscar template ${id}:`, error);
      throw new Error('Erro ao buscar template de email');
    }
  }

  /**
   * Buscar template por nome
   */
  static async getByName(name: string): Promise<EmailTemplateDTO | null> {
    try {
      const template = await knex(this.tableName)
        .select('*')
        .where('name', name)
        .where('is_active', true)
        .first();

      if (!template) {
        console.log(`⚠️ [EmailTemplateService] Template '${name}' não encontrado`);
        return null;
      }

      console.log(`✅ [EmailTemplateService] Template encontrado: ${template.name}`);
      return template;
    } catch (error) {
      console.log(`❌ [EmailTemplateService] Erro ao buscar template '${name}':`, error);
      throw new Error('Erro ao buscar template de email');
    }
  }

  /**
   * Criar novo template
   */
  static async create(data: EmailTemplateDTO): Promise<EmailTemplateDTO> {
    try {
      // Validações básicas
      if (!data.name || !data.subject || !data.html) {
        throw new Error('Nome, assunto e HTML são obrigatórios');
      }

      // Verificar se já existe template com mesmo nome
      const existing = await knex(this.tableName)
        .select('id')
        .where('name', data.name)
        .first();

      if (existing) {
        throw new Error(`Já existe um template com o nome '${data.name}'`);
      }

      const templateData = {
        name: data.name,
        subject: data.subject,
        html: data.html,
        text: data.text || null,
        category: data.category || 'general',
        is_active: data.is_active !== undefined ? data.is_active : true,
        created_at: new Date(),
        updated_at: new Date()
      };

      const [created] = await knex(this.tableName)
        .insert(templateData)
        .returning('*');

      console.log(`✅ [EmailTemplateService] Template criado: ${created.name}`);
      return created;
    } catch (error) {
      console.log('❌ [EmailTemplateService] Erro ao criar template:', error);
      throw error;
    }
  }

  /**
   * Atualizar template existente
   */
  static async update(id: number, data: Partial<EmailTemplateDTO>): Promise<EmailTemplateDTO> {
    try {
      // Verificar se template existe
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`Template com ID ${id} não encontrado`);
      }

      // Se está mudando o nome, verificar se não conflita
      if (data.name && data.name !== existing.name) {
        const nameExists = await knex(this.tableName)
          .select('id')
          .where('name', data.name)
          .where('id', '!=', id)
          .first();

        if (nameExists) {
          throw new Error(`Já existe um template com o nome '${data.name}'`);
        }
      }

      const updateData = {
        ...data,
        updated_at: new Date()
      };

      const [updated] = await knex(this.tableName)
        .where('id', id)
        .update(updateData)
        .returning('*');

      console.log(`✅ [EmailTemplateService] Template atualizado: ${updated.name}`);
      return updated;
    } catch (error) {
      console.log(`❌ [EmailTemplateService] Erro ao atualizar template ${id}:`, error);
      throw error;
    }
  }

  /**
   * Excluir template
   */
  static async delete(id: number): Promise<EmailTemplateDTO> {
    try {
      // Verificar se template existe
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`Template com ID ${id} não encontrado`);
      }

      const [deleted] = await knex(this.tableName)
        .where('id', id)
        .del()
        .returning('*');

      console.log(`✅ [EmailTemplateService] Template excluído: ${deleted.name}`);
      return deleted;
    } catch (error) {
      console.log(`❌ [EmailTemplateService] Erro ao excluir template ${id}:`, error);
      throw error;
    }
  }

  /**
   * Ativar/desativar template
   */
  static async toggleActive(id: number): Promise<EmailTemplateDTO> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`Template com ID ${id} não encontrado`);
      }

      return await this.update(id, { is_active: !existing.is_active });
    } catch (error) {
      console.log(`❌ [EmailTemplateService] Erro ao alterar status do template ${id}:`, error);
      throw error;
    }
  }

  /**
   * Buscar categorias disponíveis
   */
  static async getCategories(): Promise<string[]> {
    try {
      const result = await knex(this.tableName)
        .distinct('category')
        .whereNotNull('category')
        .orderBy('category');

      const categories = result.map(row => row.category);
      console.log(`✅ [EmailTemplateService] Encontradas ${categories.length} categorias`);
      return categories;
    } catch (error) {
      console.log('❌ [EmailTemplateService] Erro ao buscar categorias:', error);
      throw new Error('Erro ao buscar categorias');
    }
  }

  /**
   * Renderizar template com dados
   */
  static renderTemplate(template: EmailTemplateDTO, data: Record<string, any>): EmailTemplateDTO {
    const renderText = (text: string, data: Record<string, any>): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] !== undefined ? String(data[key]) : match;
      });
    };

    return {
      ...template,
      subject: renderText(template.subject, data),
      html: renderText(template.html, data),
      text: template.text ? renderText(template.text, data) : undefined
    };
  }
}
