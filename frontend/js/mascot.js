// ===== DEV ARENA MASCOT - Animated Coding Robot =====
(function () {
    const MASCOT_SIZE = 130;

    const tips = [
        "Keep coding!",
        "You're doing great!",
        "Ship it!",
        "Clean code wins!",
        "Debug like a pro!",
        "Stay curious!",
        "Push your limits!",
        "Code. Build. Showcase!",
        "Try a new challenge!",
        "Level up today!",
    ];

    // ---- Determine page & entrance config ----
    const path = window.location.pathname.split('/').pop() || 'index.html';

    const pageConfigs = {
        'index.html': {
            settle: { bottom: 24, right: 24 },
            from: { x: 300, y: 200 },
            rotation: 25,
        },
        'login.html': {
            settle: { bottom: 24, left: 24 },
            from: { x: -250, y: 100 },
            rotation: -15,
        },
        'register.html': {
            settle: { bottom: 24, left: 24 },
            from: { x: -200, y: -200 },
            rotation: -30,
        },
        'profile.html': {
            settle: { bottom: 24, right: 24 },
            from: { x: 0, y: -300 },
            rotation: 10,
        },
        'problem-detail.html': {
            settle: { bottom: 24, left: 24 },
            from: { x: -300, y: 0 },
            rotation: -20,
        },
        'submit-solution.html': {
            settle: { bottom: 24, right: 24 },
            from: { x: 200, y: -250 },
            rotation: 35,
        },
        'leaderboard.html': {
            settle: { bottom: 100, right: 24 },
            from: { x: 300, y: -200 },
            rotation: -25,
        },
        'my-submissions.html': {
            settle: { bottom: 24, left: 24 },
            from: { x: 0, y: 300 },
            rotation: 15,
        },
        'offers.html': {
            settle: { bottom: 24, right: 24 },
            from: { x: -250, y: -150 },
            rotation: -35,
        },
    };

    const config = pageConfigs[path] || pageConfigs['index.html'];

    const posProps = Object.entries(config.settle)
        .map(([k, v]) => `${k}: ${v}px;`).join(' ');

    const isLeft = config.settle.left !== undefined;
    const bubbleArrowRight = isLeft ? 'auto' : '20px';
    const bubbleArrowLeft = isLeft ? '20px' : 'auto';

    const fromX = config.from.x;
    const fromY = config.from.y;
    const rot = config.rotation;

    // Bubble fixed position
    const bubblePos = [];
    if (config.settle.bottom !== undefined) {
        bubblePos.push(`bottom: ${config.settle.bottom + MASCOT_SIZE + 20}px;`);
    }
    if (config.settle.top !== undefined) {
        bubblePos.push(`bottom: auto; top: ${config.settle.top - 46}px;`);
    }
    if (config.settle.right !== undefined) {
        bubblePos.push(`right: ${config.settle.right}px;`);
    }
    if (config.settle.left !== undefined) {
        bubblePos.push(`left: ${config.settle.left}px;`);
    }
    const bubblePosCSS = bubblePos.join(' ');

    const style = document.createElement('style');
    style.textContent = `
        .mascot-wrap {
            position: fixed;
            ${posProps}
            z-index: 9999;
            width: ${MASCOT_SIZE}px;
            height: ${MASCOT_SIZE + 10}px;
            pointer-events: auto;
            cursor: pointer;
            opacity: 0;
            transform: translate(${fromX}px, ${fromY}px) scale(0.3) rotate(${rot}deg);
            animation: mascotEntrance 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s forwards;
        }

        .mascot-svg {
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 0 12px rgba(34,111,65,0.45));
            transition: filter 0.3s ease;
        }

        .mascot-wrap:hover .mascot-svg {
            filter: drop-shadow(0 0 20px rgba(46,155,90,0.7));
        }

        @keyframes mascotEntrance {
            0%   { transform: translate(${fromX}px, ${fromY}px) scale(0.3) rotate(${rot}deg); opacity: 0; }
            40%  { transform: translate(${-fromX * 0.06}px, ${-fromY * 0.06}px) scale(1.1) rotate(${-rot * 0.2}deg); opacity: 1; }
            60%  { transform: translate(${fromX * 0.03}px, ${fromY * 0.03}px) scale(0.95) rotate(${rot * 0.08}deg); opacity: 1; }
            80%  { transform: translate(${-fromX * 0.01}px, ${-fromY * 0.01}px) scale(1.02) rotate(0deg); opacity: 1; }
            100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
        }

        /* After entrance: lock visible, idle wiggle forever */
        .mascot-wrap.settled {
            opacity: 1 !important;
            animation: mascotIdle 2.5s ease-in-out infinite !important;
        }

        @keyframes mascotIdle {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            15%      { transform: translateY(-2px) rotate(1.5deg); }
            30%      { transform: translateY(0) rotate(-1deg); }
            50%      { transform: translateY(-3px) rotate(0.5deg); }
            70%      { transform: translateY(-1px) rotate(-1.5deg); }
            85%      { transform: translateY(-2px) rotate(1deg); }
        }

        .mascot-eye { animation: mascotBlink 3.5s ease-in-out infinite; }
        .mascot-eye.right-eye { animation-delay: 0.15s; }

        @keyframes mascotBlink {
            0%, 42%, 46%, 100% { transform: scaleY(1); }
            44%                { transform: scaleY(0.05); }
        }

        .mascot-antenna-tip { animation: antennaGlow 2s ease-in-out infinite; }

        @keyframes antennaGlow {
            0%, 100% { opacity: 0.6; }
            50%      { opacity: 1; }
        }

        .mascot-code { animation: codeFlicker 4s steps(1) infinite; }

        @keyframes codeFlicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
            52% { opacity: 1; }
            80% { opacity: 0.8; }
            82% { opacity: 1; }
        }

        .mascot-wrap:hover .mascot-arm-right {
            animation: armWave 0.6s ease-in-out 2;
            transform-origin: 62px 52px;
        }

        @keyframes armWave {
            0%, 100% { transform: rotate(0deg); }
            25%      { transform: rotate(-20deg); }
            75%      { transform: rotate(10deg); }
        }

        /* ---- Speech Bubble ---- */
        .mascot-bubble {
            position: fixed;
            ${bubblePosCSS}
            z-index: 10001;
            background: var(--bg-card, linear-gradient(135deg, #1a3a28, #0d1f15));
            border: 1.5px solid #2E9B5A;
            border-radius: 12px;
            padding: 10px 16px;
            font-family: 'Segoe UI', system-ui, sans-serif;
            font-size: 14px;
            font-weight: 600;
            color: var(--text, #ffffff);
            white-space: nowrap;
            pointer-events: none;
            display: none;
            opacity: 0;
            transform: translateY(8px) scale(0.9);
            box-shadow: var(--shadow, 0 4px 24px rgba(34, 111, 65, 0.5));
        }

        .mascot-bubble::after {
            content: '';
            position: absolute;
            bottom: -7px;
            right: ${bubbleArrowRight};
            left: ${bubbleArrowLeft};
            width: 12px;
            height: 12px;
            background: var(--bg-card, #1a3a28);
            border-right: 1.5px solid #2E9B5A;
            border-bottom: 1.5px solid #2E9B5A;
            transform: rotate(45deg);
        }

        .mascot-bubble.show {
            display: block;
            opacity: 1;
            transform: translateY(0) scale(1);
            animation: bubblePop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .mascot-bubble.hiding {
            display: block;
            animation: bubbleFade 0.3s ease-out forwards;
        }

        @keyframes bubblePop {
            0%   { opacity: 0; transform: translateY(8px) scale(0.85); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes bubbleFade {
            0%   { opacity: 1; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(6px) scale(0.9); }
        }

        @media (max-width: 768px) {
            .mascot-wrap {
                width: 90px;
                height: 100px;
            }
            .mascot-bubble {
                font-size: 12px;
                padding: 8px 12px;
            }
        }
    `;
    document.head.appendChild(style);

    // ---- Get logged-in user ----
    function getUser() {
        try {
            const raw = localStorage.getItem('current_user');
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    function getGreeting(isNewUser) {
        const user = getUser();
        if (!user) return 'Welcome to DevArena!';
        const name = user.displayName || user.username || 'coder';
        const first = name.split(' ')[0];

        if (isNewUser) {
            const welcomes = [
                `Welcome aboard, ${first}! Ready to code?`,
                `Hey ${first}! Great to have you here!`,
                `${first} just joined DevArena! Let's go!`,
                `Welcome, ${first}! Your coding journey starts now!`,
            ];
            return welcomes[Math.floor(Math.random() * welcomes.length)];
        }

        const hour = new Date().getHours();
        if (hour < 12) return `Good morning, ${first}!`;
        if (hour < 17) return `Hey ${first}, welcome back!`;
        return `Good evening, ${first}!`;
    }

    // ---- Build mascot ----
    const wrap = document.createElement('div');
    wrap.className = 'mascot-wrap';
    wrap.title = 'DevArena Buddy';

    function buildMascotSvg() {
        const light = document.documentElement.getAttribute('data-theme') === 'light';
        const bodyFill = light ? '#e8efe8' : '#12121a';
        const innerFill = light ? '#d5e0d5' : '#0a0a0f';

        wrap.innerHTML = `
        <svg class="mascot-svg" viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="40" y1="14" x2="40" y2="4" stroke="#2E9B5A" stroke-width="2" stroke-linecap="round"/>
            <circle class="mascot-antenna-tip" cx="40" cy="3.5" r="3.5" fill="#226f41">
                <animate attributeName="r" values="3.5;5;3.5" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="40" cy="3.5" r="2" fill="#2E9B5A" opacity="0.8"/>
            <rect x="16" y="14" width="48" height="36" rx="8" fill="${bodyFill}" stroke="#226f41" stroke-width="2"/>
            <rect x="18" y="16" width="44" height="32" rx="6" fill="${innerFill}" opacity="0.6"/>
            <g class="mascot-eye" style="transform-origin: 30px 30px;">
                <circle cx="30" cy="30" r="5" fill="#226f41"/>
                <circle cx="30" cy="30" r="2.5" fill="#2E9B5A"/>
                <circle cx="31.5" cy="28.5" r="1" fill="#fff" opacity="0.7"/>
            </g>
            <g class="mascot-eye right-eye" style="transform-origin: 50px 30px;">
                <circle cx="50" cy="30" r="5" fill="#226f41"/>
                <circle cx="50" cy="30" r="2.5" fill="#2E9B5A"/>
                <circle cx="51.5" cy="28.5" r="1" fill="#fff" opacity="0.7"/>
            </g>
            <path d="M34 38 Q40 44 46 38" stroke="#226f41" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <rect x="26" y="52" width="28" height="18" rx="6" fill="${bodyFill}" stroke="#226f41" stroke-width="1.5"/>
            <line x1="36" y1="55" x2="44" y2="55" stroke="#2E9B5A" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
            <circle cx="40" cy="61" r="2" fill="#226f41" opacity="0.6"/>
            <g class="mascot-arm-left">
                <line x1="26" y1="56" x2="16" y2="62" stroke="#226f41" stroke-width="2" stroke-linecap="round"/>
                <circle cx="15" cy="63" r="3" fill="${bodyFill}" stroke="#226f41" stroke-width="1.5"/>
            </g>
            <g class="mascot-arm-right">
                <line x1="54" y1="56" x2="64" y2="62" stroke="#226f41" stroke-width="2" stroke-linecap="round"/>
                <circle cx="65" cy="63" r="3" fill="${bodyFill}" stroke="#226f41" stroke-width="1.5"/>
            </g>
            <line x1="33" y1="70" x2="30" y2="80" stroke="#226f41" stroke-width="2" stroke-linecap="round"/>
            <line x1="47" y1="70" x2="50" y2="80" stroke="#226f41" stroke-width="2" stroke-linecap="round"/>
            <ellipse cx="29" cy="82" rx="5" ry="2.5" fill="${bodyFill}" stroke="#226f41" stroke-width="1.2"/>
            <ellipse cx="51" cy="82" rx="5" ry="2.5" fill="${bodyFill}" stroke="#226f41" stroke-width="1.2"/>
        </svg>`;
    }

    buildMascotSvg();

    // Expose so theme toggle can refresh the mascot
    window.updateMascotTheme = buildMascotSvg;

    // Bubble is a separate fixed element
    const bubble = document.createElement('div');
    bubble.className = 'mascot-bubble';
    document.body.appendChild(bubble);
    document.body.appendChild(wrap);

    // ---- Bubble helpers ----
    let bubbleTimer = null;

    function showBubble(text, duration) {
        clearTimeout(bubbleTimer);
        bubble.classList.remove('show', 'hiding');
        bubble.textContent = text;
        void bubble.offsetWidth;
        bubble.classList.add('show');

        bubbleTimer = setTimeout(() => {
            bubble.classList.remove('show');
            bubble.classList.add('hiding');
            setTimeout(() => bubble.classList.remove('hiding'), 300);
        }, duration || 2500);
    }

    // ---- After entrance, lock visible + idle shake forever ----
    setTimeout(() => {
        // Kill entrance animation, lock transform & opacity so it can never vanish
        wrap.style.animation = 'none';
        wrap.style.opacity = '1';
        wrap.style.transform = 'translate(0,0) scale(1) rotate(0deg)';
        // Force reflow then apply settled class for idle wiggle
        void wrap.offsetWidth;
        wrap.classList.add('settled');

        // Show greeting on home page right after login/register
        const justLoggedIn = sessionStorage.getItem('just_logged_in');
        const justRegistered = sessionStorage.getItem('just_registered');
        if ((justLoggedIn || justRegistered) && (path === 'index.html' || path === '' || path === '/')) {
            sessionStorage.removeItem('just_logged_in');
            const isNew = !!justRegistered;
            sessionStorage.removeItem('just_registered');
            showBubble(getGreeting(isNew), 4500);
        }
    }, 1800);

    // ---- Expose global API so other scripts can trigger buddy messages ----
    window.showBuddyMessage = function (text, duration) {
        showBubble(text, duration || 3500);
    };

    // ---- Click: show random tip (no animation class swapping) ----
    wrap.addEventListener('click', () => {
        showBubble(tips[Math.floor(Math.random() * tips.length)], 2500);
    });

    // ---- Hover: show tip ----
    let hoverTimeout;
    wrap.addEventListener('mouseenter', () => {
        hoverTimeout = setTimeout(() => {
            showBubble(tips[Math.floor(Math.random() * tips.length)], 2000);
        }, 400);
    });
    wrap.addEventListener('mouseleave', () => clearTimeout(hoverTimeout));
})();
