// 1. Importações das bibliotecas
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import './config/db.js';
import userRoutes from './routes/userRoutes.js';

// 3. Configuração do App
const app = express();

// 4. Middlewares (Configurações de segurança e dados)
app.use(cors()); // Permite que o frontend acesse o backend
app.use(express.json()); // Permite que o servidor entenda JSON

// 5. Rota de teste (para você ver se está funcionando no navegador)
app.get('/', (req, res) => {
    res.send('Servidor do AudioSense está online! ');
});

// Middleware
app.use(cors());
app.use(express.json());

// 6. rotas
 app.use('/api/users', userRoutes);

// 7. Definição da Porta
const PORT = process.env.PORT || 3000;

// 8. Inicialização do servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando com sucesso na porta ${PORT}`);
    console.log(`🔗 Teste aqui: http://localhost:${PORT}`);
});
