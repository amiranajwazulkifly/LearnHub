// dzul
const reportService = require('../services/reportService');
const ApiError = require('../utils/apiError');
const { sendCsv } = require('../utils/csv');

function parseDays(query) {
  return Math.min(365, Math.max(1, parseInt(query.days, 10) || 30));
}

async function enrollmentTrend(req, res) {
  const days = parseDays(req.query);
  const data = await reportService.getEnrollmentTrend(days);

  res.status(200).json({
    success: true,
    message: 'Enrollment trend retrieved successfully',
    data: {
      trend: data,
      // The window the figures cover, so the chart can label its own range
      // rather than hardcoding "Last 30 Days" while showing something else.
      range: {
        days,
        from: data.length ? data[0].date : null,
        to: data.length ? data[data.length - 1].date : null,
      },
    },
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

// GET /api/reports/export/:type  (admin) — streams a CSV download.
async function exportReport(req, res) {
  const { type } = req.params;

  const build = reportService.EXPORTS[type];

  if (!build) {
    throw new ApiError(
      404,
      `Unknown export "${type}". Available: ${Object.keys(reportService.EXPORTS).join(', ')}`
    );
  }

  const { filename, columns, rows } = await build(parseDays(req.query));

  sendCsv(res, filename, columns, rows);
}

module.exports = { enrollmentTrend, coursePopularity, completionRates, exportReport };
