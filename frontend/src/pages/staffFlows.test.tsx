import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import type { Assignment, SubmissionRoster } from "../types/assignment";

vi.mock("../services/assignmentService", () => ({
  getAssignmentById: vi.fn(),
  getCourseAssignments: vi.fn(),
  createAssignment: vi.fn(),
  updateAssignment: vi.fn(),
  deleteAssignment: vi.fn(),
  getAssignmentAttachmentUrl: vi.fn(),
  getSubmissionAttachmentUrl: vi.fn(),
}));
vi.mock("../services/submissionService", () => ({
  getSubmissionsForAssignment: vi.fn(),
  gradeSubmission: vi.fn(),
}));
vi.mock("../services/courseService", () => ({
  getCourseById: vi.fn(),
  createCourse: vi.fn(),
  updateCourse: vi.fn(),
}));
vi.mock("../services/categoryService", () => ({ getCategories: vi.fn() }));
vi.mock("../services/instructorService", () => ({ getInstructors: vi.fn() }));

const assignmentService = await import("../services/assignmentService");
const submissionService = await import("../services/submissionService");
const courseService = await import("../services/courseService");
const categoryService = await import("../services/categoryService");
const instructorService = await import("../services/instructorService");

const { default: InstructorAssignmentSubmissionsPage } = await import(
  "./instructor/InstructorAssignmentSubmissionsPage"
);
const { default: InstructorCourseAssignmentsPage } = await import(
  "./instructor/InstructorCourseAssignmentsPage"
);
const { default: CourseFormPage } = await import("./admin/CourseFormPage");

const COURSE_ID = "course-1";
const ASSIGNMENT_ID = "assignment-1";

function renderRoute(element: React.ReactElement, path: string, url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path={path} element={element} />
        <Route path="/admin/courses" element={<p>course list</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

const baseAssignment: Assignment = {
  id: ASSIGNMENT_ID,
  courseId: COURSE_ID,
  title: "Responsive Layout Challenge",
  description: null,
  points: 100,
  dueAt: "2026-09-12T12:00:00Z",
  hasAttachment: false,
  attachmentName: null,
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-09-01T00:00:00Z",
};

describe("grading a submission", () => {
  function roster(): SubmissionRoster {
    return {
      points: 100,
      dueAt: "2026-09-12T12:00:00Z",
      counts: { total: 2, submitted: 1, graded: 0, missing: 1, ungraded: 1 },
      submissions: [
        {
          studentId: "s-1",
          studentName: "Nabil Farhan",
          studentEmail: "nabil@example.com",
          enrollmentStatus: "enrolled",
          isHistorical: false,
          status: "submitted",
          isLate: true,
          submission: {
            id: "submission-1",
            assignmentId: ASSIGNMENT_ID,
            studentId: "s-1",
            submissionText: "Completed.",
            submissionLink: null,
            hasAttachment: false,
            attachmentName: null,
            submittedAt: "2026-09-13T12:00:00Z",
            grade: null,
            feedback: null,
            gradedAt: null,
          },
        },
        {
          studentId: "s-2",
          studentName: "Sample Student",
          studentEmail: "student@example.com",
          enrollmentStatus: "cancelled",
          isHistorical: true,
          status: "missing",
          isLate: false,
          submission: null,
        },
      ],
    };
  }

  function setup() {
    vi.mocked(assignmentService.getAssignmentById).mockResolvedValue(baseAssignment);
    vi.mocked(submissionService.getSubmissionsForAssignment).mockResolvedValue(roster());

    return renderRoute(
      <InstructorAssignmentSubmissionsPage />,
      "/instructor/assignments/:assignmentId/submissions",
      `/instructor/assignments/${ASSIGNMENT_ID}/submissions`,
    );
  }

  test("shows the server's counts and each row's state", async () => {
    setup();

    expect(await screen.findByText("Nabil Farhan")).toBeInTheDocument();
    expect(screen.getByText("late")).toBeInTheDocument();
    expect(screen.getByText("cancelled enrollment")).toBeInTheDocument();
    expect(screen.getByText(/left the course/i)).toBeInTheDocument();
  });

  test("saving a grade sends a number and the feedback", async () => {
    const user = userEvent.setup();
    vi.mocked(submissionService.gradeSubmission).mockResolvedValue({} as never);
    setup();

    await user.type(await screen.findByPlaceholderText("Grade"), "86");
    await user.type(
      screen.getByPlaceholderText(/feedback for the student/i),
      "Good implementation.",
    );
    await user.click(screen.getByRole("button", { name: /save grade/i }));

    await waitFor(() =>
      expect(submissionService.gradeSubmission).toHaveBeenCalledWith(ASSIGNMENT_ID, "submission-1", {
        grade: 86,
        feedback: "Good implementation.",
      }),
    );
  });
});

describe("creating an assignment", () => {
  test("the new assignment form posts to the course", async () => {
    const user = userEvent.setup();
    vi.mocked(assignmentService.getCourseAssignments).mockResolvedValue([]);
    vi.mocked(assignmentService.createAssignment).mockResolvedValue(baseAssignment);

    renderRoute(
      <InstructorCourseAssignmentsPage />,
      "/instructor/courses/:courseId/assignments",
      `/instructor/courses/${COURSE_ID}/assignments`,
    );

    await user.click(await screen.findByRole("button", { name: /new assignment/i }));
    await user.type(screen.getByPlaceholderText(/week 3 problem set/i), "Semantic HTML Portfolio");
    await user.type(screen.getByPlaceholderText("100"), "50");
    await user.click(screen.getByRole("button", { name: "Create Assignment" }));

    await waitFor(() =>
      expect(assignmentService.createAssignment).toHaveBeenCalledWith(
        expect.objectContaining({
          course_id: COURSE_ID,
          title: "Semantic HTML Portfolio",
          points: "50",
        }),
      ),
    );
  });
});

describe("creating a course (admin)", () => {
  test("submits the form and returns to the course list", async () => {
    const user = userEvent.setup();

    vi.mocked(categoryService.getCategories).mockResolvedValue([
      { id: "cat-1", name: "Web Development" } as never,
    ]);
    vi.mocked(instructorService.getInstructors).mockResolvedValue({
      instructors: [
        { id: "ins-1", full_name: "Dr. Sarah Ahmad", is_active: true },
        { id: "ins-2", full_name: "Ms. Laila Hassan", is_active: false },
      ],
    } as never);
    vi.mocked(courseService.createCourse).mockResolvedValue({});

    renderRoute(<CourseFormPage />, "/admin/courses/create", "/admin/courses/create");

    // Only active instructors can be assigned a course.
    const instructorSelect = await screen.findByLabelText(/instructor/i);
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "Dr. Sarah Ahmad" })).toBeInTheDocument(),
    );
    expect(screen.queryByRole("option", { name: "Ms. Laila Hassan" })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/code/i), "WEB303");
    await user.type(screen.getByLabelText(/title/i), "Advanced Web Engineering");
    await user.clear(screen.getByLabelText(/capacity/i));
    await user.type(screen.getByLabelText(/capacity/i), "25");
    await user.selectOptions(screen.getByLabelText(/category/i), "cat-1");
    await user.selectOptions(instructorSelect, "ins-1");
    await user.click(screen.getByRole("button", { name: "Create Course" }));

    await waitFor(() =>
      expect(courseService.createCourse).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "WEB303",
          title: "Advanced Web Engineering",
          capacity: 25,
          category_id: "cat-1",
          instructor_id: "ins-1",
        }),
      ),
    );
    expect(await screen.findByText("course list")).toBeInTheDocument();
  });
});
