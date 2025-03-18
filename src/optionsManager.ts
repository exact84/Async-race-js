import newElement from './newElement';

export interface Option {
  id: number;
  text: string;
  weight: number;
}

export function isValidOption(item: unknown): item is Option {
  return (
    typeof item === 'object' &&
    item !== null &&
    'text' in item &&
    typeof item.text === 'string' &&
    'weight' in item &&
    typeof item.weight === 'number' &&
    (!('id' in item) || typeof item.id === 'number')
  );
}

function isValidOptionArray(data: unknown): data is Option[] {
  return Array.isArray(data) && data.every((element) => isValidOption(element));
}

const rawData = localStorage.getItem('wheelOptions');
const isInitialized = localStorage.getItem('wheelInitialized') === 'true';

let parsedData: unknown;
try {
  parsedData = JSON.parse(rawData ?? '[]');
} catch {
  parsedData = [];
}

export const options: Option[] =
  isInitialized && isValidOptionArray(parsedData)
    ? parsedData
    : [{ id: 1, text: '', weight: 1 }];

if (!isInitialized) {
  localStorage.setItem('wheelInitialized', 'true');
  localStorage.setItem('wheelOptions', JSON.stringify(options));
}

let nextId = Math.max(...options.map((o) => o.id), 0) + 1;

function saveOptionsToLocalStorage(): void {
  localStorage.setItem('wheelOptions', JSON.stringify(options));
}

export function addOptionRow(container: HTMLElement, option?: Option): void {
  const id = option?.id ?? nextId++;
  const text = option?.text ?? '';
  const weight = option?.weight ?? 1;

  if (!option) {
    options.push({ id, text, weight });
    saveOptionsToLocalStorage();
  }

  const newRow = newElement('div', '', container, ['option-row']);
  newRow.dataset.optionId = String(id);

  newElement('span', `#${String(id)}`, newRow);

  const newOptionInput = newElement('input', '', newRow, ['option-input'], {
    type: 'text',
    value: text,
  });

  const newWeightInput = newElement('input', '', newRow, ['weight-input'], {
    type: 'number',
    value: String(weight),
    min: '1',
  });

  const newDeleteButton = newElement('button', 'Delete', newRow, [
    'delete-btn',
  ]);

  newOptionInput.addEventListener('blur', (event) => {
    if (event.target instanceof HTMLInputElement) {
      const optionIndex = findOptionIndexById(id);
      if (optionIndex !== -1) {
        options[optionIndex].text = event.target.value;
        saveOptionsToLocalStorage();
      }
    }
  });

  newWeightInput.addEventListener('blur', (event) => {
    if (event.target instanceof HTMLInputElement) {
      const optionIndex = findOptionIndexById(id);
      if (optionIndex !== -1) {
        options[optionIndex].weight =
          Number.parseInt(event.target.value, 10) || 1;
        saveOptionsToLocalStorage();
      }
    }
  });

  newDeleteButton.addEventListener('click', () => {
    const optionIndex = findOptionIndexById(id);
    if (optionIndex !== -1) {
      options.splice(optionIndex, 1);
      saveOptionsToLocalStorage();
    }

    newRow.remove();

    if (options.length === 0) {
      nextId = 1;
      options.push({ id: nextId++, text: '', weight: 1 });
      saveOptionsToLocalStorage();
    }
  });
}

function findOptionIndexById(id: number): number {
  return options.findIndex((option) => option.id === id);
}

export function clearOptions(container: HTMLElement): void {
  options.length = 0;
  container.replaceChildren();
  options.push({ id: 1, text: '', weight: 1 });
  nextId = 2;
  saveOptionsToLocalStorage();
}

export function getOptions(): Option[] {
  return [...options];
}

export function setOptions(newOptions: Option[], container: HTMLElement): void {
  options.length = 0;
  container.replaceChildren();

  let maxId = 0;

  for (const option of newOptions) {
    const newOption = { ...option };
    if (!('id' in option) || typeof option.id !== 'number') {
      newOption.id = nextId++;
    } else {
      maxId = Math.max(maxId, newOption.id);
    }
    options.push(newOption);
    addOptionRow(container, newOption);
  }

  nextId = maxId + 1;
  saveOptionsToLocalStorage();
}
