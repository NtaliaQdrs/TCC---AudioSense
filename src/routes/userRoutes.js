// Importa o Router para poder criar rotas, o controller e o middleware necessário
import { Router } from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';


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


export default router;
