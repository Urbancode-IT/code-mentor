// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

function initScrollReveal() {
    const selectors = '.card, .solution-card, .stat-card, .sp-solution, .submission-item, .problem-detail-header, .auth-card, .form-group, .profile-hero, .profile-section, .lb-podium-item, .lb-table-row, .offer-card, .solutions-header, .top-solutions-card, .search-bar, .category-filters';
    document.querySelectorAll(selectors).forEach(el => {
        if (!el.classList.contains('reveal-on-scroll')) {
            el.classList.add('reveal-on-scroll');
            revealObserver.observe(el);
        }
    });
}

const gridObserver = new MutationObserver(() => {
    initScrollReveal();
    initCountUp();
});

document.addEventListener('DOMContentLoaded', () => {
    const containers = '.cards-grid, #user-solutions, #solutions-list, .top-solutions-list, #submissions-list, #submissions-stats, #problem-header, .detail-main, #leaderboard-container, #offers-grid';
    document.querySelectorAll(containers).forEach(el => {
        gridObserver.observe(el, { childList: true, subtree: true });
    });

    initScrollReveal();
    createStaticTechBackground();
    initTiltCards();
    initPageEntrance();
    initCardGlow();
    initMagneticButtons();
    initRippleEffect();
    initCountUp();
    initSmoothHoverCards();
    initTextReveal();
    initParallaxHero();
    initScrollProgress();
    initStaggeredCards();
    initStatPulse();
    initSectionFade();
    initInputGlow();
    initNavbarScroll();
    initLeaderboardConfetti();
});

