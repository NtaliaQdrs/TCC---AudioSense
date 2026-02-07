// Menu de Perfil
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');
const logoutBtn = document.getElementById('logoutBtn');
const minhasAudiodescrições = document.getElementById('minhasAudiodescrições');
const meusMateriais = document.getElementById('meusMateriais');
const adminPanel = document.getElementById('adminPainel');


// Abrir/Fechar menu
profileBtn.addEventListener('click', () => {
    profileDropdown.classList.toggle('active');
});

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
    if (!e.target.closest('.profile-menu')) {
        profileDropdown.classList.remove('active');
    }
});

// Logout
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('tipoUsuario');
    window.location.href = 'index.html';
});

// Mostrar opções específicas conforme o tipo de usuário
function verificarTipoUsuario() {
    const tipoUsuario = localStorage.getItem('tipoUsuario');

    if (tipoUsuario === 'docente') {
        // Docente vê "Meus Materiais"
        meusMateriais.style.display = 'flex';
        minhasAudiodescrições.style.display = 'none';
    } else if (tipoUsuario === 'discente') {
        // Discente vê "Minhas Audiodescrições"
        minhasAudiodescrições.style.display = 'flex';
        meusMateriais.style.display = 'none';
    }
}

// Controle de exibição de administração
function verificarPermissoes() {
    const tipoUsuario = localStorage.getItem('tipoUsuario');

    // Apenas docentes veem o painel
    if (tipoUsuario === 'docente') {
        adminPanel.style.display = 'flex';
    } else {
        adminPanel.style.display = 'none';
    }
}



select.addEventListener('change', (e) => {
    if (e.target.value === 'outra') {
        input.style.display = 'block';
        input.focus();
    } else {
        input.style.display = 'none';
        input.value = '';
    }
});



// Função para buscar estatísticas do backend
async function carregarEstatisticas() {
    try {
        // Buscar número de discentes
        const responseDiscentes = await fetch('http://localhost:3000/api/users/contar-discentes');
        if (responseDiscentes.ok) {
            const dataDiscentes = await responseDiscentes.json();
            document.getElementById('total-discentes').textContent = dataDiscentes.total || 0;
        }

        // Buscar número de docentes
        const responseDocentes = await fetch('http://localhost:3000/api/users/contar-docentes');
        if (responseDocentes.ok) {
            const dataDocentes = await responseDocentes.json();
            document.getElementById('total-docentes').textContent = dataDocentes.total || 0;
        }

        // Se tiver outras rotas, descomente:
        // const responseAudiovisual = await fetch('http://localhost:3000/api/conteudo/contar');
        // if (responseAudiovisual.ok) {
        //     const dataAudiovisual = await responseAudiovisual.json();
        //     document.getElementById('total-audiovisual').textContent = dataAudiovisual.total || 0;
        // }

        // const responseMateriais = await fetch('http://localhost:3000/api/material-didatico/contar');
        // if (responseMateriais.ok) {
        //     const dataMateriais = await responseMateriais.json();
        //     document.getElementById('total-materiais').textContent = dataMateriais.total || 0;
        // }

    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Carregar estatísticas quando a página carrega
document.addEventListener('DOMContentLoaded', carregarEstatisticas);

// Executar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    verificarTipoUsuario();
    verificarPermissoes();
});