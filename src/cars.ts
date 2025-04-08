import { getCars, startEngine, stopEngine, driveCar } from './api';
import { newElement } from './utils';
import { selectCar, removeCar } from './carManagement';
import type { CarControls } from './types';
import priusSvg from './assets/svg2.svg';
import flagJFIF from './assets/finish.png';
import { cleanRaceist, raceState, registerCarForRace } from './raceManager';
import { stateManager } from './state';

const MS_IN_SECOND = 1000;
const MARGIN_OFFSET = 65;

let currentControls: CarControls | undefined;

export function setCarControls(controls: CarControls): void {
  currentControls = controls;
}

export function updateSvgColor(svgDoc: Document, color: string): void {
    const textElement = svgDoc.querySelector('text');
  if (textElement) {
    textElement.style.fill = color;
  }
  const svgElement = svgDoc.querySelector('path');
  if (svgElement) {
    svgElement.style.stroke = color;
  }
}

export async function showListCars(
  container: HTMLElement,
): Promise<number> {
  container.innerHTML = '';
  const carsContainer = newElement('div', '', container, ['cars-container']);
  const titleContainer = newElement('div', '', carsContainer);

  const state = stateManager.getState();
  const data = await getCars(state.garage.page, 7);
  newElement(
    'h2',  `Garage (${data.totalCount.toString()})`, 
    titleContainer,
  );
  newElement('h4', `Page #${state.garage.page.toString()}`, titleContainer);

  const carList = newElement('ul', '', carsContainer, ['car-list']);
  cleanRaceist();

  for (const car of data.cars) {
    const carContainer = newElement('div', '', carList, ['car-container']);
    carContainer.dataset.id = car.id.toString();

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
          await removeCar(car.id, container);
          await showListCars(container);
        } catch (error) {
          if (error instanceof Error) {
            console.log('Failed to remove car:', error.message);
          } 
        }
      })();
    });

    startBtn.addEventListener('click', () => {
      void (async (): Promise<void> => {
        raceState.isRacing = true;
        const result = await startCarAnimation(car.id, {container: carContainer, carImg, startBtn, resetCarBtn});
        if (!result.success) {
          console.log('Engine was broken:', car.name);
        }
        raceState.isRacing = false;
      })();
    });

    resetCarBtn.addEventListener('click', () => {
      void (async (): Promise<void> => {
        await resetCarAnimation(car.id, {carImg, startBtn, resetCarBtn});
      })();
    });
  }

  const paginationContainer = newElement('div', '', carsContainer, ['pagination']);
  const prevBtn = newElement('button', 'PREV', paginationContainer, ['pagination-btn']);
  const nextBtn = newElement('button', 'NEXT', paginationContainer, ['pagination-btn']);
  
  const totalPages = Math.ceil(data.totalCount / 7);
  
  prevBtn.disabled = state.garage.page <= 1;
  nextBtn.disabled = state.garage.page >= totalPages;
  
  prevBtn.addEventListener('click', () => {
    if (state.garage.page > 1) {
      stateManager.updateGaragePage(state.garage.page - 1);
      void showListCars(container);
    }
  });
  
  nextBtn.addEventListener('click', () => {
    if (state.garage.page < totalPages) {
      stateManager.updateGaragePage(state.garage.page + 1);
      void showListCars(container);
    }
  });

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

    if (!raceState.isRacing) {
      elements.carImg.style.transition = 'none';
      elements.carImg.style.transform = 'translateX(0)';
      return { success: false };
    }

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
    // elements.carImg.style.transition = 'none';
    const currentPos = elements.carImg.getBoundingClientRect().left - elements.container.getBoundingClientRect().left;
    requestAnimationFrame(() => {
      elements.carImg.style.transform = `translateX(${String(currentPos - MARGIN_OFFSET)}px)`;
    });
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
  elements.carImg.style.transition = 'none';
  elements.carImg.style.transform = 'translateX(0)';
  try {
    await stopEngine(id);
    elements.resetCarBtn.disabled = true;
    elements.startBtn.disabled = false;
  } catch (error) {
    console.log('Reset error:', error);
  }
}
