import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    imageUrl: {
      type: String,
      required: true,
    },
    cropType: {
      type: String,
      required: true,
    },
    cropStage: {
      type: String,
    },
    cropVariety: {
      type: String,
    },
    soilCondition: {
      type: String,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    diseaseType: {
      type: String, // e.g., 'Disease', 'Pest', 'Healthy'
    },
    confidence: {
      type: Number,
      required: true,
    },
    riskScore: {
      type: Number,
    },
    riskLevel: {
      type: String, // 'Low', 'Moderate', 'High', 'Critical'
      required: true,
    },
    factorBreakdown: {
      aiAnalysis: Number,
      weather: Number,
      cropStage: Number,
      soil: Number,
      history: Number,
      variety: Number,
    },
    symptoms: [
      {
        type: String,
      },
    ],
    recommendations: [
      {
        priority: String,
        category: String,
        title: String,
        description: String,
        reason: String
      },
    ],
    weatherData: {
      location: String,
      temperature: Number,
      humidity: Number,
      rainfall: Number,
      windSpeed: Number,
      description: String,
    },
    history: {
      historicalRisk: String,
      diseaseReports: Number,
    },
    location: {
      type: String,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    chatHistory: [
      {
        role: String,
        content: String,
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Scan = mongoose.model('Scan', scanSchema);

export default Scan;