// ===== STATIC TECHNICAL ICONS BACKGROUND =====
function createStaticTechBackground() {
    const container = document.createElement('div');
    container.className = 'tech-bg-icons';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden;';

    const icons = [
        // Python
        `<svg viewBox="0 0 128 128" fill="currentColor"><path d="M63.4 0C29 0 31.2 14.8 31.2 14.8l.1 15.3h32.8v4.6H19.3S0 31.5 0 64.6s16.8 31.9 16.8 31.9h10V80.8s-.5-16.8 16.5-16.8h32.4s16-.3 16-15.5V17.5S94.1 0 63.4 0zM46 9.3a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6z"/><path d="M64.6 128c34.4 0 32.2-14.8 32.2-14.8l-.1-15.3H64v-4.6h44.8S128 96.5 128 63.4s-16.8-31.9-16.8-31.9h-10v15.7s.5 16.8-16.5 16.8H52.3s-16 .3-16 15.5v31S33.9 128 64.6 128zM82 118.7a5.3 5.3 0 1 1 0-10.6 5.3 5.3 0 0 1 0 10.6z"/></svg>`,
        // JavaScript
        `<svg viewBox="0 0 128 128" fill="currentColor"><path d="M2 2h124v124H2V2zm28.3 99.5c2.2 3.8 6.3 7.3 13.2 7.3 7.8 0 12.8-3.9 12.8-12.5V57.2h-10v39c0 4.2-1.7 5.3-4.5 5.3-3.1 0-4.5-2.1-5.9-4.6l-5.6 5.6zm37.7-1.4c2.6 4.3 7.5 8.7 16.1 8.7 8.5 0 15.2-4.4 15.2-12.8 0-7.7-4.4-11.1-12.2-14.6l-2.4-1c-3.9-1.7-5.6-2.8-5.6-5.5 0-2.2 1.7-3.9 4.3-3.9 2.5 0 4.2 1.1 5.7 3.9l7.3-4.7c-3.1-5.5-7.4-7.6-13-7.6-8.2 0-13.4 5.2-13.4 12 0 7.5 4.4 11 11 14.1l2.4 1c4.1 1.8 6.6 3 6.6 6.1 0 2.6-2.4 4.5-6.2 4.5-4.5 0-7.1-2.4-9.1-5.6l-6.7 4.4z"/></svg>`,
        // Java
        `<svg viewBox="0 0 128 128" fill="currentColor"><path d="M47.6 98.6c0 0-8.4 4.9 6 6.6 17.4 2 26.3 1.7 45.5-1.9 0 0 5 3.2 12.1 5.9C69 129 23.4 107.5 47.6 98.6zm-6.6-15.2c0 0-9.4 7 5 8.5 18.7 1.9 33.3 2.1 58.7-2.8 0 0 3.5 3.6 9.1 5.5C59.5 110 17.6 97.7 41 83.4z"/><path d="M69.4 61.8c10.6 12.2-2.8 23.2-2.8 23.2s26.9-13.9 14.6-31.3C69.3 37.4 59.6 30.7 96 10.1c0 0-62.5 15.6-26.6 51.7z"/><path d="M102.2 108.3c0 0 6.2 5.1-6.8 9.1-24.7 7.5-102.8 9.8-124.5.3-7.8-3.4 6.9-8.1 11.5-9.1 4.8-1 7.6-.8 7.6-.8C-18.5 101-30 118 47.2 122.2c95.3 5.2 106.4-20.8 55-13.9zM50.8 70c0 0-47.8 11.4-16.9 15.5 13 1.7 39-.9 63.2-4.3 19.8-2.8 39.8-8.8 39.8-8.8s-7 3-12.1 6.5c-48.8 12.8-143.1 6.8-116-6.2 22.9-11 42-2.7 42-2.7z"/><path d="M91.8 91.5C128 73.1 111.5 55.4 100 58c-2.8.6-4.1 1.2-4.1 1.2s1-1.6 3.1-2.3c23.2-8.1 41 23.9-11 36.6 0 0 .8-.7 3.8-2z"/><path d="M76 0c0 0 22.4 22.4-21.2 56.8-35 27.6-8 43.4 0 61.4-20.4-18.4-35.4-34.6-25.4-49.6C44.2 44.8 85.6 34.4 76 0z"/></svg>`,
        // HTML5
        `<svg viewBox="0 0 128 128" fill="currentColor"><path d="M9.0 0l10.4 118.2L63.8 128l44.7-9.8L119 0H9zm89.4 43.5H43.6l1.5 17h51.8l-4.8 53.4-28.3 7.8-28.2-7.8-1.9-22h16.7l1 11.3 12.4 3.4h.1l12.5-3.4 1.3-14.6H30.6L26.3 26.1h75.4l-3.3 17.4z"/></svg>`,
        // CSS3
        `<svg viewBox="0 0 128 128" fill="currentColor"><path d="M8.8 0l10.4 118.2L63.7 128l44.8-9.8L119.2 0H8.8zm93 43.5l-1.2 12.5-0.5 5H43.6l1.5 17h54l-1.5 16.3-4.8 53.4-28.3 7.8h-0.8l-28.2-7.8-1.9-22h16.7l1 11.3 12.4 3.4h.1l12.5-3.4 1.3-14.6H30.6L26.3 26.1h75.4l.1.4z"/></svg>`,
        // React
        `<svg viewBox="0 0 128 128" fill="currentColor"><circle cx="64" cy="64" r="11.4"/><path d="M107.3 45.2c-2.2-.8-4.5-1.6-6.9-2.3.6-2.4 1.1-4.8 1.5-7.1 2.1-13.2-.2-22.5-6.6-26.1-1.9-1.1-4-1.6-6.4-1.6-7 0-15.9 5.2-24.9 13.9-9-8.7-17.9-13.9-24.9-13.9-2.4 0-4.5.5-6.4 1.6-6.4 3.7-8.7 13-6.6 26.1.4 2.3.9 4.7 1.5 7.1-2.4.7-4.7 1.5-6.9 2.3C8.2 50 1.4 56.6 1.4 64s6.9 14 19.3 18.8c2.2.8 4.5 1.6 6.9 2.3-.6 2.4-1.1 4.8-1.5 7.1-2.1 13.2.2 22.5 6.6 26.1 1.9 1.1 4 1.6 6.4 1.6 7 0 15.9-5.2 24.9-13.9 9 8.7 17.9 13.9 24.9 13.9 2.4 0 4.5-.5 6.4-1.6 6.4-3.7 8.7-13 6.6-26.1-.4-2.3-.9-4.7-1.5-7.1 2.4-.7 4.7-1.5 6.9-2.3 12.5-4.8 19.3-11.4 19.3-18.8s-6.8-14-19.3-18.8zM92.5 14.7c4.1 2.4 5.5 9.8 3.8 20.3-.3 2.1-.8 4.3-1.4 6.6-5.2-1.2-10.7-2-16.5-2.5-3.4-4.8-6.9-9.1-10.4-13 7.4-7.3 14.9-12.3 21-12.3 1.3 0 2.5.3 3.5.9zM81.3 74c-1.8 3.2-3.9 6.4-6.1 9.6-3.7.3-7.4.4-11.2.4-3.9 0-7.6-.1-11.2-.4-2.2-3.2-4.2-6.4-6-9.6-1.9-3.3-3.7-6.7-5.3-10 1.6-3.3 3.4-6.7 5.3-10 1.8-3.2 3.9-6.4 6.1-9.6 3.7-.3 7.4-.4 11.2-.4 3.9 0 7.6.1 11.2.4 2.2 3.2 4.2 6.4 6 9.6 1.9 3.3 3.7 6.7 5.3 10-1.6 3.3-3.4 6.7-5.3 10zm8.3-3.3c1.5 3.5 2.7 6.9 3.8 10.3-3.4.8-7 1.4-10.8 1.9 1.2-1.9 2.5-3.9 3.6-6 1.2-2 2.3-4.1 3.4-6.2zM64 97.8c-2.4-2.6-4.7-5.4-6.9-8.3 2.3.1 4.6.2 6.9.2 2.3 0 4.6-.1 6.9-.2-2.2 2.9-4.5 5.7-6.9 8.3zm-18.6-15c-3.8-.5-7.4-1.1-10.8-1.9 1.1-3.3 2.3-6.8 3.8-10.3 1.1 2 2.2 4.1 3.4 6.1 1.2 2.1 2.4 4.1 3.6 6.1zM64 30.2c2.4 2.6 4.7 5.4 6.9 8.3-2.3-.1-4.6-.2-6.9-.2-2.3 0-4.6.1-6.9.2 2.2-2.9 4.5-5.7 6.9-8.3zm-18.6 15c-1.5-3.5-2.7-6.9-3.8-10.3 3.4-.8 7-1.4 10.8-1.9-1.2 1.9-2.5 3.9-3.6 6-1.2 2-2.3 4.1-3.4 6.2zM35.5 14.7c1-.6 2.2-.9 3.5-.9 6.1 0 13.6 5 21 12.3-3.5 3.8-7 8.2-10.4 13-5.8.5-11.3 1.4-16.5 2.5-.5-2.3-1-4.5-1.4-6.6-1.7-10.5-.3-17.9 3.8-20.3zM23.3 77.5c-11.4-4.4-17-9.8-17-13.5 0-3.7 5.6-9.1 17-13.5 1.8-.7 3.7-1.3 5.7-1.9 1.5 5.3 3.6 10.9 6.3 16.5-2.6 5.5-4.8 11.1-6.3 16.4-2-.6-3.9-1.2-5.7-1.9zm8.9 30.8c-4.1-2.4-5.5-9.8-3.8-20.3.3-2.1.8-4.3 1.4-6.6 5.2 1.2 10.7 2 16.5 2.5 3.4 4.8 6.9 9.1 10.4 13-7.4 7.3-14.9 12.3-21 12.3-1.3 0-2.5-.3-3.5-.9zm60.8-20.3c1.7 10.5.3 17.9-3.8 20.3-1 .6-2.2.9-3.5.9-6.1 0-13.6-5-21-12.3 3.5-3.8 7-8.2 10.4-13 5.8-.5 11.3-1.4 16.5-2.5.5 2.3 1 4.5 1.4 6.6zm9.7-10.5c-1.8.7-3.7 1.3-5.7 1.9-1.5-5.3-3.6-10.9-6.3-16.5 2.6-5.5 4.8-11.1 6.3-16.4 2 .6 3.9 1.2 5.7 1.9 11.4 4.4 17 9.8 17 13.5 0 3.7-5.6 9.1-17 13.5z"/></svg>`,
        // Node.js
        `<svg viewBox="0 0 128 128" fill="none" stroke="currentColor" stroke-width="6"><path d="M64 5.2c-2.1 0-4.2.5-6.1 1.6L14.1 32.3c-3.8 2.2-6.1 6.3-6.1 10.6v51c0 4.4 2.3 8.4 6.1 10.6l43.8 25.5c3.8 2.2 8.4 2.2 12.2 0l43.8-25.5c3.8-2.2 6.1-6.3 6.1-10.6v-51c0-4.4-2.3-8.4-6.1-10.6L70.1 6.8c-1.9-1.1-4-1.6-6.1-1.6z"/><text x="42" y="85" font-size="60" font-weight="bold" fill="currentColor" stroke="none" font-family="Arial">N</text></svg>`,
        // Docker
        `<svg viewBox="0 0 128 128" fill="currentColor"><path d="M124.8 52.1c-4.3-2.5-10-2.8-14.8-1.4-.6-5.2-4-9.7-8-12.9l-1.6-1.3-1.4 1.6c-2.7 3.3-3.4 8.8-3 13 .3 3.2 1.3 6.4 3.2 9-1.4.8-3 1.5-4.5 2-2.8 1-5.8 1.5-8.8 1.5H.1l-.1 1.6c-.1 5.2.6 10.3 2.3 15.2l.1.3.1.3c5.6 13.1 15.7 19.2 29 21.8 5.5 1.1 11 1.5 16.6 1.2 7-.3 13.8-1.8 20.2-4.5 5.3-2.3 10.1-5.4 14.2-9.3 6.8-6.5 10.8-14.7 13.6-23.4h1.2c5.3 0 10.6-1.4 14.5-5 2.2-1.9 3.7-4.5 4.4-7.3l.5-2-.6-.4zM33.7 50.2H24v9.6h9.7v-9.6zm0-10.8H24V49h9.7V39.4zm10.8 10.8h-9.7v9.6h9.7v-9.6zm0-10.8h-9.7V49h9.7V39.4zm0-10.7h-9.7v9.6h9.7V28.7zM55.3 50.2h-9.7v9.6h9.7v-9.6zm0-10.8h-9.7V49h9.7V39.4zM66 50.2h-9.7v9.6H66v-9.6zm10.8 0h-9.7v9.6h9.7v-9.6z"/></svg>`,
        // Git
        `<svg viewBox="0 0 128 128" fill="currentColor"><path d="M124.7 58.1L69.9 3.3c-3.3-3.3-8.7-3.3-12 0l-11.4 11.4 14.4 14.4c3.4-1.1 7.2-.3 9.8 2.4 2.7 2.7 3.5 6.5 2.4 9.9l13.9 13.9c3.4-1.2 7.3-.4 10 2.4 3.7 3.7 3.7 9.8 0 13.5-3.7 3.7-9.8 3.7-13.5 0-2.9-2.9-3.6-7.1-2.1-10.7L68 46.6v36.2c.9.5 1.8 1.1 2.5 1.8 3.7 3.7 3.7 9.8 0 13.5-3.7 3.7-9.8 3.7-13.5 0-3.7-3.7-3.7-9.8 0-13.5.9-.9 2-1.6 3.1-2.1V46c-1.1-.5-2.2-1.2-3.1-2.1-2.9-2.9-3.6-7.2-2-10.8L40.8 19 3.3 56.5c-3.3 3.3-3.3 8.7 0 12l54.8 54.8c3.3 3.3 8.7 3.3 12 0l54.5-54.5c3.3-3.3 3.3-8.7.1-11.7z"/></svg>`,
        // Angular
        `<svg viewBox="0 0 128 128" fill="currentColor"><path d="M64 1.8L3.8 23.7l9.2 79.9L64 126.2l51-22.6 9.2-79.9L64 1.8zm0 14.2l41.6 74H84.1L75.4 74H52.6l-8.7 16H23.6L64 16zm0 25.8L50.2 66.7h27.6L64 41.8z"/></svg>`,
        // Vue.js
        `<svg viewBox="0 0 128 128" fill="currentColor"><path d="M0 8.9h25.6L64 71.5 102.4 8.9H128L64 119.1 0 8.9z"/><path opacity="0.6" d="M25.6 8.9h25.6L64 30.7 76.8 8.9h25.6L64 71.5 25.6 8.9z"/></svg>`,
        // Spring Boot (leaf)
        `<svg viewBox="0 0 128 128" fill="currentColor"><path d="M116.3 19.2C102.9 35.4 82 43.8 61 41c0 0 0 0 0 0C48.3 54.8 41.7 72.8 43.2 91.5c.3 3.4.8 6.7 1.6 9.9C17.1 87.5 3.4 55.5 17.3 27.8 27.2 7.2 50.3-2.7 72.3.6c14 2.1 28.2 8.2 38.6 18.6.2.2.4.4.6.6-1.4 1.2 3.4-2 4.8-.6zM98.6 96.1c-1.3-2.1-2.7-4.1-4.3-6-8.5-10.3-20.6-16.2-33.5-17.1 0 0 0 0 0 0-8.8 10.6-14.1 23.7-14.6 37.5-.1 2.4 0 4.8.2 7.2 25.2 18.6 61 14.7 81.5-10.5-7.1 1.4-21.3.9-29.3-11.1z"/></svg>`,
        // AWS (cloud)
        `<svg viewBox="0 0 128 128" fill="currentColor"><path d="M38.1 72.9c0 1.8.2 3.3.6 4.4.4 1.1 1 2.3 1.7 3.6.3.5.4.9.4 1.3 0 .6-.3 1.1-1 1.7l-3.4 2.3c-.5.3-.9.5-1.3.5-.5 0-1-.3-1.5-.8-1.8-2-3.2-4.1-4.1-6.5C26.4 83 22.5 85.5 18 85.5c-5.4 0-9.7-1.5-12.8-4.6-3.1-3.1-4.7-7.2-4.7-12.3 0-5.5 1.9-9.9 5.8-13.3 3.9-3.4 9.1-5.1 15.6-5.1 2.2 0 4.4.2 6.8.5 2.4.3 4.8.8 7.4 1.4v-4.7c0-4.9-1-8.3-3-10.3s-5.6-3-10.5-3c-2.2 0-4.5.3-6.9.8-2.3.5-4.6 1.3-6.8 2.2-.7.3-1.3.5-1.7.6-.4.1-.7.2-1 .2-.9 0-1.3-.6-1.3-1.9v-2.7c0-1 .1-1.7.4-2.2.3-.5.8-.9 1.7-1.4 2.2-1.1 4.9-2.1 8-2.9C18.5 26.3 22.1 26 25.8 26c7.8 0 13.5 1.8 17.1 5.3 3.6 3.5 5.4 8.9 5.4 16.1v21.2h.1l-.3.3zM20.5 79.5c2.1 0 4.3-.4 6.6-1.2 2.3-.8 4.3-2.2 6-4 1-1.2 1.8-2.5 2.2-4 .4-1.5.7-3.3.7-5.4v-2.6c-1.8-.5-3.8-.9-5.9-1.2-2.1-.3-4.2-.4-6.2-.4-4.3 0-7.4.8-9.5 2.5-2.1 1.7-3.1 4.1-3.1 7.2 0 2.9.8 5.1 2.4 6.6 1.6 1.5 3.8 2.3 6.8 2.5zm44.7 5.7c-1.1 0-1.9-.2-2.4-.7-.5-.4-.9-1.3-1.2-2.4L49.2 30.6c-.3-1.2-.5-2-.5-2.3 0-.9.5-1.4 1.4-1.4h5.3c1.2 0 2 .2 2.5.7.5.4.8 1.3 1.1 2.4l8.6 33.8L76 30c.3-1.2.6-2 1.1-2.4.5-.4 1.3-.7 2.5-.7h4.3c1.2 0 2 .2 2.5.7.5.4.9 1.3 1.1 2.4l8.5 34.3 8.8-34.3c.3-1.2.7-2 1.1-2.4.5-.4 1.3-.7 2.5-.7h5c.9 0 1.5.5 1.5 1.4 0 .3 0 .6-.1.9-.1.3-.2.8-.4 1.4L102.1 82c-.3 1.2-.7 2-1.2 2.4-.5.4-1.3.7-2.4.7h-4.6c-1.2 0-2-.2-2.5-.7-.5-.5-.9-1.3-1.1-2.5L82 48.8l-8.2 33.1c-.3 1.2-.6 2-1.1 2.5-.5.5-1.4.7-2.5.7h-5zM119.3 86c-3.4 0-6.8-.4-10.1-1.2-3.3-.8-5.9-1.7-7.7-2.7-1.1-.6-1.8-1.3-2.1-1.9-.3-.6-.4-1.3-.4-1.9v-2.8c0-1.3.5-1.9 1.4-1.9.4 0 .7.1 1.1.2.4.1.9.3 1.5.6 2.1 1 4.4 1.7 6.9 2.2 2.5.5 4.9.8 7.4.8 3.9 0 7-.7 9.2-2.1 2.2-1.4 3.3-3.5 3.3-6.1 0-1.8-.6-3.3-1.7-4.5-1.1-1.2-3.2-2.3-6.3-3.4l-9-2.8c-4.5-1.4-7.9-3.6-10-6.4-2.1-2.8-3.2-5.9-3.2-9.2 0-2.7.6-5 1.8-7.1 1.2-2.1 2.8-3.9 4.8-5.4 2-1.5 4.3-2.6 6.9-3.4 2.6-.8 5.4-1.1 8.3-1.1 1.5 0 3 .1 4.5.3 1.5.2 2.9.5 4.3.8 1.3.4 2.6.8 3.8 1.2 1.2.5 2.1.9 2.8 1.4.9.6 1.6 1.1 2 1.8.4.6.6 1.4.6 2.3v2.6c0 1.3-.5 2-1.4 2-.5 0-1.3-.3-2.3-.8-3.4-1.5-7.2-2.3-11.4-2.3-3.6 0-6.4.6-8.3 1.8-1.9 1.2-2.9 3.1-2.9 5.8 0 1.8.6 3.4 1.9 4.6 1.3 1.3 3.6 2.5 7 3.6l8.8 2.8c4.5 1.4 7.7 3.4 9.6 6 1.9 2.6 2.9 5.5 2.9 8.8 0 2.7-.6 5.2-1.7 7.4-1.2 2.2-2.8 4.1-4.8 5.6-2.1 1.6-4.5 2.8-7.3 3.6-3 .9-6.1 1.3-9.4 1.3z"/></svg>`,
    ];

    // Pre-defined positions scattered across the page
    const positions = [
        { top: '5%', left: '3%', size: 36, rotate: 15, opacity: 0.06 },
        { top: '8%', left: '88%', size: 34, rotate: -20, opacity: 0.07 },
        { top: '20%', left: '50%', size: 30, rotate: 25, opacity: 0.05 },
        { top: '25%', left: '92%', size: 32, rotate: -35, opacity: 0.06 },
        { top: '35%', left: '8%', size: 38, rotate: 40, opacity: 0.07 },
        { top: '40%', left: '70%', size: 30, rotate: -10, opacity: 0.05 },
        { top: '52%', left: '30%', size: 34, rotate: 50, opacity: 0.06 },
        { top: '58%', left: '85%', size: 32, rotate: -25, opacity: 0.05 },
        { top: '68%', left: '5%', size: 36, rotate: 30, opacity: 0.07 },
        { top: '72%', left: '60%', size: 30, rotate: -15, opacity: 0.06 },
        { top: '82%', left: '40%', size: 34, rotate: 20, opacity: 0.05 },
        { top: '90%', left: '90%', size: 32, rotate: -40, opacity: 0.06 },
    ];

    positions.forEach((pos, i) => {
        const iconEl = document.createElement('div');
        const icon = icons[i % icons.length];
        iconEl.innerHTML = icon;
        iconEl.style.cssText = `
            position: absolute;
            top: ${pos.top};
            left: ${pos.left};
            width: ${pos.size}px;
            height: ${pos.size}px;
            color: rgba(46, 155, 90, 0.35);
            opacity: ${pos.opacity / 0.06};
            transform: rotate(${pos.rotate}deg);
        `;
        container.appendChild(iconEl);
    });

    document.body.appendChild(container);
}

