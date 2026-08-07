const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require("./config/env");
const { pool } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const instructorRoutes = require("./routes/instructorRoutes");
const courseRoutes = require("./routes/courseRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const dashboardRoutes = require('./routes/dashboardRoutes');
const studentRoutes = require('./routes/studentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const {
  apiRateLimiter,
} = require('./middleware/rateLimitMiddleware');

const notFoundMiddleware = require(
  './middleware/notFoundMiddleware'
);
const errorMiddleware = require("./middleware/errorMiddleware");
const ApiError = require('./utils/apiError');
const app = express();
const allowedOrigins = env.clientUrl
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        new ApiError(
          403,
          'This origin is not allowed to access the API'
        )
      );
    },
    credentials: true,
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  })
);
app.use(
  express.json({
    limit: '100kb',
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: '100kb',
  })
);
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the LearnHub API",
  });
});
app.get("/api/health", async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database_name,
        NOW() AS database_time
    `);
    res.status(200).json({
      success: true,
      message: "LearnHub backend is running",
      database: {
        status: "connected",
        name: result.rows[0].database_name,
        time: result.rows[0].database_time,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', studentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api', apiRateLimiter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
module.exports = app;