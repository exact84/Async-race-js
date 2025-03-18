import './styles/global.css';
import './styles/start.css';
import newElement from './newElement';
import Router from './router';
import {
  addOptionRow,
  clearOptions,
  getOptions,
  isValidOption,
  setOptions,
  type Option,
} from './optionsManager';

document.addEventListener('DOMContentLoaded', initApp);

function initApp(): void {
  const body = document.body;
  if (!body) return;
  new Router(body);
}

function loadFromFile(file: File, optionsContainer: HTMLElement): void {
  file
    .text()
    .then((content) => {
      const parsedData: unknown = JSON.parse(content);
      if (!Array.isArray(parsedData))
        throw new TypeError('Data is not an array');

      const validOptions: Option[] = [];
      for (const item of parsedData) {
        if (isValidOption(item)) {
          validOptions.push({
            id: item.id ?? 0,
            text: item.text,
            weight: item.weight,
          });
        } else {
          throw new Error('Invalid option format');
        }
      }
      setOptions(validOptions, optionsContainer);
    })
    .catch((error: unknown) => {
      console.error('Failed to load options:', error);
    });
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

function getValidOptions(): Option[] {
  return getOptions().filter(
    (option) => option.text.trim() !== '' && option.weight > 0,
  );
}

function createPasteListModal(
  parent: HTMLElement,
  optionsContainer: HTMLElement,
): void {
  const modalOverlay = newElement('div', '', parent, ['modal-overlay']);
  const modalContent = newElement('div', '', modalOverlay, ['modal-content']);

  newElement('h3', 'Enter your list', modalContent);

  const textarea = newElement('textarea', '', modalContent, ['modal-textarea']);
  if (!(textarea instanceof HTMLTextAreaElement)) {
    console.error('Failed to create textarea');
    return;
  }
  textarea.rows = 10;
  textarea.cols = 50;
  textarea.placeholder = 'Enter one option per line, e.g.: title1, weight1';

  const buttonContainer = newElement('div', '', modalContent, [
    'modal-buttons',
  ]);
  const cancelButton = newElement('button', 'Cancel', buttonContainer, [
    'modal-btn',
    'cancel-btn',
  ]);
  const confirmButton = newElement('button', 'Confirm', buttonContainer, [
    'modal-btn',
    'confirm-btn',
  ]);

  const closeModal = (): void => {
    modalOverlay.remove();
    document.body.classList.remove('modal-open');
  };

  cancelButton.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
      closeModal();
    }
  });

  const handleEscapeKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscapeKey);
    }
  };
  document.addEventListener('keydown', handleEscapeKey);

  confirmButton.addEventListener('click', () => {
    const text = textarea.value;
    const lines = text.split('\n').filter((line) => line.trim() !== '');

    if (lines.length > 0) {
      const newOptions: Option[] = lines.map((line) => {
        const [textPart, weightPart] = line
          .split(', ')
          .map((part) => part.trim());
        const weight = Number(weightPart);
        return {
          id: 0,
          text: textPart || '',
          weight: Number.isNaN(weight) || weight <= 0 ? 1 : weight,
        };
      });
      const currentOptions = getOptions();
      setOptions([...currentOptions, ...newOptions], optionsContainer);
    }
    closeModal();
  });

  document.body.classList.add('modal-open');
}

export default function createDecisionMakingTool(router?: Router): void {
  const body = document.body;
  if (!body) return;

  body.replaceChildren();

  newElement('h1', 'Decision Making Tool', body);

  const optionsContainer = newElement('div', '', body, ['options-container']);
  optionsContainer.id = 'options-container';

  const existingOptions = getOptions();
  if (existingOptions.length > 0) {
    for (const option of existingOptions) {
      addOptionRow(optionsContainer, option);
    }
  }

  const addOptionButton = newElement('button', 'Add Option', body, [
    'action-btn',
  ]);
  const pasteListButton = newElement('button', 'Paste List', body, [
    'action-btn',
  ]);
  const clearListButton = newElement('button', 'Clear List', body, [
    'action-btn',
  ]);

  const actionRow = newElement('div', '', body, ['action-row']);
  const saveListButton = newElement('button', 'Save list to file', actionRow, [
    'action-btn',
  ]);
  const loadListButton = newElement(
    'button',
    'Load list from file',
    actionRow,
    ['action-btn'],
  );

  const startButton = newElement('button', 'Start', body, ['start-btn']);

  addOptionButton.addEventListener('click', () => {
    addOptionRow(optionsContainer);
  });

  clearListButton.addEventListener('click', () => {
    clearOptions(optionsContainer);
  });

  pasteListButton.addEventListener('click', () => {
    createPasteListModal(body, optionsContainer);
  });

  saveListButton.addEventListener('click', () => {
    const options = getOptions();
    if (options.length === 0) {
      console.log('The list is empty. Nothing to save.');
      return;
    }

    const content = JSON.stringify(options, undefined, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'options.json';
    a.click();

    URL.revokeObjectURL(url);
  });

  loadListButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.addEventListener('change', (event) => {
      if (!(event.target instanceof HTMLInputElement)) return;
      const target = event.target;
      if (!target.files || target.files.length === 0) return;

      const file = target.files[0];
      loadFromFile(file, optionsContainer);
    });

    input.click();
  });

  startButton.addEventListener('click', () => {
    const validOptions = getValidOptions();
    if (validOptions.length >= 2) {
      if (router) router.navigate('/wheel');
    } else {
      createModalMessage(
        'Warning',
        'You need at least 2 valid options to start. A valid option has a non-empty title and a weight greater than 0.',
      );
    }
  });
}
