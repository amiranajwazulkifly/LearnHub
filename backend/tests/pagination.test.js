const { app, request, getToken, authHeader } = require("./helpers");

// Covers the five admin list endpoints that got LIMIT/OFFSET pagination
// added (see src/utils/pagination.js) — asserts the shared
// {page, limit, total, totalPages} shape and that `limit` is actually
// respected, rather than the whole table being returned regardless.
describe("Pagination", () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await getToken("admin");
  });

  const endpoints = [
    { name: "courses", path: "/api/courses", key: "courses" },
    { name: "students", path: "/api/students", key: "students" },
    { name: "admin enrollments", path: "/api/admin/enrollments", key: "enrollments" },
    { name: "announcements", path: "/api/announcements", key: "announcements" },
    { name: "instructors", path: "/api/instructors", key: "instructors" },
  ];

  test.each(endpoints)("$name responds with a well-formed pagination block", async ({ path, key }) => {
    const res = await request(app).get(path).set(authHeader(adminToken)).query({ page: 1, limit: 1 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data[key])).toBe(true);
    expect(res.body.data[key].length).toBeLessThanOrEqual(1);

    const { pagination } = res.body.data;
    expect(pagination).toMatchObject({
      page: 1,
      limit: 1,
      total: expect.any(Number),
      totalPages: expect.any(Number),
    });
    expect(pagination.totalPages).toBe(Math.max(1, Math.ceil(pagination.total / pagination.limit)));
  });

  test("limit is capped at 50 even if a larger value is requested", async () => {
    const res = await request(app)
      .get("/api/courses")
      .set(authHeader(adminToken))
      .query({ page: 1, limit: 999 });

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.limit).toBe(50);
  });

  test("an out-of-range page returns an empty list, not an error", async () => {
    const res = await request(app)
      .get("/api/courses")
      .set(authHeader(adminToken))
      .query({ page: 9999, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.data.courses).toEqual([]);
    expect(res.body.data.pagination.page).toBe(9999);
  });

  test("courses search + pagination combine without losing the filter", async () => {
    const res = await request(app)
      .get("/api/courses")
      .set(authHeader(adminToken))
      .query({ search: "web", page: 1, limit: 1 });

    expect(res.status).toBe(200);
    res.body.data.courses.forEach((course) => {
      const haystack = `${course.title} ${course.code}`.toLowerCase();
      expect(haystack).toContain("web");
    });
  });
});
