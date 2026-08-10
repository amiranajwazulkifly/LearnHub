const { app, request, getToken, authHeader } = require("./helpers");

// Seeded course IDs (see backend/supabase/seed.sql):
// WEB101 & API201 are taught by the seeded instructor (Sarah Ahmad, has a
// login); BUS110 is taught by Daniel Lee (no seeded login — used below to
// prove cross-instructor ownership checks without needing his token).
// The seeded student is enrolled in WEB101 only.
const OWNED_COURSE_ID = "30000000-0000-0000-0000-000000000001"; // WEB101
const NOT_OWNED_COURSE_ID = "30000000-0000-0000-0000-000000000003"; // BUS110
const NOT_ENROLLED_COURSE_ID = "30000000-0000-0000-0000-000000000002"; // API201

describe("Assignments", () => {
  let instructorToken;
  let studentToken;
  let adminToken;
  let assignmentId;

  beforeAll(async () => {
    instructorToken = await getToken("instructor");
    studentToken = await getToken("student");
    adminToken = await getToken("admin");
  });

  afterAll(async () => {
    if (assignmentId) {
      await request(app)
        .delete(`/api/assignments/${assignmentId}`)
        .set(authHeader(instructorToken));
    }
  });

  test("anonymous requests are rejected", async () => {
    const res = await request(app).get(`/api/assignments/course/${OWNED_COURSE_ID}`);
    expect(res.status).toBe(401);
  });

  test("instructor cannot create an assignment on a course they don't teach", async () => {
    const res = await request(app)
      .post("/api/assignments")
      .set(authHeader(instructorToken))
      .field("course_id", NOT_OWNED_COURSE_ID)
      .field("title", "Should be rejected");

    expect(res.status).toBe(403);
  });

  test("student cannot create an assignment at all", async () => {
    const res = await request(app)
      .post("/api/assignments")
      .set(authHeader(studentToken))
      .field("course_id", OWNED_COURSE_ID)
      .field("title", "Should be rejected");

    expect(res.status).toBe(403);
  });

  test("instructor creates an assignment on their own course", async () => {
    const res = await request(app)
      .post("/api/assignments")
      .set(authHeader(instructorToken))
      .field("course_id", OWNED_COURSE_ID)
      .field("title", "Contract Test Assignment")
      .field("description", "Do the thing.")
      .field("points", "50")
      .field("due_at", "2027-01-01T00:00:00.000Z");

    expect(res.status).toBe(201);
    expect(res.body.data.assignment).toMatchObject({
      title: "Contract Test Assignment",
      points: 50,
      courseId: OWNED_COURSE_ID,
    });

    assignmentId = res.body.data.assignment.id;
  });

  test("student not enrolled in the course cannot see its assignments", async () => {
    const res = await request(app)
      .get(`/api/assignments/course/${NOT_ENROLLED_COURSE_ID}`)
      .set(authHeader(studentToken));

    expect(res.status).toBe(403);
  });

  test("enrolled student sees the assignment with mySubmission: null", async () => {
    const res = await request(app)
      .get(`/api/assignments/course/${OWNED_COURSE_ID}`)
      .set(authHeader(studentToken));

    expect(res.status).toBe(200);
    const found = res.body.data.assignments.find((a) => a.id === assignmentId);
    expect(found).toBeDefined();
    expect(found.mySubmission).toBeNull();
  });

  test("assignment shows up on the student's cross-course /mine dashboard", async () => {
    const res = await request(app).get("/api/assignments/mine").set(authHeader(studentToken));

    expect(res.status).toBe(200);
    expect(res.body.data.assignments.some((a) => a.id === assignmentId)).toBe(true);
  });

  test("admin can read assignments without an ownership/enrollment check", async () => {
    const res = await request(app)
      .get(`/api/assignments/${assignmentId}`)
      .set(authHeader(adminToken));

    expect(res.status).toBe(200);
  });

  describe("Submission + grading flow", () => {
    let submissionId;

    test("student cannot submit empty (no text, link, or file)", async () => {
      const res = await request(app)
        .post(`/api/assignments/${assignmentId}/submit`)
        .set(authHeader(studentToken))
        .send({});

      expect(res.status).toBe(400);
    });

    test("student submits text + a link", async () => {
      const res = await request(app)
        .post(`/api/assignments/${assignmentId}/submit`)
        .set(authHeader(studentToken))
        .field("submission_text", "Here is my work.")
        .field("submission_link", "https://example.com/my-repo");

      expect(res.status).toBe(200);
      expect(res.body.data.submission).toMatchObject({
        submissionText: "Here is my work.",
        submissionLink: "https://example.com/my-repo",
        grade: null,
      });

      submissionId = res.body.data.submission.id;
    });

    test("instructor sees the submission in the roster (with non-submitters listed too)", async () => {
      const res = await request(app)
        .get(`/api/assignments/${assignmentId}/submissions`)
        .set(authHeader(instructorToken));

      expect(res.status).toBe(200);
      expect(res.body.data.points).toBe(50);
      const mine = res.body.data.submissions.find((s) => s.submission?.id === submissionId);
      expect(mine).toBeDefined();
      expect(mine.submission.grade).toBeNull();
    });

    test("grading above the assignment's max points is rejected", async () => {
      const res = await request(app)
        .patch(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`)
        .set(authHeader(instructorToken))
        .send({ grade: 999 });

      expect(res.status).toBe(400);
    });

    test("instructor grades the submission", async () => {
      const res = await request(app)
        .patch(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`)
        .set(authHeader(instructorToken))
        .send({ grade: 45, feedback: "Solid work." });

      expect(res.status).toBe(200);
      expect(Number(res.body.data.submission.grade)).toBe(45);
      expect(res.body.data.submission.feedback).toBe("Solid work.");
      expect(res.body.data.submission.gradedAt).toEqual(expect.any(String));
    });

    test("student sees the grade via my-submission", async () => {
      const res = await request(app)
        .get(`/api/assignments/${assignmentId}/my-submission`)
        .set(authHeader(studentToken));

      expect(res.status).toBe(200);
      expect(Number(res.body.data.submission.grade)).toBe(45);
    });

    test("resubmitting clears the previous grade", async () => {
      const res = await request(app)
        .post(`/api/assignments/${assignmentId}/submit`)
        .set(authHeader(studentToken))
        .field("submission_text", "Updated work.");

      expect(res.status).toBe(200);
      expect(res.body.data.submission.grade).toBeNull();
      expect(res.body.data.submission.gradedAt).toBeNull();
    });
  });
});
