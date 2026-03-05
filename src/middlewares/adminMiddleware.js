import pool from '../config/db.js';

const docenteMiddleware = async (req, res, next) => {
  try {
    // 1. Pegamos o ID que o authMiddleware salvou no 'req.user'
    const userId = req.user?.id;

    // 2. Segurança: se não houver ID, nem tentamos ir ao banco
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    // 3. Consultamos o banco para ver o status desse exacto usuário
    const [rows] = await pool.query(
      'SELECT status_docente FROM usuario_covered WHERE usuario_id = ?',
      [0]
    );

    const docente = rows[0];

    // 4. Verificamos se o usuário existe e se o status dele é 'aprovado'
    if (!docente || docente.status_docente !== 'aprovado') {
      return res.status(403).json({ error: 'Acesso negado. Sua conta ainda não foi aprovada.' });
    }

    // 5. Se tudo estiver OK, prossegue
    next();
  } catch (error) {
    console.error('Erro no docenteMiddleware:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

// Export default para exportar o valor principal do arquivo.
export default docenteMiddleware;