// Importa o pool de conexões do banco, provavelmente vai precisar ser feito um middlewere para docente também, para verificar se é docente aprovado ou não, e liberar acesso a certas rotas, como criar material, ver materiais, etc. E o admin pode aprovar ou negar docentes, e ver os docentes pendentes de aprovação. O admin também pode acessar um painel de controle para gerenciar o sistema, como ver estatísticas, gerenciar usuários, etc. O painel de controle do admin pode ser uma página separada no frontend, que só é acessível para admins. O middleware de admin vai verificar se o usuário é um admin antes de permitir o acesso a essas rotas ou páginas.
import pool from '../config/db.js';

// Cria o middleware para verificar se é admin
const adminMiddleware = async (req, res, next) => {
  try {
    // Pega o userId que foi anexado pelo authMiddleware
    const { userId } = req;

    // Verifica se o userId existe
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    // Busca o usuário no banco para verificar se é admin
    const [users] = await pool.query(
      'SELECT is_admin FROM usuario_docente WHERE usuario_id = ?',
      [userId]
    );

    // Verifica se o usuário existe
    if (users.length === 0) {
      return res.status(403).json({ error: 'Usuário não é um docente.' });
    }

    const user = users[0];

    // Verifica se é admin (is_admin = 1 ou true)
    if (user.is_admin !== 1 && user.is_admin !== true) {
      return res.status(403).json({ error: 'Acesso negado. Requer permissão de administrador.' });
    }

    // Se for admin, chama o próximo middleware ou controller
    next();

  } catch (error) {
    console.error('Erro no middleware de admin:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

export default adminMiddleware;
