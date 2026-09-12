import mongoose from 'mongoose';

const diseaseHistorySchema = new mongoose.Schema(
  {
    cropType: {
      type: String,
      required: true,
    },
    diseaseName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    district: {
      type: String,
    },
    state: {
      type: String,
    },
    occurrenceCount: {
      type: Number,
      default: 1,
    },
    severity: {
      type: String,
    },
    reportingPeriod: {
      type: String, // e.g., '2026-Q3' or 'September 2026'
    },
  },
  {
    timestamps: true,
  }
);

const DiseaseHistory = mongoose.model('DiseaseHistory', diseaseHistorySchema);

export default DiseaseHistory;