// ===== 3D TILT ON CARDS =====
function initTiltCards() {
    const tiltSelectors = '.card, .solution-card, .auth-card, .sp-solution, .stat-card, .submission-item, .lb-podium-item, .offer-card';

    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll(tiltSelectors).forEach(card => {
            const rect = card.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -2.5;
                const rotateY = ((x - centerX) / centerX) * 2.5;
                card.style.transform = `translateY(-8px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                card.dataset.tilted = '1';
            } else if (card.dataset.tilted) {
                card.style.transform = '';
                delete card.dataset.tilted;
            }
        });
    });
}

// ===== CARD GLOW TRACKING =====
function initCardGlow() {
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.card, .solution-card, .offer-card, .sp-solution, .stat-card').forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', x + 'px');
            card.style.setProperty('--mouse-y', y + 'px');
        });
    });
}

// ===== MAGNETIC BUTTONS =====
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-outline, .category-btn, .sort-pill, .filter-toggle, .lb-tab');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// ===== RIPPLE EFFECT ON BUTTONS =====
function initRippleEffect() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn, .category-btn, .sort-pill, .filter-option');
        if (!btn) return;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${e.clientX - rect.left - size / 2}px;
            top: ${e.clientY - rect.top - size / 2}px;
            background: radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 60%);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleExpand 0.6s ease-out forwards;
            pointer-events: none;
        `;

        btn.style.position = btn.style.position || 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
}

// ===== COUNT-UP ANIMATION =====
function initCountUp() {
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                countObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number, .lb-podium-credits span, .profile-stat-value').forEach(el => {
        if (el.dataset.counted) return;
        el.dataset.counted = '1';
        countObserver.observe(el);
    });
}

