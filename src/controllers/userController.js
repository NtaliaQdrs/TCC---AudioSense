// Importa o pool de conexões, bcrypt para criptografar senha e jwt para tokens
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userController = {

    // Cadastro de Discente
    cadastroDiscente: async (req, res) => {
        try {
            const { nome_completo, email, senha } = req.body;

            // Validação básica
            if (!nome_completo || !email || !senha) {
                return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
            }

            // Verificar se o email já existe
            const [existingUser] = await pool.query(
                'SELECT id FROM usuario WHERE email = ?',
                [email]
            );
            if (existingUser.length > 0) {
                return res.status(409).json({ error: 'Este email já está em uso.' });
            }

            // Criptografar a senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(senha, salt);

            // Inserir na tabela usuario
            const [result] = await pool.query(
                'INSERT INTO usuario (nome_completo, email, tipo_usuario, senha, data_cadastro) VALUES (?, ?, ?, ?, NOW())',
                [nome_completo, email, 'discente', hashedPassword]
            );

            const usuarioId = result.insertId;

            // Inserir na tabela usuario_discente
            await pool.query(
                'INSERT INTO usuario_discente (usuario_id) VALUES (?)',
                [usuarioId]
            );

            res.status(201).json({
                message: 'Discente cadastrado com sucesso!',
                usuarioId: usuarioId
            });

        } catch (error) {
            console.error('Erro no cadastro de discente:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    // Cadastro de Docente
    cadastroDocente: async (req, res) => {
        try {
            const { nome_completo, email, senha, disciplina_id, comprovante_vinculo, informacao_adicional } = req.body;

            // Validação básica
            if (!nome_completo || !email || !senha || !disciplina_id) {
                return res.status(400).json({ error: 'Nome, email, senha e disciplina são obrigatórios.' });
            }

            // Verificar se o email já existe
            const [existingUser] = await pool.query(
                'SELECT id FROM usuario WHERE email = ?',
                [email]
            );
            if (existingUser.length > 0) {
                return res.status(409).json({ error: 'Este email já está em uso.' });
            }

            // Criptografar a senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(senha, salt);

            // Inserir na tabela usuario
            const [result] = await pool.query(
                'INSERT INTO usuario (nome_completo, email, tipo_usuario, senha, data_cadastro) VALUES (?, ?, ?, ?, NOW())',
                [nome_completo, email, 'docente', hashedPassword]
            );

            const usuarioId = result.insertId;

            // Inserir na tabela usuario_docente com status_aprovacao = 'pendente'
            await pool.query(
                'INSERT INTO usuario_docente (usuario_id, status_aprovacao, comprovante_vinculo, informacao_adicional) VALUES (?, ?, ?, ?)',
                [usuarioId, 'pendente', comprovante_vinculo, informacao_adicional]
            );

            // Inserir na tabela docente_disciplina
            await pool.query(
                'INSERT INTO docente_disciplina (docente_id, disciplina_id) VALUES (?, ?)',
                [usuarioId, disciplina_id]
            );

            res.status(201).json({
                message: 'Docente cadastrado com sucesso! Aguardando aprovação do administrador.',
                usuarioId: usuarioId
            });

        } catch (error) {
            console.error('Erro no cadastro de docente:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    // Login
    login: async (req, res) => {
        try {
            const { email, senha } = req.body;

            // Validação básica
            if (!email || !senha) {
                return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
            }

            // Buscar o usuário pelo email
            const [users] = await pool.query(
                'SELECT * FROM usuario WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            const user = users[0];

            // Comparar a senha
            const isPasswordCorrect = await bcrypt.compare(senha, user.senha);

            if (!isPasswordCorrect) {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            // Gerar token JWT
            const token = jwt.sign(
                { userId: user.id, email: user.email, tipo_usuario: user.tipo_usuario },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            res.status(200).json({
                message: 'Login bem-sucedido!',
                token: token,
                user: { id: user.id, email: user.email, tipo_usuario: user.tipo_usuario }
            });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    // Pegar perfil do usuário
    getProfile: async (req, res) => {
        try {
            const [users] = await pool.query(
                'SELECT id, nome_completo, email, tipo_usuario FROM usuario WHERE id = ?',
                [req.userId]
            );

            if (users.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            res.status(200).json(users[0]);

        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    // Atualizar perfil
    updateProfile: async (req, res) => {
        try {
            const { userId } = req;
            const { nome_completo, email, oldPassword, newPassword } = req.body;

            if (!nome_completo && !email && !oldPassword && !newPassword) {
                return res.status(400).json({ error: 'Nenhum dado fornecido para atualização.' });
            }

            // Atualizar nome ou email
            if (nome_completo || email) {
                if (email) {
                    const [existingUser] = await pool.query(
                        'SELECT id FROM usuario WHERE email = ? AND id != ?',
                        [email, userId]
                    );
                    if (existingUser.length > 0) {
                        return res.status(409).json({ error: 'Este email já está em uso.' });
                    }
                }

                const updateFields = [];
                const updateValues = [];

                if (nome_completo) {
                    updateFields.push('nome_completo = ?');
                    updateValues.push(nome_completo);
                }
                if (email) {
                    updateFields.push('email = ?');
                    updateValues.push(email);
                }

                updateValues.push(userId);

                await pool.query(
                    `UPDATE usuario SET ${updateFields.join(', ')} WHERE id = ?`,
                    updateValues
                );
            }

            // Atualizar senha
            if (newPassword && oldPassword) {
                const [users] = await pool.query('SELECT senha FROM usuario WHERE id = ?', [userId]);
                const user = users[0];

                const isPasswordCorrect = await bcrypt.compare(oldPassword, user.senha);
                if (!isPasswordCorrect) {
                    return res.status(401).json({ error: 'A senha antiga está incorreta.' });
                }

                const salt = await bcrypt.genSalt(10);
                const hashedNewPassword = await bcrypt.hash(newPassword, salt);

                await pool.query('UPDATE usuario SET senha = ? WHERE id = ?', [hashedNewPassword, userId]);
            } else if (newPassword && !oldPassword) {
                return res.status(400).json({ error: 'Para definir uma nova senha, a senha antiga é obrigatória.' });
            }

            res.status(200).json({ message: 'Perfil atualizado com sucesso!' });

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    // Deletar perfil
    deleteProfile: async (req, res) => {
        try {
            const { userId } = req;
            const { senha } = req.body;

            if (!senha) {
                return res.status(400).json({ error: 'A senha é obrigatória para confirmar a exclusão.' });
            }

            const [users] = await pool.query('SELECT senha FROM usuario WHERE id = ?', [userId]);

            if (users.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            const user = users[0];
            const isPasswordCorrect = await bcrypt.compare(senha, user.senha);

            if (!isPasswordCorrect) {
                return res.status(401).json({ error: 'Senha incorreta. A exclusão foi cancelada.' });
            }

            await pool.query('DELETE FROM usuario WHERE id = ?', [userId]);

            res.status(200).json({ message: 'Conta deletada com sucesso.' });

        } catch (error) {
            console.error('Erro ao deletar perfil:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },




    // Aprovar docente (apenas admin)

    aprovarDocente: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; // 'aprovado' ou 'rejeitado'

            if (!status || !['aprovado', 'rejeitado'].includes(status)) {
                return res.status(400).json({ error: 'Status deve ser "aprovado" ou "rejeitado".' });
            }

            // Se for rejeição, motivo é obrigatório
            if (status === 'rejeitado' && !motivo_rejeicao) {
                return res.status(400).json({ error: 'Motivo da rejeição é obrigatório.' });
            }

            // Atualizar status_aprovacao
            await pool.query(
                'UPDATE usuario_docente SET status_aprovacao = ?, motivo_rejeicao = ? WHERE usuario_id = ?',
                [status, motivo_rejeicao || null, id]
            );

            // Atualizar apenas o status (NÃO DELETA O REGISTRO)
            if (status === 'aprovado') {
                await pool.query(
                    'UPDATE usuario_docente SET status_docente = ? WHERE usuario_id = ?',
                    ['aprovado', id]
                );
            } else {
                // Se recusado, salva o motivo também
                await pool.query(
                    'UPDATE usuario_docente SET status_docente = ?, motivo_recusa = ? WHERE usuario_id = ?',
                    ['recusado', motivo_recusa, id]
                );
            }


            res.status(200).json({
                message: `Docente ${status} com sucesso!`,
                motivo: motivo_rejeicao || null
            });

        } catch (error) {
            console.error('Erro ao aprovar docente:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    // Listar docentes pendentes (apenas admin)
    docentesPendentes: async (req, res) => {
        try {
            const [docentes] = await pool.query(`
        SELECT u.id, u.nome_completo, u.email, ud.status_aprovacao, ud.comprovante_vinculo
        FROM usuario u
        JOIN usuario_docente ud ON u.id = ud.usuario_id
        WHERE ud.status_aprovacao = 'pendente'
      `);

            res.status(200).json(docentes);

        } catch (error) {
            console.error('Erro ao listar docentes pendentes:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    },

    // Obter status do usuário (admin, aprovação, etc)
    getStatusAdmin: async (req, res) => {
        try {
            const { userId } = req;

            // Buscar informações do usuário
            const [users] = await pool.query(
                'SELECT id, tipo_usuario FROM usuario WHERE id = ?',
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            const user = users[0];
            const tipoUsuario = user.tipo_usuario;

            // Se for discente
            if (tipoUsuario === 'discente') {
                return res.status(200).json({
                    isAdmin: false,
                    statusAprovacao: 'aprovado',
                    tipo: 'discente'
                });
            }

            // Se for docente
            if (tipoUsuario === 'docente') {
                const [docentes] = await pool.query(
                    'SELECT is_admin, status_aprovacao FROM usuario_docente WHERE usuario_id = ?',
                    [userId]
                );

                if (docentes.length === 0) {
                    return res.status(404).json({ error: 'Dados de docente não encontrados.' });
                }

                const docente = docentes[0];
                const isAdmin = docente.is_admin === 1 || docente.is_admin === true;

                return res.status(200).json({
                    isAdmin: isAdmin,
                    statusAprovacao: docente.status_aprovacao,
                    tipo: 'docente'
                });
            }

            res.status(200).json({
                isAdmin: false,
                statusAprovacao: 'desconhecido',
                tipo: tipoUsuario
            });

        } catch (error) {
            console.error('Erro ao obter status de admin:', error);
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }


};

export default userController;
