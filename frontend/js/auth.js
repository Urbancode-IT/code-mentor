import { apiFetch, setToken, setCurrentUser, isLoggedIn, updateNavbar, showToast } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();

    if (isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Clear error when user starts typing
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const errorEl = document.getElementById('password-error');
            if (errorEl) errorEl.innerHTML = '';
        });
    }
});

function validatePassword(password) {
    return [
        { test: password.length >= 8, label: 'At least 8 characters' },
        { test: /[A-Z]/.test(password), label: 'Uppercase letter' },
        { test: /[a-z]/.test(password), label: 'Lowercase letter' },
        { test: /\d/.test(password), label: 'A digit' },
        { test: /[@$!%*?&#+\-_]/.test(password), label: 'Special character (@$!%*?&#+_-)' },
    ];
}

function showPasswordErrors(password, errorElementId) {
    const rules = validatePassword(password);
    const failed = rules.filter(r => !r.test);
    if (failed.length === 0) return true;

    const errorEl = document.getElementById(errorElementId);
    if (errorEl) {
        errorEl.innerHTML = `
            <ul class="password-error-list">
                ${failed.map(r => `<li>${r.label}</li>`).join('')}
            </ul>
        `;
    }
    return false;
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Logging in...';

    try {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                username: document.getElementById('username').value,
                password: document.getElementById('password').value,
            }),
        });

        setToken(data.token);
        setCurrentUser({
            username: data.username,
            role: data.role,
            displayName: data.displayName,
            userId: data.userId,
            profilePicUrl: data.profilePicUrl || null,
            credits: data.credits || 0,
        });

        sessionStorage.setItem('just_logged_in', '1');
        window.location.href = 'index.html';
    } catch (err) {
        showToast(err.message || 'Login failed', 'error');
        btn.disabled = false;
        btn.textContent = 'Login';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    if (!showPasswordErrors(password, 'password-error')) {
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Creating account...';

    try {
        const data = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: password,
                displayName: document.getElementById('display-name').value,
            }),
        });

        setToken(data.token);
        setCurrentUser({
            username: data.username,
            role: data.role,
            displayName: data.displayName,
            userId: data.userId,
            profilePicUrl: data.profilePicUrl || null,
            credits: data.credits || 0,
        });

        sessionStorage.setItem('just_logged_in', '1');
        sessionStorage.setItem('just_registered', '1');
        window.location.href = 'index.html';
    } catch (err) {
        showToast(err.message || 'Registration failed', 'error');
        btn.disabled = false;
        btn.textContent = 'Create Account';
    }
}