function animateNumber(el) {
    const text = el.textContent.replace(/,/g, '');
    const target = parseInt(text);
    if (isNaN(target) || target === 0) return;

    const duration = 1200;
    const start = performance.now();
    const original = el.textContent;

    el.textContent = '0';

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(target * eased);
        el.textContent = current.toLocaleString();
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = original;
        }
    }

    requestAnimationFrame(update);
}

// ===== SMOOTH HOVER GLOW ON CARDS =====
function initSmoothHoverCards() {
    const selectors = '.card, .solution-card, .offer-card, .sp-solution, .stat-card, .lb-podium-item';
    document.querySelectorAll(selectors).forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

// ===== TEXT REVEAL ANIMATION =====
function initTextReveal() {
    const hero = document.querySelector('.hero h1');
    if (!hero) return;

    const words = hero.innerHTML.split(/(\s+|<[^>]+>)/);
    hero.innerHTML = words.map((word, i) => {
        if (word.trim() === '' || word.startsWith('<')) return word;
        return `<span class="word-reveal" style="animation-delay:${i * 0.06}s">${word}</span>`;
    }).join('');
}

// ===== PARALLAX HERO =====
function initParallaxHero() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;
        hero.style.transform = `translateY(${rate}px)`;
        hero.style.opacity = Math.max(0, 1 - scrolled / 500);
    }, { passive: true });
}

