import type { Car, EngineResponse, Winner } from './types';

const API_BASE_URL = 'http://127.0.0.1:3000';

export async function getCars(
  page = 1,
  limit = 7
): Promise<{ cars: Car[]; totalCount: number }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/garage?_page=${String(page)}&_limit=${String(limit)}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch cars');
    }

    const data: unknown = await response.json();

    if (!isCarArray(data)) {
      throw new Error('Invalid data format for cars');
    }

    const totalCount = Number.parseInt(
      response.headers.get('X-Total-Count') ?? '0',
      10
    );

    return { cars: data, totalCount };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching cars:', error.message);
    }
    return { cars: [], totalCount: 0 };
  }
}

export async function getCar(id: number): Promise<Car | undefined> {
  try {
    return await safeFetch<Car>(`${API_BASE_URL}/garage/${String(id)}`, isCar);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching car with id ${String(id)}:`, error.message);
    }
    return undefined;
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

    const data: unknown = await response.json();

    if (!isCar(data)) {
      throw new Error('Invalid car data format');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating car:', error.message);
    }
    throw error;
  }
}

export async function deleteCar(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/garage/${String(id)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error deleting car with id ${String(id)}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error deleting car with id ${String(id)}:`, error.message);
    }
  }
}

export async function generateRandomCars(count = 100): Promise<void> {
  try {
    const carBrands = [
      'Tesla',
      'BMW',
      'Mercedes',
      'Audi',
      'Porsche',
      'Ferrari',
      'Lamborghini',
      'McLaren',
      'Bugatti',
      'Koenigsegg'
    ];
    const carModels = [
      'Model S',
      'M5',
      'AMG GT',
      'RS7',
      '911',
      'SF90',
      'Aventador',
      'P1',
      'Chiron',
      'Jesko'
    ];

    const promises = Array.from({ length: count }, () => {
      const name = `${carBrands[Math.floor(Math.random() * carBrands.length)]} ${
        carModels[Math.floor(Math.random() * carModels.length)]
      }`;
      const color = `#${Math.floor(Math.random() * 16_777_215)
        .toString(16)
        .padStart(6, '0')}`;
      return createCar(name, color);
    });

    await Promise.all(promises);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error generating random cars:', error.message);
    }
  }
}

export async function startEngine(id: number): Promise<EngineResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/engine?id=${String(id)}&status=started`,
      {
        method: 'PATCH',
      }
    );

    if (response.status === 404) throw new Error('Car not found');
    if (response.status === 400) throw new Error('Invalid parameters');
    if (!response.ok) {
      throw new Error(`Failed to start engine for car ${String(id)}`);
    }

    const data: unknown = await response.json();

    if (!isEngineResponse(data)) {
      throw new Error('Invalid engine response data');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error starting engine for car ${String(id)}:`, error.message);
    }
    throw error;
  }
}


// export async function startEngine(id: number): Promise<EngineResponse> {
//   try {
//     const response = await fetch(
//       `${API_BASE_URL}/engine?id=${String(id)}&status=started`,
//       {
//         method: 'PATCH',
//       },
//     );

//     return await response.json();
//   } catch (error) {
//     console.error(`Error starting engine for car ${String(id)}:`, error);
//     throw error;
//   }
// }

export async function stopEngine(id: number): Promise<EngineResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/engine?id=${String(id)}&status=stopped`,
      {
        method: 'PATCH',
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to stop engine for car ${String(id)}`);
    }

    const data: unknown = await response.json();

    if (!isEngineResponse(data)) {
      throw new Error('Invalid engine response data');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error stopping engine for car ${String(id)}:`, error.message);
    }
    throw error;
  }
}

export async function driveCar(id: number): Promise<{ success: boolean }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/engine?id=${String(id)}&status=drive`,
      {
        method: 'PATCH',
      },
    );

    if (!response.ok) {
      return { success: false };
    }

    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getWinners(
  page = 1,
  limit = 10,
  sort = 'id',
  order = 'ASC',
): Promise<{ winners: Winner[]; totalCount: number }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/winners?_page=${String(page)}&_limit=${String(limit)}&_sort=${sort}&_order=${order}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch winners');
    }

    const data: unknown = await response.json();

    if (!isWinnerArray(data)) {
      throw new Error('Invalid winners data format');
    }

    const totalCount = Number.parseInt(
      response.headers.get('X-Total-Count') ?? '0',
      10
    );

    return { winners: data, totalCount };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching winners:', error.message);
    }
    return { winners: [], totalCount: 0 };
  }
}

