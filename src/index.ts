import './styles/global.css';
import './styles/garage.css';
import newElement from './newElement';
import Router from './router';
import { showListCars } from './cars';

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

export default function createDGarage(router?: Router): void {
  const body = document.body;
  const container = newElement('div', '', body, ['garage-container']);

  const nav = newElement('nav', '', container, ['garage-nav']);
  const toGarageBtn = newElement('button', 'TO GARAGE', nav, [
    'nav-btn',
    'active',
  ]);
  const toWinnersBtn = newElement('button', 'TO WINNERS', nav, ['nav-btn']);

  const garageSection = newElement('section', '', container, [
    'garage-section',
  ]);

  const controls = newElement('div', '', garageSection, ['controls']);
  const createGroup = newElement('div', '', controls, ['control-group']);
  const createInput = newElement('input', '', createGroup, ['control-input'], {
    type: 'text',
  });
  const colorInput = newElement('input', '', createGroup, ['control-input'], {
    type: 'color',
    value: '#ffffff',
  });
  const createBtn = newElement('button', 'CREATE', createGroup, [
    'control-btn',
  ]);

  const updateGroup = newElement('div', '', controls, ['control-group']);
  const updateInput = newElement('input', '', updateGroup, ['control-input'], {
    type: 'text',
  });
  const updateColorInput = newElement(
    'input',
    '',
    updateGroup,
    ['control-input'],
    {
      type: 'color',
      value: '#ffffff',
    },
  );
  const updateBtn = newElement('button', 'UPDATE', updateGroup, [
    'control-btn',
  ]);

  const actions = newElement('div', '', garageSection, ['actions']);
  const raceBtn = newElement('button', 'RACE', actions, [
    'action-btn',
    'primary',
  ]);
  const resetBtn = newElement('button', 'RESET', actions, ['action-btn']);
  const generateBtn = newElement('button', 'GENERATE 100 CARS', actions, [
    'action-btn',
  ]);

  //отображение нужного колличества машин
  showListCars(garageSection);

  const footer = newElement('footer', '© 2025 Async Race', body, ['footer']);
}
