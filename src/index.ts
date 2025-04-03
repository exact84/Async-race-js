import './styles/global.css';
import './styles/garage.css';
import newElement from './newElement';
import Router from './router';


document.addEventListener('DOMContentLoaded', initApp);

function initApp(): void {
  const body = document.body;
  if (!body) return;
  new Router(body);
}

function createModalMessage(
  title: string,
  message: string,
  parent: HTMLElement = document.body,
): void {
  const modalOverlay = newElement('div', '', parent, ['modal-overlay']);
  const modalContent = newElement('div', '', modalOverlay, ['modal-content']);

  newElement('h3', title, modalContent);
  newElement('p', message, modalContent);

  const buttonContainer = newElement('div', '', modalContent, [
    'modal-buttons',
  ]);
  const okButton = newElement('button', 'OK', buttonContainer, [
    'modal-btn',
    'confirm-btn',
  ]);

  document.body.classList.add('modal-open');

  okButton.addEventListener('click', () => {
    modalOverlay.remove();
    document.body.classList.remove('modal-open');
  });

  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
      modalOverlay.remove();
      document.body.classList.remove('modal-open');
    }
  });

  const handleEscapeKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      modalOverlay.remove();
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', handleEscapeKey);
    }
  };
  document.addEventListener('keydown', handleEscapeKey);
}

export default function createDGarage(router?: Router): void {}
