import { apiFetch, isLoggedIn, isAdmin, getCurrentUser, updateNavbar, showToast } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    loadUserCredits();
    loadOffers();
    setupAdminControls();
});

async function loadUserCredits() {
    const creditsEl = document.getElementById('credits-count');
    if (!isLoggedIn()) {
        creditsEl.textContent = '0';
        return;
    }
    try {
        const user = await apiFetch('/users/me');
        creditsEl.textContent = user.credits || 0;
    } catch {
        creditsEl.textContent = '0';
    }
}

async function loadOffers() {
    const grid = document.getElementById('offers-grid');
    try {
        const offers = await apiFetch('/offers');
        renderOffers(offers);
    } catch (err) {
        grid.innerHTML = '<div class="empty-state"><h3>Failed to load offers</h3></div>';
    }
}

function renderOffers(offers) {
    const grid = document.getElementById('offers-grid');

    if (!offers || offers.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">&#127873;</div>
                <h3>No offers available yet</h3>
                <p>Check back soon!</p>
            </div>
        `;
        return;
    }

    const admin = isAdmin();

    grid.innerHTML = offers.map((o, i) => `
        <div class="offer-card ${!admin && o.redeemable ? 'offer-redeemable' : (!admin ? 'offer-locked' : '')}" style="animation-delay:${i * 0.1}s">
            <div class="offer-header">
                <h3 class="offer-title">${escapeHtml(o.title)}</h3>
                <div class="offer-credits-req">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ${o.creditsRequired} credits
                </div>
            </div>
            <p class="offer-desc">${escapeHtml(o.description)}</p>
            <div class="offer-footer">
                ${admin
                    ? `<span class="offer-admin-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        Admin — view only
                    </span>`
                    : o.redeemable
                        ? `<button class="btn btn-primary btn-sm" onclick="redeemOffer(${o.id})">Redeem Now</button>`
                        : `<span class="offer-locked-text">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            Need ${o.creditsRequired} credits to unlock
                        </span>`
                }
            </div>
            ${!admin && o.redeemable ? '<div class="offer-glow"></div>' : ''}
        </div>
    `).join('');
}

window.redeemOffer = async function (offerId) {
    if (!isLoggedIn()) {
        showToast('Please login to redeem offers', 'error');
        return;
    }
    if (!confirm('Redeem this offer? Credits will be deducted from your account.')) return;

    try {
        const result = await apiFetch(`/offers/${offerId}/redeem`, { method: 'POST' });
        showToast(result.message);
        document.getElementById('credits-count').textContent = result.remainingCredits;

        // Update stored user
        const user = getCurrentUser();
        if (user) {
            user.credits = result.remainingCredits;
            localStorage.setItem('current_user', JSON.stringify(user));
        }

        loadOffers();
    } catch (err) {
        showToast(err.message, 'error');
    }
};

function setupAdminControls() {
    const createBtn = document.getElementById('create-offer-btn');
    if (createBtn) {
        createBtn.style.display = isAdmin() ? 'inline-flex' : 'none';
    }

    const overlay = document.getElementById('offer-modal');
    if (!overlay) return;

    createBtn?.addEventListener('click', () => {
        document.getElementById('offer-form').reset();
        overlay.classList.add('active');
    });

    document.getElementById('offer-modal-close')?.addEventListener('click', () => {
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });

    document.getElementById('offer-form')?.addEventListener('submit', handleOfferSubmit);
}

async function handleOfferSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;

    const payload = {
        title: document.getElementById('offer-title').value,
        description: document.getElementById('offer-description').value,
        creditsRequired: parseInt(document.getElementById('offer-credits').value),
        link: document.getElementById('offer-link').value || null,
    };

    try {
        await apiFetch('/offers', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Offer created!');
        document.getElementById('offer-modal').classList.remove('active');
        loadOffers();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
