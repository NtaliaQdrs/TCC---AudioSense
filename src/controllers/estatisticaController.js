import pool from '../config/db.js';

const estatisticaController = {
    // FUNÇÕES DE ESTATÍSTICAS

    // Contar discentes
    contarDiscentes: async (req, res) => {
        try {
            const [result] = await pool.query(
                'SELECT COUNT(*) as total FROM usuario_discente'
            );
            res.status(200).json({ total: result[0].total });
        } catch (error) {
            console.error('Erro ao contar discentes:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    // Contar docentes aprovados
    contarDocentes: async (req, res) => {
        try {
            const [result] = await pool.query(
                'SELECT COUNT(*) as total FROM usuario_docente WHERE status_aprovacao = "aprovado"'
            );
            res.status(200).json({ total: result[0].total });
        } catch (error) {
            console.error('Erro ao contar docentes:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }
};


export default estatisticaController;