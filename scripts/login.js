console.log("🔥 login.js carregado!");


// Quando a página carrega
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');

    // Adiciona listener ao formulário
    form.addEventListener('submit', async function (e) {
        e.preventDefault(); // Impede o comportamento padrão do formulário

        // Pega os valores do formulário
        const email = form.querySelector('input[type="email"]').value;
        const senha = form.querySelector('input[type="password"]').value;

        // Validação básica
        if (!email || !senha) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        try {
            // Mostra que está carregando
            console.log('🔐 Tentando fazer login...');

            // Envia a requisição para o backend
            const response = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha
                })
            });

            // Verifica se a resposta foi bem-sucedida
            if (!response.ok) {
                const errorData = await response.json();
                alert('Erro ao fazer login: ' + (errorData.mensagem || 'Email ou senha incorretos'));
                console.error('❌ Erro:', errorData);
                return;
            }

            // Pega os dados da resposta
            const data = await response.json();
            console.log('✅ Login bem-sucedido!', data);

            // Armazena o token no localStorage
            if (data.token) {
                localStorage.setItem('token', data.token);
                console.log('✅ Token armazenado!');
            }

            // Armazena informações do usuário (opcional)
            if (data.user) {
                localStorage.setItem('usuario', JSON.stringify(data.user));
            }

            // Redireciona para a página inicial
       
            window.location.href = '../index.html';

        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            alert('Erro ao conectar ao servidor. Verifique se o backend está rodando!');
        }
    });
});

// Função para mostrar/esconder senha
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = event.target;

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    }
}
