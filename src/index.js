const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Route to fetch weather data
app.get('/api/weather/:city', async (req, res) => {
  try {
    const city = req.params.city;
    
    // Using Open-Meteo API (free, no API key required)
    const geoResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: {
        name: city,
        count: 1,
        language: 'en',
        format: 'json'
      }
    });

    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    const location = geoResponse.data.results[0];
    const { latitude, longitude, name, country } = location;

    // Fetch weather data
    const weatherResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
        timezone: 'auto'
      }
    });

    const weather = weatherResponse.data;

    res.json({
      city: name,
      country,
      current: weather.current,
      daily: weather.daily,
      timezone: weather.timezone
    });
  } catch (error) {
    console.error('Error fetching weather:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🌤️  Weather Forecast App running on http://localhost:${PORT}`);
  console.log('Try: http://localhost:3000/api/weather/London');
});
