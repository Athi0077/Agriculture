import express from 'express';
import { getWeather, askWeatherAssistant } from '../controllers/weatherController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route: user must be logged in so we can read their city/state
router.get('/', protect, getWeather);
router.post('/assistant', protect, askWeatherAssistant);

export default router;
