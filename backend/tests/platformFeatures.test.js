const { app, request, getToken, authHeader } = require("./helpers");
const { pool } = require("../src/config/db");

// Seed fixtures (backend/supabase/seed.sql).
const WEB202 = "30000000-0000-0000-0000-000000000001"; // published; Sarah teaches; student enrolled
const API303 = "30000000-0000-0000-0000-000000000002"; // published; student NOT enrolled
const CLD400 = "30000000-0000-0000-0000-000000000007"; // draft
const WEB101 = "30000000-0000-0000-0000-000000000008"; // archived; student completed it
const SAMPLE_STUDENT = "00000000-0000-0000-0000-000000000002";
const WELCOME_ANNOUNCEMENT = "50000000-0000-0000-0000-000000000001";

describe("Platform features", () => {
  let adminToken;
  let studentToken;
  let instructorToken;
  let startedAt;
  const createdAssignmentIds = [];

  // Notifications that already existed and were unread before this suite.
  // "Mark all read" touches them too, so they're restored afterwards.
  let preexistingUnreadIds = [];

  beforeAll(async () => {
    adminToken = await getToken("admin");
    studentToken = await getToken("student");
    instructorToken = await getToken("instructor");
    startedAt = new Date();

    const unread = await pool.query(
      "SELECT id FROM public.notifications WHERE read_at IS NULL"
    );
    preexistingUnreadIds = unread.rows.map((row) => row.id);
  });

  afterAll(async () => {
    for (const id of createdAssignmentIds) {
      await request(app).delete(`/api/assignments/${id}`).set(authHeader(instructorToken));
    }

    // Leave the shared demo database as we found it.
    await pool.query("DELETE FROM public.notifications WHERE created_at >= $1", [startedAt]);
    await pool.query("UPDATE public.notifications SET read_at = NULL WHERE id = ANY($1)", [
      preexistingUnreadIds,
    ]);
    await pool.query(
      "DELETE FROM public.announcement_reads WHERE user_id = $1 AND read_at >= $2",
      [SAMPLE_STUDENT, startedAt]
    );
  });

  describe("notifications", () => {
    test("posting an assignment notifies enrolled students", async () => {
      const created = await request(app)
        .post("/api/assignments")
        .set(authHeader(instructorToken))
        .field("course_id", WEB202)
        .field("title", "Notification Test Assignment")
        .field("points", "10");

      expect(created.status).toBe(201);
      const assignmentId = created.body.data.assignment.id;
      createdAssignmentIds.push(assignmentId);

      const res = await request(app).get("/api/notifications").set(authHeader(studentToken));

      expect(res.status).toBe(200);
      const match = res.body.data.notifications.find(
        (n) => n.type === "assignment_posted" && n.link === `/student/tasks/${assignmentId}`
      );
      expect(match).toBeDefined();
      expect(match.readAt).toBeNull();
      expect(res.body.data.unreadCount).toBeGreaterThan(0);
    });

    test("submitting notifies the instructor, and grading notifies the student", async () => {
      const assignmentId = createdAssignmentIds[0];

      const submitted = await request(app)
        .post(`/api/assignments/${assignmentId}/submit`)
        .set(authHeader(studentToken))
        .field("submission_text", "Done.");
      expect(submitted.status).toBe(200);

      const instructorFeed = await request(app)
        .get("/api/notifications")
        .set(authHeader(instructorToken));
      expect(
        instructorFeed.body.data.notifications.some(
          (n) =>
            n.type === "submission_received" &&
            n.link === `/instructor/assignments/${assignmentId}/submissions`
        )
      ).toBe(true);

      const graded = await request(app)
        .patch(
          `/api/assignments/${assignmentId}/submissions/${submitted.body.data.submission.id}/grade`
        )
        .set(authHeader(instructorToken))
        .send({ grade: 9 });
      expect(graded.status).toBe(200);

      const studentFeed = await request(app).get("/api/notifications").set(authHeader(studentToken));
      const gradedNote = studentFeed.body.data.notifications.find(
        (n) => n.type === "submission_graded" && n.link === `/student/tasks/${assignmentId}`
      );
      expect(gradedNote).toBeDefined();
      expect(gradedNote.body).toBe("9 / 10");
    });

    test("a user cannot mark someone else's notification as read", async () => {
      const studentFeed = await request(app).get("/api/notifications").set(authHeader(studentToken));
      const theirs = studentFeed.body.data.notifications[0];

      const res = await request(app)
        .patch(`/api/notifications/${theirs.id}/read`)
        .set(authHeader(instructorToken));

      expect(res.status).toBe(404);
    });

    test("mark one read, then mark all read", async () => {
      const feed = await request(app).get("/api/notifications").set(authHeader(studentToken));
      const target = feed.body.data.notifications.find((n) => n.readAt === null);

      const one = await request(app)
        .patch(`/api/notifications/${target.id}/read`)
        .set(authHeader(studentToken));
      expect(one.status).toBe(200);
      expect(one.body.data.notification.readAt).not.toBeNull();

      const all = await request(app)
        .patch("/api/notifications/read-all")
        .set(authHeader(studentToken));
      expect(all.status).toBe(200);

      const after = await request(app).get("/api/notifications").set(authHeader(studentToken));
      expect(after.body.data.unreadCount).toBe(0);
    });

    test("a malformed id is a 400, not a 500", async () => {
      const res = await request(app)
        .patch("/api/notifications/not-a-uuid/read")
        .set(authHeader(studentToken));

      expect(res.status).toBe(400);
    });

    test("anonymous requests are rejected", async () => {
      const res = await request(app).get("/api/notifications");
      expect(res.status).toBe(401);
    });
  });

  describe("announcement read state", () => {
    test("marking an announcement read flips isRead and lowers the unread count", async () => {
      await pool.query(
        "DELETE FROM public.announcement_reads WHERE user_id = $1 AND announcement_id = $2",
        [SAMPLE_STUDENT, WELCOME_ANNOUNCEMENT]
      );

      const before = await request(app)
        .get("/api/announcements/published")
        .set(authHeader(studentToken));
      const target = before.body.data.announcements.find((a) => a.id === WELCOME_ANNOUNCEMENT);
      expect(target.isRead).toBe(false);

      const marked = await request(app)
        .post(`/api/announcements/${WELCOME_ANNOUNCEMENT}/read`)
        .set(authHeader(studentToken));
      expect(marked.status).toBe(200);

      const after = await request(app)
        .get("/api/announcements/published")
        .set(authHeader(studentToken));
      expect(after.body.data.announcements.find((a) => a.id === WELCOME_ANNOUNCEMENT).isRead).toBe(
        true
      );
      expect(after.body.data.unreadCount).toBe(before.body.data.unreadCount - 1);
    });

    test("marking read is idempotent", async () => {
      const again = await request(app)
        .post(`/api/announcements/${WELCOME_ANNOUNCEMENT}/read`)
        .set(authHeader(studentToken));
      expect(again.status).toBe(200);
    });
  });

  describe("course lifecycle", () => {
    test("the student catalog lists only published courses", async () => {
      const res = await request(app).get("/api/courses?limit=50").set(authHeader(studentToken));

      expect(res.status).toBe(200);
      expect(res.body.data.courses.every((c) => c.status === "published")).toBe(true);
      expect(res.body.data.courses.some((c) => c.id === CLD400)).toBe(false);
    });

    test("a status filter can't be used to reveal drafts to a student", async () => {
      const res = await request(app)
        .get("/api/courses?status=draft")
        .set(authHeader(studentToken));

      expect(res.body.data.courses).toHaveLength(0);
    });

    test("admins still see every status", async () => {
      const res = await request(app).get("/api/courses?limit=50").set(authHeader(adminToken));

      const statuses = new Set(res.body.data.courses.map((c) => c.status));
      expect(statuses.has("draft")).toBe(true);
      expect(statuses.has("archived")).toBe(true);
    });

    test("a student cannot open a draft course by id", async () => {
      const res = await request(app).get(`/api/courses/${CLD400}`).set(authHeader(studentToken));
      expect(res.status).toBe(404);
    });

    test("a student can still open an archived course they completed", async () => {
      const res = await request(app).get(`/api/courses/${WEB101}`).set(authHeader(studentToken));
      expect(res.status).toBe(200);
    });

    test("an archived course cannot be enrolled in", async () => {
      const res = await request(app)
        .post("/api/enrollments")
        .set(authHeader(studentToken))
        .send({ courseId: WEB101 });

      expect(res.status).toBe(400);
    });

    test("catalog entries carry live seat counts", async () => {
      const res = await request(app).get("/api/courses?limit=50").set(authHeader(studentToken));
      const api303 = res.body.data.courses.find((c) => c.id === API303);

      expect(typeof api303.enrolled_count).toBe("number");
    });
  });

  describe("profiles", () => {
    test("a student's profile includes their academic details", async () => {
      const res = await request(app).get("/api/auth/me").set(authHeader(studentToken));

      expect(res.body.data.user.studentNumber).toBe("STU2026001");
      expect(res.body.data.user.programme).toBe("Computer Science");
      expect(res.body.data.user.semester).toBe(5);
    });

    test("an instructor's profile includes expertise and teaching load", async () => {
      const res = await request(app).get("/api/auth/me").set(authHeader(instructorToken));
      const user = res.body.data.user;

      expect(user.expertise).toBeTruthy();
      expect(user.biography).toBeTruthy();
      expect(user.isActiveInstructor).toBe(true);
      expect(user.courseCount).toBeGreaterThan(0);
      expect(typeof user.studentCount).toBe("number");
    });
  });
});
