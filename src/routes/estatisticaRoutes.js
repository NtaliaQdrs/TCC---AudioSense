import express from 'express';
import estatisticaController from '../controllers/estatisticaController.js'; // Verifique se o caminho está correto

const router = express.Router();

// URL: /api/estatisticas/discentes
router.get('/discentes', estatisticaController.contarDiscentes);

// URL: /api/estatisticas/docentes
router.get('/docentes', estatisticaController.contarDocentes);

export default router;
