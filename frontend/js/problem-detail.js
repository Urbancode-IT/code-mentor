import { apiFetch, isLoggedIn, isAdmin, getCurrentUser, updateNavbar, showToast, timeAgo } from './api.js';

// SVG Icons
const ICON = {
    heartOutline: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    heartFilled: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    bookmark: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
    bookmarkFilled: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
    comment: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    thumbUp: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>`,
    link: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
};

let problemId;
let problemData;
let isProblemSaved = false;

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    const params = new URLSearchParams(window.location.search);
    problemId = params.get('id');

    if (!problemId) {
        window.location.href = 'index.html';
        return;
    }

    loadProblem();
    loadSolutions();
});

async function loadProblem() {
    try {
        problemData = await apiFetch(`/problems/${problemId}`);
        if (isLoggedIn()) {
            try {
                const ids = await apiFetch('/problem-likes/my');
                isProblemSaved = ids.includes(Number(problemId));
            } catch { isProblemSaved = false; }
        }
        renderProblem(problemData);
    } catch (err) {
        document.getElementById('problem-header').innerHTML =
            '<div class="empty-state"><h3>Problem not found</h3></div>';
    }
}

function renderProblem(p) {
    const header = document.getElementById('problem-header');
    header.innerHTML = `
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;">
            <h1 class="problem-detail-title" style="margin:0;">${escapeHtml(p.title)}</h1>
            <div style="display:flex;align-items:center;gap:0.75rem;">
                <span class="badge badge-${(p.difficulty || '').toLowerCase()}">${(p.difficulty || '').charAt(0).toUpperCase() + (p.difficulty || '').slice(1).toLowerCase()}</span>
                ${isLoggedIn() ? `
                <button class="btn-save-problem ${isProblemSaved ? 'saved' : ''}" id="save-problem-btn" onclick="window.toggleSaveProblem(this)">
                    ${isProblemSaved ? ICON.bookmarkFilled : ICON.bookmark}
                    <span>${isProblemSaved ? 'Saved' : 'Save'}</span>
                </button>
                ` : ''}
            </div>
        </div>
        <div class="problem-detail-meta">
            ${p.tags.map(t => `<span class="tag">${escapeHtml(t.trim())}</span>`).join('')}
            <span style="color: var(--text-light); font-size: 0.85rem;">by ${escapeHtml(p.authorName)} &middot; ${timeAgo(p.createdAt)}</span>
        </div>

        <div class="problem-section" style="margin-top: 1.5rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">Introduction</h3>
            <div class="problem-detail-desc">${escapeHtml(p.introduction)}</div>
        </div>

        <div class="problem-section" style="margin-top: 1.5rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">Requirements</h3>
            <div class="problem-detail-desc" style="white-space: pre-wrap;">${escapeHtml(p.requirements)}</div>
        </div>

        ${p.suggestedImplementation ? `
            <div class="problem-section" style="margin-top: 1.5rem;">
                <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem;">Suggested Implementation</h3>
                <div class="problem-detail-desc" style="white-space: pre-wrap; background: var(--bg-elevated); padding: 1rem; border-radius: 8px; border-left: 3px solid var(--primary);">${escapeHtml(p.suggestedImplementation)}</div>
            </div>
        ` : ''}

        ${isAdmin() ? `
            <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-danger btn-sm" onclick="deleteProblemAction()">${ICON.trash} Delete</button>
            </div>
        ` : ''}
    `;
}

async function loadSolutions() {
    const container = document.getElementById('solutions-list');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading solutions...</div>';

    try {
        const solutions = await apiFetch(`/solutions/problem/${problemId}`);

        // Render top solutions panel (left side)
        renderTopSolutions(solutions);

        // Render all solutions (right side)
        renderSolutions(solutions);

        const countEl = document.getElementById('solution-count');
        if (countEl) countEl.textContent = `(${solutions.length})`;
    } catch (err) {
        container.innerHTML = '<div class="empty-state"><h3>Failed to load solutions</h3></div>';
    }
}

// ===== TOP SOLUTIONS (Left Panel) =====
function renderTopSolutions(solutions) {
    const container = document.getElementById('top-solutions-list');
    const countEl = document.getElementById('top-solution-count');

    if (countEl) countEl.textContent = `(${solutions.length})`;

    if (!solutions || solutions.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding:1.5rem 0;">
                <div class="empty-state-icon">&#128161;</div>
                <h3 style="font-size:1rem;">No solutions yet</h3>
                <p style="font-size:0.85rem;">Be the first!</p>
            </div>
        `;
        return;
    }

    // Already sorted by likes (descending) from the backend
    container.innerHTML = solutions.map((s, i) => {
        const initial = s.authorName ? s.authorName.charAt(0).toUpperCase() : '?';
        const spPicUrl = s.authorProfilePicUrl ? (s.authorProfilePicUrl.startsWith('http') ? s.authorProfilePicUrl : window.BACKEND_BASE_URL + s.authorProfilePicUrl) : null;
        const avatarHtml = spPicUrl
            ? `<img class="sp-avatar" src="${escapeHtml(spPicUrl)}" alt="" onerror="this.outerHTML='<span class=sp-avatar-initial>${initial}</span>'">`
            : `<span class="sp-avatar-initial">${initial}</span>`;
        const tagsHtml = s.tags && s.tags.length > 0
            ? `<div class="sp-tags">${s.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`
            : '';

        return `
            <div class="sp-solution" style="animation-delay:${i * 0.06}s">
                <div class="sp-solution-header">
                    ${avatarHtml}
                    <span class="sp-author">${escapeHtml(s.authorName)}</span>
                </div>
                <p class="sp-desc">${escapeHtml(s.description)}</p>
                ${tagsHtml}
                <div class="sp-footer">
                    <div class="sp-stats">
                        <span>${ICON.thumbUp} ${s.likeCount}</span>
                        <span>${ICON.comment} ${s.commentCount}</span>
                    </div>
                    <a href="#solution-${s.id}" class="sp-view-link" onclick="scrollToSolution('solution-${s.id}')">
                        View solution &rarr;
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

// ===== ALL SOLUTIONS (Right Side) =====
function renderSolutions(solutions) {
    const container = document.getElementById('solutions-list');
    const submitBtn = document.getElementById('submit-solution-btn');

    if (submitBtn) {
        submitBtn.style.display = isLoggedIn() ? 'inline-flex' : 'none';
        submitBtn.onclick = () => {
            window.location.href = `submit-solution.html?problemId=${problemId}`;
        };
    }

    if (!solutions || solutions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">&#128161;</div>
                <h3>No solutions yet</h3>
                <p>Be the first to submit a solution!</p>
            </div>
        `;
        return;
    }

    const currentUser = getCurrentUser();

    container.innerHTML = solutions.map((s, i) => {
        const initial = s.authorName ? s.authorName.charAt(0).toUpperCase() : '?';
        const sPicUrl = s.authorProfilePicUrl ? (s.authorProfilePicUrl.startsWith('http') ? s.authorProfilePicUrl : window.BACKEND_BASE_URL + s.authorProfilePicUrl) : null;
        const avatarHtml = sPicUrl
            ? `<img src="${escapeHtml(sPicUrl)}" alt="" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" onerror="this.outerHTML='<span class=solution-avatar-initial>${initial}</span>'">`
            : `<span class="solution-avatar-initial">${initial}</span>`;
        const tagsHtml = s.tags && s.tags.length > 0
            ? `<div class="card-tags" style="margin-top:0.75rem;">${s.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`
            : '';

        return `
        <div class="solution-card" id="solution-${s.id}" style="animation-delay:${i * 0.08}s">
            <div class="solution-header">
                <div style="display:flex;align-items:center;gap:0.6rem;">
                    ${avatarHtml}
                    <div>
                        <span class="solution-author">${escapeHtml(s.authorName)}</span>
                        <span class="solution-date">&middot; ${timeAgo(s.createdAt)}</span>
                    </div>
                </div>
                ${(isAdmin() || (currentUser && currentUser.userId === s.authorId)) ? `
                    <button class="btn-icon delete" onclick="deleteSolution(${s.id})" title="Delete">${ICON.trash}</button>
                ` : ''}
            </div>
            <p class="solution-desc">${escapeHtml(s.description)}</p>
            ${tagsHtml}
            <a class="solution-repo" href="${escapeHtml(s.repoUrl)}" target="_blank" onclick="event.stopPropagation()">
                ${ICON.link} ${escapeHtml(s.repoUrl)}
            </a>
            ${s.screenshotUrls && s.screenshotUrls.length > 0 ? `
                <div class="solution-screenshots">
                    ${s.screenshotUrls.map((url, idx) => `
                        <img src="${escapeHtml(url)}" alt="Screenshot ${idx + 1}" class="solution-screenshot" onclick="event.stopPropagation(); window.openScreenshot('${escapeHtml(url)}')" loading="lazy">
                    `).join('')}
                </div>
            ` : ''}
            <div class="solution-actions">
                <button class="like-btn ${s.likedByCurrentUser ? 'liked' : ''}" onclick="toggleLike(${s.id}, this)"
                    ${!isLoggedIn() ? 'title="Login to like"' : ''}>
                    ${s.likedByCurrentUser ? ICON.heartFilled : ICON.heartOutline} <span class="like-count">${s.likeCount}</span>
                </button>
                <button class="comment-toggle" onclick="toggleComments(${s.id}, this)">
                    ${ICON.comment} <span id="comment-count-${s.id}">${s.commentCount}</span> comments
                </button>
            </div>
            <div class="comments-section" id="comments-${s.id}">
                <div class="comments-list" id="comments-list-${s.id}"></div>
                ${isLoggedIn() ? `
                    <div class="comment-form">
                        <input type="text" placeholder="Write a comment..." id="comment-input-${s.id}">
                        <button onclick="postComment(${s.id})">Post</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    }).join('');
}

