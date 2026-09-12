import mongoose from 'mongoose';

const aiReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    },
    reportType: {
      type: String,
      default: 'scan-summary',
    },
    title: {
      type: String,
      default: 'AI Farming Report',
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    overallStatus: {
      type: String,
      required: true, // e.g., 'Good', 'Moderate', 'Needs Attention'
    },
    riskLevel: {
      type: String,
      required: true, // e.g., 'Low', 'Moderate', 'High', 'Critical'
    },
    summary: {
      type: String,
      required: true,
    },
    keyFindings: [
      { type: String }
    ],
    changes: [
      { type: String }
    ],
    recommendations: [
      { type: String }
    ],
    scanCount: {
      type: Number,
      required: true,
      default: 0
    },
    sourceScanIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scan'
      }
    ],
    isRead: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reports for the same period
aiReportSchema.index({ userId: 1, periodStart: 1, periodEnd: 1 }, { unique: true });

const AIReport = mongoose.model('AIReport', aiReportSchema);

export default AIReport;
