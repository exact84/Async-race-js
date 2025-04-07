import type { AppState } from './types';

const initialState: AppState = {
  garage: {
    page: 1,
    selectedCarId: undefined,
    createName: '',
    createColor: '#000000',
    updateName: '',
    updateColor: '#000000',
  },
  winners: {
    page: 1,
    sort: {
      field: 'wins',
      order: 'ASC',
    },
  },
};

class StateManager {
  private state: AppState = initialState;

  public getState(): AppState {
    return this.state;
  }

  public updateGaragePage(page: number): void {
    this.state.garage.page = page;
  }

  public updateWinnersPage(page: number): void {
    this.state.winners.page = page;
  }

  public updateSelectedCar(id: number | undefined = undefined): void {
    this.state.garage.selectedCarId = id;
  }

  public updateCreateForm(name: string, color: string): void {
    this.state.garage.createName = name;
    this.state.garage.createColor = color;
  }

  public updateUpdateForm(name: string, color: string): void {
    this.state.garage.updateName = name;
    this.state.garage.updateColor = color;
  }

  public updateWinnersSort(field: 'wins' | 'time', order: 'ASC' | 'DESC'): void {
    this.state.winners.sort = { field, order };
  }
}

export const stateManager = new StateManager();
