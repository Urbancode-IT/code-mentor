import { apiFetch, setToken, setCurrentUser, isLoggedIn, updateNavbar, showToast } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();

    const currentPage = window.location.pathname.split('/').pop();
    const pagesThatAllowLoggedInUsers = ['forgot-password.html', 'reset-password.html'];
    if (isLoggedIn() && !pagesThatAllowLoggedInUsers.includes(currentPage)) {
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

    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }

    const resetForm = document.getElementById('reset-form');
    if (resetForm) {
        resetForm.addEventListener('submit', handleResetPassword);
    }

    // Clear error when user starts typing
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const errorEl = document.getElementById('password-error');
            if (errorEl) errorEl.innerHTML = '';
        });
    }

    wireOAuthButtons();
    showOAuthErrorIfPresent();
});

function wireOAuthButtons() {
    const backend = window.BACKEND_BASE_URL;
    const google = document.getElementById('oauth-google');
    if (google) google.href = `${backend}/oauth2/authorization/google`;
    const github = document.getElementById('oauth-github');
    if (github) github.href = `${backend}/oauth2/authorization/github`;
}

function showOAuthErrorIfPresent() {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('oauth_error');
    if (err) {
        showToast(err, 'error');
        const url = new URL(window.location.href);
        url.searchParams.delete('oauth_error');
        window.history.replaceState({}, '', url.toString());
    }
}

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

async function handleForgotPassword(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
        const data = await apiFetch('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({
                email: document.getElementById('email').value,
            }),
        });
        showToast(data.message || 'If an account exists for that email, a reset link has been sent.', 'success');
        btn.textContent = 'Link sent';
    } catch (err) {
        showToast(err.message || 'Could not send reset link', 'error');
        btn.disabled = false;
        btn.textContent = 'Send reset link';
    }
}

async function handleResetPassword(e) {
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

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
        showToast('Reset link is invalid or missing the token.', 'error');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Resetting...';

    try {
        const data = await apiFetch('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, newPassword: password }),
        });
        showToast(data.message || 'Password reset. Please log in.', 'success');
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    } catch (err) {
        showToast(err.message || 'Could not reset password', 'error');
        btn.disabled = false;
        btn.textContent = 'Reset password';
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
