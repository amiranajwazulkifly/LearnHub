const { app, request, getToken, authHeader, SEEDED_IDS } = require("./helpers");

describe("Courses: response envelope", () => {
  let adminToken;
  let createdId;

  beforeAll(async () => {
    adminToken = await getToken("admin");
  });

  afterAll(async () => {
    if (createdId) {
      await request(app).delete(`/api/courses/${createdId}`).set(authHeader(adminToken));
    }
  });

  test("GET list is wrapped in {success, message, data: {courses, pagination}}", async () => {
    const res = await request(app).get("/api/courses").set(authHeader(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.courses)).toBe(true);
    expect(res.body.data.pagination.total).toBe(res.body.data.courses.length);
  });

  test("POST create (with category + instructor) returns {success, message, data: {course}}", async () => {
    const res = await request(app)
      .post("/api/courses")
      .set(authHeader(adminToken))
      .send({
        code: `CT${Date.now().toString().slice(-6)}`,
        title: "Contract Test Course",
        description: "created by the test suite",
        category_id: SEEDED_IDS.categoryId,
        instructor_id: SEEDED_IDS.instructorId,
        capacity: 20,
        status: "draft",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.course).toMatchObject({ title: "Contract Test Course" });
    createdId = res.body.data.course.id;
  });

  // Regression guard: courseController.js used to have two `getCourseById`
  // definitions — the second silently shadowed the first, and the shadowed
  // (dead) one used an inner JOIN that would 404 for any course missing a
  // category or instructor. Only one definition should exist, and it must
  // use LEFT JOIN so courses without both associations are still fetchable.
  test("GET by id works even when category_id/instructor_id are both null", async () => {
    const createRes = await request(app)
      .post("/api/courses")
      .set(authHeader(adminToken))
      .send({
        code: `CT${(Date.now() + 1).toString().slice(-6)}`,
        title: "Contract Test Course (no associations)",
        description: "created by the test suite",
        capacity: 20,
        status: "draft",
      });
    expect(createRes.status).toBe(201);
    const unassociatedId = createRes.body.data.course.id;

    const getRes = await request(app)
      .get(`/api/courses/${unassociatedId}`)
      .set(authHeader(adminToken));

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.course.id).toBe(unassociatedId);

    await request(app).delete(`/api/courses/${unassociatedId}`).set(authHeader(adminToken));
  });

  test("GET by id for a real id returns {success, message, data: {course}}", async () => {
    const res = await request(app).get(`/api/courses/${createdId}`).set(authHeader(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data.course.id).toBe(createdId);
  });

  test("GET by a nonexistent id returns 404", async () => {
    const res = await request(app)
      .get("/api/courses/00000000-0000-0000-0000-000000000000")
      .set(authHeader(adminToken));

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("POST create with a duplicate course code returns 409", async () => {
    const res = await request(app)
      .post("/api/courses")
      .set(authHeader(adminToken))
      .send({
        code: `CT${Date.now().toString().slice(-6)}`, // reuse won't collide unless run in same ms; verified below instead
        title: "Duplicate code check",
        capacity: 20,
        status: "draft",
      });
    // First insert of this generated code should succeed...
    expect(res.status).toBe(201);
    const dupId = res.body.data.course.id;

    // ...and inserting the exact same code again should 409.
    const dupRes = await request(app)
      .post("/api/courses")
      .set(authHeader(adminToken))
      .send({ code: res.body.data.course.code, title: "Duplicate code check 2", capacity: 20 });

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.success).toBe(false);

    await request(app).delete(`/api/courses/${dupId}`).set(authHeader(adminToken));
  });
});
