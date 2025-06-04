import { Request, Response } from 'express';
import { getRedisClient } from '../config/redis';

class CacheController {
  /**
   * Define um valor no cache do Redis
   * @route POST /api/cache/set
   */
  public async set(req: Request, res: Response): Promise<void> {
    try {
      const { key, value, ttl = 300 } = req.body;

      if (!key || value === undefined) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos. "key" e "value" são obrigatórios'
        });
        return;
      }

      const redis = getRedisClient();
      await redis.set(key, JSON.stringify(value), 'EX', ttl);

      res.json({
        success: true,
        message: 'Valor definido com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao definir valor no cache:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao definir valor no cache',
        error: error.message
      });
    }
  }

  /**
   * Obtém um valor do cache do Redis
   * @route GET /api/cache/get
   */
  public async get(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.query;

      if (!key) {
        res.status(400).json({
          success: false,
          message: 'Parâmetro "key" é obrigatório'
        });
        return;
      }

      const redis = getRedisClient();
      const value = await redis.get(key as string);

      res.json({
        success: true,
        data: {
          exists: value !== null,
          value: value ? JSON.parse(value) : null
        }
      });
    } catch (error: any) {
      console.error('Erro ao obter valor do cache:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter valor do cache',
        error: error.message
      });
    }
  }

  /**
   * Remove um valor do cache do Redis
   * @route DELETE /api/cache/delete
   */
  public async delete(req: Request, res: Response): Promise<void> {
    try {
      // Aceita a chave tanto do body quanto do query param
      const key = req.body.key || req.query.key;

      if (!key) {
        res.status(400).json({
          success: false,
          message: 'Parâmetro "key" é obrigatório'
        });
        return;
      }

      const redis = getRedisClient();
      await redis.del(key as string);

      res.json({
        success: true,
        message: 'Valor removido com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao remover valor do cache:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao remover valor do cache',
        error: error.message
      });
    }
  }

  /**
   * Limpa todo o cache ou com padrão específico
   * @route POST /api/cache/clear
   */
  public async clear(req: Request, res: Response): Promise<void> {
    try {
      const { pattern = '*' } = req.body;
      const redis = getRedisClient();

      // Usa SCAN para encontrar chaves com o padrão e as remove
      let cursor = '0';
      let keysDeleted = 0;

      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100
        );

        cursor = nextCursor;

        if (keys.length > 0) {
          await redis.del(...keys);
          keysDeleted += keys.length;
        }
      } while (cursor !== '0');

      res.json({
        success: true,
        message: `Cache limpo com sucesso. ${keysDeleted} chaves removidas.`
      });
    } catch (error: any) {
      console.error('Erro ao limpar cache:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao limpar cache',
        error: error.message
      });
    }
  }

  /**
   * Obtém estatísticas do cache
   * @route GET /api/cache/stats
   */
  public async getStats(req: Request, res: Response): Promise<void> {
    try {
      const redis = getRedisClient();
      const info = await redis.info();
      const dbSize = await redis.dbsize();

      res.json({
        success: true,
        data: {
          keys: dbSize,
          info
        }
      });
    } catch (error: any) {
      console.error('Erro ao obter estatísticas do cache:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter estatísticas do cache',
        error: error.message
      });
    }
  }
}

export default new CacheController(); 