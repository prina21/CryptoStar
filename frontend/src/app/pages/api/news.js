// pages/api/news.js

export default async function handler(req, res) {
    try {
      const response = await fetch('https://cryptocontrol.io/api/v1/public/news');
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Proxy fetch failed:', error.message);
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  }
  