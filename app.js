const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// PostgreSQL setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Home route
app.get('/', (req, res) => {
  res.render('index', { weather: null, error: null });
});

// Handle form submission
app.post('/', async (req, res) => {
  const city = req.body.city;
  const apiKey = process.env.API_KEY;
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  try {
    const response = await axios.get(url);
    const weather = response.data;

    const weatherData = {
      city: weather.name,
      temperature: weather.main.temp,
      description: weather.weather[0].description,
    };

    // Insert into database
    await pool.query(
      'INSERT INTO weather_queries (city, temperature, description) VALUES ($1, $2, $3)',
      [weatherData.city, weatherData.temperature, weatherData.description]
    );

    res.render('index', { weather: weatherData, error: null });
  } catch (error) {
    res.render('index', { weather: null, error: 'City not found. Please try again.' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
