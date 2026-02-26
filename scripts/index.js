// Função para ir para o painel correto
async function irParaPainelAdmin(event) {
    event.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'pages/login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/admin/verificar-admin', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.isAdmin === true) {
            // Se for admin, vai para painelAdmin2
            window.location.href = 'pages/painelAdmin2.html';
        } else {
            // Se não for admin, vai para painelAdmin1
            window.location.href = 'pages/painelAdmin1.html';
        }
    } catch (error) {
        console.error('Erro ao verificar admin:', error);
        window.location.href = 'pages/painelAdmin1.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // =============================
    // ELEMENTOS DO MENU DE PERFIL
    // =============================

    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const minhasAudiodescricoes = document.getElementById('minhasAudiodescrições');
    const meusMateriais = document.getElementById('meusMateriais');
    const adminPanel = document.getElementById('adminPainel');

    // =============================
    // MENU PERFIL
    // =============================

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', () => {
            profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-menu')) {
                profileDropdown.classList.remove('active');
            }
        });
    }

    // =============================
    // LOGOUT
    // =============================

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const confirmar = confirm("Tem certeza que deseja sair da sua conta?");

            if (confirmar) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                window.location.href = 'index.html';
            }
        });
    }


    // =============================
    // VERIFICAR TIPO DE USUÁRIO
    // =============================

    function verificarTipoUsuario() {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const tipoUsuario = usuario?.tipo_usuario;

        if (!tipoUsuario) return;

        if (tipoUsuario === 'docente') {
            if (meusMateriais) meusMateriais.style.display = 'flex';
            if (minhasAudiodescricoes) minhasAudiodescricoes.style.display = 'none';
        } else if (tipoUsuario === 'discente') {
            if (minhasAudiodescricoes) minhasAudiodescricoes.style.display = 'flex';
            if (meusMateriais) meusMateriais.style.display = 'none';
        }
    }

    // =============================
    // VERIFICAR PERMISSÕES
    // =============================

    function verificarPermissoes() {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const tipoUsuario = usuario?.tipo_usuario;

        if (!adminPanel) return;

        if (tipoUsuario === 'docente') {
            adminPanel.style.display = 'flex';
        } else {
            adminPanel.style.display = 'none';
        }
    }




    // =============================
    // CARREGAR ESTATÍSTICAS
    // =============================

    async function carregarEstatisticas() {
        try {
            const responseDiscentes = await fetch('http://localhost:3000/api/estatisticas/contar-discentes' );
            if (responseDiscentes.ok) {
                const data = await responseDiscentes.json();
                const el = document.getElementById('total-discentes');
                if (el) el.textContent = data.total || 0;
            }

            const responseDocentes = await fetch('http://localhost:3000/api/estatisticas/contar-docentes' );

            if (responseDocentes.ok) {
                const data = await responseDocentes.json();
                const el = document.getElementById('total-docentes');
                if (el) el.textContent = data.total || 0;
            }

        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }


    //Some o botão de login e cadastro se o usuário já estiver logado
    const welcomeAuthBtn = document.getElementById('welcomeAuthBtn');

    function verificarLogin() {
        const token = localStorage.getItem('token');

        if (token) {
            if (welcomeAuthBtn) welcomeAuthBtn.style.display = 'none';
        } else {
            if (welcomeAuthBtn) welcomeAuthBtn.style.display = 'inline-block';
        }
    }


    // =============================
    // EXECUTAR AO CARREGAR
    // =============================

    verificarTipoUsuario();
    verificarPermissoes();
    carregarEstatisticas();
    verificarLogin();


});
