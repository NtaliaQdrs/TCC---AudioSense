import mysql from 'mysql2/promise'; 
import 'dotenv/config';

console.log('Criando pool de conexões...');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Teste rápido de conexão
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Conectado ao banco de dados MySQL!");
        connection.release();
    } catch (error) {
        console.error("❌ Erro ao conectar ao banco de dados:", error.message);
    }
}

testConnection();

export default pool;