// ===== SCROLL PROGRESS BAR =====
function initScrollProgress() {
    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#226f41,#2E9B5A,#34D399);z-index:10000;width:0;transition:width 0.15s ease-out;pointer-events:none;box-shadow:0 0 8px rgba(46,155,90,0.5);';
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = progress + '%';
    }, { passive: true });
}

// ===== STAGGERED CARD ENTRANCE =====
function initStaggeredCards() {
    const gridObserverStagger = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const cards = entry.target.querySelectorAll('.card, .solution-card, .offer-card');
                cards.forEach((card, i) => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(40px) scale(0.95)';
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, i * 80);
                });
                gridObserverStagger.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.cards-grid, #offers-grid').forEach(grid => {
        gridObserverStagger.observe(grid);
    });
}

// ===== HOVER PULSE ON STAT CARDS =====
function initStatPulse() {
    document.querySelectorAll('.stat-card, .lb-podium-item').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.animation = 'statPulse 0.4s ease-out';
        });
        card.addEventListener('animationend', () => {
            card.style.animation = '';
        });
    });
}

// ===== SMOOTH SCROLL-TRIGGERED FADE FOR SECTIONS =====
function initSectionFade() {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    document.querySelectorAll('.category-filters, .search-bar, .filter-dropdown, .solutions-header, .submissions-hero').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        sectionObserver.observe(el);
    });
}

