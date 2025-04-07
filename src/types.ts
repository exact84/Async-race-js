export interface Car {
  id: number;
  name: string;
  color: string;
}

export interface EngineResponse {
  velocity: number;
  distance: number;
}

export interface Winner {
  id: number;
  name: string;
  wins: number;
  time: number;
}

export interface CarControls {
  updateNameInput: HTMLInputElement;
  updateColorInput: HTMLInputElement;
  updateBtn: HTMLButtonElement;
  selectedCarId: number | undefined;
}

export interface GarageContainers {
  garageSection: HTMLElement;
  carsContainer: HTMLElement;
  carList: HTMLElement;
  titleContainer: HTMLElement;
  controlsContainer: HTMLElement;
  raceControlsContainer: HTMLElement;
}

export interface CarRaceElements {
  container: HTMLElement;
  carImg: HTMLObjectElement;
  startBtn: HTMLButtonElement;
  resetCarBtn: HTMLButtonElement;
  nameElement: HTMLElement;
}

export type SortOrder = 'ASC' | 'DESC';

export interface SortState {
  field: 'wins' | 'time';
  order: SortOrder;
}

export interface AppState {
  garage: {
    page: number;
    createName: string;
    createColor: string;
    updateName: string;
    updateColor: string;
    selectedCarId: number | undefined;
  };
  winners: {
    page: number;
    sort: SortState;
  };
}
