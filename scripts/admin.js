async function carregarPainel() {
    // Pega o token de autenticação armazenado no navegador
    const token = localStorage.getItem('token');

    // Faz uma requisição para o servidor para verificar o status do usuário
    const response = await fetch('http://localhost:3000/api/users/status-admin', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

     // Verifica se a resposta foi bem-sucedida (status 200-299), se não, mostra mensagem de acesso negado
    if (!response.ok) {
        document.body.innerHTML = '<p>Acesso negado.</p>';
        return;
    }

    // Converte a resposta em JSON (extrai os dados)
    const data = await response.json();

     // Se não for admin, verifica se está aguardando aprovação ou se precisa solicitar
    if (data.isAdmin) {
        mostrarPainelAdmin();
    } else if (data.statusAprovacao === 'pendente') {
        mostrarStatusPendente();
        // Se não for admin e não estiver pendente, mostra a opção de solicitar
    } else {
        mostrarSolicitacao();
    }
}

// Função que mostra o painel de admin
function mostrarPainelAdmin() {
     // Deixa visível o elemento com id 'painelAdmin'
    document.getElementById('painelAdmin').style.display = 'block';
}

// Função que mostra o status pendente
function mostrarStatusPendente() {
    // Deixa visível o elemento com id 'statusPendente'
    document.getElementById('statusPendente').style.display = 'block';
}

// Função que mostra a solicitação de admin
function mostrarSolicitacao() {
    // Deixa visível o elemento com id 'solicitacaoAdmin'
    document.getElementById('solicitacaoAdmin').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', carregarPainel);
