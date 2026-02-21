// 1. Importações das bibliotecas
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
console.log("JWT_SECRET:", process.env.JWT_SECRET);
import cors from 'cors';
import './config/db.js';
import userRoutes from './routes/userRoutes.js';
import estatisticaRoutes from './routes/estatisticaRoutes.js'; 
import adminRoutes from './routes/adminRoutes.js';


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
 app.use('/api/estatisticas', estatisticaRoutes);
 app.use('/api/admin', adminRoutes);  


// 7. Definição da Porta
const PORT = process.env.PORT || 3000;

// 8. Inicialização do servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando com sucesso na porta ${PORT}`);
    console.log(`🔗 Teste aqui: http://localhost:${PORT}`);
});
