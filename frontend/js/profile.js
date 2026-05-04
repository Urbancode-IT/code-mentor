import { apiFetch, isLoggedIn, getCurrentUser, setCurrentUser, updateNavbar, showToast, timeAgo, logout } from './api.js';

const API_BASE = window.API_BASE_URL;
const BACKEND_BASE = window.BACKEND_BASE_URL;

const ICON = {
    heart: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    comment: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    link: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    shield: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    user: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    calendar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    bulb: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>`,
};

let currentUserData = null;
let pendingAvatarFile = null;

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();

    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    loadProfile();
    loadUserSolutions();

    document.getElementById('logout-btn')?.addEventListener('click', logout);

    // Edit modal
    document.getElementById('edit-modal-close')?.addEventListener('click', closeEditModal);
    document.getElementById('edit-profile-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'edit-profile-modal') closeEditModal();
    });
    document.getElementById('edit-profile-form')?.addEventListener('submit', handleEditProfile);

    // Avatar file input
    document.getElementById('avatar-file-input')?.addEventListener('change', handleAvatarSelect);
    document.getElementById('avatar-remove-btn')?.addEventListener('click', handleAvatarRemove);

    // Camera
    document.getElementById('camera-btn')?.addEventListener('click', openCamera);
    document.getElementById('camera-modal-close')?.addEventListener('click', closeCamera);
    document.getElementById('camera-cancel-btn')?.addEventListener('click', closeCamera);
    document.getElementById('camera-capture-btn')?.addEventListener('click', capturePhoto);
    document.getElementById('camera-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'camera-modal') closeCamera();
    });

    // Change password modal
    document.getElementById('password-modal-close')?.addEventListener('click', closeChangePasswordModal);
    document.getElementById('change-password-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'change-password-modal') closeChangePasswordModal();
    });
    document.getElementById('change-password-form')?.addEventListener('submit', handleChangePassword);

    const newPwInput = document.getElementById('new-password');
    if (newPwInput) {
        newPwInput.addEventListener('input', () => {
            const errorEl = document.getElementById('password-error');
            if (errorEl) errorEl.innerHTML = '';
        });
    }
});

async function loadProfile() {
    try {
        const user = await apiFetch('/users/me');
        currentUserData = user;
        renderProfile(user);
    } catch (err) {
        showToast('Failed to load profile', 'error');
    }
}

function getProfilePicUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return BACKEND_BASE + url;
}

function renderProfile(user) {
    const card = document.getElementById('profile-card');
    const initials = user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    const picUrl = getProfilePicUrl(user.profilePicUrl);
    const picHtml = picUrl
        ? `<div class="profile-pic"><img src="${escapeHtml(picUrl)}" alt="${escapeHtml(user.displayName)}" onerror="this.parentElement.innerHTML='${initials}'"></div>`
        : `<div class="profile-pic">${initials}</div>`;

    card.innerHTML = `
        <div class="profile-banner">
            <div class="banner-pattern"></div>
        </div>
        <div class="profile-body">
            <div class="profile-pic-wrapper">
                ${picHtml}
                <button class="profile-edit-btn" id="edit-profile-trigger" title="Edit Profile">${ICON.edit}</button>
            </div>
            <div class="profile-info">
                <h2>${escapeHtml(user.displayName)}</h2>
                <p class="username">@${escapeHtml(user.username)}</p>
                <p class="email">${escapeHtml(user.email)}</p>
                ${user.bio ? `<p class="bio">${escapeHtml(user.bio)}</p>` : '<p class="bio" style="color: var(--text-muted); font-style: italic;">Add your bio</p>'}
                <div class="profile-badges">
                    <span class="badge badge-joined">${ICON.calendar} Joined ${formatDate(user.createdAt)}</span>
                </div>
                <button class="btn btn-outline btn-sm" id="change-password-trigger" style="margin-top: 0.75rem;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Change Password
                </button>
            </div>
            <div class="profile-stats-row" id="profile-stats">
                <div class="profile-stat">
                    <div class="profile-stat-value" id="stat-solutions">-</div>
                    <div class="profile-stat-label">Solutions</div>
                </div>
                <div class="profile-stat">
                    <div class="profile-stat-value" id="stat-likes">-</div>
                    <div class="profile-stat-label">Total Likes</div>
                </div>
                <div class="profile-stat">
                    <div class="profile-stat-value" id="stat-comments">-</div>
                    <div class="profile-stat-label">Comments</div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('edit-profile-trigger')?.addEventListener('click', openEditModal);
    document.getElementById('change-password-trigger')?.addEventListener('click', openChangePasswordModal);
}

