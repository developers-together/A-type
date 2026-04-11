import { initTheme } from './modules/theme';
import { initEvents } from './modules/events';
import { newGame } from './modules/game';
import { initInfo } from './modules/pages/info';
import { initLogin } from './modules/pages/login';

window.addEventListener('load', () => {
    initTheme();
    initInfo();
    initLogin();

    if (document.getElementById('words')) {
        initEvents();
        newGame();
    }
});
