import request from 'supertest';
import express from 'express';
import { usersCorsMiddleware, usersAdminCorsMiddleware, usersPublicCorsMiddleware } from '../middleware/corsUsers.middleware';

describe('CORS Users Middleware Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('usersCorsMiddleware', () => {
    beforeEach(() => {
      app.use('/test', usersCorsMiddleware);
      app.get('/test', (req, res) => {
        res.json({ success: true, message: 'Test endpoint' });
      });
    });

    it('should allow requests from localhost in development', async () => {
      process.env.NODE_ENV = 'development';
      
      const response = await request(app)
        .get('/test')
        .set('Origin', 'https://portal.sabercon.com.br')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('https://portal.sabercon.com.br');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should allow requests from configured origins', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'https://portal.sabercon.com.br')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('https://portal.sabercon.com.br');
    });

    it('should reject requests from unauthorized origins', async () => {
      process.env.NODE_ENV = 'production';
      
      const response = await request(app)
        .get('/test')
        .set('Origin', 'https://malicious-site.com')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('CORS_ORIGIN_NOT_ALLOWED');
    });

    it('should handle preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/test')
        .set('Origin', 'https://portal.sabercon.com.br')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Authorization')
        .expect(200);

      expect(response.headers['access-control-allow-methods']).toContain('GET');
      expect(response.headers['access-control-allow-headers']).toContain('Authorization');
    });

    it('should set security headers', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'https://portal.sabercon.com.br')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['x-api-version']).toBe('1.0');
      expect(response.headers['x-service']).toBe('users-api');
    });
  });

  describe('usersAdminCorsMiddleware', () => {
    beforeEach(() => {
      app.use('/admin-test', usersAdminCorsMiddleware);
      app.post('/admin-test', (req, res) => {
        res.json({ success: true, message: 'Admin endpoint' });
      });
    });

    it('should allow requests from admin origins', async () => {
      const response = await request(app)
        .post('/admin-test')
        .set('Origin', 'https://admin.sabercon.com.br')
        .send({ test: 'data' })
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('https://admin.sabercon.com.br');
      expect(response.headers['x-admin-api']).toBe('true');
      expect(response.headers['x-security-level']).toBe('high');
    });

    it('should reject requests from non-admin origins', async () => {
      process.env.NODE_ENV = 'production';
      
      const response = await request(app)
        .post('/admin-test')
        .set('Origin', 'https://regular-user-site.com')
        .send({ test: 'data' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('CORS_ADMIN_ACCESS_DENIED');
    });

    it('should set additional security headers for admin endpoints', async () => {
      const response = await request(app)
        .post('/admin-test')
        .set('Origin', 'https://portal.sabercon.com.br')
        .send({ test: 'data' })
        .expect(200);

      expect(response.headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
      expect(response.headers['x-admin-api']).toBe('true');
      expect(response.headers['x-security-level']).toBe('high');
    });
  });

  describe('usersPublicCorsMiddleware', () => {
    beforeEach(() => {
      app.use('/public-test', usersPublicCorsMiddleware);
      app.get('/public-test', (req, res) => {
        res.json({ success: true, message: 'Public endpoint' });
      });
    });

    it('should allow requests from any origin', async () => {
      const response = await request(app)
        .get('/public-test')
        .set('Origin', 'https://any-site.com')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['x-public-api']).toBe('true');
    });

    it('should not allow credentials for public endpoints', async () => {
      const response = await request(app)
        .get('/public-test')
        .set('Origin', 'https://any-site.com')
        .expect(200);

      expect(response.headers['access-control-allow-credentials']).toBeUndefined();
    });

    it('should only allow safe methods', async () => {
      const response = await request(app)
        .options('/public-test')
        .set('Origin', 'https://any-site.com')
        .set('Access-Control-Request-Method', 'GET')
        .expect(200);

      const allowedMethods = response.headers['access-control-allow-methods'];
      expect(allowedMethods).toContain('GET');
      expect(allowedMethods).toContain('OPTIONS');
      expect(allowedMethods).not.toContain('POST');
      expect(allowedMethods).not.toContain('DELETE');
    });
  });

  describe('Environment-based behavior', () => {
    it('should be more permissive in development', async () => {
      process.env.NODE_ENV = 'development';
      
      app.use('/env-test', usersCorsMiddleware);
      app.get('/env-test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/env-test')
        .set('Origin', 'http://localhost:9999')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:9999');
    });

    it('should be restrictive in production', async () => {
      process.env.NODE_ENV = 'production';
      
      app.use('/env-test', usersCorsMiddleware);
      app.get('/env-test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/env-test')
        .set('Origin', 'http://localhost:9999')
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Headers validation', () => {
    beforeEach(() => {
      app.use('/headers-test', usersCorsMiddleware);
      app.post('/headers-test', (req, res) => {
        res.json({ success: true });
      });
    });

    it('should allow standard headers', async () => {
      const response = await request(app)
        .options('/headers-test')
        .set('Origin', 'https://portal.sabercon.com.br')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type,Authorization')
        .expect(200);

      const allowedHeaders = response.headers['access-control-allow-headers'];
      expect(allowedHeaders).toContain('Content-Type');
      expect(allowedHeaders).toContain('Authorization');
    });

    it('should expose necessary response headers', async () => {
      const response = await request(app)
        .post('/headers-test')
        .set('Origin', 'https://portal.sabercon.com.br')
        .send({ test: 'data' })
        .expect(200);

      const exposedHeaders = response.headers['access-control-expose-headers'];
      expect(exposedHeaders).toContain('X-Total-Count');
      expect(exposedHeaders).toContain('X-Response-Time');
    });
  });

  afterEach(() => {
    // Reset environment
    delete process.env.NODE_ENV;
  });
});