// ============================================
// SCRIPT PARA DELETAR USUÁRIOS DE TESTE
// Banco: audiolab_db2
// Uso: node delete-test-users.mjs
// ============================================

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function deleteTestUsers() {
    const connection = await pool.getConnection();

    try {
        console.log('🗑️  Deletando usuários de teste...\n');

        // ============================================
        // 1. ENCONTRAR OS IDs DOS USUÁRIOS
        // ============================================
        const [usuarios] = await connection.execute(
            'SELECT id FROM usuario WHERE email IN (?, ?)',
            ['joao.admin@example.com', 'maria.discente@example.com']
        );

        if (usuarios.length === 0) {
            console.log('⚠️  Nenhum usuário de teste encontrado!\n');
            return;
        }

        const usuarioIds = usuarios.map(u => u.id);
        console.log('Encontrados ' + usuarioIds.length + ' usuários:\n');

        // ============================================
        // 2. DELETAR DE usuario_docente
        // ============================================
        const placeholders = usuarioIds.map(() => '?').join(',');
        const [resultDocente] = await connection.execute(
            `DELETE FROM usuario_docente WHERE usuario_id IN (${placeholders})`,
            usuarioIds
        );

        if (resultDocente.affectedRows > 0) {
            console.log('✅ ' + resultDocente.affectedRows + ' docente(s) deletado(s) de usuario_docente');
        }

        // ============================================
        // 3. DELETAR DE usuario_discente
        // ============================================
        const [resultDiscente] = await connection.execute(
            `DELETE FROM usuario_discente WHERE usuario_id IN (${placeholders})`,
            usuarioIds
        );

        if (resultDiscente.affectedRows > 0) {
            console.log('✅ ' + resultDiscente.affectedRows + ' discente(s) deletado(s) de usuario_discente');
        }

        // ============================================
        // 4. DELETAR DE usuario
        // ============================================
        const [resultUsuario] = await connection.execute(
            `DELETE FROM usuario WHERE id IN (${placeholders})`,
            usuarioIds
        );

        console.log('✅ ' + resultUsuario.affectedRows + ' usuário(s) deletado(s) de usuario\n');

        console.log('✨ Usuários de teste deletados com sucesso!');
        console.log('\n🚀 Próximo passo:');
        console.log('Execute: node seed-test-data-FINAL.mjs\n');

    } catch (error) {
        console.error('❌ Erro ao deletar usuários:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        await connection.release();
        await pool.end();
    }
}

deleteTestUsers();