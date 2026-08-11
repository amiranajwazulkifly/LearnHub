const {
  registerStudent,
  loginUser,
  updateCurrentUser,
  changeCurrentUserPassword,
  revokeUserSessions,
  requestPasswordReset,
  resetPassword,
} = require('../services/authService');

async function register(req, res) {
  const result = await registerStudent({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
  });

  res.status(201).json({
    success: true,
    message: 'Student account registered successfully',
    data: result,
  });
}

async function login(req, res) {
  const result = await loginUser({
    email: req.body.email,
    password: req.body.password,
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
}

function getCurrentUser(req, res) {
  res.status(200).json({
    success: true,
    message: 'Authenticated user retrieved successfully',
    data: {
      user: req.user,
    },
  });
}

async function updateProfile(req, res) {
  const user = await updateCurrentUser(
    req.user.id,
    {
      fullName: req.body.fullName,
      email: req.body.email,
    }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user,
    },
  });
}

async function changePassword(req, res) {
  // Revokes every token issued before now (e.g. on other devices) and
  // returns a fresh one so the caller's own session keeps working.
  const { token } = await changeCurrentUserPassword(
    req.user.id,
    {
      currentPassword:
        req.body.currentPassword,
      newPassword:
        req.body.newPassword,
    }
  );

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    data: { token },
  });
}

async function logout(req, res) {
  // Immediately invalidates the presented token (and any other
  // outstanding one) instead of letting it stay usable until it
  // naturally expires.
  await revokeUserSessions(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
}

async function forgotPassword(req, res) {
  const { devResetToken } = await requestPasswordReset(req.body.email);

  res.status(200).json({
    success: true,
    message: 'If an account exists for that email, a password reset link has been sent.',
    // Only populated outside production — there's no email provider wired
    // up yet, so this lets the flow be exercised without one. See
    // authService.requestPasswordReset for where the link is logged.
    data: { devResetToken },
  });
}

async function resetPasswordHandler(req, res) {
  await resetPassword({
    email: req.body.email,
    token: req.body.token,
    newPassword: req.body.newPassword,
  });

  res.status(200).json({
    success: true,
    message: 'Password reset successfully. You can now log in with your new password.',
  });
}

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword: resetPasswordHandler,
};
