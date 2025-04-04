import newElement from './newElement';

export function showListCars(garageSection: HTMLElement) {
  const carsContainer = newElement('div', '', garageSection, [
    'cars-container',
  ]);
  const garageHeader = newElement('h2', 'Garage()', carsContainer);
  const garagePage = newElement('h4', 'Page #', carsContainer);

  //отображение нужного колличества машин

  const carList = newElement('ul', '', carsContainer, ['list']);
  newElement('li', 'Первый ', carList, ['list-item']);
  newElement('li', 'Второй ', carList, ['list-item']);
  newElement('li', 'Третий ', carList, ['list-item']);
}
