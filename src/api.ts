import { Car, EngineResponse, Winner } from './types';

const API_BASE_URL = 'http://127.0.0.1:3000';

export async function getCars(
  page: number = 1,
  limit: number = 7,
): Promise<{ cars: Car[]; totalCount: number }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/garage?_page=${page}&_limit=${limit}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch cars');
    }

    const cars: Car[] = await response.json();
    const totalCount = Number(response.headers.get('X-Total-Count'));

    return { cars, totalCount };
  } catch (error) {
    console.error('Error fetching cars:', error);
    return { cars: [], totalCount: 0 };
  }
}

export async function getCar(id: number): Promise<Car> {
  try {
    const response = await fetch(`${API_BASE_URL}/garage/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch car');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching car with id ${id}:`, error);
    throw error;
  }
}

export async function createCar(name: string, color: string): Promise<Car> {
  try {
    const response = await fetch(`${API_BASE_URL}/garage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, color }),
    });

    if (!response.ok) {
      throw new Error('Failed to create car');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating car:', error);
    throw error;
  }
}

export async function deleteCar(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/garage/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Car not found');
      }
      throw new Error('Failed to delete car');
    }
  } catch (error) {
    console.error(`Error deleting car with id ${id}:`, error);
    throw error;
  }
}

export async function generateRandomCars(count: number = 100): Promise<void> {
  try {
    const carBrands = ['Tesla', 'BMW', 'Mercedes', 'Audi', 'Porsche'];
    const carModels = ['Model S', 'M5', 'AMG GT', 'RS7', '911'];

    const promises = Array.from({ length: count }, () => {
      const name = `${carBrands[Math.floor(Math.random() * carBrands.length)]} ${
        carModels[Math.floor(Math.random() * carModels.length)]
      }`;
      const color = `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')}`;
      return createCar(name, color);
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error generating random cars:', error);
    throw error;
  }
}

export async function startEngine(id: number): Promise<EngineResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/engine?id=${id}&status=started`,
      {
        method: 'PATCH',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to start engine');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error starting engine for car ${id}:`, error);
    throw error;
  }
}

export async function stopEngine(id: number): Promise<EngineResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/engine?id=${id}&status=stopped`,
      {
        method: 'PATCH',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to stop engine');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error stopping engine for car ${id}:`, error);
    throw error;
  }
}

export async function driveCar(id: number): Promise<{ success: boolean }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/engine?id=${id}&status=drive`,
      {
        method: 'PATCH',
      },
    );

    return { success: response.status === 200 };
  } catch (error) {
    console.error(`Error driving car ${id}:`, error);
    return { success: false };
  }
}

export async function getWinners(
  page: number = 1,
  limit: number = 10,
  sort: string = 'id',
  order: string = 'ASC',
): Promise<{ winners: Winner[]; totalCount: number }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/winners?_page=${page}&_limit=${limit}&_sort=${sort}&_order=${order}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const winners: Winner[] = await response.json();
    const totalCount = parseInt(
      response.headers.get('X-Total-Count') || '0',
      10,
    );

    return { winners, totalCount };
  } catch (error) {
    console.error('Error fetching winners:', error);
    throw error;
  }
}

export async function getWinner(id: number): Promise<Winner | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/winners/${id}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    return null;
  }
}

export async function createWinner(winner: Winner): Promise<Winner> {
  try {
    const response = await fetch(`${API_BASE_URL}/winners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(winner),
    });

    if (!response.ok) {
      throw new Error('Failed to create winner');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating winner:', error);
    throw error;
  }
}

export async function updateWinner(
  id: number,
  winner: Omit<Winner, 'id'>,
): Promise<Winner> {
  try {
    const response = await fetch(`${API_BASE_URL}/winners/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(winner),
    });

    if (!response.ok) {
      throw new Error('Failed to update winner');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating winner ${id}:`, error);
    throw error;
  }
}

export async function deleteWinner(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/winners/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete winner');
    }
  } catch (error) {
    console.error(`Error deleting winner ${id}:`, error);
    throw error;
  }
}

export async function updateCar(
  id: number,
  { name, color }: Omit<Car, 'id'>,
): Promise<Car> {
  try {
    const response = await fetch(`${API_BASE_URL}/garage/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, color }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Car not found');
      }
      throw new Error('Failed to update car');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating car with id ${id}:`, error);
    throw error;
  }
}
