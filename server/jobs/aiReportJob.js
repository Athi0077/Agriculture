import cron from 'node-cron';
import User from '../models/User.js';
import Scan from '../models/Scan.js';
import AIReport from '../models/AIReport.js';
import Notification from '../models/Notification.js';
import { generateFarmingReport } from '../services/openrouterService.js';

// Helper to determine the current 6-hour window
const getCurrentWindow = () => {
  const now = new Date();
  const start = new Date(now);
  
  // E.g., if hour is 14, window is 12:00 to 18:00
  const hour = now.getHours();
  const windowStartHour = Math.floor(hour / 6) * 6;
  
  start.setHours(windowStartHour, 0, 0, 0);
  
  const end = new Date(start);
  end.setHours(windowStartHour + 6, 0, 0, 0);
  
  return { start, end };
};

const runAIReportJob = async () => {
  console.log(`[cron] Starting AI Farming Report job...`);
  const { start, end } = getCurrentWindow();
  
  try {
    const users = await User.find({});
    console.log(`[cron] Found ${users.length} active users.`);

    for (const user of users) {
      try {
        // 1. Check if report already exists for this window to prevent duplicates
        const existingReport = await AIReport.findOne({
          userId: user._id,
          periodStart: start,
          periodEnd: end
        });

        if (existingReport) {
          console.log(`[cron] Skip user ${user._id}: Report already exists for current window.`);
          continue;
        }

        // 2. Fetch recent scan history (last 15 scans)
        const recentScans = await Scan.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .limit(15);

        if (!recentScans || recentScans.length === 0) {
          console.log(`[cron] Skip user ${user._id}: No scans found.`);
          continue;
        }

        // 3. Generate AI report using Gemini
        console.log(`[cron] Generating report for user ${user._id} using ${recentScans.length} scans...`);
        const aiResponse = await generateFarmingReport(recentScans, 'English');

        // Validate basic structure
        if (!aiResponse || !aiResponse.overallStatus || !aiResponse.summary) {
          throw new Error('AI returned invalid structure');
        }

        // 4. Save AIReport
        const newReport = await AIReport.create({
          userId: user._id,
          title: 'AI Farming Report',
          periodStart: start,
          periodEnd: end,
          overallStatus: aiResponse.overallStatus,
          riskLevel: aiResponse.riskLevel || 'Unknown',
          summary: aiResponse.summary,
          keyFindings: aiResponse.keyFindings || [],
          changes: aiResponse.changes || [],
          recommendations: aiResponse.recommendations || [],
          scanCount: recentScans.length,
          sourceScanIds: recentScans.map(s => s._id),
          isRead: false
        });

        // 5. Create Notification
        await Notification.create({
          userId: user._id,
          type: 'AI_REPORT',
          title: 'New AI Farming Report 🌱',
          message: 'Your latest crop scan report is ready. Tap to view your crop health insights.',
          reportId: newReport._id,
          isRead: false
        });

        console.log(`[cron] Successfully generated report ${newReport._id} for user ${user._id}`);
      } catch (userErr) {
        console.error(`[cron] Failed to process user ${user._id}:`, userErr.message);
      }
    }
    
    console.log(`[cron] AI Farming Report job completed successfully.`);
  } catch (error) {
    console.error(`[cron] Critical error in runAIReportJob:`, error);
  }
};

export const initCronJobs = () => {
  // Run every 6 hours (at minute 0)
  // '0 */6 * * *'
  // For testing purposes, if you want to run it every minute, use '* * * * *'
  cron.schedule('0 */6 * * *', () => {
    runAIReportJob();
  });
  
  console.log('[cron] Automated AI Report job scheduled (every 6 hours).');
};

// Expose manual trigger for development testing
export const triggerManualJob = () => {
  runAIReportJob();
};
