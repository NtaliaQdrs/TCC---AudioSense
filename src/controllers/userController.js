console.log("🔥 USER CONTROLLER CARREGADO");

// Importa o pool de conexões, bcrypt para criptografar senha e jwt para tokens
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// FUNÇÃO DE VALIDAÇÃO DE SENHA
// ============================================
function validarSenha(senha) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(senha);
    const hasLowerCase = /[a-z]/.test(senha);
    const hasNumber = /[0-9]/.test(senha);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha);

    if (senha.length < minLength) {
        return { valida: false, erro: `A senha deve ter no mínimo ${minLength} caracteres.` };
    }
    if (!hasUpperCase) {
        return { valida: false, erro: 'A senha deve conter pelo menos uma letra maiúscula.' };
    }
    if (!hasLowerCase) {
        return { valida: false, erro: 'A senha deve conter pelo menos uma letra minúscula.' };
    }
    if (!hasNumber) {
        return { valida: false, erro: 'A senha deve conter pelo menos um número.' };
    }
    if (!hasSpecialChar) {
        return { valida: false, erro: 'A senha deve conter pelo menos um caractere especial (!@#$%^&*).' };
    }

    return { valida: true };
}


const userController = {

    // Cadastro de Discente
    cadastroDiscente: async (req, res) => {
        try {
            const { nome_completo, email, senha } = req.body;

            // Validação básica
            if (!nome_completo || !email || !senha) {
                return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
            }


            // Validar força da senha
            const validacao = validarSenha(senha);
            if (!validacao.valida) {
                return res.status(400).json({ error: validacao.erro });
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


            // Validar força da senha
            const validacao = validarSenha(senha);
            if (!validacao.valida) {
                return res.status(400).json({ error: validacao.erro });
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
        console.log("JWT_SECRET dentro do controller:", process.env.JWT_SECRET);
        try {
            
            const { email, senha } = req.body;

            console.log("📩 Email recebido:", email);
            console.log("🔐 Senha recebida:", senha);

            if (!process.env.JWT_SECRET) {
                console.log("❌ JWT_SECRET não encontrado!");
                return res.status(500).json({
                    error: 'JWT_SECRET não configurado no servidor.'
                });
            }

            if (!email || !senha) {
                console.log("❌ Email ou senha vazios");
                return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
            }

            const [users] = await pool.query(
                'SELECT * FROM usuario WHERE email = ?',
                [email]
            );

            console.log("👤 Resultado da consulta no banco:", users);

            if (users.length === 0) {
                console.log("❌ Usuário não encontrado no banco");
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            const user = users[0];

            console.log("🔒 Hash armazenado no banco:", user.senha);

            const isPasswordCorrect = await bcrypt.compare(senha, user.senha);

            console.log("🧪 Resultado do bcrypt.compare:", isPasswordCorrect);

            if (!isPasswordCorrect) {
                console.log("❌ Senha incorreta");
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            console.log("✅ Senha correta!");

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

            await pool.query('DELETE FROM docente_disciplina WHERE docente_id = ?', [userId]);
            await pool.query('DELETE FROM usuario_docente WHERE usuario_id = ?', [userId]);
            await pool.query('DELETE FROM usuario_discente WHERE usuario_id = ?', [userId]);
            await pool.query('DELETE FROM usuario WHERE id = ?', [userId]);

            res.status(200).json({ message: 'Conta deletada com sucesso.' });

        } catch (error) {
            console.error('Erro ao deletar perfil:', error);
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
    },

};


export default userController;


