const enrollmentService = require("../services/enrollmentService");
const notifications = require("../services/notificationService");
const ApiError = require("../utils/apiError");

// Student-facing enrollment endpoints.
//
// These follow the same pattern as every other controller: throw an ApiError
// and let asyncHandler and errorMiddleware shape the response. They used to
// catch everything locally and answer each failure by hand, which meant an
// unexpected error became a generic 500 here while the same error elsewhere
// went through the shared handler (and its logging and 400 mapping).
// Response bodies are unchanged.

// POST /api/enrollments
async function createEnrollment(req, res) {
  const studentId = req.user.id;
  const { courseId } = req.body;

  if (!courseId) {
    throw new ApiError(400, "courseId is required");
  }

  const course = await enrollmentService.findCourseById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Lifecycle: only a published course takes enrollments. A draft isn't ready
  // and an archived course is a historical record.
  if (course.status !== "published") {
    throw new ApiError(400, "This course is not available for enrollment");
  }

  const existingEnrollment = await enrollmentService.findActiveEnrollment(studentId, courseId);

  if (existingEnrollment) {
    throw new ApiError(409, "You are already enrolled in this course");
  }

  const activeEnrollmentCount = await enrollmentService.countActiveEnrollments(courseId);

  if (activeEnrollmentCount >= course.capacity) {
    throw new ApiError(409, "This course is already full");
  }

  const timetableConflict = await enrollmentService.findTimetableConflict(studentId, courseId);

  if (timetableConflict) {
    throw new ApiError(409, "This course conflicts with your current timetable", null, {
      conflict: timetableConflict,
    });
  }

  const enrollment = await enrollmentService.createEnrollment(studentId, courseId);

  // This enrollment took the last seat.
  if (activeEnrollmentCount + 1 >= course.capacity) {
    await notifications.notifyRole("admin", {
      type: "course_full",
      title: `${course.code} reached full capacity`,
      body: `${course.capacity} / ${course.capacity} seats taken`,
      link: `/admin/courses/${course.id}/edit`,
    });
  }

  res.status(201).json({
    success: true,
    message: "Enrollment created successfully",
    data: enrollment,
  });
}

// GET /api/enrollments/my-courses
async function getMyCourses(req, res) {
  const enrollments = await enrollmentService.getEnrollmentsByStudentId(req.user.id);

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments,
  });
}

// DELETE /api/enrollments/:id
async function cancelEnrollment(req, res) {
  const enrollment = await enrollmentService.cancelEnrollment(req.params.id, req.user.id);

  if (!enrollment) {
    throw new ApiError(404, "Active enrollment not found");
  }

  res.status(200).json({
    success: true,
    message: "Enrollment cancelled successfully",
    data: enrollment,
  });
}

// GET /api/enrollments/timetable
async function getMyTimetable(req, res) {
  const timetable = await enrollmentService.getTimetableByStudentId(req.user.id);

  res.status(200).json({
    success: true,
    count: timetable.length,
    data: timetable,
  });
}

module.exports = {
  createEnrollment,
  getMyCourses,
  cancelEnrollment,
  getMyTimetable,
};
