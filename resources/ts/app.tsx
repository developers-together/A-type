import { initTheme } from './modules/theme';
import { initEvents } from './modules/events';
import { newGame } from './modules/game';
import { initInfo } from './modules/pages/info';
import { createRoot } from 'react-dom/client';
import { AuthApp } from './auth/AuthApp';

window.addEventListener('load', () => {
    const authRoot = document.getElementById('auth-root');

    if (authRoot) {
        createRoot(authRoot).render(<AuthApp />);
    }

    initTheme();
    initInfo();

    if (document.getElementById('words')) {
        initEvents();
        newGame();
    }
});
