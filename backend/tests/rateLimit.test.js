const request = require("supertest");

describe("General API rate limiter", () => {
  // Load a fresh copy of the app with a deliberately tiny ceiling, isolated
  // from the module registry the other test files share.
  function loadAppWithLimit(max) {
    let app;
    const previous = process.env.API_RATE_LIMIT_MAX;
    process.env.API_RATE_LIMIT_MAX = String(max);

    jest.isolateModules(() => {
      app = require("../src/app");
    });

    process.env.API_RATE_LIMIT_MAX = previous;
    return app;
  }

  test("is mounted in front of the API routers, and rejects once the ceiling is hit", async () => {
    const app = loadAppWithLimit(2);

    // Anonymous requests are refused by auth before any database work, which
    // keeps this test independent of data. They still count towards the limit.
    const first = await request(app).get("/api/courses");
    const second = await request(app).get("/api/courses");
    const third = await request(app).get("/api/courses");

    expect(first.status).toBe(401);
    expect(second.status).toBe(401);
    // Before this fix the limiter was registered after every router, so no
    // request ever reached it and this came back 401 too.
    expect(third.status).toBe(429);
    expect(third.body.success).toBe(false);
  });

  test("advertises its policy in standard headers", async () => {
    const app = loadAppWithLimit(50);
    const res = await request(app).get("/api/courses");

    expect(res.headers["ratelimit-policy"]).toBeDefined();
  });

  test("does not rate limit the health check", async () => {
    const app = loadAppWithLimit(1);

    await request(app).get("/api/courses");
    const res = await request(app).get("/api/health");

    expect(res.status).not.toBe(429);
  });
});
