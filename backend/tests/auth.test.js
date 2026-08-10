const { app, request, SEEDED_ACCOUNTS, getToken, authHeader } = require("./helpers");

// This suite doubles as the "does the seed actually work" check discussed
// after the seed-password drift incident: if the committed seed.sql ever
// stops matching the documented TestPass123! password for any of these
// three roles, these tests fail immediately instead of a teammate hitting
// a silent "invalid credentials" wall.
describe("Auth: seeded credentials", () => {
  test.each(Object.entries(SEEDED_ACCOUNTS))(
    "%s account logs in with its documented password",
    async (role, { email, password }) => {
      const res = await request(app).post("/api/auth/login").send({ email, password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toEqual(expect.any(String));
      expect(res.body.data.user.email).toBe(email);
      expect(res.body.data.user.role).toBe(role);
    }
  );

  test("rejects a wrong password with 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: SEEDED_ACCOUNTS.admin.email, password: "definitely-wrong" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("rejects a login for an email that doesn't exist", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@learnhub.local", password: "TestPass123!" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("rejects malformed login payloads with 400, not 500", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "not-an-email" });

    expect(res.status).toBe(400);
  });
});

describe("Auth: /me session check (role coverage regression guard)", () => {
  // This is exactly the bug fixed earlier: /me, /password and /logout were
  // hardcoded to roleMiddleware('admin', 'student'), so an instructor's
  // session would 403 on every page refresh. Assert all three roles here
  // so a future edit can't silently narrow the allowed roles again.
  test.each(["admin", "student", "instructor"])("%s can fetch /auth/me", async (role) => {
    const token = await getToken(role);

    const res = await request(app).get("/api/auth/me").set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe(role);
  });

  test("an unauthenticated request to /me is rejected", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
