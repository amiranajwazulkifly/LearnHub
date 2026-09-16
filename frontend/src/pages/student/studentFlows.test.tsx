import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import type { Course } from "../../types/course";
import type { Assignment, Submission } from "../../types/assignment";

vi.mock("../../services/courseService", () => ({ getCourseById: vi.fn() }));
vi.mock("../../services/scheduleService", () => ({ getSchedules: vi.fn() }));
vi.mock("../../services/enrollmentService", () => ({
  enrollCourse: vi.fn(),
  getMyCourses: vi.fn(),
  cancelEnrollment: vi.fn(),
}));
vi.mock("../../services/assignmentService", () => ({
  getAssignmentById: vi.fn(),
  getMyAssignments: vi.fn(),
  getAssignmentAttachmentUrl: vi.fn(),
  getSubmissionAttachmentUrl: vi.fn(),
}));
vi.mock("../../services/submissionService", () => ({
  getMySubmission: vi.fn(),
  submitAssignment: vi.fn(),
}));

const courseService = await import("../../services/courseService");
const scheduleService = await import("../../services/scheduleService");
const enrollmentService = await import("../../services/enrollmentService");
const assignmentService = await import("../../services/assignmentService");
const submissionService = await import("../../services/submissionService");

const { default: CourseDetailsPage } = await import("./CourseDetailsPage");
const { default: MyCoursesPage } = await import("./MyCoursesPage");
const { default: StudentAssignmentDetailPage } = await import("./StudentAssignmentDetailPage");

const COURSE_ID = "course-1";
const ASSIGNMENT_ID = "assignment-1";

function course(overrides: Partial<Course> = {}): Course {
  return {
    id: COURSE_ID,
    code: "WEB202",
    title: "Fundamentals of Web Development",
    description: "Build a web app.",
    category_id: null,
    instructor_id: null,
    capacity: 30,
    status: "published",
    enrolled_count: 12,
    ...overrides,
  };
}

function assignment(overrides: Partial<Assignment> = {}): Assignment {
  return {
    id: ASSIGNMENT_ID,
    courseId: COURSE_ID,
    courseCode: "WEB202",
    courseTitle: "Fundamentals of Web Development",
    title: "Responsive Layout Challenge",
    description: "Reproduce the mockup.",
    points: 100,
    dueAt: "2099-01-01T12:00:00Z",
    hasAttachment: false,
    attachmentName: null,
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
    canSubmit: true,
    ...overrides,
  };
}

function renderRoute(element: React.ReactElement, path: string, url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path={path} element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

function httpError(status: number) {
  const headers = new AxiosHeaders();
  return new AxiosError("Request failed", "ERR", { headers }, null, {
    status,
    statusText: "",
    headers,
    config: { headers },
    data: { success: false, message: "You are not enrolled in this course" },
  });
}

describe("enrolling in a course", () => {
  function setup(overrides: Partial<Course> = {}) {
    vi.mocked(courseService.getCourseById).mockResolvedValue(course(overrides));
    vi.mocked(scheduleService.getSchedules).mockResolvedValue([]);
    vi.mocked(enrollmentService.getMyCourses).mockResolvedValue({ success: true, count: 0, data: [] });

    return renderRoute(<CourseDetailsPage />, "/student/courses/:id", `/student/courses/${COURSE_ID}`);
  }

  test("enrolling calls the API and switches the page to the enrolled state", async () => {
    const user = userEvent.setup();
    vi.mocked(enrollmentService.enrollCourse).mockResolvedValue({ data: { id: "enrollment-1" } });

    setup();
    await user.click(await screen.findByRole("button", { name: "Enroll Now" }));

    expect(enrollmentService.enrollCourse).toHaveBeenCalledWith(COURSE_ID);
    expect(await screen.findByRole("button", { name: "Enrolled" })).toBeDisabled();
  });

  test("a full course cannot be enrolled in", async () => {
    setup({ capacity: 30, enrolled_count: 30 });

    expect(await screen.findByRole("button", { name: "Course Full" })).toBeDisabled();
  });

  test("a course that isn't published cannot be enrolled in", async () => {
    setup({ status: "archived" });

    expect(await screen.findByRole("button", { name: "Enrollment Closed" })).toBeDisabled();
  });
});

describe("cancelling an enrollment", () => {
  test("asks for confirmation first, and only cancels once confirmed", async () => {
    const user = userEvent.setup();

    vi.mocked(enrollmentService.getMyCourses).mockResolvedValue({
      success: true,
      count: 1,
      data: [
        {
          enrollment_id: "enrollment-1",
          enrollment_status: "enrolled",
          enrolled_at: "2026-09-01T00:00:00Z",
          course_id: COURSE_ID,
          code: "WEB202",
          title: "Fundamentals of Web Development",
          description: "Build a web app.",
          capacity: 30,
          course_status: "published",
          instructor_name: "Dr. Sarah Ahmad",
          category_name: "Web Development",
        },
      ],
    });
    vi.mocked(scheduleService.getSchedules).mockResolvedValue([]);
    vi.mocked(assignmentService.getMyAssignments).mockResolvedValue([]);
    vi.mocked(enrollmentService.cancelEnrollment).mockResolvedValue({ success: true });

    renderRoute(<MyCoursesPage />, "/student/my-courses", "/student/my-courses");

    await user.click(await screen.findByRole("button", { name: "Cancel enrollment" }));

    // Nothing happens until the dialog is confirmed.
    const dialog = await screen.findByRole("dialog");
    expect(enrollmentService.cancelEnrollment).not.toHaveBeenCalled();

    // Backing out does nothing.
    await user.click(within(dialog).getByRole("button", { name: "Keep Enrollment" }));
    expect(enrollmentService.cancelEnrollment).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel enrollment" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Cancel Enrollment" }),
    );

    await waitFor(() => expect(enrollmentService.cancelEnrollment).toHaveBeenCalledWith("enrollment-1"));
  });
});

