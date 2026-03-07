// auth.js - Authentication page logic
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleRegisterLink = document.getElementById('toggleRegister');
    const toggleLoginLink = document.getElementById('toggleLogin');
    const loginCard = document.getElementById('loginCard');
    const registerCard = document.getElementById('registerCard');

    // Toggle between login and register
    toggleRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.style.display = 'none';
        registerCard.style.display = 'block';
    });

    toggleLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.style.display = 'block';
        registerCard.style.display = 'none';
    });

    // Handle login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const messageDiv = document.getElementById('loginMessage');

        try {
            messageDiv.textContent = '';

            const response = await apiCall(AUTH_ENDPOINTS.LOGIN, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            // Store token and redirect
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            messageDiv.textContent = 'Login successful! Redirecting...';
            messageDiv.className = 'auth-message success';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            messageDiv.textContent = error.message;
            messageDiv.className = 'auth-message error';
        }
    });

    // Handle registration
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const messageDiv = document.getElementById('registerMessage');

        try {
            messageDiv.textContent = '';

            const response = await apiCall(AUTH_ENDPOINTS.REGISTER, {
                method: 'POST',
                body: JSON.stringify({ name, email, password, confirmPassword })
            });

            // Store token and redirect
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            messageDiv.textContent = 'Account created successfully! Redirecting...';
            messageDiv.className = 'auth-message success';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            messageDiv.textContent = error.message;
            messageDiv.className = 'auth-message error';
        }
    });
});