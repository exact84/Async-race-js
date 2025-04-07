import { getCars, startEngine, stopEngine, driveCar } from './api';
import { newElement } from './utils';
import { selectCar, removeCar } from './carManagement';
import type { CarControls } from './types';
import priusSvg from './assets/svg2.svg';
import flagJFIF from './assets/finish.png';
import { registerCarForRace } from './raceManager';
import { stateManager } from './state';

const MS_IN_SECOND = 1000;
const MARGIN_OFFSET = 65;

let currentControls: CarControls | undefined;

export function setCarControls(controls: CarControls): void {
  currentControls = controls;
}

function updateSvgColor(svgDoc: Document, color: string): void {
  const textElements = svgDoc.querySelectorAll('text');
  const pathElements = svgDoc.querySelectorAll('path');

  if (textElements[0]) {
    textElements[0].style.fill = color;
  }
  if (pathElements[0]) {
    pathElements[0].style.stroke = color;
  }
}

export async function showListCars(
  container: HTMLElement,
): Promise<number> {
  const carsContainer = newElement('div', '', container, ['cars-container']);
  const titleContainer = newElement('div', '', carsContainer, ['cars-title']);

  const state = stateManager.getState();
  const data = await getCars(state.garage.page, 7);
  newElement(
    'h2',  `Garage (${data.totalCount.toString()})`, 
    titleContainer,
  );
  newElement('h4', `Page #${state.garage.page.toString()}`, titleContainer);

  const carList = newElement('ul', '', carsContainer, ['car-list']);

  for (const car of data.cars) {
    const carContainer = newElement('div', '', carList, ['car-container']);
    carContainer.dataset.id = car.id.toString(); // сохранили id

    const controls = newElement('div', '', carContainer, ['car-controls']);
    const selectBtn = newElement('button', 'SELECT', controls, [
      'car-btn',
      'select-btn',
    ]);
    const removeBtn = newElement('button', 'REMOVE', controls, [
      'car-btn',
      'remove-btn',
    ]);
    const nameElement = newElement('span', car.name, controls, ['car-name']);

    const carVisual = newElement('div', '', carContainer, ['car-visual']);
    const startBtn = newElement('button', 'A', carVisual, ['engine-btn']);
    const resetCarBtn = newElement('button', 'B', carVisual, ['engine-btn']);
    resetCarBtn.disabled = true;

    const carImg = newElement('object', '', carVisual, ['car-svg']);
    carImg.type = 'image/svg+xml';
    carImg.data = priusSvg;
    carImg.width = '100';
    carImg.height = '40';
    carImg.style.transform = 'translateX(0)';

    carImg.addEventListener('load', () => {
      const svgDoc = carImg.contentDocument;
      if (svgDoc) {
        // const textElement = svgDoc.querySelector('text');
        // if (textElement) {
        //   textElement.style.fill = car.color;
        // }
        // const svgElement = svgDoc.querySelector('path');
        // if (svgElement) {
        //   svgElement.style.stroke = car.color;
        // }
        updateSvgColor(svgDoc, car.color);
      }
    });

    const flagImg = newElement('img', '', carVisual, ['finish-flag']);
    flagImg.src = flagJFIF;
    flagImg.alt = 'finish';

    registerCarForRace(car.id, {container: carContainer, carImg, startBtn, resetCarBtn}, nameElement);

    selectBtn.addEventListener('click', () => {
      if (currentControls) {
        selectCar(car, currentControls);
      }
    });

    removeBtn.addEventListener('click', () => {
      void (async (): Promise<void> => {
        try {
          // запретить удалять машины посреди гонки
          // if (raceState.isRacing) {
          //   return;
          // }
          await removeCar(car.id, container);
          await showListCars(container);
        } catch (error) {
          if (error instanceof Error) {
            console.error('Failed to remove car:', error.message);
          } 
        }
      })();
    });

    startBtn.addEventListener('click', () => {
      void (async (): Promise<void> => {
        const result = await startCarAnimation(car.id, {container: carContainer, carImg, startBtn, resetCarBtn});
        if (!result.success) {
          console.log('Engine was broken:', car.name);
        }
      })();
    });

    resetCarBtn.addEventListener('click', () => {
      void (async (): Promise<void> => {
        await resetCarAnimation(car.id, {carImg, startBtn, resetCarBtn});
      })();
    });
  }

  return data.totalCount;
}

export async function startCarAnimation(
  id: number,
  elements: {
    container: HTMLElement;
    carImg: HTMLObjectElement;
    startBtn: HTMLButtonElement;
    resetCarBtn: HTMLButtonElement;
  }
): Promise<{ success: boolean; time?: number }> {
  const startBtn = elements.startBtn;
  const resetBtn = elements.resetCarBtn;
  
  try {
    startBtn.disabled = true;
    resetBtn.disabled = false;

    const { velocity, distance } = await startEngine(id);
    const duration = distance / velocity / MS_IN_SECOND;
    const finishPosition = elements.container.offsetWidth - elements.carImg.offsetWidth - MARGIN_OFFSET;
    const startTime = Date.now();

    elements.carImg.style.transition = `transform ${String(duration)}s linear`;
    elements.carImg.style.transform = `translateX(${String(finishPosition)}px)`;

    const { success } = await driveCar(id);
    if (!success) {
      throw new Error('Engine failure');
    }

    return { 
      success: true, 
      time: (Date.now() - startTime) / MS_IN_SECOND 
    };
  } catch {
    const currentPos = elements.carImg.getBoundingClientRect().left - elements.container.getBoundingClientRect().left;
    elements.carImg.style.transition = 'none';
    requestAnimationFrame(() => {
      elements.carImg.style.transform = `translateX(${String(currentPos)}px)`;
    });
    startBtn.disabled = false;
    resetBtn.disabled = true;
    return { success: false };
  }
}

export async function resetCarAnimation(
  id: number,
  elements: {
    carImg: HTMLObjectElement;
    startBtn: HTMLButtonElement;
    resetCarBtn: HTMLButtonElement;
  }
): Promise<void> {
  try {
    await stopEngine(id);
    elements.carImg.style.transition = 'none';
    requestAnimationFrame(() => {
      elements.carImg.style.transform = 'translateX(0)';
    });
    elements.resetCarBtn.disabled = true;
    elements.startBtn.disabled = false;
  } catch (error) {
    console.error('Reset error:', error);
  }
}
