// Importa o pool de conexões do banco
import pool from '../config/db.js';

// Middleware para verificar se o usuário é um docente aprovado
const docenteMiddleware = async (req, res, next) => {
  try {
    // Pega o userId que foi anexado pelo authMiddleware
    const { userId } = req;

    // Verifica se o userId existe
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    // Busca o status do docente
    const [rows] = await pool.query(
      'SELECT status_docente FROM usuario_docente WHERE usuario_id = ?',
      [userId]
    );

    // Se não encontrou ou não é aprovado, nega acesso
    if (rows.length === 0 || rows[0].status_docente !== 'aprovado') {
      return res.status(403).json({ error: 'Docente não aprovado. Aguarde a aprovação do administrador.' });
    }

    // Se for aprovado, deixa passar
    next();

  } catch (error) {
    console.error('Erro no middleware de docente:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

export default docenteMiddleware;
