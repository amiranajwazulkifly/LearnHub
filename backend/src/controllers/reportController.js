// backend/src/controllers/reportController.js
const asyncHandler = require('../utils/asyncHandler');
const reportService = require('../services/reportService');

// GET /api/reports/enrollment-trend?days=30
exports.enrollmentTrend = asyncHandler(async (req, res) => {
  const days = Math.min(365, parseInt(req.query.days) || 30);
  const data = await reportService.getEnrollmentTrend(days);
  res.status(200).json(data);
});

// GET /api/reports/course-popularity?limit=10
exports.coursePopularity = asyncHandler(async (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const data = await reportService.getCoursePopularity(limit);
  res.status(200).json(data);
});

// GET /api/reports/completion-rates
exports.completionRates = asyncHandler(async (req, res) => {
  const data = await reportService.getCompletionRates();
  res.status(200).json(data);
});
