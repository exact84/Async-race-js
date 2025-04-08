import './styles/global.css';
import './styles/garage.css';
import './styles/winners.css';
import { newElement } from './utils';
import Router from './router';
import { routerGlobal } from './router';

document.addEventListener('DOMContentLoaded', initApp);

export default function initApp(): void {
  const body = document.body;

  const container = newElement('div', '', body, ['app-container']);

  const nav = newElement('nav', '', container, ['nav']);
  const toGarageBtn = newElement('button', 'TO GARAGE', nav, ['nav-btn']);
  const toWinnersBtn = newElement('button', 'TO WINNERS', nav, ['nav-btn']);

  const contentContainer = newElement('div', '', container, [
    'content-container',
  ]);

  const router = new Router(contentContainer);
  routerGlobal.appRouter = router;

  toGarageBtn.addEventListener('click', () => {
    toGarageBtn.classList.add('active');
    toWinnersBtn.classList.remove('active');
    router.navigate('/');
  });

  toWinnersBtn.addEventListener('click', () => {
    toWinnersBtn.classList.add('active');
    toGarageBtn.classList.remove('active');
    router.navigate('/winners');
  });

  if (globalThis.location.pathname === '/winners') {
    toWinnersBtn.classList.add('active');
  } else {
    toGarageBtn.classList.add('active');
  }
}
