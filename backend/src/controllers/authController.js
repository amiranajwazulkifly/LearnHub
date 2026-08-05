const {
  registerStudent,
  loginUser,
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
  logout,
};
