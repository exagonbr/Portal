import express from 'express';

const router = express.Router();

// Exemplo de uma rota de sessão
router.post('/login', (req, res) => {
  res.json({ message: 'Login bem-sucedido' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout bem-sucedido' });
});

export default router;