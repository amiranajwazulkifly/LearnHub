const { app, request, getToken, authHeader, cleanupNotificationsSince } = require("./helpers");
const { pool } = require("../src/config/db");
const env = require("../src/config/env");
const supabase = require("../src/config/supabaseStorage");

const WEB202 = "30000000-0000-0000-0000-000000000001";
const PASSWORD = "TestPass123!";

async function login(email) {
  const res = await request(app).post("/api/auth/login").send({ email, password: PASSWORD });
  return res.body.data.token;
}

// Signed URLs are issued for the browser's host. Inside the backend container
// storage is reached by its internal name, so map back before fetching.
function internal(url) {
  return url.replace(env.supabasePublicUrl, env.supabaseUrl);
}

describe("Attachment access", () => {
  const startedAt = new Date();

  let sarah; // instructor of WEB202
  let daniel; // instructor of other courses
  let owner; // Sample Student, enrolled in WEB202
  let classmate; // Nabil Farhan, also enrolled in WEB202
  let outsider; // Hannah Yusof, not enrolled in WEB202

  let assignmentId;
  let submissionId;
  let submissionPath;

  beforeAll(async () => {
    sarah = await getToken("instructor");
    owner = await getToken("student");
    daniel = await login("daniel.lee@learnhub.local");
    classmate = await login("nabil.farhan@learnhub.local");
    outsider = await login("hannah.yusof@learnhub.local");

    const created = await request(app)
      .post("/api/assignments")
      .set(authHeader(sarah))
      .field("course_id", WEB202)
      .field("title", "File Access Test")
      .attach("attachment", Buffer.from("brief contents"), "brief.txt");
    assignmentId = created.body.data.assignment.id;

    const submitted = await request(app)
      .post(`/api/assignments/${assignmentId}/submit`)
      .set(authHeader(owner))
      .attach("attachment", Buffer.from("private student work"), "my-work.txt");
    submissionId = submitted.body.data.submission.id;

    const row = await pool.query(
      "SELECT attachment_path FROM public.assignment_submissions WHERE id = $1",
      [submissionId]
    );
    submissionPath = row.rows[0].attachment_path;
  });

  afterAll(async () => {
    if (submissionPath) {
      await supabase.storage.from("assignment-files").remove([submissionPath]);
    }
    if (assignmentId) {
      // Also removes the instructor's attachment from storage.
      await request(app).delete(`/api/assignments/${assignmentId}`).set(authHeader(sarah));
    }
    await cleanupNotificationsSince(startedAt);
  });

  test("the API never returns a storage URL, only whether a file exists", async () => {
    const assignment = await request(app)
      .get(`/api/assignments/${assignmentId}`)
      .set(authHeader(owner));
    const mine = await request(app)
      .get(`/api/assignments/${assignmentId}/my-submission`)
      .set(authHeader(owner));

    for (const body of [assignment.body.data.assignment, mine.body.data.submission]) {
      expect(body.hasAttachment).toBe(true);
      expect(body.attachmentUrl).toBeUndefined();
      expect(JSON.stringify(body)).not.toMatch(/storage\/v1|object\/public/);
    }
  });

  test("files are stored as paths in a private bucket", async () => {
    expect(submissionPath).toMatch(/^submissions\//);

    const bucket = await pool.query(
      "SELECT public FROM storage.buckets WHERE id = 'assignment-files'"
    );
    expect(bucket.rows[0].public).toBe(false);
  });

  test("the file's public URL does not serve it", async () => {
    const publicUrl = `${env.supabaseUrl}/storage/v1/object/public/assignment-files/${submissionPath}`;
    const res = await fetch(publicUrl);

    expect(res.ok).toBe(false);
  });

  test("the submitting student gets a short-lived link that downloads the file", async () => {
    const res = await request(app)
      .get(`/api/assignments/${assignmentId}/submissions/${submissionId}/attachment`)
      .set(authHeader(owner));

    expect(res.status).toBe(200);
    expect(res.body.data.expiresIn).toBeLessThanOrEqual(60);
    expect(res.body.data.url).toMatch(/\/object\/sign\/.*token=/);

    const file = await fetch(internal(res.body.data.url));
    expect(file.ok).toBe(true);
    expect(await file.text()).toBe("private student work");
  });

  test("the course instructor can download the submission", async () => {
    const res = await request(app)
      .get(`/api/assignments/${assignmentId}/submissions/${submissionId}/attachment`)
      .set(authHeader(sarah));

    expect(res.status).toBe(200);
  });

  test("a classmate in the same course cannot download it", async () => {
    const res = await request(app)
      .get(`/api/assignments/${assignmentId}/submissions/${submissionId}/attachment`)
      .set(authHeader(classmate));

    expect(res.status).toBe(404);
  });

  test("an instructor of a different course cannot download it", async () => {
    const res = await request(app)
      .get(`/api/assignments/${assignmentId}/submissions/${submissionId}/attachment`)
      .set(authHeader(daniel));

    expect(res.status).toBe(404);
  });

  test("an enrolled student can download the assignment brief", async () => {
    const res = await request(app)
      .get(`/api/assignments/${assignmentId}/attachment`)
      .set(authHeader(classmate));

    expect(res.status).toBe(200);
    const file = await fetch(internal(res.body.data.url));
    expect(await file.text()).toBe("brief contents");
  });

  test("a student outside the course cannot download the brief", async () => {
    const res = await request(app)
      .get(`/api/assignments/${assignmentId}/attachment`)
      .set(authHeader(outsider));

    expect(res.status).toBe(403);
  });

  test("a tampered signed link is rejected by storage", async () => {
    const res = await request(app)
      .get(`/api/assignments/${assignmentId}/attachment`)
      .set(authHeader(owner));

    // Corrupt the token's signature specifically. (The URL also carries a
    // download filename after the token, so the last character isn't it.)
    const url = new URL(internal(res.body.data.url));
    const token = url.searchParams.get("token");
    url.searchParams.set("token", `${token.slice(0, -1)}${token.endsWith("x") ? "y" : "x"}`);

    const file = await fetch(url);

    expect(file.ok).toBe(false);
  });
});
