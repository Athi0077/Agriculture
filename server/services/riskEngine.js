import { riskRules, cropStageVulnerability, soilConditionRisk } from '../config/riskRules.js';

const WEIGHTS = {
  ai: 0.40,
  weather: 0.25,
  stage: 0.10,
  soil: 0.10,
  history: 0.10,
  variety: 0.05
};

export const calculateCropRisk = (data) => {
  const {
    aiDiagnosis,
    aiConfidence,
    diseaseType,
    cropType,
    cropStage,
    cropVariety,
    weatherData,
    soilCondition,
    historicalData
  } = data;

  const factors = [];
  const breakdown = { aiAnalysis: 0, weather: 0, cropStage: 0, soil: 0, history: 0, variety: 0 };
  let explanationParts = [];

  // 1. AI Score (0-100)
  let rawAiScore = 0;
  if (aiConfidence >= 0 && diseaseType !== 'Healthy' && aiDiagnosis !== 'Analysis Failed') {
    rawAiScore = aiConfidence;
  }
  if (diseaseType === 'Healthy') {
    rawAiScore = 0; // if it's confidently healthy, AI risk is 0
  }
  
  if (aiConfidence < 50 && diseaseType !== 'Healthy') {
    explanationParts.push("Low image confidence. The visual analysis might not be reliable.");
  } else if (diseaseType !== 'Healthy') {
    explanationParts.push(`AI detected possible ${aiDiagnosis} with ${aiConfidence}% confidence.`);
  }

  breakdown.aiAnalysis = Number((rawAiScore * WEIGHTS.ai).toFixed(2));

  // 2. Weather Score (0-100)
  let rawWeatherScore = 30; // default baseline
  if (weatherData) {
    const { humidity, rainfall, temperature } = weatherData;
    let rule = riskRules.Generic.Fungal; // default to fungal checks
    
    // Check if we have crop and disease specific rules
    if (cropType && aiDiagnosis && riskRules[cropType] && riskRules[cropType][aiDiagnosis]) {
      rule = riskRules[cropType][aiDiagnosis];
    } else if (diseaseType === 'Bacterial') {
      rule = riskRules.Generic.Bacterial;
    } else if (diseaseType === 'Pest') {
      rule = riskRules.Generic.Pest;
    }
    
    if (rule.humidity) {
      if (humidity > (rule.humidity.high || 80)) {
        rawWeatherScore += 40;
        explanationParts.push("Current high humidity creates favorable conditions for disease spread.");
      } else if (humidity > (rule.humidity.medium || 60)) {
        rawWeatherScore += 20;
      }
    }
    
    if (rule.rainfall && rainfall > (rule.rainfall.high || 15)) {
        rawWeatherScore += 30;
        explanationParts.push("Recent heavy rainfall increases environmental disease pressure.");
    }
  } else {
    explanationParts.push("Weather information is currently unavailable.");
  }
  // Clamp to 100
  rawWeatherScore = Math.min(rawWeatherScore, 100);
  breakdown.weather = Number((rawWeatherScore * WEIGHTS.weather).toFixed(2));

  // 3. Crop Stage (0-100)
  let rawStageScore = 0;
  if (cropStage) {
    const stageVuln = cropStageVulnerability[cropStage] || 'Moderate';
    if (stageVuln === 'High') {
      rawStageScore = 100;
      explanationParts.push(`Current crop stage (${cropStage}) is highly vulnerable.`);
    } else if (stageVuln === 'Moderate') {
      rawStageScore = 50;
    } else {
      rawStageScore = 20;
    }
  }
  breakdown.cropStage = Number((rawStageScore * WEIGHTS.stage).toFixed(2));

  // 4. Soil Condition (0-100)
  let rawSoilScore = 0;
  if (soilCondition) {
    const soilRisk = soilConditionRisk[soilCondition] || 'Unknown';
    if (soilRisk === 'High') {
      rawSoilScore = 100;
      explanationParts.push(`Waterlogged soil increases root rot and fungal risk.`);
    } else if (soilRisk === 'Stress') {
      rawSoilScore = 80;
      explanationParts.push(`Dry soil conditions increase plant stress.`);
    } else if (soilRisk === 'Moderate') {
      rawSoilScore = 40;
    }
  } else {
    // Missing data handling
    rawSoilScore = 0; // Default to neutral if missing
  }
  breakdown.soil = Number((rawSoilScore * WEIGHTS.soil).toFixed(2));

  // 5. Historical Data (0-100)
  let rawHistoryScore = 0;
  if (historicalData && historicalData.available) {
    rawHistoryScore = historicalData.riskScore || 0;
    if (rawHistoryScore > 50) {
      explanationParts.push(`Similar diseases have been reported locally (High historical activity).`);
    }
  } else {
    explanationParts.push("Insufficient local history data.");
  }
  breakdown.history = Number((rawHistoryScore * WEIGHTS.history).toFixed(2));

  // 6. Variety Susceptibility (0-100)
  let rawVarietyScore = 0;
  if (cropVariety) {
    // In a real system, you'd look up a database of variety resistance
    // We default to moderate vulnerability if unknown to not artificially inflate risk
    rawVarietyScore = 50; 
  } else {
    // "Variety susceptibility data unavailable"
    rawVarietyScore = 50; 
  }
  breakdown.variety = Number((rawVarietyScore * WEIGHTS.variety).toFixed(2));

  // Final calculation
  let finalRiskScore = breakdown.aiAnalysis + breakdown.weather + breakdown.cropStage + breakdown.soil + breakdown.history + breakdown.variety;
  
  // Clamp 0-100
  finalRiskScore = Math.max(0, Math.min(Math.round(finalRiskScore), 100));

  // Level mapping
  let riskLevel = 'Low';
  if (finalRiskScore >= 80) riskLevel = 'Critical';
  else if (finalRiskScore >= 60) riskLevel = 'High';
  else if (finalRiskScore >= 30) riskLevel = 'Moderate';

  let explanation = explanationParts.join(' ');
  if (!explanation) explanation = 'No significant risk factors detected.';

  return {
    riskScore: finalRiskScore,
    riskLevel,
    confidence: aiConfidence, // Separate from risk
    factorBreakdown: breakdown,
    explanation,
  };
};
