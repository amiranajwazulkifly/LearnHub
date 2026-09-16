const { app, request, getToken, authHeader } = require("./helpers");
const { toCsv, escapeField } = require("../src/utils/csv");

describe("CSV serialization", () => {
  test("leaves plain values alone", () => {
    expect(escapeField("WEB202")).toBe("WEB202");
    expect(escapeField(42)).toBe("42");
  });

  test("renders null and undefined as empty", () => {
    expect(escapeField(null)).toBe("");
    expect(escapeField(undefined)).toBe("");
  });

  test("quotes fields containing a comma, quote or newline", () => {
    expect(escapeField("Ahmad, Sarah")).toBe('"Ahmad, Sarah"');
    expect(escapeField('He said "hi"')).toBe('"He said ""hi"""');
    expect(escapeField("line one\nline two")).toBe('"line one\nline two"');
  });

  test("neutralises leading characters a spreadsheet would treat as a formula", () => {
    // Without this, opening the export in Excel or Sheets would execute the
    // cell rather than display it.
    for (const dangerous of ["=1+1", "+1", "-1", "@SUM(A1)"]) {
      expect(escapeField(dangerous).startsWith("\t")).toBe(true);
    }
  });

  test("writes a header row and CRLF line endings", () => {
    const csv = toCsv(
      [
        ["code", "Code"],
        ["count", "Count"],
      ],
      [{ code: "WEB202", count: 3 }]
    );

    expect(csv).toBe("Code,Count\r\nWEB202,3\r\n");
  });
});

describe("Report exports", () => {
  let adminToken;
  let studentToken;

  const TYPES = [
    "students",
    "courses",
    "enrollments",
    "completion-rates",
    "instructor-allocation",
    "enrollment-trend",
  ];

  beforeAll(async () => {
    adminToken = await getToken("admin");
    studentToken = await getToken("student");
  });

  test.each(TYPES)("%s exports as a CSV attachment", async (type) => {
    const res = await request(app)
      .get(`/api/reports/export/${type}`)
      .set(authHeader(adminToken));

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/csv/);
    expect(res.headers["content-disposition"]).toMatch(/attachment; filename=".*\.csv"/);

    // A BOM, a header row, and at least the header line.
    expect(res.text.startsWith("﻿")).toBe(true);
    expect(res.text.split("\r\n")[0].length).toBeGreaterThan(0);
  });

  test("an unknown export type is a 404, not a crash", async () => {
    const res = await request(app)
      .get("/api/reports/export/not-a-report")
      .set(authHeader(adminToken));

    expect(res.status).toBe(404);
  });

  test("students cannot export", async () => {
    const res = await request(app)
      .get("/api/reports/export/students")
      .set(authHeader(studentToken));

    expect(res.status).toBe(403);
  });

  test("anonymous requests are rejected", async () => {
    const res = await request(app).get("/api/reports/export/students");
    expect(res.status).toBe(401);
  });
});

describe("Enrollment trend", () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await getToken("admin");
  });

  test("returns one point per day in the window, including quiet days", async () => {
    const res = await request(app)
      .get("/api/reports/enrollment-trend?days=14")
      .set(authHeader(adminToken));

    expect(res.status).toBe(200);
    // Zero-filled: a gap in activity must still produce a point, otherwise a
    // line chart silently joins non-adjacent dates.
    expect(res.body.data.trend).toHaveLength(14);
    expect(res.body.data.range.days).toBe(14);
  });

  test("clamps an absurd range instead of trusting the query string", async () => {
    const res = await request(app)
      .get("/api/reports/enrollment-trend?days=99999")
      .set(authHeader(adminToken));

    expect(res.body.data.range.days).toBe(365);
  });
});
