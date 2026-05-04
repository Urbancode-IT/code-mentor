import { apiFetch, isAdmin, isLoggedIn, updateNavbar, showToast, timeAgo } from './api.js';

const ICON = {
    code: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    star: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    bookmark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
    bookmarkFilled: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
};

let allProblems = [];
let likedProblemIds = new Set();
let currentFilter = 'ALL';
let currentCategory = 'ALL';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    loadProblems();
    setupFilters();
    setupCategoryFilters();
    setupSearch();
    setupModal();
});

async function loadProblems() {
    const grid = document.getElementById('problems-grid');
    grid.innerHTML = '<div class="loading"><div class="spinner"></div>Loading challenges...</div>';

    try {
        allProblems = await apiFetch('/problems');
        if (isLoggedIn()) {
            try {
                const ids = await apiFetch('/problem-likes/my');
                likedProblemIds = new Set(ids);
            } catch { likedProblemIds = new Set(); }
        }
        applyFilters();
        setupAdminControls();
    } catch (err) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">!</div><h3>Failed to load problems</h3><p>' + err.message + '</p></div>';
    }
}

function applyFilters() {
    let filtered = allProblems;

    if (currentCategory !== 'ALL') {
        filtered = filtered.filter(p => p.category && p.category === currentCategory);
    }

    if (currentFilter !== 'ALL') {
        filtered = filtered.filter(p => p.difficulty && p.difficulty.toUpperCase() === currentFilter);
    }

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.introduction.toLowerCase().includes(q) ||
            (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
        );
    }

    renderProblems(filtered);
}

