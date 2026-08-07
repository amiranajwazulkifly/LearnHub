// dzul
const reportService = require('../services/reportService');

async function enrollmentTrend(req, res) {
  const days = Math.min(365, parseInt(req.query.days, 10) || 30);
  const data = await reportService.getEnrollmentTrend(days);
  res.status(200).json({
    success: true,
    message: 'Enrollment trend retrieved successfully',
    data: { trend: data },
  });
}

async function coursePopularity(req, res) {
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
  const data = await reportService.getCoursePopularity(limit);
  res.status(200).json({
    success: true,
    message: 'Course popularity retrieved successfully',
    data: { courses: data },
  });
}

async function completionRates(req, res) {
  const data = await reportService.getCompletionRates();
  res.status(200).json({
    success: true,
    message: 'Completion rates retrieved successfully',
    data: { courses: data },
  });
}

module.exports = { enrollmentTrend, coursePopularity, completionRates };
