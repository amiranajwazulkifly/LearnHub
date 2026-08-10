const { app, request, getToken, authHeader } = require("./helpers");

describe("Instructors: response envelope", () => {
  let adminToken;
  let createdId;

  beforeAll(async () => {
    adminToken = await getToken("admin");
  });

  afterAll(async () => {
    if (createdId) {
      await request(app).delete(`/api/instructors/${createdId}`).set(authHeader(adminToken));
    }
  });

  test("GET list is wrapped in {success, message, data: {instructors}}", async () => {
    const res = await request(app).get("/api/instructors").set(authHeader(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.instructors)).toBe(true);
    expect(res.body.data.instructors[0]).toHaveProperty("full_name");
    // has_login was added for the instructor-portal feature — guard the
    // shape stays intact through this refactor.
    expect(res.body.data.instructors[0]).toHaveProperty("has_login");
  });

  test("POST create returns {success, message, data: {instructor}}", async () => {
    const res = await request(app)
      .post("/api/instructors")
      .set(authHeader(adminToken))
      .send({
        full_name: "Contract Test Instructor",
        email: `contract-test-${Date.now()}@learnhub.local`,
        phone: "0100000000",
        expertise: "Testing",
        biography: "created by the test suite",
        is_active: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.instructor).toMatchObject({ full_name: "Contract Test Instructor" });

    createdId = res.body.data.instructor.id;
  });

  test("DELETE returns {success, message, data: {instructor}}", async () => {
    const res = await request(app)
      .delete(`/api/instructors/${createdId}`)
      .set(authHeader(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data.instructor.id).toBe(createdId);
    createdId = null; // already deleted, skip afterAll cleanup
  });
});
