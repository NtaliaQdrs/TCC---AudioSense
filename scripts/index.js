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

// Executar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    verificarTipoUsuario();
    verificarPermissoes();
});
