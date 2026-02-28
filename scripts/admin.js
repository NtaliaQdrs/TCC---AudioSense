document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/admin/verificar-admin', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            document.body.innerHTML = '<p>Erro ao verificar usuário.</p>';
            return;
        }

        const data = await response.json();

        if (data.isAdmin) {
            // Já é admin → manda para painel de gerenciamento
            window.location.href = 'painelAdmin2.html';
            return;
        }

        // Se não for admin, mostra a tela de solicitação
        document.getElementById('solicitacaoAdmin').style.display = 'block';

    } catch (error) {
        console.error('Erro:', error);
    }
});