import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {

  // 1️⃣ Pegar o header Authorization
  const authHeader = req.headers['authorization'];

  // 2️⃣ Verificar se o header existe
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  // 3️⃣ Extrair o token (remover "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // 4️⃣ Verificar se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5️⃣ Salvar o ID do usuário na requisição
    req.user = { id: decoded.userId };

    // 6️⃣ Continuar para a próxima função
    next();

  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

export default authMiddleware;