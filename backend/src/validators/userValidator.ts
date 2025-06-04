
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valida email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida UUID
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valida telefone
 */
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
}

/**
 * Valida dados para criação de usuário
 */
export function validateCreateUser(data: any): ValidationResult {
  const errors: string[] = [];

  // Nome obrigatório
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Nome é obrigatório');
  } else if (data.name.length < 2 || data.name.length > 100) {
    errors.push('Nome deve ter entre 2 e 100 caracteres');
  }

  // Email obrigatório e válido
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email é obrigatório');
  } else if (!isValidEmail(data.email)) {
    errors.push('Email deve ter um formato válido');
  } else if (data.email.length > 255) {
    errors.push('Email deve ter no máximo 255 caracteres');
  }

  // Senha obrigatória
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Senha é obrigatória');
  } else if (data.password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }

  // Role ID obrigatório
  if (!data.role_id || typeof data.role_id !== 'string') {
    errors.push('Role ID é obrigatório');
  } else if (!isValidUUID(data.role_id)) {
    errors.push('Role ID deve ser um UUID válido');
  }

  // Institution ID obrigatório
  if (!data.institution_id || typeof data.institution_id !== 'string') {
    errors.push('Institution ID é obrigatório');
  } else if (!isValidUUID(data.institution_id)) {
    errors.push('Institution ID deve ser um UUID válido');
  }

  // Telefone opcional, mas se fornecido deve ser válido
  if (data.phone !== undefined && data.phone !== null && data.phone !== '') {
    if (typeof data.phone !== 'string') {
      errors.push('Telefone deve ser uma string');
    } else if (!isValidPhone(data.phone)) {
      errors.push('Telefone deve conter apenas números, espaços, hífens e parênteses');
    }
  }

  // is_active opcional, mas se fornecido deve ser boolean
  if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
    errors.push('is_active deve ser true ou false');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida dados para atualização de usuário
 */
export function validateUpdateUser(data: any): ValidationResult {
  const errors: string[] = [];

  // Nome opcional, mas se fornecido deve ser válido
  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.push('Nome deve ser uma string');
    } else if (data.name.length < 2 || data.name.length > 100) {
      errors.push('Nome deve ter entre 2 e 100 caracteres');
    }
  }

  // Email opcional, mas se fornecido deve ser válido
  if (data.email !== undefined) {
    if (typeof data.email !== 'string') {
      errors.push('Email deve ser uma string');
    } else if (!isValidEmail(data.email)) {
      errors.push('Email deve ter um formato válido');
    } else if (data.email.length > 255) {
      errors.push('Email deve ter no máximo 255 caracteres');
    }
  }

  // Senha opcional, mas se fornecida deve ser válida
  if (data.password !== undefined) {
    if (typeof data.password !== 'string') {
      errors.push('Senha deve ser uma string');
    } else if (data.password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }
  }

  // Role ID opcional, mas se fornecido deve ser válido
  if (data.role_id !== undefined) {
    if (typeof data.role_id !== 'string') {
      errors.push('Role ID deve ser uma string');
    } else if (!isValidUUID(data.role_id)) {
      errors.push('Role ID deve ser um UUID válido');
    }
  }

  // Institution ID opcional, mas se fornecido deve ser válido
  if (data.institution_id !== undefined) {
    if (typeof data.institution_id !== 'string') {
      errors.push('Institution ID deve ser uma string');
    } else if (!isValidUUID(data.institution_id)) {
      errors.push('Institution ID deve ser um UUID válido');
    }
  }

  // Telefone opcional, mas se fornecido deve ser válido
  if (data.phone !== undefined && data.phone !== null && data.phone !== '') {
    if (typeof data.phone !== 'string') {
      errors.push('Telefone deve ser uma string');
    } else if (!isValidPhone(data.phone)) {
      errors.push('Telefone deve conter apenas números, espaços, hífens e parênteses');
    }
  }

  // is_active opcional, mas se fornecido deve ser boolean
  if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
    errors.push('is_active deve ser true ou false');
  }

  // status opcional, mas se fornecido deve ser válido
  if (data.status !== undefined) {
    if (!['active', 'inactive', 'blocked'].includes(data.status)) {
      errors.push('Status deve ser: active, inactive ou blocked');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida filtros de usuários
 */
export function validateUserFilters(query: any): ValidationResult {
  const errors: string[] = [];

  // Validar page
  if (query.page !== undefined) {
    const page = parseInt(query.page);
    if (isNaN(page) || page < 1) {
      errors.push('Página deve ser um número inteiro maior que 0');
    }
  }

  // Validar limit
  if (query.limit !== undefined) {
    const limit = parseInt(query.limit);
    if (isNaN(limit) || limit < 5 || limit > 100) {
      errors.push('Limite deve ser um número entre 5 e 100');
    }
  }

  // Validar sortBy
  if (query.sortBy !== undefined) {
    const validSortFields = ['name', 'email', 'created_at', 'updated_at'];
    if (!validSortFields.includes(query.sortBy)) {
      errors.push('Ordenação deve ser por: name, email, created_at ou updated_at');
    }
  }

  // Validar sortOrder
  if (query.sortOrder !== undefined) {
    if (!['asc', 'desc'].includes(query.sortOrder)) {
      errors.push('Ordem deve ser: asc ou desc');
    }
  }

  // Validar institution_id se fornecido
  if (query.institution_id !== undefined && query.institution_id !== '') {
    if (!isValidUUID(query.institution_id)) {
      errors.push('Institution ID deve ser um UUID válido');
    }
  }

  // Validar status se fornecido
  if (query.status !== undefined && query.status !== '') {
    if (!['active', 'inactive', 'blocked'].includes(query.status)) {
      errors.push('Status deve ser: active, inactive ou blocked');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 