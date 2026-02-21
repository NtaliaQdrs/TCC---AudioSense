const select = document.getElementById('disciplina');
const input = document.getElementById('disciplinaOutra');

// Select disciplina outra
select.addEventListener('change', (e) => {
    if (e.target.value === 'outra') {
        input.style.display = 'block';
        input.focus();
    } else {
        input.style.display = 'none';
        input.value = '';
    }
});

//JavaScript para mostrar/esconder senha:
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
