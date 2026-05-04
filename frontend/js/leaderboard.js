import { apiFetch, updateNavbar } from './api.js';

let currentTab = 'weekly';

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    loadLeaderboard();
    setupTabs();
});

function setupTabs() {
    const tabs = document.querySelectorAll('.lb-tab');
    const slider = document.querySelector('.lb-tab-slider');

    function moveSlider(tab) {
        slider.style.width = tab.offsetWidth + 'px';
        slider.style.left = tab.offsetLeft + 'px';
    }

    // initial position
    moveSlider(document.querySelector('.lb-tab.active'));

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            moveSlider(tab);
            currentTab = tab.dataset.tab;
            loadLeaderboard();
        });
    });
}

async function loadLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading leaderboard...</div>';

    try {
        const data = await apiFetch(`/leaderboard/${currentTab}`);
        renderLeaderboard(data);
        // Launch confetti only for All Time tab when there are entries
        if (currentTab === 'alltime' && data && data.length > 0 && window.launchConfetti) {
            setTimeout(() => window.launchConfetti(), 400);
        }
    } catch (err) {
        console.error('Leaderboard error:', err);
        container.innerHTML = `<div class="empty-state"><h3>Failed to load leaderboard</h3><p style="color:var(--text-muted);font-size:0.9rem;">${err.message || 'Check if the backend is running'}</p></div>`;
    }
}

const TROPHY_GOLD = `<svg class="trophy-icon trophy-gold" viewBox="0 0 24 24" fill="none"><path d="M6 2h12v6a6 6 0 01-12 0V2z" fill="#FFD700"/><path d="M8 2H4v3a3 3 0 003 3h1V2zM16 2h4v3a3 3 0 01-3 3h-1V2z" fill="#FFD700" opacity=".6"/><rect x="9" y="14" width="6" height="3" rx="1" fill="#FFD700"/><rect x="7" y="17" width="10" height="2" rx="1" fill="#FFD700" opacity=".8"/></svg>`;
const TROPHY_SILVER = `<svg class="trophy-icon trophy-silver" viewBox="0 0 24 24" fill="none"><path d="M6 2h12v6a6 6 0 01-12 0V2z" fill="#C0C0C0"/><path d="M8 2H4v3a3 3 0 003 3h1V2zM16 2h4v3a3 3 0 01-3 3h-1V2z" fill="#C0C0C0" opacity=".6"/><rect x="9" y="14" width="6" height="3" rx="1" fill="#C0C0C0"/><rect x="7" y="17" width="10" height="2" rx="1" fill="#C0C0C0" opacity=".8"/></svg>`;
const TROPHY_BRONZE = `<svg class="trophy-icon trophy-bronze" viewBox="0 0 24 24" fill="none"><path d="M6 2h12v6a6 6 0 01-12 0V2z" fill="#CD7F32"/><path d="M8 2H4v3a3 3 0 003 3h1V2zM16 2h4v3a3 3 0 01-3 3h-1V2z" fill="#CD7F32" opacity=".6"/><rect x="9" y="14" width="6" height="3" rx="1" fill="#CD7F32"/><rect x="7" y="17" width="10" height="2" rx="1" fill="#CD7F32" opacity=".8"/></svg>`;

const CREDIT_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#3B82F6"/><path d="M12 6v12M8 10l4-4 4 4M8 14l4 4 4-4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/></svg>`;

function renderLeaderboard(entries) {
    const container = document.getElementById('leaderboard-container');

    if (!entries || entries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">&#127942;</div>
                <h3>No entries yet</h3>
                <p>Start solving challenges to appear on the leaderboard!</p>
            </div>
        `;
        return;
    }

    const top3 = entries.slice(0, 3);
    const rest = entries.slice(3);
    const trophies = [TROPHY_GOLD, TROPHY_SILVER, TROPHY_BRONZE];

    // Build podium — order: 2nd, 1st, 3rd
    const podiumOrder = [1, 0, 2];
    let podiumHtml = `<div class="lb-podium">`;
    podiumOrder.forEach(idx => {
        if (idx >= top3.length) {
            podiumHtml += `<div class="lb-podium-item lb-podium-${idx + 1} lb-podium-empty"></div>`;
            return;
        }
        const e = top3[idx];
        const avatarHtml = getAvatarHtml(e, 'lb-podium-avatar');
        const placeClass = idx + 1;

        podiumHtml += `
            <div class="lb-podium-item lb-podium-${placeClass}" style="animation-delay:${0.15 + idx * 0.12}s">
                ${avatarHtml}
                <div class="lb-podium-name">${escapeHtml(e.displayName)}</div>
                <div class="lb-podium-trophy">${trophies[idx]}</div>
                <div class="lb-podium-stats">${e.solutionCount} solution${e.solutionCount !== 1 ? 's' : ''}</div>
                <div class="lb-podium-credits">${CREDIT_ICON} <span>${e.credits.toLocaleString()}</span></div>
                <div class="lb-podium-credits-label">Credits</div>
            </div>
        `;
    });
    podiumHtml += `</div>`;

    // Build table
    let tableHtml = '';
    if (rest.length > 0) {
        tableHtml = `
        <div class="lb-table">
            <div class="lb-table-header">
                <span class="lb-col-rank">Rank</span>
                <span class="lb-col-user">User</span>
                <span class="lb-col-solutions">Solutions</span>
                <span class="lb-col-credits">Credits</span>
            </div>
        `;
        rest.forEach((e, i) => {
            const avatarHtml = getAvatarHtml(e, 'lb-table-avatar');
            tableHtml += `
                <div class="lb-table-row" style="animation-delay:${0.4 + i * 0.05}s">
                    <span class="lb-col-rank">${e.rank}</span>
                    <span class="lb-col-user">
                        ${avatarHtml}
                        <span class="lb-table-name">${escapeHtml(e.displayName)}</span>
                    </span>
                    <span class="lb-col-solutions">${e.solutionCount}</span>
                    <span class="lb-col-credits">
                        ${CREDIT_ICON} <strong>${e.credits.toLocaleString()}</strong>
                    </span>
                </div>
            `;
        });
        tableHtml += `</div>`;
    }

    container.innerHTML = podiumHtml + tableHtml;
}

function getAvatarHtml(entry, className) {
    const picUrl = entry.profilePicUrl
        ? (entry.profilePicUrl.startsWith('http') ? entry.profilePicUrl : window.BACKEND_BASE_URL + entry.profilePicUrl)
        : null;
    const initial = entry.displayName ? entry.displayName.charAt(0).toUpperCase() : '?';
    if (picUrl) {
        return `<img class="${className}" src="${escapeHtml(picUrl)}" alt="" onerror="this.outerHTML='<span class=${className}-initial>${initial}</span>'">`;
    }
    return `<span class="${className}-initial">${initial}</span>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
