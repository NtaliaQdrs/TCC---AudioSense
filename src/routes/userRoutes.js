// Importa o Router para poder criar rotas, o controller e o middleware necessário
import { Router } from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import docenteMiddleware from '../middlewares/docenteMiddleware.js';

// Cria o objeto router com a configuração padrão do express
const router = new Router();

// Rotas públicas (sem autenticação)
router.post('/cadastro-discente', userController.cadastroDiscente);
router.post('/cadastro-docente', userController.cadastroDocente);
router.post('/login', userController.login);

// Rotas privadas (precisa de login)
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.delete('/profile', authMiddleware, userController.deleteProfile);
router.get('/status-admin', authMiddleware, userController.getStatusAdmin); 

// Rotas de docente (precisa ser docente APROVADO), coisas a adicionar
router.get('/meus-materiais', authMiddleware, docenteMiddleware, userController.meusMateriais);
router.post('/criar-material', authMiddleware, docenteMiddleware, userController.criarMaterial);

// Rotas de admin (precisa ser administrador), coisas a adicionar
router.put('/aprovar-docente/:id', authMiddleware, adminMiddleware, userController.aprovarDocente);
router.get('/docentes-pendentes', authMiddleware, adminMiddleware, userController.docentesPendentes);

export default router;
