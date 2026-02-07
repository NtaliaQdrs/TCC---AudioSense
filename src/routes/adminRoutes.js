import { Router } from 'express';
import adminController from '../controllers/adminController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import docenteMiddleware from '../middlewares/docenteMiddleware.js';

// Cria o objeto router
const router = new Router();

// ============================================
// ROTAS DE APROVAÇÃO DE CADASTRO DE DOCENTES
// ============================================

// Listar docentes pendentes (apenas admin)
router.get('/docentes-pendentes', authMiddleware, adminMiddleware, adminController.docentesPendentes);

// Aprovar ou rejeitar cadastro de docente (apenas admin)
router.put('/aprovar-docente/:id', authMiddleware, adminMiddleware, adminController.aprovarDocente);

// ============================================
// ROTAS DE APROVAÇÃO DE SOLICITAÇÕES DE ADMIN
// ============================================

// Docente solicita ser administrador
router.post('/solicitar-admin', authMiddleware, docenteMiddleware, adminController.solicitarAdministrador);

// Listar solicitações de admin pendentes (apenas admin)
router.get('/solicitacoes-admin-pendentes', authMiddleware, adminMiddleware, adminController.listarSolicitacoesAdminPendentes);

// Listar todas as solicitações de admin (apenas admin)
router.get('/todas-solicitacoes-admin', authMiddleware, adminMiddleware, adminController.listarTodasSolicitacoesAdmin);

// Aprovar solicitação de administrador (apenas admin)
router.post('/aprovar-solicitacao-admin/:solicitacaoId', authMiddleware, adminMiddleware, adminController.aprovarSolicitacaoAdmin);

// Rejeitar solicitação de administrador (apenas admin)
router.post('/rejeitar-solicitacao-admin/:solicitacaoId', authMiddleware, adminMiddleware, adminController.rejeitarSolicitacaoAdmin);



export default router;