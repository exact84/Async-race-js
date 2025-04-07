import { newElement } from './utils';
import { setupCarManagement } from './carManagement';
import { setupRaceControls } from './raceManager';
import { showListCars } from './cars';

export function createGarage(container: HTMLElement): void {
  const garageSection = newElement('section', '', container, ['garage-section']);

  const carManagementSection = newElement('div', '', garageSection, ['car-management']);
  const raceControlsSection = newElement('div', '', garageSection, ['race-controls']);
  const carsListSection = newElement('div', '', garageSection, ['cars-list']);

  setupCarManagement(carManagementSection, carsListSection);
  setupRaceControls(raceControlsSection);
  void showListCars(carsListSection);
}
