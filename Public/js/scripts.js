import { initTheme } from './modules/theme.js';
import { initEvents } from './modules/events.js';
import { newGame } from './modules/game.js';
import { initInfo } from './modules/pages/info.js';
import { initLogin } from './modules/pages/login.js';

window.addEventListener('load', () => {
    initTheme();
    initEvents();
    newGame();
    initInfo();
    initLogin();
});
