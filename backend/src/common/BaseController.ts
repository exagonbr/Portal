import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse, PaginationParams, PaginationResult } from '../types/common';
import { Logger } from '../utils/Logger';

export abstract class BaseController {
  protected logger: Logger;

  constructor(controllerName: string) {
    this.logger = new Logger(controllerName);
  }

  /**
   * Valida os dados da requisição usando express-validator
   */
  protected validateRequest(req: Request): string[] | null {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errors.array().map(error => error.msg);
    }
    return null;
  }

  /**
   * Resposta de sucesso padronizada
   */
  protected success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200,
    pagination?: PaginationResult
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      pagination
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Resposta de erro padronizada
   */
  protected error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: string[]
  ): Response {
    const response: ApiResponse<null> = {
      success: false,
      message,
      errors
    };

    this.logger.error(`Error ${statusCode}: ${message}`, { errors });
    return res.status(statusCode).json(response);
  }

  /**
   * Resposta de erro de validação
   */
  protected validationError(res: Response, errors: string[]): Response {
    return this.error(res, 'Validation failed', 400, errors);
  }

  /**
   * Resposta de não encontrado
   */
  protected notFound(res: Response, resource: string): Response {
    return this.error(res, `${resource} not found`, 404);
  }

  /**
   * Resposta de não autorizado
   */
  protected unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, message, 401);
  }

  /**
   * Resposta de conflito
   */
  protected conflict(res: Response, message: string): Response {
    return this.error(res, message, 409);
  }

  /**
   * Extrai parâmetros de paginação da query string
   */
  protected getPaginationParams(req: Request): PaginationParams {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  /**
   * Wrapper para tratamento de erros assíncronos
   */
  protected asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: Function) => {
      Promise.resolve(fn(req, res, next)).catch((error: Error) => {
        this.logger.error('Unhandled error in controller', error);
        this.error(res, 'Internal server error');
      });
    };
  }

  /**
   * Valida se o ID é válido (UUID)
   */
  protected validateId(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Extrai o ID do usuário autenticado
   */
  protected getUserId(req: Request): string | null {
    return (req.user as any)?.userId || null;
  }

  /**
   * Verifica se o usuário está autenticado
   */
  protected isAuthenticated(req: Request): boolean {
    return !!(req.user as any)?.userId;
  }

  /**
   * Remove campos sensíveis de um objeto
   */
  protected sanitizeUser<T extends Record<string, any>>(user: T): Omit<T, 'password'> {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Remove campos sensíveis de um array de usuários
   */
  protected sanitizeUsers<T extends Record<string, any>>(users: T[]): Omit<T, 'password'>[] {
    return users.map(user => this.sanitizeUser(user));
  }
}