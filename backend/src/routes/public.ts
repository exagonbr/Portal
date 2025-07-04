import express from 'express';

const router = express.Router();

// Exemplo de uma rota pública
router.get('/', (req, res) => {
  res.json({ message: 'API Pública' });
});

export default router;