function openEditModal() {
    if (!currentUserData) return;
    pendingAvatarFile = null;

    // Set preview
    const previewImg = document.getElementById('avatar-preview-img');
    const previewInitials = document.getElementById('avatar-preview-initials');
    const removeBtn = document.getElementById('avatar-remove-btn');
    const picUrl = getProfilePicUrl(currentUserData.profilePicUrl);

    if (picUrl) {
        previewImg.src = picUrl;
        previewImg.style.display = 'block';
        previewInitials.style.display = 'none';
        removeBtn.style.display = 'inline-flex';
    } else {
        previewImg.style.display = 'none';
        previewInitials.style.display = 'flex';
        previewInitials.textContent = currentUserData.displayName
            .split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        removeBtn.style.display = 'none';
    }

    document.getElementById('edit-username').value = currentUserData.username || '';
    document.getElementById('edit-email').value = currentUserData.email || '';
    document.getElementById('edit-display-name').value = currentUserData.displayName || '';
    document.getElementById('edit-bio').value = currentUserData.bio || '';
    document.getElementById('edit-profile-modal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('edit-profile-modal').classList.remove('active');
    pendingAvatarFile = null;
}

function handleAvatarSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
        showToast('Only JPEG, PNG, GIF, or WebP images are allowed', 'error');
        e.target.value = '';
        return;
    }

    // Validate size
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be under 5MB', 'error');
        e.target.value = '';
        return;
    }

    pendingAvatarFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => {
        const previewImg = document.getElementById('avatar-preview-img');
        const previewInitials = document.getElementById('avatar-preview-initials');
        previewImg.src = ev.target.result;
        previewImg.style.display = 'block';
        previewInitials.style.display = 'none';
        document.getElementById('avatar-remove-btn').style.display = 'inline-flex';
        document.getElementById('avatar-preview').classList.add('avatar-changed');
        setTimeout(() => document.getElementById('avatar-preview').classList.remove('avatar-changed'), 400);
    };
    reader.readAsDataURL(file);

    // Reset file input so same file can be re-selected
    e.target.value = '';
}

function handleAvatarRemove() {
    pendingAvatarFile = 'REMOVE';
    const previewImg = document.getElementById('avatar-preview-img');
    const previewInitials = document.getElementById('avatar-preview-initials');
    previewImg.style.display = 'none';
    previewInitials.style.display = 'flex';
    previewInitials.textContent = (currentUserData?.displayName || '?')
        .split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    document.getElementById('avatar-remove-btn').style.display = 'none';
}

// ===== CAMERA CAPTURE =====
let cameraStream = null;

async function openCamera() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
        });
        const video = document.getElementById('camera-video');
        video.srcObject = cameraStream;
        document.getElementById('camera-modal').classList.add('active');
    } catch (err) {
        if (err.name === 'NotAllowedError') {
            showToast('Camera access denied. Please allow camera permission.', 'error');
        } else if (err.name === 'NotFoundError') {
            showToast('No camera found on this device.', 'error');
        } else {
            showToast('Could not access camera: ' + err.message, 'error');
        }
    }
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    const video = document.getElementById('camera-video');
    video.srcObject = null;
    document.getElementById('camera-modal').classList.remove('active');
}

function capturePhoto() {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');

    // Set canvas to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    // Mirror the image (selfie mode)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
        if (!blob) {
            showToast('Failed to capture photo', 'error');
            return;
        }

        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        pendingAvatarFile = file;

        // Update preview
        const previewImg = document.getElementById('avatar-preview-img');
        const previewInitials = document.getElementById('avatar-preview-initials');
        previewImg.src = URL.createObjectURL(blob);
        previewImg.style.display = 'block';
        previewInitials.style.display = 'none';
        document.getElementById('avatar-remove-btn').style.display = 'inline-flex';
        document.getElementById('avatar-preview').classList.add('avatar-changed');
        setTimeout(() => document.getElementById('avatar-preview').classList.remove('avatar-changed'), 400);

        closeCamera();
        showToast('Photo captured!');
    }, 'image/jpeg', 0.9);
}

