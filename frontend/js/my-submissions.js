import { apiFetch, isLoggedIn, getCurrentUser, updateNavbar, showToast, timeAgo } from './api.js';

let allSolutions = [];

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();

    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    loadSubmissions();
    setupFilters();
});

async function loadSubmissions() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    try {
        allSolutions = await apiFetch(`/solutions/user/${currentUser.userId}`);
        renderStats(allSolutions);
        renderSubmissions(allSolutions);
    } catch (err) {
        document.getElementById('submissions-list').innerHTML =
            '<div class="empty-state"><h3>Failed to load submissions</h3></div>';
    }
}

function renderStats(solutions) {
    const container = document.getElementById('submissions-stats');
    const totalLikes = solutions.reduce((sum, s) => sum + s.likeCount, 0);
    const totalComments = solutions.reduce((sum, s) => sum + s.commentCount, 0);

    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${solutions.length}</div>
            <div class="stat-label">Solutions</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${totalLikes}</div>
            <div class="stat-label">Total Likes</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${totalComments}</div>
            <div class="stat-label">Total Comments</div>
        </div>
    `;
}

function setupFilters() {
    document.querySelectorAll('.sort-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.sort-pill.active').classList.remove('active');
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            let sorted = [...allSolutions];
            if (filter === 'most-liked') {
                sorted.sort((a, b) => b.likeCount - a.likeCount);
            } else if (filter === 'recent') {
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }
            renderSubmissions(sorted);
        });
    });
}

function renderSubmissions(solutions) {
    const container = document.getElementById('submissions-list');

    if (!solutions || solutions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">&#128640;</div>
                <h3>No submissions yet</h3>
                <p>Head over to the <a href="index.html">challenges</a> and submit your first solution!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = solutions.map(s => `
        <div class="solution-card submission-item" onclick="window.location.href='problem-detail.html?id=${s.problemId}'">
            <div class="solution-header">
                <div>
                    <span class="solution-author">${escapeHtml(s.problemTitle)}</span>
                </div>
            </div>
            <p class="solution-desc">${escapeHtml(s.description)}</p>
            <a class="solution-repo" href="${escapeHtml(s.repoUrl)}" target="_blank" onclick="event.stopPropagation()">
                &#128279; ${escapeHtml(s.repoUrl)}
            </a>
            <div class="submission-footer">
                <div class="card-meta">
                    <span>&#10084; ${s.likeCount}</span>
                    <span>&#128172; ${s.commentCount}</span>
                </div>
                <span class="solution-date">${timeAgo(s.createdAt)}</span>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
