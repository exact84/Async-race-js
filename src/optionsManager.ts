import newElement from './newElement';

export interface Option {
  id: number;
  text: string;
  weight: number;
}

export const options: Option[] = [];
let nextId = 1;

export function addOptionRow(container: HTMLElement, option?: Option): void {
  const id = option?.id ?? nextId++;
  const text = option?.text ?? '';
  const weight = option?.weight ?? 1;

  if (!option) {
    options.push({ id, text, weight });
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
        console.log('Updated options:', options);
      }
    }
  });

  newWeightInput.addEventListener('blur', (event) => {
    if (event.target instanceof HTMLInputElement) {
      const optionIndex = findOptionIndexById(id);
      if (optionIndex !== -1) {
        options[optionIndex].weight =
          Number.parseInt(event.target.value, 10) || 1;
        console.log('Updated options:', options);
      }
    }
  });

  newDeleteButton.addEventListener('click', () => {
    const optionIndex = findOptionIndexById(id);
    if (optionIndex !== -1) {
      options.splice(optionIndex, 1);
    }

    newRow.remove();

    if (options.length === 0) {
      nextId = 1;
    }

    console.log('Updated options after delete:', options);
  });
}

function findOptionIndexById(id: number): number {
  return options.findIndex((option) => option.id === id);
}

export function clearOptions(container: HTMLElement): void {
  options.length = 0;
  nextId = 1;
  container.replaceChildren();
  addOptionRow(container);
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

    if (newOption.id === undefined) {
      newOption.id = nextId++;
    } else {
      maxId = Math.max(maxId, newOption.id);
    }

    options.push(newOption);
    addOptionRow(container, newOption);
  }

  nextId = maxId + 1;
}
