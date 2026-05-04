import { apiFetch, isLoggedIn, isAdmin, updateNavbar, showToast, timeAgo } from './api.js';

const ICON = {
    code: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    star: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    bookmark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
    bookmarkFilled: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
};

let savedProblemIds = new Set();

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    loadSavedProblems();
});

async function loadSavedProblems() {
    const grid = document.getElementById('saved-grid');
    grid.innerHTML = '<div class="loading"><div class="spinner"></div>Loading saved challenges...</div>';

    try {
        const [allProblems, likedIds] = await Promise.all([
            apiFetch('/problems'),
            apiFetch('/problem-likes/my'),
        ]);

        savedProblemIds = new Set(likedIds);
        const saved = allProblems.filter(p => savedProblemIds.has(p.id));

        const countEl = document.getElementById('saved-count');
        if (countEl) countEl.textContent = `${saved.length} challenge${saved.length !== 1 ? 's' : ''}`;

        if (saved.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <h3>No saved challenges yet</h3>
                    <p>Browse challenges and click the bookmark icon to save them for later.</p>
                    <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Challenges</a>
                </div>
            `;
            return;
        }

        renderSavedProblems(saved);
    } catch (err) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">!</div><h3>Failed to load</h3><p>' + err.message + '</p></div>';
    }
}

function renderSavedProblems(problems) {
    const grid = document.getElementById('saved-grid');

    grid.innerHTML = problems.map(p => `
        <div class="card" onclick="window.location.href='problem-detail.html?id=${p.id}'">
            <div class="card-header">
                <h3 class="card-title">${escapeHtml(p.title)}</h3>
                <span class="badge badge-${(p.difficulty || '').toLowerCase()}">${(p.difficulty || '').charAt(0).toUpperCase() + (p.difficulty || '').slice(1).toLowerCase()}</span>
            </div>
            <p class="card-desc">${escapeHtml(p.introduction)}</p>
            ${p.category ? `<span class="category-badge" onclick="event.stopPropagation()">${escapeHtml(p.category)}</span>` : ''}
            <div class="card-tags">
                ${p.tags.map(t => `<span class="tag">${escapeHtml(t.trim())}</span>`).join('')}
            </div>
            <div class="card-footer" style="margin-top: 0.75rem;">
                <div class="card-meta">
                    <span>${ICON.code} ${p.solutionCount} solution${p.solutionCount !== 1 ? 's' : ''}</span>
                    <span class="credits-badge">${ICON.star} ${p.credits} credits</span>
                    <span>${timeAgo(p.createdAt)}</span>
                </div>
                <button class="btn-bookmark saved" onclick="event.stopPropagation(); window.unsaveProblem(${p.id}, this)" title="Remove from saved">
                    ${ICON.bookmarkFilled}
                </button>
            </div>
        </div>
    `).join('');
}

window.unsaveProblem = async function (problemId, btnEl) {
    try {
        await apiFetch(`/problem-likes/toggle/${problemId}`, { method: 'POST' });
        savedProblemIds.delete(problemId);
        const card = btnEl.closest('.card');
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.remove();
            const countEl = document.getElementById('saved-count');
            if (countEl) countEl.textContent = `${savedProblemIds.size} challenge${savedProblemIds.size !== 1 ? 's' : ''}`;
            const grid = document.getElementById('saved-grid');
            if (grid && grid.children.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <div class="empty-state-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                        </div>
                        <h3>No saved challenges yet</h3>
                        <p>Browse challenges and click the bookmark icon to save them for later.</p>
                        <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Challenges</a>
                    </div>
                `;
            }
        }, 300);
        showToast('Removed from saved');
    } catch (err) {
        showToast(err.message, 'error');
    }
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
