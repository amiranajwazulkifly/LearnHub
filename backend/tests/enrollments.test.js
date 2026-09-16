const { app, request, getToken, authHeader } = require("./helpers");
const ApiError = require("../src/utils/apiError");
const errorMiddleware = require("../src/middleware/errorMiddleware");

// None of these tests create an enrollment, so the demo data is untouched.
const SWE301 = "30000000-0000-0000-0000-000000000006"; // published, at capacity
const WEB101 = "30000000-0000-0000-0000-000000000008"; // archived

describe("Enrollment API", () => {
  let studentToken;
  let adminToken;

  beforeAll(async () => {
    studentToken = await getToken("student");
    adminToken = await getToken("admin");
  });

  test("a missing courseId is a 400 with the standard error shape", async () => {
    const res = await request(app).post("/api/enrollments").set(authHeader(studentToken)).send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: "courseId is required" });
  });

  test("a full course is a 409", async () => {
    const res = await request(app)
      .post("/api/enrollments")
      .set(authHeader(studentToken))
      .send({ courseId: SWE301 });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("This course is already full");
  });

  test("an archived course is not open for enrollment", async () => {
    const res = await request(app)
      .post("/api/enrollments")
      .set(authHeader(studentToken))
      .send({ courseId: WEB101 });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("This course is not available for enrollment");
  });

  test("an unknown course is a 404", async () => {
    const res = await request(app)
      .post("/api/enrollments")
      .set(authHeader(studentToken))
      .send({ courseId: "30000000-0000-0000-0000-0000000000ff" });

    expect(res.status).toBe(404);
  });

  test("cancelling an enrollment that isn't yours or doesn't exist is a 404", async () => {
    const res = await request(app)
      .delete("/api/enrollments/70000000-0000-0000-0000-0000000000ff")
      .set(authHeader(studentToken));

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "Active enrollment not found" });
  });

  test("my-courses and timetable keep their { success, count, data } shape", async () => {
    for (const path of ["/api/enrollments/my-courses", "/api/enrollments/timetable"]) {
      const res = await request(app).get(path).set(authHeader(studentToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBe(res.body.data.length);
    }
  });

  test("the endpoints are for students only", async () => {
    const res = await request(app)
      .post("/api/enrollments")
      .set(authHeader(adminToken))
      .send({ courseId: SWE301 });

    expect(res.status).toBe(403);
  });
});

describe("errorMiddleware extra fields", () => {
  function run(error) {
    const res = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
    };

    const originalError = console.error;
    console.error = () => {};
    try {
      errorMiddleware(error, {}, res, () => {});
    } finally {
      console.error = originalError;
    }

    return res;
  }

  test("merges extra fields into a client error response", () => {
    const res = run(
      new ApiError(409, "This course conflicts with your current timetable", null, {
        conflict: { existing_course_code: "WEB202" },
      })
    );

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      success: false,
      message: "This course conflicts with your current timetable",
      conflict: { existing_course_code: "WEB202" },
    });
  });

  test("never merges extra fields into a 500", () => {
    const res = run(new ApiError(500, "boom", null, { secret: "internal" }));

    expect(res.body.secret).toBeUndefined();
    expect(res.body.message).toBe("Internal server error");
  });
});
