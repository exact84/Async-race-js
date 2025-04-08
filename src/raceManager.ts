import {
  getWinner,
  updateWinner,
  createWinner,
} from './api';
import { newElement } from './utils';
import type { CarRaceElements, Winner } from './types';
import { startCarAnimation, resetCarAnimation } from './cars';

interface RaceState {
  isRacing: boolean;
  winners: Winner[];
  racePromises: Promise<void>[];
}

export const raceState: RaceState = {
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

export function cleanRaceist(): void {
  carElements.clear();
}

export function setupRaceControls(container: HTMLElement): void {
  
  const raceBtn = newElement('button', 'RACE', container, ['race-btn']);
  const resetBtn = newElement('button', 'RESET', container, ['reset-btn']);
  resetBtn.disabled = true;

  raceBtn.addEventListener('click', () => {
    if (raceState.isRacing) return;
    void startRace().finally(() => {
      // raceBtn.disabled = false;
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
        const winner: Winner = {
          id,
          name: elements.nameElement.textContent ?? 'Unknown',
          time: result.time,
          wins: 1,
        };
        raceState.winners.push(winner);
        await handleWinner(winner);
      }
    } catch (error) {
      console.error('Race error:', error);
    }
  });

  raceState.racePromises = startPromises;
  await Promise.allSettled(startPromises); //all
  raceState.isRacing = false;
}

async function resetRace(): Promise<void> {
  raceState.isRacing = false;
  // await Promise.allSettled(raceState.racePromises);
  raceState.racePromises = [];
  raceState.winners = [];

  const resetPromises = [...carElements.entries()].map(async ([id, elements]) => {
    elements.carImg.style.transition = 'none';
    elements.carImg.style.transform = 'translateX(0)';
    await resetCarAnimation(id, elements);
  });

  await Promise.allSettled(resetPromises);
}

async function handleWinner(winner: Winner): Promise<void> {
  if (!raceState.isRacing) {
    return;
  }

  try {
    const existingWinner = await getWinner(winner.id);

    if (existingWinner) {
      let newTime = existingWinner.time;
      if (winner.time < existingWinner.time) { 
        newTime = winner.time;
      } 
      await updateWinner(winner.id, {
        ...existingWinner,
        time: newTime,
        wins: existingWinner.wins + 1,
      });
    } else {

      await createWinner(winner);
    }
   showWinnerMessage(winner.name, winner.time);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error handling winner:', errorMessage);
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
