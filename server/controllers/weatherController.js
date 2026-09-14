import { getWeatherByLocation } from '../services/weatherService.js';
import { answerWeatherDoubt } from '../services/openrouterService.js';

// @desc    Get weather for a location based on logged in user's city/state
// @route   GET /api/weather
// @access  Private
export const getWeather = async (req, res) => {
  try {
    const { city, state, location } = req.user;

    if (!city || !state) {
      return res.status(400).json({ success: false, message: 'User location (city, state) not found. Please update your profile.' });
    }

    const weatherData = await getWeatherByLocation(city, state, location?.latitude, location?.longitude);

    res.status(200).json({ success: true, weatherData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching weather' });
  }
};

// @desc    Ask AI assistant a weather-related question
// @route   POST /api/weather/assistant
// @access  Private
export const askWeatherAssistant = async (req, res) => {
  try {
    const { message, weather, history } = req.body;
    
    if (!message || !weather) {
      return res.status(400).json({ success: false, message: 'Message and weather data are required' });
    }
    
    // User language from auth middleware
    const language = req.user?.language || 'English';
    
    const reply = await answerWeatherDoubt(message, weather, language, history);
    
    res.status(200).json({ success: true, reply });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing weather assistant request' });
  }
};
