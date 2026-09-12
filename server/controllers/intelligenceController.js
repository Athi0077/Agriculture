import Scan from '../models/Scan.js';
import DiseaseHistory from '../models/DiseaseHistory.js';
import { analyzeCropImage } from '../services/openrouterService.js';
import { getWeatherByLocation } from '../services/weatherService.js';
import { getLocalDiseaseHistory } from '../services/historicalDiseaseService.js';
import { calculateCropRisk } from '../services/riskEngine.js';
import { generateRecommendations } from '../services/recommendationEngine.js';

// @desc    Analyze crop image and environmental factors for full intelligence report
// @route   POST /api/intelligence/analyze
// @access  Private
export const analyzeIntelligence = async (req, res) => {
  try {
    const { cropType, cropStage, cropVariety, soilCondition, location, lat, lng } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const imageUrl = req.file.path.replace(/\\/g, '/');
    const userLocation = location || `${req.user.city}, ${req.user.state}`;

    // 1. Fetch Weather Data (Handle gracefully if fails)
    let weatherData = null;
    try {
      weatherData = await getWeatherByLocation(req.user.city, req.user.state);
    } catch (err) {
      console.warn("Weather data unavailable:", err.message);
    }

    // 2. OpenRouter Image Analysis
    const aiResult = await analyzeCropImage(imageUrl, cropType, weatherData, req.user.language);

    // 3. Local Disease History
    const historicalData = await getLocalDiseaseHistory(cropType, userLocation);

    // 4. Calculate Risk
    const riskEngineData = {
      aiDiagnosis: aiResult.diagnosis,
      aiConfidence: aiResult.confidence,
      diseaseType: aiResult.type,
      cropType,
      cropStage,
      cropVariety,
      weatherData,
      soilCondition,
      historicalData
    };
    
    const riskResult = calculateCropRisk(riskEngineData);

    // 5. Generate Recommendations
    const recommendations = generateRecommendations({
      riskLevel: riskResult.riskLevel,
      aiDiagnosis: aiResult.diagnosis,
      diseaseType: aiResult.type,
      treatment: aiResult.treatment,
      weatherData,
      soilCondition,
      aiConfidence: aiResult.confidence
    });

    // 6. Save to Database (Scan model)
    const scan = await Scan.create({
      userId: req.user._id,
      imageUrl,
      cropType,
      cropStage,
      cropVariety,
      soilCondition,
      location: userLocation,
      coordinates: (lat && lng) ? { lat: Number(lat), lng: Number(lng) } : undefined,
      diagnosis: aiResult.diagnosis,
      diseaseType: aiResult.type,
      confidence: riskResult.confidence, // Save AI confidence
      symptoms: aiResult.symptoms || [],
      weatherData,
      riskScore: riskResult.riskScore,
      riskLevel: riskResult.riskLevel,
      factorBreakdown: riskResult.factorBreakdown,
      history: {
        historicalRisk: historicalData.riskLevel,
        diseaseReports: historicalData.diseaseReports
      },
      recommendations
    });

    // Also update history table if a disease was detected with high confidence
    if (aiResult.type === 'Disease' && aiResult.confidence > 75) {
      const existingHistory = await DiseaseHistory.findOne({
        cropType,
        diseaseName: aiResult.diagnosis,
        location: userLocation
      });

      if (existingHistory) {
        existingHistory.occurrenceCount += 1;
        await existingHistory.save();
      } else {
        await DiseaseHistory.create({
          cropType,
          diseaseName: aiResult.diagnosis,
          location: userLocation,
          district: req.user.city,
          state: req.user.state,
          severity: riskResult.riskLevel,
          occurrenceCount: 1,
          reportingPeriod: new Date().toISOString().substring(0, 7) // YYYY-MM
        });
      }
    }

    // 7. Return Structured Response
    res.status(201).json({
      success: true,
      scanId: scan._id,
      crop: {
        type: cropType,
        stage: cropStage,
        variety: cropVariety
      },
      diagnosis: {
        name: aiResult.diagnosis,
        type: aiResult.type,
        confidence: riskResult.confidence
      },
      risk: {
        score: riskResult.riskScore,
        level: riskResult.riskLevel
      },
      factorBreakdown: riskResult.factorBreakdown,
      weather: weatherData || null,
      localHistory: historicalData,
      symptoms: aiResult.symptoms || [],
      recommendations,
      explanation: riskResult.explanation
    });

  } catch (error) {
    console.error('Intelligence Analysis Error:', error);
    res.status(500).json({ success: false, message: 'Server error during intelligence analysis' });
  }
};

// @desc    Ask a follow up doubt about a diagnosis
// @route   POST /api/intelligence/ask-doubt
// @access  Private
export const askDoubt = async (req, res) => {
  try {
    const { question, scanContext, scanId } = req.body;
    
    if (!question || !scanContext) {
      return res.status(400).json({ success: false, message: 'Missing question or context' });
    }

    let chatHistory = [];
    let scan = null;
    let Scan = null;
    
    if (scanId) {
      Scan = (await import('../models/Scan.js')).default;
      scan = await Scan.findOne({ _id: scanId, userId: req.user._id });
      if (scan && scan.chatHistory) {
        chatHistory = scan.chatHistory;
      }
    }

    const { answerDoubt } = await import('../services/openrouterService.js');
    const answer = await answerDoubt(question, scanContext, req.user.language, chatHistory);

    if (scan) {
      if (!scan.chatHistory) scan.chatHistory = [];
      scan.chatHistory.push({ role: 'user', content: question });
      scan.chatHistory.push({ role: 'ai', content: answer });
      await scan.save();
    }

    res.status(200).json({
      success: true,
      answer,
      chatHistory: scan ? scan.chatHistory : undefined
    });
  } catch (error) {
    console.error('Ask Doubt Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing your doubt' });
  }
};
