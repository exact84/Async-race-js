import { createCar, deleteCar, updateCar, deleteWinner, generateRandomCars } from './api';
import type { Car, CarControls } from './types';
import { newElement } from './utils';
import { showListCars, setCarControls } from './cars';
import { stateManager } from './state';

export function setupCarManagement(container: HTMLElement, carsListContainer?: HTMLElement): void {

  const createForm = newElement('form', '', container, ['create-form']);
  const createNameInput = newElement('input', '', createForm, ['car-name'],   {
    type: 'text',
    name: 'car-name',
    placeholder: 'Enter car name',
    value: stateManager.getState().garage.createName,
  });

  const createColorInput = newElement('input', '', createForm, ['car-color'], {
    type: 'color',
    name: 'color',
    value: stateManager.getState().garage.createColor,
  });

  const createBtn = newElement('button', 'CREATE', createForm, ['race-btn']);

  const updateForm = newElement('form', '', container, ['update-form']);
  const updateNameInput = newElement('input', '', updateForm, ['car-name'], {
    type: 'text',
    name: 'car-name',
    placeholder: 'Enter new car name',
    value: stateManager.getState().garage.updateName,
  });
  updateNameInput.disabled = !stateManager.getState().garage.selectedCarId;

  const updateColorInput = newElement('input', '', updateForm, ['car-color'], {
    type: 'color',
    name: 'color',
    value: stateManager.getState().garage.updateColor,
  });
  updateColorInput.disabled = !stateManager.getState().garage.selectedCarId;

  const updateBtn = newElement('button', 'UPDATE', updateForm, ['race-btn']);
  updateBtn.disabled = !stateManager.getState().garage.selectedCarId;

  const carControls: CarControls = {
    updateNameInput,
    updateColorInput,
    updateBtn,
    selectedCarId: stateManager.getState().garage.selectedCarId,
  };

  setCarControls(carControls);

  createBtn.addEventListener('click', () => {
    void (async (): Promise<void> => {
      const name = createNameInput.value.trim();
      const color = createColorInput.value;
  
      if (name) {
        await createCar(name, color);
        createNameInput.value = '';
        createColorInput.value = '#000000';
        stateManager.updateCreateForm('', '#000000');
        await showListCars(carsListContainer ?? container);
      }
    })();
  });

  updateBtn.addEventListener('click', () => {
    void (async (): Promise<void> => {
      const id = carControls.selectedCarId;
      if (!id) return;
  
      const name = updateNameInput.value.trim();
      const color = updateColorInput.value;
  
      if (name) {
        await updateCar(id, { name, color });
        resetUpdateForm(carControls);
        await showListCars(carsListContainer ?? container);
      }
    })();
  });

  const generateBtn = newElement('button', 'GENERATE 100 CARS', container, [
    'generate-btn',
  ]);
  generateBtn.addEventListener('click', () => {
    void (async (): Promise<void> => {
          // убрать потом параметр 3
      await generateRandomCars(3);
      await showListCars(carsListContainer ?? container);
    })();
  });
}

export function selectCar(car: Car, controls: CarControls): void {
  controls.selectedCarId = car.id;
  if (controls.updateNameInput instanceof HTMLInputElement) {
    controls.updateNameInput.value = car.name;
    controls.updateNameInput.disabled = false;
  }
  if (controls.updateColorInput instanceof HTMLInputElement) {
    controls.updateColorInput.value = car.color;
    controls.updateColorInput.disabled = false;
  }
  if (controls.updateBtn instanceof HTMLButtonElement) {
    controls.updateBtn.disabled = false;
  }
  
  stateManager.updateUpdateForm(car.name, car.color);
  stateManager.updateSelectedCar(car.id);
}

export async function removeCar(
  id: number,
  garageSection: HTMLElement,
): Promise<void> {
  await deleteCar(id);
  await deleteWinner(id);
  await showListCars(garageSection);
}

function resetUpdateForm(controls: CarControls): void {
  controls.selectedCarId = undefined;
  if (controls.updateNameInput instanceof HTMLInputElement) {
    controls.updateNameInput.value = '';
    controls.updateNameInput.disabled = true;
  }
  if (controls.updateColorInput instanceof HTMLInputElement) {
    controls.updateColorInput.value = '#ffffff';
    controls.updateColorInput.disabled = true;
  }
  if (controls.updateBtn instanceof HTMLButtonElement) {
    controls.updateBtn.disabled = true;
  }
  stateManager.updateSelectedCar();
  stateManager.updateUpdateForm('', '#000000');
}
