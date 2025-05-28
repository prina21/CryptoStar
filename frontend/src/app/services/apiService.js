const API_BASE_URL = 'http://127.0.0.1:8000/api'; 

async function getAccountOverview() {
  try {
    const response = await fetch(`${API_BASE_URL}/account/overview`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching account overview:", error);
    throw error; // Re-throw the error for the component to handle
  }
}

async function getStrategyPerformance() {
  try {
    const response = await fetch(`${API_BASE_URL}/strategy/performance`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching strategy performance:", error);
    throw error;
  }
}

async function getOrderHistory() {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/history`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching order history:", error);
    throw error;
  }
}

async function getWatchlist() {
  try {
    const response = await fetch(`${API_BASE_URL}/watchlist/items`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    throw error;
  }
}

export { getAccountOverview, getStrategyPerformance, getOrderHistory, getWatchlist };