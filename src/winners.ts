import { newElement } from './utils';
import { getWinners, getCar } from './api';
import { stateManager } from './state';

type SortOrder = 'ASC' | 'DESC';
interface SortState {
  field: 'wins' | 'time';
  order: SortOrder;
}

async function displayWinners(
  page: number,
  tbody: HTMLElement,
  sort: SortState,
): Promise<number> {
  try {
    const { winners, totalCount } = await getWinners(page, 10, sort.field, sort.order);
    tbody.innerHTML = '';

    for (const winner of winners) {
      const car = await getCar(winner.id);
      if (!car) continue;

      const index = winners.indexOf(winner);
      const row = newElement('tr', '', tbody);
      const position = (page - 1) * 10 + index + 1;
      newElement('td', position.toString(), row);

      const carCell = newElement('td', '', row);
      const carIcon = newElement('div', '', carCell, ['car-icon']);
      carIcon.style.backgroundColor = car.color;

      newElement('td', car.name, row);
      newElement('td', winner.wins.toString(), row);
      newElement('td', winner.time.toFixed(2), row);
    }

    return totalCount;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to display winners:', error.message);
    }
    return 0;
  }
}

export function createWinners(container: HTMLElement): void {
  const state = stateManager.getState();
  const winnersSection = newElement('section', '', container, ['winners-section']);

  // Добавляем заголовки в начале
  const pageNumber = state.winners.page.toString();
  const titleH2 = newElement('h2', 'Winners (0)', winnersSection);
  const pageH3 = newElement('h3', `Page #${pageNumber}`, winnersSection);

  const table = newElement('table', '', winnersSection, ['winners-table']);
  const thead = newElement('thead', '', table);
  const headerRow = newElement('tr', '', thead);

  newElement('th', 'Number', headerRow);
  newElement('th', 'Car', headerRow);
  newElement('th', 'Name', headerRow);

  const winsHeader = newElement('th', 'Wins', headerRow);
  winsHeader.style.cursor = 'pointer';
  const timeHeader = newElement('th', 'Best time (seconds)', headerRow);
  timeHeader.style.cursor = 'pointer';

  const tbody = newElement('tbody', '', table);

  const updateWinners = async (): Promise<void> => {
    try {
      const totalCount = await displayWinners(state.winners.page, tbody, state.winners.sort);
      titleH2.textContent = `Winners (${totalCount.toString()})`;
      pageH3.textContent = `Page #${state.winners.page.toString()}`;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error updating winners:', error.message);
      }
    }
  };

  winsHeader.addEventListener('click', () => {
    const currentSort = state.winners.sort;
    const newOrder: SortOrder = currentSort.field === 'wins' && currentSort.order === 'ASC' ? 'DESC' : 'ASC';
    stateManager.updateWinnersSort('wins', newOrder);
    void updateWinners();
  });

  timeHeader.addEventListener('click', () => {
    const currentSort = state.winners.sort;
    const newOrder: SortOrder = currentSort.field === 'time' && currentSort.order === 'ASC' ? 'DESC' : 'ASC';
    stateManager.updateWinnersSort('time', newOrder);
    void updateWinners();
  });

  void updateWinners();
}
