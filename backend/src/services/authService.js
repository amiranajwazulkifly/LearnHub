const crypto = require('crypto');

const { pool } = require('../config/db');
const ApiError = require('../utils/apiError');
const env = require('../config/env');

const {
  hashPassword,
  comparePassword,
} = require('../utils/password');

const generateToken = require('../utils/generateToken');

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function formatUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

// Student-only fields, merged onto the user object when role === 'student'.
// A student_profiles row always exists (created by the DB trigger on
// account creation), so this is a straight lookup, never an insert.
//
// studentNumber, programme and semester are institution-managed academic
// details: exposed so the student can see them, but not editable through
// the profile endpoint.
async function getStudentProfileFields(userId) {
  const result = await pool.query(
    `SELECT student_number, phone, programme, semester, address, gender, nationality
     FROM public.student_profiles WHERE user_id = $1`,
    [userId]
  );
  const row = result.rows[0];
  if (!row) return {};
  return {
    studentNumber: row.student_number,
    phone: row.phone,
    programme: row.programme,
    semester: row.semester,
    address: row.address,
    gender: row.gender,
    nationality: row.nationality,
  };
}

// Instructor fields come from the instructors directory row linked to this
// login, plus live teaching load. An instructor account with no linked
// directory row simply gets no extra fields.
async function getInstructorProfileFields(userId) {
  const result = await pool.query(
    `SELECT
       i.expertise, i.biography, i.is_active, i.phone,
       COUNT(DISTINCT c.id) AS course_count,
       COUNT(DISTINCT e.student_id) FILTER (WHERE e.status = 'enrolled') AS student_count
     FROM public.instructors i
     LEFT JOIN public.courses c ON c.instructor_id = i.id
     LEFT JOIN public.enrollments e ON e.course_id = c.id
     WHERE i.user_id = $1
     GROUP BY i.id`,
    [userId]
  );
  const row = result.rows[0];
  if (!row) return {};
  return {
    expertise: row.expertise,
    biography: row.biography,
    isActiveInstructor: row.is_active,
    phone: row.phone,
    courseCount: Number(row.course_count),
    studentCount: Number(row.student_count),
  };
}

async function withProfileFields(user) {
  if (user.role === 'student') {
    return { ...formatUser(user), ...(await getStudentProfileFields(user.id)) };
  }

  if (user.role === 'instructor') {
    return { ...formatUser(user), ...(await getInstructorProfileFields(user.id)) };
  }

  return formatUser(user);
}

async function findUserByEmail(email) {
  const result = await pool.query(
    `
      SELECT
        id, full_name, email, password_hash, role, status, created_at, updated_at
      FROM public.users
      WHERE lower(email) = lower($1)
      LIMIT 1
    `,
    [email]
  );
  return result.rows[0] || null;
}

