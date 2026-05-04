const API_BASE = window.API_BASE_URL;
const BACKEND_BASE = window.BACKEND_BASE_URL;

export function getToken() {
    return localStorage.getItem('jwt_token');
}

export function setToken(token) {
    localStorage.setItem('jwt_token', token);
}

export function getCurrentUser() {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user) {
    localStorage.setItem('current_user', JSON.stringify(user));
}

export function isLoggedIn() {
    return !!getToken();
}

export function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'ADMIN';
}

export function logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('current_user');
    window.location.href = 'index.html';
}

// ===== THEME =====
function getThemeToggleHtml() {
    return `
        <label class="theme-toggle" title="Switch theme">
            <div class="theme-toggle-track">
                <div class="theme-toggle-scene theme-toggle-scene--dark">
                    <div class="scene-mountains"></div>
                    <div class="scene-stars">
                        <span style="top:5px;left:10px;"></span>
                        <span style="top:3px;left:22px;width:3px;height:3px;"></span>
                        <span style="top:9px;left:16px;width:2px;height:2px;"></span>
                        <span style="top:6px;left:32px;"></span>
                        <span style="top:2px;left:38px;width:2px;height:2px;"></span>
                    </div>
                </div>
                <div class="theme-toggle-scene theme-toggle-scene--light">
                    <div class="scene-sun-sky"></div>
                    <div class="scene-hills"></div>
                    <div class="scene-trees"></div>
                </div>
                <div class="theme-toggle-thumb">
                    <svg class="thumb-icon thumb-icon--moon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    <svg class="thumb-icon thumb-icon--sun" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>
                </div>
            </div>
        </label>
    `;
}

export function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

function setupThemeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if (isLight) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
        if (typeof window.updateMascotTheme === 'function') window.updateMascotTheme();
    });
}

export async function apiFetch(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'login.html' || currentPage === 'register.html') {
            const error = await response.json().catch(() => ({ message: 'Invalid username or password' }));
            throw new Error(error.message || 'Invalid username or password');
        }
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('current_user');
        window.location.href = 'login.html';
        return;
    }

    if (response.status === 204) return null;

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || Object.values(error).join(', ') || `HTTP ${response.status}`);
    }

    return response.json();
}

export function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

export function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
        }
    }
    return 'just now';
}

export async function updateNavbar() {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (isLoggedIn()) {
        // Sync profile pic from server in the background
        try {
            const freshUser = await apiFetch('/users/me');
            if (freshUser) {
                const stored = getCurrentUser();
                if (stored && (stored.profilePicUrl !== freshUser.profilePicUrl || stored.displayName !== freshUser.displayName)) {
                    setCurrentUser({ ...stored, profilePicUrl: freshUser.profilePicUrl || null, displayName: freshUser.displayName });
                }
            }
        } catch { /* ignore — use cached data */ }

        const user = getCurrentUser();
        const initial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : '?';
        const picUrl = user?.profilePicUrl ? (user.profilePicUrl.startsWith('http') ? user.profilePicUrl : BACKEND_BASE + user.profilePicUrl) : null;
        const avatarHtml = picUrl
            ? `<img src="${picUrl}" alt="" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.3);" onerror="this.outerHTML='<span style=\\'width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#198754,#0EA5E9);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700\\'>${initial}</span>'">`
            : `<span style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #198754, #0EA5E9); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;">${initial}</span>`;
        navLinks.innerHTML = `
            <a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}">Home</a>
            <a href="saved-problems.html" class="${currentPage === 'saved-problems.html' ? 'active' : ''}">Saved</a>
            <a href="leaderboard.html" class="${currentPage === 'leaderboard.html' ? 'active' : ''}">Leaderboard</a>
            <a href="offers.html" class="${currentPage === 'offers.html' ? 'active' : ''}">Offers</a>
            <a href="my-submissions.html" class="${currentPage === 'my-submissions.html' ? 'active' : ''}">My Submissions</a>
            <a href="profile.html" class="${currentPage === 'profile.html' ? 'active' : ''}" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                ${avatarHtml}
                ${user ? user.displayName : 'Profile'}
            </a>
            ${getThemeToggleHtml()}
        `;
        setupThemeToggle();
    } else {
        navLinks.innerHTML = `
            <a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}">Home</a>
            <a href="leaderboard.html" class="${currentPage === 'leaderboard.html' ? 'active' : ''}">Leaderboard</a>
            <a href="offers.html" class="${currentPage === 'offers.html' ? 'active' : ''}">Offers</a>
            <a href="login.html" class="${currentPage === 'login.html' ? 'active' : ''}">Login</a>
            ${getThemeToggleHtml()}
        `;
        setupThemeToggle();
    }
}

window.__logout = logout;

// Apply theme immediately on module load to prevent flash
initTheme();