// ===== FOCUS GLOW ON INPUTS =====
function initInputGlow() {
    document.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('focus', () => {
            input.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
            input.style.boxShadow = '0 0 0 3px rgba(46, 155, 90, 0.15), 0 0 15px rgba(34, 111, 65, 0.1)';
        });
        input.addEventListener('blur', () => {
            input.style.boxShadow = '';
        });
    });
}

// ===== NAVBAR SCROLL EFFECT =====
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 60) {
            navbar.style.backdropFilter = 'blur(20px)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.backdropFilter = '';
            navbar.style.boxShadow = '';
        }

        if (currentScroll > lastScroll && currentScroll > 200) {
            navbar.style.transform = 'translateY(-100%)';
            navbar.style.transition = 'transform 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease';
        } else {
            navbar.style.transform = 'translateY(0)';
            navbar.style.transition = 'transform 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease';
        }
        lastScroll = currentScroll;
    }, { passive: true });
}

// ===== PAGE ENTRANCE ANIMATIONS =====
function initPageEntrance() {
    const authCard = document.querySelector('.auth-card');
    if (authCard) {
        authCard.style.animation = 'authEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) both';
    }

    const subHero = document.querySelector('.submissions-hero');
    if (subHero) {
        subHero.style.animation = 'fadeInDown 0.6s ease-out both';
    }

    const profileHero = document.querySelector('.profile-hero');
    if (profileHero) {
        profileHero.style.animation = 'slideUp 0.5s ease-out both';
    }

    const submitForm = document.querySelector('#solution-form')?.closest('div');
    if (submitForm) {
        submitForm.style.animation = 'authEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) both';
    }

    // Stagger nav links
    document.querySelectorAll('.navbar-links a, .navbar-links button').forEach((link, i) => {
        link.style.opacity = '0';
        link.style.animation = `fadeInDown 0.4s ease-out ${0.1 + i * 0.05}s both`;
    });
}

