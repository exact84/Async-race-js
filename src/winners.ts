import { newElement } from './utils';
import { getWinners, getCar } from './api';
import { stateManager } from './state';
import type { SortOrder, SortState } from './types';
import priusSvg from './assets/svg2.svg';
import { updateSvgColor } from './cars';

let totalCount = 0;

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

      const carImg = newElement('object', '', carCell, ['car-svg']);
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
  
  const paginationContainer = newElement('div', '', winnersSection, ['pagination']);
  const prevBtn = newElement('button', 'PREV', paginationContainer, ['pagination-btn']);
  const nextBtn = newElement('button', 'NEXT', paginationContainer, ['pagination-btn']);

  const updateWinners = async (): Promise<void> => {
    try {
      const state = stateManager.getState();
      totalCount = await displayWinners(state.winners.page, tbody, state.winners.sort);
      titleH2.textContent = `Winners (${totalCount.toString()})`;
      pageH3.textContent = `Page #${state.winners.page.toString()}`;

      updateSortIndicators();
      
      const maxPage = Math.ceil(totalCount / 10);
      prevBtn.disabled = state.winners.page <= 1;
      nextBtn.disabled = state.winners.page >= maxPage;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error updating winners:', error.message);
      }
    }
  };

  const updateSortIndicators = (): void => {
    winsHeader.textContent = 'Wins';
    timeHeader.textContent = 'Best time (seconds)';

    const { field, order } = state.winners.sort;
    const indicator = order === 'ASC' ? ' ↑' : ' ↓';

    if (field === 'wins') {
      winsHeader.textContent += indicator;
    } else if (field === 'time') {
      timeHeader.textContent += indicator;
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
  
  prevBtn.addEventListener('click', () => {
    if (state.winners.page > 1) {
      stateManager.updateWinnersPage(state.winners.page - 1);
      void updateWinners();
    }
  });
  
  nextBtn.addEventListener('click', () => {
    if (state.winners.page < Math.ceil(totalCount / 10)) {
      stateManager.updateWinnersPage(state.winners.page + 1);
      void updateWinners();
    }
  });

  void updateWinners();
}
