// =============================================================
//  DevArena frontend config — single source of truth for backend URL.
//  To swap environments, change ONLY the PROD_BACKEND_URL below.
// =============================================================

// Your deployed backend base URL (no trailing slash, no /api).
// e.g. 'https://code-mentor-p7kr.onrender.com'
const PROD_BACKEND_URL = 'https://code-mentor-p7kr.onrender.com';

// Local dev backend (Spring Boot default).
const DEV_BACKEND_URL = 'http://localhost:8080';

const isLocal =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.hostname === '';

const BACKEND_BASE = PROD_BACKEND_URL;

window.BACKEND_BASE_URL = BACKEND_BASE;        // for static assets like /uploads/...
window.API_BASE_URL = `${BACKEND_BASE}/api`;   // for REST calls