// ===== LEADERBOARD CONFETTI BURST =====
function initLeaderboardConfetti() {
    // Confetti is now triggered from leaderboard.js only for All Time tab with entries
}

function launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10002;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
        '#2E9B5A', '#226f41', '#34D399', '#FFD700', '#FF6B6B',
        '#4FC3F7', '#BA68C8', '#FF8A65', '#AED581', '#FFF176',
    ];

    const pieces = [];
    const PIECE_COUNT = 150;

    for (let i = 0; i < PIECE_COUNT; i++) {
        const startX = canvas.width * (0.2 + Math.random() * 0.6);
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
        const speed = 8 + Math.random() * 12;

        pieces.push({
            x: startX,
            y: canvas.height + 10,
            vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
            vy: Math.sin(angle) * speed - (4 + Math.random() * 6),
            width: 6 + Math.random() * 6,
            height: 4 + Math.random() * 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 12,
            gravity: 0.12 + Math.random() * 0.08,
            drag: 0.98 + Math.random() * 0.015,
            opacity: 1,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.03 + Math.random() * 0.05,
            shape: Math.random() > 0.5 ? 'rect' : 'circle',
        });
    }

    let frame = 0;
    const maxFrames = 300;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frame++;

        let alive = 0;
        pieces.forEach(p => {
            p.vy += p.gravity;
            p.vx *= p.drag;
            p.x += p.vx + Math.sin(p.wobble) * 0.8;
            p.y += p.vy;
            p.rotation += p.rotSpeed;
            p.wobble += p.wobbleSpeed;

            if (frame > maxFrames * 0.6) {
                p.opacity -= 0.015;
            }

            if (p.opacity <= 0 || p.y > canvas.height + 50) return;
            alive++;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = Math.max(0, p.opacity);

            if (p.shape === 'rect') {
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }

            ctx.restore();
        });

        if (alive > 0 && frame < maxFrames) {
            requestAnimationFrame(draw);
        } else {
            canvas.remove();
        }
    }

    requestAnimationFrame(draw);
}

// Expose globally so other pages can trigger it
window.launchConfetti = launchConfetti;