describe("submitting an assignment", () => {
  function setup(a: Assignment, submission: Submission | null = null) {
    vi.mocked(assignmentService.getAssignmentById).mockResolvedValue(a);
    vi.mocked(submissionService.getMySubmission).mockResolvedValue(submission);

    return renderRoute(
      <StudentAssignmentDetailPage />,
      "/student/tasks/:assignmentId",
      `/student/tasks/${ASSIGNMENT_ID}`,
    );
  }

  test("an empty submission is refused before calling the API", async () => {
    const user = userEvent.setup();
    setup(assignment());

    await user.click(await screen.findByRole("button", { name: "Submit Assignment" }));

    expect(await screen.findByText(/add some text, a link, or a file/i)).toBeInTheDocument();
    expect(submissionService.submitAssignment).not.toHaveBeenCalled();
  });

  test("submitting sends the work to the API", async () => {
    const user = userEvent.setup();
    vi.mocked(submissionService.submitAssignment).mockResolvedValue({} as Submission);
    setup(assignment());

    await user.type(await screen.findByPlaceholderText(/write your answer/i), "My answer");
    await user.click(screen.getByRole("button", { name: "Submit Assignment" }));

    await waitFor(() =>
      expect(submissionService.submitAssignment).toHaveBeenCalledWith(
        ASSIGNMENT_ID,
        expect.objectContaining({ submission_text: "My answer" }),
      ),
    );
  });

  test("a graded submission shows the grade and feedback", async () => {
    setup(assignment(), {
      id: "submission-1",
      assignmentId: ASSIGNMENT_ID,
      studentId: "student-1",
      submissionText: "Done",
      submissionLink: null,
      hasAttachment: false,
      attachmentName: null,
      submittedAt: "2026-09-10T12:00:00Z",
      grade: 86,
      feedback: "Improve input validation.",
      gradedAt: "2026-09-12T12:00:00Z",
    });

    expect(await screen.findByText("86 / 100")).toBeInTheDocument();
    expect(screen.getByText("Improve input validation.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Replace Submission" })).toBeEnabled();
  });

  test("after leaving the course, the record is readable but submitting is closed", async () => {
    setup(assignment({ canSubmit: false, enrollmentStatus: "cancelled" }));

    expect(await screen.findByText(/your enrollment in this course has ended/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submissions closed" })).toBeDisabled();
  });

  test("no access shows a proper error state, not a raw message", async () => {
    vi.mocked(assignmentService.getAssignmentById).mockRejectedValue(httpError(403));
    vi.mocked(submissionService.getMySubmission).mockRejectedValue(httpError(403));

    renderRoute(
      <StudentAssignmentDetailPage />,
      "/student/tasks/:assignmentId",
      `/student/tasks/${ASSIGNMENT_ID}`,
    );

    expect(await screen.findByRole("heading", { name: "Assignment unavailable" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Tasks" })).toBeInTheDocument();
    // A 403 won't succeed on retry, so none is offered.
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(screen.queryByText(/not enrolled in this course/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Failed to load this assignment")).not.toBeInTheDocument();
  });
});
