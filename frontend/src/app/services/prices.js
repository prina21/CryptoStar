import axios from 'axios';

class CoinGecko {
  constructor(apiKey, apiType) {
    this.root = 'https://api.coingecko.com/api/v3' 
    
 //   const authParam = 'x-cg-demo-api-key';

    this.headers = {
      'accept': 'application/json',
     // [authParam]: apiKey
    };
  }

  async getHistoricalData(coinId, days, vsCurrency = 'usd') {
    const requestUrl = `${this.root}/coins/${coinId}/ohlc?vs_currency=${vsCurrency}&days=${days}`;
    try {
      const response = await axios.get(requestUrl, { headers: this.headers });
      const data = response.data;

      return data.map(([time, open, high, low, close]) => ({
        time: Math.floor(time / 1000), // Convert milliseconds to seconds
        open,
        high,
        low,
        close
      }));
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }

  async getVsCurrencies() {
    const requestUrl = `${this.root}/simple/supported_vs_currencies`;
    try {
      const response = await axios.get(requestUrl, { headers: this.headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching supported currencies:', error);
      return [];
    }
  }

  async getCoinIdByName(coinName) {
    const requestUrl = `${this.root}/coins/list`;
    try {
      const response = await axios.get(requestUrl, { headers: this.headers });
      const data = response.data;
      return data.filter(coin => coin.name.toLowerCase() === coinName.toLowerCase());
    } catch (error) {
      console.error('Error fetching coin list:', error);
      return [];
    }
  }
}

export default CoinGecko;
