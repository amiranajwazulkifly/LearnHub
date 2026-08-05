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

  const existingUser =
    await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new ApiError(
      409,
      'An account with this email already exists'
    );
  }

  const passwordHash =
    await hashPassword(password);

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

  const user =
    await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new ApiError(
      401,
      'Invalid email or password'
    );
  }

  const passwordMatches =
    await comparePassword(
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

async function updateCurrentUser(
  userId,
  {
    fullName,
    email,
  }
) {
  const currentResult = await pool.query(
    `
      SELECT
        id,
        full_name,
        email
      FROM public.users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  const currentUser = currentResult.rows[0];

  if (!currentUser) {
    throw new ApiError(
      404,
      'User account not found'
    );
  }

  const updatedFullName =
    fullName === undefined
      ? currentUser.full_name
      : fullName.trim();

  const updatedEmail =
    email === undefined
      ? currentUser.email
      : normalizeEmail(email);

  const duplicateResult = await pool.query(
    `
      SELECT id
      FROM public.users
      WHERE lower(email) = lower($1)
        AND id <> $2
      LIMIT 1
    `,
    [updatedEmail, userId]
  );

  if (duplicateResult.rows[0]) {
    throw new ApiError(
      409,
      'An account with this email already exists'
    );
  }

  try {
    const result = await pool.query(
      `
        UPDATE public.users
        SET
          full_name = $1,
          email = $2
        WHERE id = $3
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
        updatedFullName,
        updatedEmail,
        userId,
      ]
    );

    return formatUser(result.rows[0]);
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

async function changeCurrentUserPassword(
  userId,
  {
    currentPassword,
    newPassword,
  }
) {
  const result = await pool.query(
    `
      SELECT
        id,
        password_hash
      FROM public.users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  const user = result.rows[0];

  if (!user) {
    throw new ApiError(
      404,
      'User account not found'
    );
  }

  const passwordMatches =
    await comparePassword(
      currentPassword,
      user.password_hash
    );

  if (!passwordMatches) {
    throw new ApiError(
      401,
      'Current password is incorrect'
    );
  }

  const sameAsCurrent =
    await comparePassword(
      newPassword,
      user.password_hash
    );

  if (sameAsCurrent) {
    throw new ApiError(
      400,
      'New password must be different from the current password'
    );
  }

  const newPasswordHash =
    await hashPassword(newPassword);

  await pool.query(
    `
      UPDATE public.users
      SET password_hash = $1
      WHERE id = $2
    `,
    [
      newPasswordHash,
      userId,
    ]
  );
}

module.exports = {
  registerStudent,
  loginUser,
  findUserById,
  updateCurrentUser,
  changeCurrentUserPassword,
};
