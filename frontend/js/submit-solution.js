import { apiFetch, isLoggedIn, updateNavbar, showToast } from './api.js';

let problemId;
let problemDifficulty = '';

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();

    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    problemId = params.get('problemId');

    if (!problemId) {
        window.location.href = 'index.html';
        return;
    }

    loadProblemInfo();

    document.getElementById('solution-form').addEventListener('submit', handleSubmit);
});

async function loadProblemInfo() {
    try {
        const problem = await apiFetch(`/problems/${problemId}`);
        document.getElementById('problem-title').textContent = problem.title;
        document.getElementById('problem-difficulty').textContent = problem.difficulty;
        document.getElementById('problem-difficulty').className = `badge badge-${problem.difficulty.toLowerCase()}`;
        problemDifficulty = problem.difficulty;
    } catch (err) {
        showToast('Failed to load problem info', 'error');
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    try {
        await apiFetch(`/solutions/problem/${problemId}`, {
            method: 'POST',
            body: JSON.stringify({
                repoUrl: document.getElementById('repo-url').value,
                description: document.getElementById('solution-desc').value,
                tags: document.getElementById('solution-tags').value,
            }),
        });

        const credits = problemDifficulty === 'ADVANCED' ? 30
            : problemDifficulty === 'INTERMEDIATE' ? 20 : 10;

        const buddyMessages = [
            `Awesome! You earned ${credits} credits!`,
            `${credits} credits in the bag! Nice work!`,
            `Solution shipped! +${credits} credits!`,
            `Boom! ${credits} credits earned! Keep going!`,
            `That's ${credits} more credits for you!`,
        ];

        showToast('Solution submitted! You earned credits!');

        if (window.showBuddyMessage) {
            window.showBuddyMessage(
                buddyMessages[Math.floor(Math.random() * buddyMessages.length)],
                4500
            );
        }

        setTimeout(() => {
            window.location.href = `problem-detail.html?id=${problemId}`;
        }, 2000);
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Submit Solution';
    }
}
