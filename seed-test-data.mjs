import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import 'dotenv/config';


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function seedTestData() {
    const connection = await pool.getConnection();

    try {
        console.log('🌱 Iniciando seed de dados de teste...\n');

        // ============================================
        // 1. VERIFICAR E INSERIR DOCENTE ADMINISTRADOR
        // ============================================
        console.log('🔍 Verificando se docente admin já existe...');

        const [usuarioAdmin] = await connection.execute(
            'SELECT id FROM usuario WHERE email = ?',
            ['joao.admin@example.com']
        );

        let usuarioAdminId;

        if (usuarioAdmin.length > 0) {
            console.log('⚠️  Docente admin já existe no banco!');
            usuarioAdminId = usuarioAdmin[0].id;
            console.log('   ID: ' + usuarioAdminId + '\n');
        } else {
            const senhaDocente = 'senha123';
            const hashDocente = await bcrypt.hash(senhaDocente, 10);

            const usuarioAdminQuery = `
                INSERT INTO usuario (
                    nome_usuario,
                    nome_completo,
                    email,
                    senha,
                    tipo_usuario,
                    data_cadastro
                ) VALUES (?, ?, ?, ?, ?, NOW())
            `;

            const usuarioAdminValues = [
                'joao.admin',
                'João Silva Admin',
                'joao.admin@example.com',
                hashDocente,
                'docente'
            ];

            const [resultAdmin] = await connection.execute(usuarioAdminQuery, usuarioAdminValues);
            usuarioAdminId = resultAdmin.insertId;

            console.log('✅ Usuário Admin criado!');
            console.log('   ID: ' + usuarioAdminId);
            console.log('   Nome: João Silva Admin');
            console.log('   Email: joao.admin@example.com');
            console.log('   Senha: ' + senhaDocente + '\n');

            // Agora insere na tabela usuario_docente
            const adminQuery = `
                INSERT INTO usuario_docente (
                    usuario_id,
                    is_admin,
                    status_aprovacao,
                    comprovante_vinculo
                ) VALUES (?, ?, ?, ?)
            `;

            const adminValues = [
                usuarioAdminId,
                1,  // is_admin = true
                'aprovado',
                'comprovante_teste.pdf'  // Arquivo de teste
            ];

            await connection.execute(adminQuery, adminValues);
            console.log('✅ Docente Administrador inserido com sucesso!');
            console.log('   Status: aprovado');
            console.log('   Admin: SIM\n');
        }

        // ============================================
        // 2. VERIFICAR E INSERIR DOCENTE NÃO ADMINISTRADOR
        // ============================================

        console.log('🔍 Verificando se docente já existe...');

        const [usuarioDocente] = await connection.execute(
            'SELECT id FROM usuario WHERE email = ?',
            ['marcus.docente@example.com']
        );

        let usuarioDocenteId;

        if (usuarioDocente.length > 0) {
            console.log('⚠️  Docente já existe no banco!');
            usuarioDocenteId = usuarioDocente[0].id;
            console.log('   ID: ' + usuarioDocenteId + '\n');
        } else {
            const senhaDocente = 'senha123';
            const hashDocente = await bcrypt.hash(senhaDocente, 10);

            const usuarioDocenteQuery = `
                INSERT INTO usuario (
                    nome_usuario,
                    nome_completo,
                    email,
                    senha,
                    tipo_usuario,
                    data_cadastro
                ) VALUES (?, ?, ?, ?, ?, NOW())
            `;

            const usuarioDocenteValues = [
                'marcus.docente',
                'Marcus Silva',
                'marcus.docente@example.com',
                hashDocente,
                'docente'
            ];

            const [resultDocente] = await connection.execute(usuarioDocenteQuery, usuarioDocenteValues);
            usuarioDocenteId = resultDocente.insertId;

            console.log('✅ Usuário Docente criado!');
            console.log('   ID: ' + usuarioDocenteId);
            console.log('   Nome: Marcus Silva');
            console.log('   Email: marcus.docente@example.com');
            console.log('   Senha: ' + senhaDocente + '\n');

            // Agora insere na tabela usuario_docente
            const docenteQuery = `
                INSERT INTO usuario_docente (
                    usuario_id,
                    is_admin,
                    status_aprovacao,
                    comprovante_vinculo
                ) VALUES (?, ?, ?, ?)
            `;

            const docenteValues = [
                usuarioDocenteId,
                0,  // is_admin = false (docente normal)
                'aprovado',
                'comprovante_teste.pdf'  // Arquivo de teste
            ];

            await connection.execute(docenteQuery, docenteValues);
            console.log('✅ Docente inserido com sucesso!');
            console.log('   Status: aprovado');
            console.log('   Admin: NÃO\n');
        }


        // ============================================
        // 2. VERIFICAR E INSERIR DISCENTE
        // ============================================
        console.log('🔍 Verificando se discente já existe...');

        const [usuariosDiscente] = await connection.execute(
            'SELECT id FROM usuario WHERE email = ?',
            ['maria.discente@example.com']
        );

        let usuarioDiscenteId;

        if (usuariosDiscente.length > 0) {
            console.log('⚠️  Discente já existe no banco!');
            usuarioDiscenteId = usuariosDiscente[0].id;
            console.log('   ID: ' + usuarioDiscenteId + '\n');
        } else {
            const senhaDiscente = 'senha123';
            const hashDiscente = await bcrypt.hash(senhaDiscente, 10);

            const usuarioDiscenteQuery = `
                INSERT INTO usuario (
                    nome_usuario,
                    nome_completo,
                    email,
                    senha,
                    tipo_usuario,
                    data_cadastro
                ) VALUES (?, ?, ?, ?, ?, NOW())
            `;

            const usuarioDiscenteValues = [
                'maria.discente',
                'Maria Santos',
                'maria.discente@example.com',
                hashDiscente,
                'discente'
            ];

            const [resultDiscente] = await connection.execute(usuarioDiscenteQuery, usuarioDiscenteValues);
            usuarioDiscenteId = resultDiscente.insertId;

            console.log('✅ Usuário Discente criado!');
            console.log('   ID: ' + usuarioDiscenteId);
            console.log('   Nome: Maria Santos');
            console.log('   Email: maria.discente@example.com');
            console.log('   Senha: ' + senhaDiscente + '\n');

            // Agora insere na tabela usuario_discente
            const discenteQuery = `
                INSERT INTO usuario_discente (
                    usuario_id
                ) VALUES (?)
            `;

            const discenteValues = [usuarioDiscenteId];

            await connection.execute(discenteQuery, discenteValues);
            console.log('✅ Discente inserido com sucesso!\n');
        }

        // ============================================
        // 3. LISTAR USUÁRIOS
        // ============================================
        console.log('📋 Usuários no banco:\n');

        const [usuarios] = await connection.execute(
            'SELECT id, nome_usuario, nome_completo, email, tipo_usuario FROM usuario WHERE tipo_usuario IN ("docente", "discente") ORDER BY data_cadastro DESC'
        );

        usuarios.forEach(user => {
            console.log(`  - ${user.nome_completo} (${user.email})`);
            console.log(`    Tipo: ${user.tipo_usuario}`);
            console.log(`    Usuário: ${user.nome_usuario}\n`);
        });

        console.log('✨ Seed concluído com sucesso!');
        console.log('\n🧪 Próximos passos:');
        console.log('1. Abra http://localhost:3000/login');
        console.log('2. Teste o login com:');
        console.log('   - Email: joao.admin@example.com | Senha: senha123 (Docente Admin)');
        console.log('   - Email: maria.discente@example.com | Senha: senha123 (Discente)');
        console.log('3. Verifique se as funcionalidades estão funcionando\n');

    } catch (error) {
        console.error('❌ Erro ao inserir dados:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        await connection.release();
        await pool.end();
    }
}

seedTestData();