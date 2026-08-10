const { app, request, SEEDED_ACCOUNTS, authHeader } = require("./helpers");

// Deliberately logs in fresh instead of using the shared getToken() cache
// from helpers.js — these tests revoke tokens and change passwords, and a
// stale cached token would break every later test in this file (or, worse,
// leak into other test files if the cache were ever shared).
async function freshLogin(role) {
  const { email, password } = SEEDED_ACCOUNTS[role];
  const res = await request(app).post("/api/auth/login").send({ email, password });
  if (res.status !== 200) {
    throw new Error(`freshLogin(${role}) failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.data.token;
}

describe("Auth: session revocation", () => {
  test("logout immediately invalidates the token instead of waiting for it to expire", async () => {
    const token = await freshLogin("student");

    const before = await request(app).get("/api/auth/me").set(authHeader(token));
    expect(before.status).toBe(200);

    const logoutRes = await request(app).post("/api/auth/logout").set(authHeader(token));
    expect(logoutRes.status).toBe(200);

    const after = await request(app).get("/api/auth/me").set(authHeader(token));
    expect(after.status).toBe(401);
  });

  test("changing password revokes the old token but hands back a working new one", async () => {
    const token = await freshLogin("admin");
    const tempPassword = "TempPass456!";

    const changeRes = await request(app)
      .patch("/api/auth/password")
      .set(authHeader(token))
      .send({ currentPassword: SEEDED_ACCOUNTS.admin.password, newPassword: tempPassword });

    expect(changeRes.status).toBe(200);
    const newToken = changeRes.body.data.token;
    expect(newToken).toEqual(expect.any(String));
    expect(newToken).not.toBe(token);

    const oldTokenCheck = await request(app).get("/api/auth/me").set(authHeader(token));
    expect(oldTokenCheck.status).toBe(401);

    const newTokenCheck = await request(app).get("/api/auth/me").set(authHeader(newToken));
    expect(newTokenCheck.status).toBe(200);

    // Revert immediately so other test files' getToken("admin") cache
    // (a fresh login against the documented seed password) still works.
    const revertRes = await request(app)
      .patch("/api/auth/password")
      .set(authHeader(newToken))
      .send({ currentPassword: tempPassword, newPassword: SEEDED_ACCOUNTS.admin.password });
    expect(revertRes.status).toBe(200);
  });
});

describe("Auth: forgot / reset password", () => {
  test("the response is identical for a known and an unknown email (no account enumeration)", async () => {
    const known = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: SEEDED_ACCOUNTS.student.email });
    const unknown = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "nobody-in-particular@learnhub.local" });

    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(known.body.message).toBe(unknown.body.message);
    expect(unknown.body.data.devResetToken).toBeNull();
    expect(known.body.data.devResetToken).toEqual(expect.any(String));
  });

  test("resetting with a wrong token is rejected", async () => {
    const res = await request(app).post("/api/auth/reset-password").send({
      email: SEEDED_ACCOUNTS.student.email,
      token: "this-is-not-the-real-token",
      newPassword: "WhateverPass123!",
    });

    expect(res.status).toBe(400);
  });

  test("the correct token resets the password, logs in with it, and can't be reused", async () => {
    const newPassword = "FreshPass789!";

    const forgotRes = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: SEEDED_ACCOUNTS.student.email });
    const resetToken = forgotRes.body.data.devResetToken;
    expect(resetToken).toEqual(expect.any(String));

    const resetRes = await request(app).post("/api/auth/reset-password").send({
      email: SEEDED_ACCOUNTS.student.email,
      token: resetToken,
      newPassword,
    });
    expect(resetRes.status).toBe(200);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: SEEDED_ACCOUNTS.student.email, password: newPassword });
    expect(loginRes.status).toBe(200);

    const reuseRes = await request(app).post("/api/auth/reset-password").send({
      email: SEEDED_ACCOUNTS.student.email,
      token: resetToken,
      newPassword: "AnotherPass000!",
    });
    expect(reuseRes.status).toBe(400);

    // Revert back to the documented seed password for other test files.
    const revertForgot = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: SEEDED_ACCOUNTS.student.email });
    const revertRes = await request(app).post("/api/auth/reset-password").send({
      email: SEEDED_ACCOUNTS.student.email,
      token: revertForgot.body.data.devResetToken,
      newPassword: SEEDED_ACCOUNTS.student.password,
    });
    expect(revertRes.status).toBe(200);
  });
});
