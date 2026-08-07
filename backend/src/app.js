const express = require("express");
const cors = require("cors");

const env = require("./config/env");
const { pool } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const instructorRoutes = require("./routes/instructorRoutes");
const courseRoutes = require("./routes/courseRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");

const notFoundMiddleware = require("./middleware/notFoundMiddleware");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
