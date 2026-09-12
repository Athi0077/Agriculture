export const generateRecommendations = (data) => {
  const {
    riskLevel,
    aiDiagnosis,
    diseaseType,
    treatment,
    weatherData,
    soilCondition,
    aiConfidence
  } = data;

  const recommendations = [];

  // Low confidence check
  if (aiConfidence < 60 && diseaseType !== 'Healthy') {
    recommendations.push({
      priority: 'HIGH',
      category: 'Data Quality',
      title: 'Improve Image Quality',
      description: 'Upload a clearer close-up image of the affected leaf for better analysis.',
      reason: 'AI confidence is low.'
    });
  }

  // Critical risk actions
  if (riskLevel === 'Critical') {
    recommendations.push({
      priority: 'CRITICAL',
      category: 'Action Required',
      title: 'Immediate Field Inspection',
      description: 'Immediate field inspection recommended. Check surrounding plants for similar symptoms.',
      reason: 'The overall crop risk score is critically high.'
    });
  }

  // Soil specific
  if (soilCondition === 'Waterlogged') {
    recommendations.push({
      priority: 'HIGH',
      category: 'Field Management',
      title: 'Improve Drainage',
      description: 'Check drainage systems and avoid excessive irrigation until soil moisture normalizes.',
      reason: 'Waterlogged soil increases the risk of root rot and soil-borne diseases.'
    });
  } else if (soilCondition === 'Dry') {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Field Management',
      title: 'Increase Irrigation',
      description: 'Ensure adequate watering to reduce plant stress.',
      reason: 'Dry soil can weaken plant defenses.'
    });
  }

  // Weather specific
  if (weatherData) {
    if (weatherData.humidity > 80 && (diseaseType === 'Disease' || diseaseType === 'Unknown')) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Monitoring',
        title: 'Monitor Humidity Effects',
        description: 'Monitor affected plants closely and avoid unnecessary overhead irrigation.',
        reason: 'High humidity strongly supports fungal growth.'
      });
    }
  }

  // Safe chemical advice
  if (diseaseType === 'Disease' && (riskLevel === 'High' || riskLevel === 'Critical') && (!treatment || treatment.toLowerCase() === 'none')) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Treatment',
      title: 'Consult Agronomist',
      description: 'Consult a local agricultural officer or qualified agronomist before applying any chemical fungicide or bactericide treatment.',
      reason: 'Chemical application requires professional verification based on local regulations.'
    });
  }

  // Specific AI Treatment
  if (treatment && treatment.toLowerCase() !== 'none' && treatment.toLowerCase() !== 'unknown') {
    recommendations.push({
      priority: 'HIGH',
      category: 'Treatment',
      title: 'Apply ' + treatment,
      description: `The AI recommends ${treatment} for this diagnosis. You can search for this product online.`,
      reason: 'Targeted treatment is necessary to control the spread.',
      productQuery: treatment
    });
  }
  
  if (diseaseType === 'Pest' && (riskLevel === 'High' || riskLevel === 'Critical')) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Treatment',
      title: 'Pest Management',
      description: 'Consult an expert for appropriate integrated pest management (IPM) strategies or safe pesticide applications.',
      reason: 'Pest populations can grow rapidly without proper intervention.'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'LOW',
      category: 'General',
      title: 'Continue Normal Operations',
      description: 'Maintain standard watering and feeding schedules. Monitor crop weekly.',
      reason: 'No immediate risks identified.'
    });
  }

  return recommendations;
};
