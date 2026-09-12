import Scan from '../models/Scan.js';
import { analyzeCropImage } from '../services/openrouterService.js';
import { getWeatherByLocation } from '../services/weatherService.js';

// @desc    Analyze a new scan
// @route   POST /api/scans/analyze
// @access  Private
export const analyzeScan = async (req, res) => {
  try {
    const { cropType, cropStage, cropVariety, soilCondition, lat, lng } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const imageUrl = req.file.path; // Multer saves it here

    // 1. Get user's location weather
    const weatherData = await getWeatherByLocation(req.user.city, req.user.state);

    // 2. Analyze image using OpenRouter AI
    const aiResult = await analyzeCropImage(imageUrl, cropType, weatherData);

    // 3. Save to database
    const scan = await Scan.create({
      userId: req.user._id,
      imageUrl: imageUrl.replace(/\\/g, '/'), // normalize path for frontend
      cropType,
      cropStage,
      cropVariety,
      soilCondition,
      diagnosis: aiResult.diagnosis,
      diseaseType: aiResult.type,
      confidence: aiResult.confidence,
      riskLevel: aiResult.riskLevel,
      symptoms: aiResult.symptoms,
      recommendations: aiResult.recommendations,
      weatherData,
      coordinates: (lat && lng) ? { lat: Number(lat), lng: Number(lng) } : undefined
    });

    res.status(201).json({
      success: true,
      scan
    });

  } catch (error) {
    console.error('Scan Analysis Error:', error);
    res.status(500).json({ success: false, message: 'Server error during analysis' });
  }
};

// @desc    Get user scans
// @route   GET /api/scans
// @access  Private
export const getUserScans = async (req, res) => {
  try {
    const scans = await Scan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, scans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching scans' });
  }
};

// @desc    Get single scan by ID
// @route   GET /api/scans/:id
// @access  Private
export const getScanById = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);

    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }

    // Make sure user owns this scan
    if (scan.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this scan' });
    }

    res.status(200).json({ success: true, scan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching scan' });
  }
};

// @desc    Delete a scan
// @route   DELETE /api/scans/:id
// @access  Private
export const deleteScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);

    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }

    // Make sure user owns this scan
    if (scan.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this scan' });
    }

    await scan.deleteOne();
    
    // Optional: Also delete the image file from the uploads directory here

    res.status(200).json({ success: true, message: 'Scan removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting scan' });
  }
};

// @desc    Get anonymized community scans for heatmap
// @route   GET /api/scans/community
// @access  Private
export const getCommunityScans = async (req, res) => {
  try {
    const scans = await Scan.find({ 'coordinates.lat': { $exists: true } })
      .select('coordinates riskLevel diseaseType cropType createdAt')
      .sort({ createdAt: -1 })
      .limit(500);
      
    res.status(200).json({ success: true, scans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching community scans' });
  }
};
