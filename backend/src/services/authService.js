const { pool } = require('../config/db');
const ApiError = require('../utils/apiError');
const {
  hashPassword,
  comparePassword,
} = require('../utils/password');
const generateToken = require('../utils/generateToken');

function normalizeEmail(email) {
  return email.trim().toLowerCase();
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

async function findUserByEmail(email) {
  const result = await pool.query(
    `
      SELECT
        id,
        full_name,
        email,
        password_hash,
        role,
        status,
        created_at,
        updated_at
      FROM public.users
      WHERE lower(email) = lower($1)
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] || null;
}

async function findUserById(userId) {
  const result = await pool.query(
    `
      SELECT
        id,
        full_name,
        email,
        role,
        status,
        created_at,
        updated_at
      FROM public.users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  const user = result.rows[0];

  return user ? formatUser(user) : null;
}

async function registerStudent({
  fullName,
  email,
  password,
}) {
  const normalizedEmail = normalizeEmail(email);

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new ApiError(
      409,
      'An account with this email already exists'
    );
  }

  const passwordHash = await hashPassword(password);

  try {
    const result = await pool.query(
      `
        INSERT INTO public.users (
          full_name,
          email,
          password_hash,
          role,
          status
        )
        VALUES ($1, $2, $3, 'student', 'active')
        RETURNING
          id,
          full_name,
          email,
          role,
          status,
          created_at,
          updated_at
      `,
      [
        fullName.trim(),
        normalizedEmail,
        passwordHash,
      ]
    );

    const user = result.rows[0];

    return {
      user: formatUser(user),
      token: generateToken(user),
    };
  } catch (error) {
    if (error.code === '23505') {
      throw new ApiError(
        409,
        'An account with this email already exists'
      );
    }

    throw error;
  }
}

async function loginUser({
  email,
  password,
}) {
  const normalizedEmail = normalizeEmail(email);

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new ApiError(
      401,
      'Invalid email or password'
    );
  }

  const passwordMatches = await comparePassword(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    throw new ApiError(
      401,
      'Invalid email or password'
    );
  }

  if (user.status !== 'active') {
    throw new ApiError(
      403,
      'Your account is not currently active'
    );
  }

  return {
    user: formatUser(user),
    token: generateToken(user),
  };
}

module.exports = {
  registerStudent,
  loginUser,
  findUserById,
};
