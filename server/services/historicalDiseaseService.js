import DiseaseHistory from '../models/DiseaseHistory.js';

export const getLocalDiseaseHistory = async (cropType, location) => {
  try {
    if (!location || !cropType) {
      return { available: false, riskLevel: 'Unknown', diseaseReports: 0 };
    }

    // Basic exact match for location for now (in a real app, use geo-spatial queries or fuzzy matching)
    // Here we're using a regex for simple case-insensitive matching
    const regexLocation = new RegExp(location, 'i');
    
    const records = await DiseaseHistory.find({
      cropType: new RegExp(`^${cropType}$`, 'i'),
      location: regexLocation
    });

    if (records.length === 0) {
      return { available: false, riskLevel: 'Insufficient local history', diseaseReports: 0 };
    }

    const diseaseReports = records.reduce((acc, curr) => acc + curr.occurrenceCount, 0);

    let riskLevel = 'Low';
    let riskScore = 0; // mapped to 0-100 internally for calculation

    if (diseaseReports <= 5) {
      riskLevel = 'Low';
      riskScore = 15;
    } else if (diseaseReports <= 20) {
      riskLevel = 'Moderate';
      riskScore = 40;
    } else if (diseaseReports <= 50) {
      riskLevel = 'High';
      riskScore = 70;
    } else {
      riskLevel = 'Very high';
      riskScore = 95;
    }

    return {
      available: true,
      riskLevel,
      riskScore,
      diseaseReports,
    };
  } catch (error) {
    console.error('Error fetching local disease history:', error);
    return { available: false, riskLevel: 'Error fetching history', diseaseReports: 0 };
  }
};