function renderProblems(problems) {
    const grid = document.getElementById('problems-grid');

    if (!problems || problems.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">&#128221;</div><h3>No challenges found</h3><p>Try adjusting your filters or search query.</p></div>';
        return;
    }

    grid.innerHTML = problems.map(p => {
        const saved = likedProblemIds.has(p.id);
        return `
        <div class="card" onclick="window.location.href='problem-detail.html?id=${p.id}'">
            <div class="card-header">
                <h3 class="card-title">${escapeHtml(p.title)}</h3>
                <span class="badge badge-${(p.difficulty || '').toLowerCase()}">${(p.difficulty || '').charAt(0).toUpperCase() + (p.difficulty || '').slice(1).toLowerCase()}</span>
            </div>
            <p class="card-desc">${escapeHtml(p.introduction)}</p>
            ${p.category ? `<span class="category-badge" onclick="event.stopPropagation(); window.filterByCategory('${escapeHtml(p.category)}')">${escapeHtml(p.category)}</span>` : ''}
            <div class="card-tags">
                ${p.tags.map(t => `<span class="tag">${escapeHtml(t.trim())}</span>`).join('')}
            </div>
            <div class="card-footer" style="margin-top: 0.75rem;">
                <div class="card-meta">
                    <span>${ICON.code} ${p.solutionCount} solution${p.solutionCount !== 1 ? 's' : ''}</span>
                    <span class="credits-badge">${ICON.star} ${p.credits} credits</span>
                    <span>${timeAgo(p.createdAt)}</span>
                </div>
                <div style="display:flex;align-items:center;gap:0.4rem;" onclick="event.stopPropagation()">
                    ${isLoggedIn() ? `
                    <button class="btn-bookmark ${saved ? 'saved' : ''}" onclick="window.toggleProblemLike(${p.id}, this)" title="${saved ? 'Remove from saved' : 'Save for later'}">
                        ${saved ? ICON.bookmarkFilled : ICON.bookmark}
                    </button>
                    ` : ''}
                    ${isAdmin() ? `
                        <button class="btn-icon" onclick="editProblem(${p.id})" title="Edit">${ICON.edit}</button>
                        <button class="btn-icon delete" onclick="deleteProblem(${p.id})" title="Delete">${ICON.trash}</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `}).join('');
}

function setupFilters() {
    const toggle = document.getElementById('filter-toggle');
    const menu = document.getElementById('filter-menu');
    const label = document.getElementById('filter-label');

    if (!toggle || !menu || !label) return;

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menu.classList.contains('show');
        if (isOpen) {
            toggle.classList.remove('open');
            menu.classList.remove('show');
        } else {
            toggle.classList.add('open');
            menu.classList.add('show');
        }
    });

    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !menu.contains(e.target)) {
            toggle.classList.remove('open');
            menu.classList.remove('show');
        }
    });

    document.querySelectorAll('.filter-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.filter-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            label.textContent = btn.textContent.trim();
            toggle.classList.remove('open');
            menu.classList.remove('show');
            applyFilters();
        });
    });
}

function setupCategoryFilters() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            applyFilters();
        });
    });
}

function setupSearch() {
    const input = document.getElementById('search-input');
    if (!input) return;

    let debounceTimer;
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchQuery = input.value.trim();
            applyFilters();
        }, 300);
    });
}

function setupAdminControls() {
    const createBtn = document.getElementById('create-problem-btn');
    if (createBtn) {
        createBtn.style.display = isAdmin() ? 'inline-flex' : 'none';
    }
}

window.toggleProblemLike = async function (problemId, btnEl) {
    try {
        const res = await apiFetch(`/problem-likes/toggle/${problemId}`, { method: 'POST' });
        if (res.liked) {
            likedProblemIds.add(problemId);
            btnEl.classList.add('saved');
            btnEl.innerHTML = ICON.bookmarkFilled;
            btnEl.title = 'Remove from saved';
        } else {
            likedProblemIds.delete(problemId);
            btnEl.classList.remove('saved');
            btnEl.innerHTML = ICON.bookmark;
            btnEl.title = 'Save for later';
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
};

function setupModal() {
    const overlay = document.getElementById('problem-modal');
    if (!overlay) return;

    document.getElementById('create-problem-btn')?.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Create Challenge';
        document.getElementById('problem-form').reset();
        document.getElementById('problem-form').dataset.editId = '';
        overlay.classList.add('active');
    });

    document.getElementById('modal-close')?.addEventListener('click', () => {
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });

    document.getElementById('problem-form')?.addEventListener('submit', handleProblemSubmit);
}

async function handleProblemSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const editId = form.dataset.editId;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    const payload = {
        title: document.getElementById('prob-title').value,
        introduction: document.getElementById('prob-introduction').value,
        requirements: document.getElementById('prob-requirements').value,
        suggestedImplementation: document.getElementById('prob-suggested-impl').value,
        difficulty: document.getElementById('prob-difficulty').value,
        category: document.getElementById('prob-category').value,
        tags: document.getElementById('prob-tags').value,
    };

    try {
        if (editId) {
            await apiFetch(`/problems/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
            showToast('Challenge updated!');
        } else {
            await apiFetch('/problems', { method: 'POST', body: JSON.stringify(payload) });
            showToast('Challenge created!');
        }
        document.getElementById('problem-modal').classList.remove('active');
        loadProblems();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
    }
}

window.editProblem = async function (id) {
    try {
        const problem = await apiFetch(`/problems/${id}`);
        document.getElementById('modal-title').textContent = 'Edit Challenge';
        document.getElementById('prob-title').value = problem.title;
        document.getElementById('prob-introduction').value = problem.introduction;
        document.getElementById('prob-requirements').value = problem.requirements;
        document.getElementById('prob-suggested-impl').value = problem.suggestedImplementation || '';
        document.getElementById('prob-difficulty').value = problem.difficulty;
        document.getElementById('prob-category').value = problem.category || '';
        document.getElementById('prob-tags').value = problem.tags.join(',');
        document.getElementById('problem-form').dataset.editId = id;
        document.getElementById('problem-modal').classList.add('active');
    } catch (err) {
        showToast(err.message, 'error');
    }
};

window.deleteProblem = async function (id) {
    if (!confirm('Are you sure you want to delete this challenge? All solutions and comments will be removed.')) return;

    try {
        await apiFetch(`/problems/${id}`, { method: 'DELETE' });
        showToast('Challenge deleted');
        loadProblems();
    } catch (err) {
        showToast(err.message, 'error');
    }
};

window.filterByCategory = function (category) {
    currentCategory = category;
    // Update the active state on category buttons
    document.querySelectorAll('.category-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.category === category);
    });
    applyFilters();
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