// export async function getWinners(
//   page = 1,
//   limit = 10,
//   sort = 'id',
//   order = 'ASC',
// ): Promise<{ winners: Winner[]; totalCount: number }> {
//   try {
//     const response = await fetch(
//       `${API_BASE_URL}/winners?_page=${String(page)}&_limit=${String(limit)}&_sort=${sort}&_order=${order}`,
//     );

//     const winners: Winner[] = await response.json();
//     const totalCount = Number.parseInt(
//       response.headers.get('X-Total-Count') ?? '0',
//       10,
//     );

//     return { winners, totalCount };
//   } catch (error) {
//     console.error('Error fetching winners:', error);
//     return { winners: [], totalCount: 0 };
//   }
// }

export async function getWinner(id: number): Promise<Winner | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/winners/${String(id)}`);
    
    if (!response.ok) {
      return undefined;
    }

    const data: unknown = await response.json();

    if (!isWinner(data)) {
      throw new Error('Invalid winner data format');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching winner ${String(id)}:`, error.message);
    }
    return undefined;
  }
}

// export async function getWinner(id: number): Promise<Winner | undefined> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/winners/${String(id)}`);
//     return response.ok ? (await response.json()) : undefined;
//   } catch {
//     return undefined;
//   }
// }

// export async function createWinner(winner: Winner): Promise<Winner> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/winners`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(winner),
//     });

//     const data: Winner = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error creating winner:', error);
//     throw error;
//   }
// }

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

    const data: unknown = await response.json();

    if (!isWinner(data)) {
      throw new Error('Invalid winner data');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating winner:', error.message);
    }
    throw error;
  }
}

export async function updateWinner(
  id: number,
  winner: Omit<Winner, 'id'>,
): Promise<Winner | object> {
  try {
    const response = await fetch(`${API_BASE_URL}/winners/${String(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(winner),
    });

    if (!response.ok) {
      throw new Error('Failed to update winner');
    }

    const data: unknown = await response.json();

    if (!isWinner(data)) {
      throw new Error('Invalid winner data');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error updating winner ${String(id)}:`, error.message);
    }
    return {};
  }
}

export async function deleteWinner(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/winners/${String(id)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error deleting winner ${String(id)}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error deleting winner ${String(id)}:`, error.message);
    }
  }
}

export async function updateCar(
  id: number,
  { name, color }: Omit<Car, 'id'>,
): Promise<Car | object> {
  try {
    const response = await fetch(`${API_BASE_URL}/garage/${String(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, color }),
    });

    if (!response.ok) {
      throw new Error('Failed to update car');
    }

    const data: unknown = await response.json();

    if (!isCar(data)) {
      throw new Error('Invalid car data format');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error updating car with id ${String(id)}:`, error.message);
    }
    return {};
  }
}

function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null;
}

function isCar(obj: unknown): obj is Car {
  return isObject(obj)
    && typeof obj.id === 'number'
    && typeof obj.name === 'string'
    && typeof obj.color === 'string';
}

function isWinner(obj: unknown): obj is Winner {
  return isObject(obj)
    && typeof obj.id === 'number'
    && typeof obj.wins === 'number'
    && typeof obj.time === 'number';
}

function isCarArray(data: unknown): data is Car[] {
  return Array.isArray(data) && data.every((element) => isCar(element));
}

function isWinnerArray(obj: unknown): obj is Winner[] {
  return Array.isArray(obj) && obj.every((item) => isWinner(item));
}

async function safeFetch<T>(
  url: string,
  validate: (data: unknown) => data is T,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${String(response.status)}`);
  }

  const data: unknown = await response.json();

  if (!validate(data)) {
    throw new Error('Invalid data format from server');
  }

  return data;
}

function isEngineResponse(obj: unknown): obj is EngineResponse {
  return (
    isObject(obj) &&
    typeof obj.velocity === 'number' &&
    typeof obj.distance === 'number'
  );
}