// Smooth scroll to a solution from the top solutions panel
window.scrollToSolution = function (id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.transition = 'box-shadow 0.3s';
        el.style.boxShadow = '0 0 0 3px var(--primary), 0 8px 25px rgba(25, 135, 84, 0.2)';
        setTimeout(() => {
            el.style.boxShadow = '';
        }, 1500);
    }
};

window.toggleLike = async function (solutionId, btn) {
    if (!isLoggedIn()) {
        showToast('Please login to like solutions', 'error');
        return;
    }

    try {
        const result = await apiFetch(`/likes/toggle/${solutionId}`, { method: 'POST' });
        const countSpan = btn.querySelector('.like-count');
        countSpan.textContent = result.likeCount;

        if (result.liked) {
            btn.classList.add('liked');
            btn.innerHTML = `${ICON.heartFilled} <span class="like-count">${result.likeCount}</span>`;
        } else {
            btn.classList.remove('liked');
            btn.innerHTML = `${ICON.heartOutline} <span class="like-count">${result.likeCount}</span>`;
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
};

window.toggleComments = async function (solutionId, btn) {
    const section = document.getElementById(`comments-${solutionId}`);
    const isOpen = section.classList.contains('open');

    if (isOpen) {
        section.classList.remove('open');
        return;
    }

    section.classList.add('open');
    const list = document.getElementById(`comments-list-${solutionId}`);
    list.innerHTML = '<div class="loading" style="padding:0.5rem"><div class="spinner" style="width:24px;height:24px"></div></div>';

    try {
        const comments = await apiFetch(`/comments/solution/${solutionId}`);
        renderComments(solutionId, comments);
    } catch (err) {
        list.innerHTML = '<p style="color:var(--danger)">Failed to load comments</p>';
    }
};

function renderComments(solutionId, comments) {
    const list = document.getElementById(`comments-list-${solutionId}`);
    const currentUser = getCurrentUser();

    if (!comments || comments.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem 0">No comments yet</p>';
        return;
    }

    list.innerHTML = comments.map(c => {
        const ci = c.authorName ? c.authorName.charAt(0).toUpperCase() : '?';
        const picUrl = c.authorProfilePicUrl ? (c.authorProfilePicUrl.startsWith('http') ? c.authorProfilePicUrl : window.BACKEND_BASE_URL + c.authorProfilePicUrl) : null;
        const commentAvatar = picUrl
            ? `<img src="${escapeHtml(picUrl)}" alt="" class="comment-avatar" onerror="this.outerHTML='<span class=comment-avatar-initial>${ci}</span>'">`
            : `<span class="comment-avatar-initial">${ci}</span>`;
        return `
        <div class="comment-item">
            <div class="comment-header">
                ${commentAvatar}
                <div>
                    <span class="comment-author">${escapeHtml(c.authorName)}</span>
                    <span class="comment-time">${timeAgo(c.createdAt)}</span>
                </div>
                ${(isAdmin() || (currentUser && currentUser.userId === c.authorId)) ? `
                    <button class="btn-icon delete" style="margin-left:auto;width:24px;height:24px;font-size:0.7rem" onclick="deleteComment(${c.id}, ${solutionId})" title="Delete">${ICON.trash}</button>
                ` : ''}
            </div>
            <p class="comment-text">${escapeHtml(c.content)}</p>
        </div>`;
    }).join('');
}

window.postComment = async function (solutionId) {
    const input = document.getElementById(`comment-input-${solutionId}`);
    const content = input.value.trim();
    if (!content) return;

    try {
        await apiFetch(`/comments/solution/${solutionId}`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
        input.value = '';

        const comments = await apiFetch(`/comments/solution/${solutionId}`);
        renderComments(solutionId, comments);

        const countEl = document.getElementById(`comment-count-${solutionId}`);
        if (countEl) countEl.textContent = comments.length;

        showToast('Comment posted!');
    } catch (err) {
        showToast(err.message, 'error');
    }
};

window.deleteComment = async function (commentId, solutionId) {
    if (!confirm('Delete this comment?')) return;

    try {
        await apiFetch(`/comments/${commentId}`, { method: 'DELETE' });

        const comments = await apiFetch(`/comments/solution/${solutionId}`);
        renderComments(solutionId, comments);

        const countEl = document.getElementById(`comment-count-${solutionId}`);
        if (countEl) countEl.textContent = comments.length;

        showToast('Comment deleted');
    } catch (err) {
        showToast(err.message, 'error');
    }
};

window.deleteSolution = async function (solutionId) {
    if (!confirm('Delete this solution?')) return;

    try {
        await apiFetch(`/solutions/${solutionId}`, { method: 'DELETE' });
        showToast('Solution deleted');
        loadSolutions();
    } catch (err) {
        showToast(err.message, 'error');
    }
};

window.deleteProblemAction = async function () {
    if (!confirm('Delete this challenge and all its solutions?')) return;

    try {
        await apiFetch(`/problems/${problemId}`, { method: 'DELETE' });
        showToast('Challenge deleted');
        window.location.href = 'index.html';
    } catch (err) {
        showToast(err.message, 'error');
    }
};

window.openScreenshot = function (url) {
    const overlay = document.createElement('div');
    overlay.className = 'screenshot-lightbox';
    overlay.innerHTML = `
        <div class="screenshot-lightbox-content">
            <img src="${url}" alt="Screenshot">
            <button class="screenshot-lightbox-close" onclick="this.closest('.screenshot-lightbox').remove()">&times;</button>
        </div>
    `;
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
};

window.toggleSaveProblem = async function (btnEl) {
    try {
        const res = await apiFetch(`/problem-likes/toggle/${problemId}`, { method: 'POST' });
        isProblemSaved = res.liked;
        if (res.liked) {
            btnEl.classList.add('saved');
            btnEl.innerHTML = `${ICON.bookmarkFilled} <span>Saved</span>`;
            showToast('Challenge saved!');
        } else {
            btnEl.classList.remove('saved');
            btnEl.innerHTML = `${ICON.bookmark} <span>Save</span>`;
            showToast('Removed from saved');
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
