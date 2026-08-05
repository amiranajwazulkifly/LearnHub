const {
  registerStudent,
  loginUser,
  updateCurrentUser,
  changeCurrentUserPassword,
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
  await changeCurrentUserPassword(
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
  });
}

function logout(req, res) {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
}

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
};
