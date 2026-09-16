const { app, request, getToken, authHeader, cleanupNotificationsSince } = require("./helpers");

// The end-to-end path this system exists to support:
//
//   instructor creates an assignment
//     -> student sees it
//     -> student submits
//     -> instructor receives the submission
//     -> instructor grades with feedback
//     -> student sees the grade and feedback
//
// Every screen involved reports counts, so this also pins the invariant that
// the roster, the assignment list and the instructor dashboard never
// disagree about the same assignment.

const WEB202 = "30000000-0000-0000-0000-000000000001"; // Sarah's course; the seeded student is enrolled
const SEEDED_STUDENT_NAME = "Sample Student";

describe("Core assignment workflow", () => {
  let instructorToken;
  let studentToken;
  let assignmentId;
  let submissionId;

  const startedAt = new Date();

  beforeAll(async () => {
    instructorToken = await getToken("instructor");
    studentToken = await getToken("student");
  });

  afterAll(async () => {
    if (assignmentId) {
      await request(app)
        .delete(`/api/assignments/${assignmentId}`)
        .set(authHeader(instructorToken));
    }

    await cleanupNotificationsSince(startedAt);
  });

  test("instructor creates an assignment", async () => {
    const res = await request(app)
      .post("/api/assignments")
      .set(authHeader(instructorToken))
      .field("course_id", WEB202)
      .field("title", "Workflow Test Assignment")
      .field("points", "40")
      .field("due_at", "2027-01-01T12:00");

    expect(res.status).toBe(201);
    assignmentId = res.body.data.assignment.id;
    expect(assignmentId).toBeTruthy();
  });

  test("the assignment starts with everyone missing and nothing graded", async () => {
    const res = await request(app)
      .get(`/api/assignments/${assignmentId}/submissions`)
      .set(authHeader(instructorToken));

    expect(res.status).toBe(200);
    expect(res.body.data.counts.submitted).toBe(0);
    expect(res.body.data.counts.graded).toBe(0);
    expect(res.body.data.counts.missing).toBeGreaterThan(0);
  });

  test("the student sees it on their cross-course task list", async () => {
    const res = await request(app)
      .get("/api/assignments/mine")
      .set(authHeader(studentToken));

    expect(res.status).toBe(200);
    expect(res.body.data.assignments.some((a) => a.id === assignmentId)).toBe(true);
  });

  test("the student submits", async () => {
    const res = await request(app)
      .post(`/api/assignments/${assignmentId}/submit`)
      .set(authHeader(studentToken))
      .field("submission_text", "My answer.")
      .field("submission_link", "https://example.edu/workflow");

    expect(res.status).toBe(200);
    submissionId = res.body.data.submission.id;
    expect(submissionId).toBeTruthy();
  });

  test("the instructor receives it on the roster, counted as submitted", async () => {
    const res = await request(app)
      .get(`/api/assignments/${assignmentId}/submissions`)
      .set(authHeader(instructorToken));

    expect(res.status).toBe(200);

    const row = res.body.data.submissions.find(
      (entry) => entry.studentName === SEEDED_STUDENT_NAME
    );

    expect(row).toBeDefined();
    expect(row.status).toBe("submitted");
    expect(res.body.data.counts.submitted).toBe(1);
    expect(res.body.data.counts.graded).toBe(0);
  });

  test("the assignment list agrees with the roster", async () => {
    const res = await request(app)
      .get(`/api/assignments/course/${WEB202}`)
      .set(authHeader(instructorToken));

    const listed = res.body.data.assignments.find((a) => a.id === assignmentId);

    expect(listed.counts.submitted).toBe(1);
    expect(listed.counts.graded).toBe(0);
    expect(listed.counts.ungraded).toBe(1);
  });

  test("a grade above the assignment's points is rejected", async () => {
    const res = await request(app)
      .patch(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`)
      .set(authHeader(instructorToken))
      .send({ grade: 999 });

    expect(res.status).toBe(400);
  });

  test("the instructor grades it with feedback", async () => {
    const res = await request(app)
      .patch(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`)
      .set(authHeader(instructorToken))
      .send({ grade: 36, feedback: "Clear and correct." });

    expect(res.status).toBe(200);
  });

  test("the student sees the grade and the feedback", async () => {
    const res = await request(app)
      .get(`/api/assignments/${assignmentId}/my-submission`)
      .set(authHeader(studentToken));

    expect(res.status).toBe(200);
    expect(Number(res.body.data.submission.grade)).toBe(36);
    expect(res.body.data.submission.feedback).toBe("Clear and correct.");
  });

  test("grading moves the counts on every surface at once", async () => {
    const roster = await request(app)
      .get(`/api/assignments/${assignmentId}/submissions`)
      .set(authHeader(instructorToken));

    expect(roster.body.data.counts.graded).toBe(1);
    expect(roster.body.data.counts.ungraded).toBe(0);

    const list = await request(app)
      .get(`/api/assignments/course/${WEB202}`)
      .set(authHeader(instructorToken));

    const listed = list.body.data.assignments.find((a) => a.id === assignmentId);

    expect(listed.counts.graded).toBe(1);
    expect(listed.counts.ungraded).toBe(0);
  });

  test("resubmitting clears the grade until it is reviewed again", async () => {
    const resubmit = await request(app)
      .post(`/api/assignments/${assignmentId}/submit`)
      .set(authHeader(studentToken))
      .field("submission_text", "A revised answer.");

    expect(resubmit.status).toBe(200);

    const res = await request(app)
      .get(`/api/assignments/${assignmentId}/my-submission`)
      .set(authHeader(studentToken));

    expect(res.body.data.submission.grade).toBeNull();
    expect(res.body.data.submission.feedback).toBeNull();
  });
});
