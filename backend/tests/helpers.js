const request = require("supertest");
const app = require("../src/app");

// Seeded local dev accounts (see backend/supabase/seed.sql).
const SEEDED_ACCOUNTS = {
  admin: { email: "admin@learnhub.local", password: "TestPass123!" },
  student: { email: "student@learnhub.local", password: "TestPass123!" },
  instructor: { email: "sarah.ahmad@learnhub.local", password: "TestPass123!" },
};

const SEEDED_IDS = {
  categoryId: "10000000-0000-0000-0000-000000000001",
  instructorId: "20000000-0000-0000-0000-000000000001",
};

const tokenCache = {};

// Logs in as a seeded role and caches the token for the life of the test
// run — this doubles as the "does the seed actually work" check: if the
// documented credentials ever stop working, every test using this helper
// fails immediately instead of the breakage going unnoticed.
async function getToken(role) {
  if (tokenCache[role]) return tokenCache[role];

  const { email, password } = SEEDED_ACCOUNTS[role];
  const res = await request(app).post("/api/auth/login").send({ email, password });

  if (res.status !== 200 || !res.body?.data?.token) {
    throw new Error(
      `Seed login failed for role "${role}" (${email}): expected 200 with a token, got ${res.status} ${JSON.stringify(res.body)}`
    );
  }

  tokenCache[role] = res.body.data.token;
  return tokenCache[role];
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = { app, request, SEEDED_ACCOUNTS, SEEDED_IDS, getToken, authHeader };
