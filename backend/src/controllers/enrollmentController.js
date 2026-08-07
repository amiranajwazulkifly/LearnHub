const enrollmentService = require("../services/enrollmentService");

async function createEnrollment(req, res) {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    const course = await enrollmentService.findCourseById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "This course is not available for enrollment",
      });
    }

    const existingEnrollment = await enrollmentService.findActiveEnrollment(
      studentId,
      courseId,
    );

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    const activeEnrollmentCount =
      await enrollmentService.countActiveEnrollments(courseId);

    if (activeEnrollmentCount >= course.capacity) {
      return res.status(409).json({
        success: false,
        message: "This course is already full",
      });
    }

    const enrollment = await enrollmentService.createEnrollment(
      studentId,
      courseId,
    );

    res.status(201).json({
      success: true,
      message: "Enrollment created successfully",
      data: enrollment,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create enrollment",
    });
  }
}

async function getMyCourses(req, res) {
  try {
    const studentId = req.user.id;

    const enrollments =
      await enrollmentService.getEnrollmentsByStudentId(studentId);

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve enrolled courses",
    });
  }
}

async function cancelEnrollment(req, res) {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const enrollment = await enrollmentService.cancelEnrollment(id, studentId);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Active enrollment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enrollment cancelled successfully",
      data: enrollment,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel enrollment",
    });
  }
}

async function getMyTimetable(req, res) {
  try {
    const studentId = req.user.id;

    const timetable =
      await enrollmentService.getTimetableByStudentId(studentId);

    res.status(200).json({
      success: true,
      count: timetable.length,
      data: timetable,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve timetable",
    });
  }
}

module.exports = {
  createEnrollment,
  getMyCourses,
  cancelEnrollment,
  getMyTimetable,
};
