const { app, request, getToken, authHeader } = require("./helpers");

describe("Schedules: response envelope", () => {
  let adminToken;
  let courseId;
  let createdId;

  beforeAll(async () => {
    adminToken = await getToken("admin");
    const coursesRes = await request(app).get("/api/courses").set(authHeader(adminToken));
    courseId = coursesRes.body.data.courses[0].id;
  });

  afterAll(async () => {
    if (createdId) {
      await request(app).delete(`/api/schedules/${createdId}`).set(authHeader(adminToken));
    }
  });

  test("GET list is wrapped in {success, message, data: {schedules}}", async () => {
    const res = await request(app).get("/api/schedules").set(authHeader(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.schedules)).toBe(true);
  });

  test("POST create returns {success, message, data: {schedule}}", async () => {
    // The DB's uniqueness constraint is on (course_id, day_of_week,
    // start_time, end_time, start_date) — vary start_date per run so this
    // test can't collide with a leftover row from a previous run.
    const startDate = new Date(2027, 0, 1 + (Date.now() % 300)).toISOString().slice(0, 10);

    const res = await request(app)
      .post("/api/schedules")
      .set(authHeader(adminToken))
      .send({
        course_id: courseId,
        day_of_week: 3,
        start_time: "09:00",
        end_time: "10:00",
        location: "Contract Test Room",
        start_date: startDate,
        end_date: "2027-12-01",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.schedule).toMatchObject({ location: "Contract Test Room" });

    createdId = res.body.data.schedule.id;
  });

  // Regression guard: DELETE used to run the same validateSchedule
  // middleware as POST/PUT, which requires a full create-shaped body.
  // Since deletes never send a body, this silently 400'd every time —
  // the admin "Delete" button on the Schedules page never actually worked.
  test("DELETE succeeds without a request body", async () => {
    const res = await request(app)
      .delete(`/api/schedules/${createdId}`)
      .set(authHeader(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    createdId = null; // already deleted, skip afterAll cleanup
  });
});
