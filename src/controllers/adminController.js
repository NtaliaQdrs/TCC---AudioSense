// Importa o pool de conexões do banco
import pool from '../config/db.js';

const adminController = {

    // ============================================
    // APROVAÇÃO DE CADASTRO DE DOCENTES
    // ============================================

    // Listar docentes pendentes de aprovação
    docentesPendentes: async (req, res) => {
        try {
            const [docentes] = await pool.query(
                `SELECT 
                    ud.usuario_id,
                    u.nome_completo,
                    u.email,
                    ud.status_aprovacao,
                    ud.data_cadastro,
                    GROUP_CONCAT(d.nome SEPARATOR ', ') as disciplinas
                FROM usuario_docente ud
                JOIN usuario u ON ud.usuario_id = u.id
                LEFT JOIN docente_disciplina dd ON ud.usuario_id = dd.docente_id
                LEFT JOIN disciplina d ON dd.disciplina_id = d.id
                WHERE ud.status_aprovacao = 'pendente'
                GROUP BY ud.usuario_id
                ORDER BY ud.data_cadastro DESC`
            );

            res.status(200).json(docentes);

        } catch (error) {
            console.error('Erro ao listar docentes pendentes:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    // Aprovar ou rejeitar cadastro de docente
    aprovarDocente: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, motivo_rejeicao } = req.body;
            const { userId: adminId } = req;

            // Validação
            if (!status || !['aprovado', 'rejeitado'].includes(status)) {
                return res.status(400).json({ error: 'Status inválido. Use "aprovado" ou "rejeitado".' });
            }

            if (status === 'rejeitado' && !motivo_rejeicao) {
                return res.status(400).json({ error: 'Motivo da rejeição é obrigatório.' });
            }

            // Verificar se o docente existe
            const [docente] = await pool.query(
                'SELECT * FROM usuario_docente WHERE usuario_id = ?',
                [id]
            );

            if (docente.length === 0) {
                return res.status(404).json({ error: 'Docente não encontrado.' });
            }

            // Atualizar status
            if (status === 'aprovado') {
                await pool.query(
                    'UPDATE usuario_docente SET status_aprovacao = ?, data_decisao = NOW() WHERE usuario_id = ?',
                    ['aprovado', id]
                );
            } else {
                await pool.query(
                    'UPDATE usuario_docente SET status_aprovacao = ?, motivo_rejeicao = ?, data_decisao = NOW() WHERE usuario_id = ?',
                    ['rejeitado', motivo_rejeicao, id]
                );
            }

            res.status(200).json({
                message: `Docente ${status === 'aprovado' ? 'aprovado' : 'rejeitado'} com sucesso!`
            });

        } catch (error) {
            console.error('Erro ao aprovar docente:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    // ============================================
    // APROVAÇÃO DE SOLICITAÇÕES DE ADMINISTRADOR
    // ============================================

    // Docente solicita ser administrador
    solicitarAdministrador: async (req, res) => {
        try {
            const { userId } = req;

            // Verificar se o usuário é docente aprovado
            const [docente] = await pool.query(
                'SELECT * FROM usuario_docente WHERE usuario_id = ? AND status_aprovacao = "aprovado"',
                [userId]
            );

            if (docente.length === 0) {
                return res.status(403).json({ error: 'Apenas docentes aprovados podem solicitar acesso de administrador.' });
            }

            // Verificar se já tem uma solicitação pendente
            const [solicitacaoExistente] = await pool.query(
                'SELECT id FROM solicitacao_admin WHERE usuario_docente_id = ? AND status = "pendente"',
                [userId]
            );

            if (solicitacaoExistente.length > 0) {
                return res.status(409).json({ error: 'Você já tem uma solicitação pendente.' });
            }

            // Criar solicitação
            await pool.query(
                'INSERT INTO solicitacao_admin (usuario_docente_id, status, data_solicitacao) VALUES (?, ?, NOW())',
                [userId, 'pendente']
            );

            res.status(201).json({
                message: 'Solicitação de administrador enviada com sucesso!'
            });

        } catch (error) {
            console.error('Erro ao solicitar administrador:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    // Listar solicitações de admin pendentes
    listarSolicitacoesAdminPendentes: async (req, res) => {
        try {
            const [solicitacoes] = await pool.query(
                `SELECT 
                    sa.id,
                    sa.usuario_docente_id,
                    u.nome_completo,
                    u.email,
                    ud.status_aprovacao,
                    sa.status,
                    sa.data_solicitacao,
                    GROUP_CONCAT(d.nome SEPARATOR ', ') as disciplinas
                FROM solicitacao_admin sa
                JOIN usuario_docente ud ON sa.usuario_docente_id = ud.usuario_id
                JOIN usuario u ON ud.usuario_id = u.id
                LEFT JOIN docente_disciplina dd ON ud.usuario_id = dd.docente_id
                LEFT JOIN disciplina d ON dd.disciplina_id = d.id
                WHERE sa.status = 'pendente'
                GROUP BY sa.id
                ORDER BY sa.data_solicitacao DESC`
            );

            res.status(200).json(solicitacoes);

        } catch (error) {
            console.error('Erro ao listar solicitações de admin:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    // Listar todas as solicitações de admin
    listarTodasSolicitacoesAdmin: async (req, res) => {
        try {
            const [solicitacoes] = await pool.query(
                `SELECT 
                    sa.id,
                    sa.usuario_docente_id,
                    u.nome_completo,
                    u.email,
                    ud.status_aprovacao,
                    sa.status,
                    sa.data_solicitacao,
                    sa.data_decisao,
                    sa.motivo_rejeicao,
                    GROUP_CONCAT(d.nome SEPARATOR ', ') as disciplinas
                FROM solicitacao_admin sa
                JOIN usuario_docente ud ON sa.usuario_docente_id = ud.usuario_id
                JOIN usuario u ON ud.usuario_id = u.id
                LEFT JOIN docente_disciplina dd ON ud.usuario_id = dd.docente_id
                LEFT JOIN disciplina d ON dd.disciplina_id = d.id
                GROUP BY sa.id
                ORDER BY sa.data_solicitacao DESC`
            );

            res.status(200).json(solicitacoes);

        } catch (error) {
            console.error('Erro ao listar todas as solicitações de admin:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    // Aprovar solicitação de administrador
    aprovarSolicitacaoAdmin: async (req, res) => {
        try {
            const { solicitacaoId } = req.params;
            const { userId: adminId } = req;

            // Verificar se a solicitação existe
            const [solicitacao] = await pool.query(
                'SELECT * FROM solicitacao_admin WHERE id = ?',
                [solicitacaoId]
            );

            if (solicitacao.length === 0) {
                return res.status(404).json({ error: 'Solicitação não encontrada.' });
            }

            const usuarioDocenteId = solicitacao[0].usuario_docente_id;

            // Atualizar status da solicitação
            await pool.query(
                'UPDATE solicitacao_admin SET status = ?, admin_aprovador_id = ?, data_decisao = NOW() WHERE id = ?',
                ['aprovado', adminId, solicitacaoId]
            );

            // Atualizar is_admin do docente
            await pool.query(
                'UPDATE usuario_docente SET is_admin = 1 WHERE usuario_id = ?',
                [usuarioDocenteId]
            );

            res.status(200).json({
                message: 'Solicitação de administrador aprovada com sucesso!'
            });

        } catch (error) {
            console.error('Erro ao aprovar solicitação de admin:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    // Rejeitar solicitação de administrador
    rejeitarSolicitacaoAdmin: async (req, res) => {
        try {
            const { solicitacaoId } = req.params;
            const { motivo_rejeicao } = req.body;
            const { userId: adminId } = req;

            if (!motivo_rejeicao) {
                return res.status(400).json({ error: 'Motivo da rejeição é obrigatório.' });
            }

            // Verificar se a solicitação existe
            const [solicitacao] = await pool.query(
                'SELECT * FROM solicitacao_admin WHERE id = ?',
                [solicitacaoId]
            );

            if (solicitacao.length === 0) {
                return res.status(404).json({ error: 'Solicitação não encontrada.' });
            }

            // Atualizar status da solicitação
            await pool.query(
                'UPDATE solicitacao_admin SET status = ?, motivo_rejeicao = ?, admin_aprovador_id = ?, data_decisao = NOW() WHERE id = ?',
                ['rejeitado', motivo_rejeicao, adminId, solicitacaoId]
            );

            res.status(200).json({
                message: 'Solicitação de administrador rejeitada com sucesso!'
            });

        } catch (error) {
            console.error('Erro ao rejeitar solicitação de admin:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

   
};

export default adminController;