async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('jwt_token');

    const response = await fetch(`${API_BASE}/users/me/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    if (!response.ok) {
        let msg = `Upload failed (${response.status})`;
        try {
            const err = await response.json();
            msg = err.message || msg;
        } catch { /* ignore parse error */ }
        throw new Error(msg);
    }

    return await response.json();
}

async function handleEditProfile(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        // Upload avatar if changed
        let newPicUrl = currentUserData.profilePicUrl;
        if (pendingAvatarFile === 'REMOVE') {
            newPicUrl = null;
        } else if (pendingAvatarFile instanceof File) {
            const result = await uploadAvatar(pendingAvatarFile);
            newPicUrl = result.profilePicUrl;
        }

        const newUsername = document.getElementById('edit-username').value.trim();
        const newEmail = document.getElementById('edit-email').value.trim();
        const usernameChanged = newUsername !== currentUserData.username;

        const updated = await apiFetch('/users/me', {
            method: 'PUT',
            body: JSON.stringify({
                username: newUsername,
                email: newEmail,
                displayName: document.getElementById('edit-display-name').value.trim(),
                bio: document.getElementById('edit-bio').value.trim(),
                profilePicUrl: newPicUrl,
            }),
        });
        currentUserData = updated;
        renderProfile(updated);

        // Sync localStorage so navbar picks up the new pic/name
        const stored = getCurrentUser();
        if (stored) {
            setCurrentUser({
                ...stored,
                username: updated.username,
                displayName: updated.displayName,
                profilePicUrl: updated.profilePicUrl || null,
            });
        }
        updateNavbar();

        closeEditModal();

        if (usernameChanged) {
            showToast('Profile updated! Please log in again with your new username.');
            setTimeout(() => logout(), 1500);
        } else {
            showToast('Profile updated!');
        }
    } catch (err) {
        showToast(err.message || 'Failed to update profile', 'error');
    } finally {
        btn.textContent = 'Save Changes';
        btn.disabled = false;
    }
}

async function loadUserSolutions() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const container = document.getElementById('user-solutions');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading your solutions...</div>';

    try {
        const solutions = await apiFetch(`/solutions/user/${currentUser.userId}`);
        renderUserSolutions(solutions);
        updateStats(solutions);
    } catch (err) {
        container.innerHTML = '<div class="empty-state"><h3>Failed to load solutions</h3></div>';
    }
}

function updateStats(solutions) {
    const totalLikes = solutions.reduce((sum, s) => sum + (s.likeCount || 0), 0);
    const totalComments = solutions.reduce((sum, s) => sum + (s.commentCount || 0), 0);

    // Animate stat numbers
    animateNumber('stat-solutions', solutions.length);
    animateNumber('stat-likes', totalLikes);
    animateNumber('stat-comments', totalComments);
}

function animateNumber(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (target === 0) { el.textContent = '0'; return; }

    let current = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const interval = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        el.textContent = current;
    }, 30);
}

function renderUserSolutions(solutions) {
    const container = document.getElementById('user-solutions');

    if (!solutions || solutions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">${ICON.bulb}</div>
                <h3>No solutions yet</h3>
                <p>Start solving challenges and your solutions will appear here!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = solutions.map((s, i) => `
        <div class="solution-card" style="cursor: pointer; animation-delay: ${i * 0.08}s" onclick="window.location.href='problem-detail.html?id=${s.problemId}'">
            <div class="solution-header">
                <div>
                    <span class="solution-author">${escapeHtml(s.problemTitle)}</span>
                    <span class="solution-date">&middot; ${timeAgo(s.createdAt)}</span>
                </div>
                <div class="card-meta">
                    <span>${ICON.heart} ${s.likeCount}</span>
                    <span>${ICON.comment} ${s.commentCount}</span>
                </div>
            </div>
            <p class="solution-desc">${escapeHtml(s.description)}</p>
            <a class="solution-repo" href="${escapeHtml(s.repoUrl)}" target="_blank" onclick="event.stopPropagation()">
                ${ICON.link} ${escapeHtml(s.repoUrl)}
            </a>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== CHANGE PASSWORD =====
function openChangePasswordModal() {
    document.getElementById('change-password-form').reset();
    const errorEl = document.getElementById('password-error');
    if (errorEl) errorEl.innerHTML = '';
    document.getElementById('change-password-modal').classList.add('active');
}

function closeChangePasswordModal() {
    document.getElementById('change-password-modal').classList.remove('active');
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

async function handleChangePassword(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;

    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }

    if (!showPasswordErrors(newPassword, 'password-error')) {
        return;
    }

    btn.textContent = 'Updating...';
    btn.disabled = true;

    try {
        await apiFetch('/users/me/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        closeChangePasswordModal();
        showToast('Password changed successfully!');
    } catch (err) {
        showToast(err.message || 'Failed to change password', 'error');
    } finally {
        btn.textContent = 'Update Password';
        btn.disabled = false;
    }
}
