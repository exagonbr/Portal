/**
 * Classe base para erros personalizados da aplicação
 */
export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Mantém o stack trace
    Error.captureStackTrace(this, this.constructor);
    
    // Define o nome da classe do erro
    this.name = this.constructor.name;
  }
}

/**
 * Erro de validação (400)
 */
export class ValidationError extends AppError {
  public readonly errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Erro de autenticação (401)
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Token inválido ou expirado') {
    super(message, 401);
  }
}

/**
 * Erro de autorização/permissão (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') {
    super(message, 403);
  }
}

/**
 * Erro de recurso não encontrado (404)
 */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado') {
    super(message, 404);
  }
}

/**
 * Erro de conflito/duplicação (409)
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflito nos dados') {
    super(message, 409);
  }
}

/**
 * Erro de dados inválidos (422)
 */
export class UnprocessableEntityError extends AppError {
  public readonly errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * Erro interno do servidor (500)
 */
export class InternalServerError extends AppError {
  constructor(message = 'Erro interno do servidor') {
    super(message, 500);
  }
}

/**
 * Erro de serviço indisponível (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Serviço temporariamente indisponível') {
    super(message, 503);
  }
}

/**
 * Verifica se um erro é operacional (esperado)
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Obtém o código de status HTTP de um erro
 */
export function getErrorStatusCode(error: Error): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  return 500; // Internal Server Error como padrão
}

/**
 * Formata erro para resposta da API
 */
export function formatErrorResponse(error: Error) {
  const statusCode = getErrorStatusCode(error);
  
  const response: any = {
    success: false,
    message: error.message,
    timestamp: new Date().toISOString(),
    statusCode
  };

  // Adicionar detalhes específicos para erros de validação
  if (error instanceof ValidationError || error instanceof UnprocessableEntityError) {
    response.errors = error.errors;
  }

  // Em ambiente de desenvolvimento, incluir stack trace
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  return response;
} 