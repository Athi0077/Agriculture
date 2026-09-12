export const riskRules = {
  // Generic fallback rules
  Generic: {
    Fungal: {
      humidity: { high: 80, medium: 65 },
      rainfall: { high: 20, medium: 10 },
      temperature: { high: 32, low: 18 }
    },
    Bacterial: {
      humidity: { high: 75, medium: 60 },
      rainfall: { high: 15, medium: 5 },
      temperature: { high: 35, low: 20 }
    },
    Pest: {
      temperature: { high: 35, low: 25 },
      humidity: { low: 40 } // Some pests prefer dry heat
    }
  },
  Tomato: {
    'Early Blight': {
      humidity: { high: 80, medium: 65 },
      rainfall: { high: 20, medium: 10 }
    },
    'Late Blight': {
      humidity: { high: 85, medium: 70 },
      temperature: { low: 15, high: 25 } // prefers cool, wet conditions
    }
  },
  // Add more specific crop rules here
};

export const cropStageVulnerability = {
  Seedling: 'Moderate',
  Vegetative: 'Moderate',
  Flowering: 'High',
  Fruiting: 'High',
  Maturity: 'Medium',
};

export const soilConditionRisk = {
  Dry: 'Stress',
  Normal: 'Low',
  Moist: 'Moderate',
  Waterlogged: 'High',
};
