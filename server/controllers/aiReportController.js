import AIReport from '../models/AIReport.js';

// @desc    Get all AI reports for user
// @route   GET /api/ai-reports
// @access  Private
export const getAIReports = async (req, res) => {
  try {
    const reports = await AIReport.find({ userId: req.user._id })
      .sort({ generatedAt: -1 });

    res.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error('Error in getAIReports:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single AI report by ID
// @route   GET /api/ai-reports/:id
// @access  Private
export const getAIReportById = async (req, res) => {
  try {
    const report = await AIReport.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('sourceScanIds', 'cropType diagnosis confidence riskLevel createdAt imageUrl');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Error in getAIReportById:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark AI report as read
// @route   POST /api/ai-reports/:id/read
// @access  Private
export const markReportAsRead = async (req, res) => {
  try {
    const report = await AIReport.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Error in markReportAsRead:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
