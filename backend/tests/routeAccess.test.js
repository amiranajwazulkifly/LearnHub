const { app, request, getToken, authHeader } = require("./helpers");

// Formalizes the manual curl audit that found courses/categories/schedules/
// instructors had zero auth middleware. Every resource below must: reject
// anonymous requests, let any authenticated role read, and restrict writes
// to admins only. If a future change accidentally removes a route's auth
// middleware (or narrows/widens it), this fails immediately instead of the
// gap sitting live until someone audits it by hand again.
const RESOURCES = ["courses", "categories", "schedules", "instructors"];

describe.each(RESOURCES)("Route access: /api/%s", (resource) => {
  test("anonymous GET is rejected", async () => {
    const res = await request(app).get(`/api/${resource}`);
    expect(res.status).toBe(401);
  });

  test("anonymous POST is rejected", async () => {
    const res = await request(app).post(`/api/${resource}`).send({});
    expect(res.status).toBe(401);
  });

  test.each(["admin", "student", "instructor"])("%s can GET the list", async (role) => {
    const token = await getToken(role);
    const res = await request(app).get(`/api/${resource}`).set(authHeader(token));
    expect(res.status).toBe(200);
  });

  test.each(["student", "instructor"])("%s cannot POST (admin-only write)", async (role) => {
    const token = await getToken(role);
    const res = await request(app).post(`/api/${resource}`).set(authHeader(token)).send({});
    expect(res.status).toBe(403);
  });
});