async function getAuthContext(userId) {
  const result = await pool.query(
    `
      SELECT
        id, full_name, email, role, status, created_at, updated_at, token_valid_after
      FROM public.users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  const row = result.rows[0];
  if (!row) return null;

  // Only the core account fields: this runs on every authenticated request,
  // and the middleware needs id, role and status, nothing more. Profile
  // enrichment (which for an instructor is an aggregate over their courses)
  // happens once, in getCurrentUserProfile, where it's actually returned.
  return {
    user: formatUser(row),
    tokenValidAfter: row.token_valid_after,
  };
}

async function getCurrentUserProfile(user) {
  return withProfileFields({
    id: user.id,
    full_name: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  });
}

async function revokeUserSessions(userId) {
  await pool.query(
    `UPDATE public.users SET token_valid_after = NOW() WHERE id = $1`,
    [userId]
  );
}

async function registerStudent({ fullName, email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const passwordHash = await hashPassword(password);

  try {
    const result = await pool.query(
      `
        INSERT INTO public.users (full_name, email, password_hash, role, status)
        VALUES ($1, $2, $3, 'student', 'active')
        RETURNING id, full_name, email, role, status, created_at, updated_at
      `,
      [fullName.trim(), normalizedEmail, passwordHash]
    );

    const user = result.rows[0];
    return { user: await withProfileFields(user), token: generateToken(user) };
  } catch (error) {
    if (error.code === '23505') {
      throw new ApiError(409, 'An account with this email already exists');
    }
    throw error;
  }
}

async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const user = await findUserByEmail(normalizedEmail);

  if (!user) throw new ApiError(401, 'Invalid email or password');

  const passwordMatches = await comparePassword(password, user.password_hash);
  if (!passwordMatches) throw new ApiError(401, 'Invalid email or password');
  if (user.status !== 'active') throw new ApiError(403, 'Your account is not currently active');

  return { user: await withProfileFields(user), token: generateToken(user) };
}

async function updateCurrentUser(userId, { fullName, email, address, gender, nationality }) {
  const currentResult = await pool.query(
    `SELECT id, full_name, email, role FROM public.users WHERE id = $1 LIMIT 1`,
    [userId]
  );

  const currentUser = currentResult.rows[0];
  if (!currentUser) throw new ApiError(404, 'User account not found');

  const updatedFullName = fullName === undefined ? currentUser.full_name : fullName.trim();
  const updatedEmail = email === undefined ? currentUser.email : normalizeEmail(email);

  const duplicateResult = await pool.query(
    `SELECT id FROM public.users WHERE lower(email) = lower($1) AND id <> $2 LIMIT 1`,
    [updatedEmail, userId]
  );
  if (duplicateResult.rows[0]) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  let updatedUser;
  try {
    const result = await pool.query(
      `
        UPDATE public.users
        SET full_name = $1, email = $2
        WHERE id = $3
        RETURNING id, full_name, email, role, status, created_at, updated_at
      `,
      [updatedFullName, updatedEmail, userId]
    );
    updatedUser = result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new ApiError(409, 'An account with this email already exists');
    }
    throw error;
  }

  // Student-only fields — only touch student_profiles for student accounts,
  // and only overwrite a field if the caller actually sent it.
  if (currentUser.role === 'student' && (address !== undefined || gender !== undefined || nationality !== undefined)) {
    await pool.query(
      `
        UPDATE public.student_profiles
        SET
          address = COALESCE($1, address),
          gender = COALESCE($2, gender),
          nationality = COALESCE($3, nationality)
        WHERE user_id = $4
      `,
      [address ?? null, gender ?? null, nationality ?? null, userId]
    );
  }

  return withProfileFields(updatedUser);
}

async function changeCurrentUserPassword(userId, { currentPassword, newPassword }) {
  const result = await pool.query(
    `SELECT id, password_hash FROM public.users WHERE id = $1 LIMIT 1`,
    [userId]
  );

  const user = result.rows[0];
  if (!user) throw new ApiError(404, 'User account not found');

  const passwordMatches = await comparePassword(currentPassword, user.password_hash);
  if (!passwordMatches) throw new ApiError(401, 'Current password is incorrect');

  const sameAsCurrent = await comparePassword(newPassword, user.password_hash);
  if (sameAsCurrent) {
    throw new ApiError(400, 'New password must be different from the current password');
  }

  const newPasswordHash = await hashPassword(newPassword);

  const updateResult = await pool.query(
    `
      UPDATE public.users
      SET password_hash = $1, token_valid_after = NOW()
      WHERE id = $2
      RETURNING id, full_name, email, role, status, created_at, updated_at, token_valid_after
    `,
    [newPasswordHash, userId]
  );

  const updatedUser = updateResult.rows[0];
  const issuedAtMs = new Date(updatedUser.token_valid_after).getTime() + 1;

  return { token: generateToken(updatedUser, { issuedAtMs }) };
}

async function requestPasswordReset(email) {
  const normalizedEmail = normalizeEmail(email);
  const user = await findUserByEmail(normalizedEmail);

  if (!user) return { devResetToken: null };

  const rawToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await pool.query(
    `UPDATE public.users SET reset_token_hash = $1, reset_token_expires_at = $2 WHERE id = $3`,
    [hashResetToken(rawToken), expiresAt, user.id]
  );

  const resetLink = `${env.clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;
  console.log(`[password reset] ${normalizedEmail} -> ${resetLink}`);

  return { devResetToken: env.nodeEnv === 'production' ? null : rawToken };
}

async function resetPassword({ email, token, newPassword }) {
  const normalizedEmail = normalizeEmail(email);

  const result = await pool.query(
    `
      SELECT id, reset_token_expires_at
      FROM public.users
      WHERE lower(email) = lower($1) AND reset_token_hash = $2
      LIMIT 1
    `,
    [normalizedEmail, hashResetToken(token)]
  );

  const user = result.rows[0];
  if (!user || !user.reset_token_expires_at || new Date(user.reset_token_expires_at) < new Date()) {
    throw new ApiError(400, 'This reset link is invalid or has expired');
  }

  const newPasswordHash = await hashPassword(newPassword);

  await pool.query(
    `
      UPDATE public.users
      SET password_hash = $1, token_valid_after = NOW(), reset_token_hash = NULL, reset_token_expires_at = NULL
      WHERE id = $2
    `,
    [newPasswordHash, user.id]
  );
}

module.exports = {
  getCurrentUserProfile,
  registerStudent,
  loginUser,
  getAuthContext,
  revokeUserSessions,
  updateCurrentUser,
  changeCurrentUserPassword,
  requestPasswordReset,
  resetPassword,
};