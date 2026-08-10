const { app, request, getToken, authHeader } = require("./helpers");

// Target envelope: {success, message, data: {...}} everywhere, matching
// the pattern already used by studentController/announcementController.
// getAllCategories used to return a bare array with no envelope at all.
describe("Categories: response envelope", () => {
  let adminToken;
  let createdId;

  beforeAll(async () => {
    adminToken = await getToken("admin");
  });

  afterAll(async () => {
    if (createdId) {
      await request(app).delete(`/api/categories/${createdId}`).set(authHeader(adminToken));
    }
  });

  test("GET list is wrapped in {success, message, data: {categories}}", async () => {
    const res = await request(app).get("/api/categories").set(authHeader(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.message).toBe("string");
    expect(Array.isArray(res.body.data.categories)).toBe(true);
    expect(res.body.data.categories.length).toBeGreaterThan(0);
    expect(res.body.data.categories[0]).toHaveProperty("name");
  });

  test("POST create returns {success, message, data: {category}}", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set(authHeader(adminToken))
      .send({ name: "Contract Test Category", description: "created by the test suite" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category).toMatchObject({ name: "Contract Test Category" });

    createdId = res.body.data.category.id;
  });

  test("PUT update returns {success, message, data: {category}}", async () => {
    const res = await request(app)
      .put(`/api/categories/${createdId}`)
      .set(authHeader(adminToken))
      .send({ name: "Contract Test Category (updated)", description: "still here" });

    expect(res.status).toBe(200);
    expect(res.body.data.category.name).toBe("Contract Test Category (updated)");
  });

  test("PUT update on a missing id returns a 404 ApiError shape", async () => {
    const res = await request(app)
      .put("/api/categories/00000000-0000-0000-0000-000000000000")
      .set(authHeader(adminToken))
      .send({ name: "Nonexistent Category", description: "x" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
