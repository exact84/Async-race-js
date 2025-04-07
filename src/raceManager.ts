import {
  getWinner,
  updateWinner,
  createWinner,
} from './api';
import { newElement } from './utils';
import type { CarRaceElements } from './types';
import { startCarAnimation, resetCarAnimation } from './cars';

interface RaceState {
  isRacing: boolean;
  winners: { id: number; name: string; time: number }[];
  racePromises: Promise<void>[];
}

const raceState: RaceState = {
  isRacing: false,
  winners: [],
  racePromises: [],
};

const carElements = new Map<number, CarRaceElements>();

export function registerCarForRace(
  id: number,
  elements: Omit<CarRaceElements, 'nameElement'>,
  nameElement: HTMLElement
): void {
  carElements.set(id, { ...elements, nameElement });
}

export function unregisterCar(id: number): void {
  carElements.delete(id);
}

export function setupRaceControls(container: HTMLElement): void {
  const controlsContainer = newElement('div', '', container, ['race-controls']);
  
  const raceBtn = newElement('button', 'RACE', controlsContainer, ['race-btn']);
  const resetBtn = newElement('button', 'RESET', controlsContainer, ['reset-btn']);
  resetBtn.disabled = true;

  raceBtn.addEventListener('click', () => {
    if (raceState.isRacing) return;
    void startRace().finally(() => {
      raceBtn.disabled = false;
    });
    raceBtn.disabled = true;
    resetBtn.disabled = false;
  });

  resetBtn.addEventListener('click', () => {
    void resetRace().finally(() => {
      resetBtn.disabled = true;
      raceBtn.disabled = false;
    });
  });
}

async function startRace(): Promise<void> {
  if (raceState.isRacing) return;
  
  raceState.isRacing = true;
  raceState.winners = [];

  const startPromises = [...carElements.entries()].map(async ([id, elements]) => {
    try {
      const result = await startCarAnimation(id, elements);
      if (result.success && result.time && raceState.winners.length === 0) {
        const winner = {
          id,
          name: elements.nameElement.textContent ?? 'Unknown',
          time: result.time,
        };
        raceState.winners.push(winner);
        await handleWinner(winner);
      }
    } catch (error) {
      console.error('Race error:', error);
    }
  });

  raceState.racePromises = startPromises;
  await Promise.all(startPromises);
  raceState.isRacing = false;
}

async function resetRace(): Promise<void> {
  // Останавливаем гонку
  raceState.isRacing = false;
  
  // Ждем завершения всех Promise'ов
  await Promise.allSettled(raceState.racePromises);
  raceState.racePromises = [];
  raceState.winners = [];

  // Сбрасываем все машины
  const resetPromises = [...carElements.entries()].map(async ([id, elements]) => {
    await resetCarAnimation(id, elements);
  });

  await Promise.allSettled(resetPromises);
}

async function handleWinner(winner: { id: number; name: string; time: number }): Promise<void> {
  try {
    const existingWinner = await getWinner(winner.id);
    if (existingWinner) {
      if (winner.time < existingWinner.time) {
        await updateWinner(winner.id, {
          ...existingWinner,
          time: winner.time,
          wins: existingWinner.wins + 1,
        });
      }
    } else {
      await createWinner({
        id: winner.id,
        wins: 1,
        time: winner.time,
      });
    }
    showWinnerMessage(winner.name, winner.time);
  } catch (error) {
    console.error('Error handling winner:', error);
  }
}

function showWinnerMessage(name: string, time: number): void {
  const modalOverlay = newElement('div', '', document.body, ['modal-overlay']);
  const modal = newElement('div', '', modalOverlay, ['winner-modal']);
  const message = newElement('div', '', modal, ['winner-message']);
  newElement('h2', 'Winner!', message);
  newElement('p', `${name} finished in ${time.toFixed(2)}s!`, message);
  const closeBtn = newElement('button', 'OK', message, ['close-btn']);

  const handleClose = (): void => {
    modalOverlay.remove();
  };

  closeBtn.addEventListener('click', handleClose);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') handleClose();
  });
}
