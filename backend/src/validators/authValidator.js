function validateRegister(req) {
  const errors = [];

  const { fullName, email, password } = req.body;

  if (!fullName || !fullName.trim()) {
    errors.push({
      field: "fullName",
      message: "Full name is required",
    });
  }

  if (!email || !email.trim()) {
    errors.push({
      field: "email",
      message: "Email is required",
    });
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      errors.push({
        field: "email",
        message: "Please enter a valid email address",
      });
    }
  }

  if (!password) {
    errors.push({
      field: "password",
      message: "Password is required",
    });
  } else if (password.length < 8) {
    errors.push({
      field: "password",
      message: "Password must be at least 8 characters",
    });
  }

  return errors;
}

function validateLogin(req) {
  const errors = [];

  const { email, password } = req.body;

  if (!email || !email.trim()) {
    errors.push({
      field: "email",
      message: "Email is required",
    });
  }

  if (!password) {
    errors.push({
      field: "password",
      message: "Password is required",
    });
  }

  return errors;
}

function validateUpdateProfile(req) {
  const errors = [];

  const { fullName, email } = req.body;

  if (!fullName || !fullName.trim()) {
    errors.push({
      field: "fullName",
      message: "Full name is required",
    });
  }

  if (!email || !email.trim()) {
    errors.push({
      field: "email",
      message: "Email is required",
    });
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      errors.push({
        field: "email",
        message: "Please enter a valid email address",
      });
    }
  }

  return errors;
}

function validateChangePassword(req) {
  const errors = [];

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword) {
    errors.push({
      field: "currentPassword",
      message: "Current password is required",
    });
  }

  if (!newPassword) {
    errors.push({
      field: "newPassword",
      message: "New password is required",
    });
  } else if (newPassword.length < 8) {
    errors.push({
      field: "newPassword",
      message: "New password must be at least 8 characters",
    });
  }

  return errors;
}

function validateForgotPassword(req) {
  const errors = [];

  const { email } = req.body;

  if (!email || !email.trim()) {
    errors.push({
      field: "email",
      message: "Email is required",
    });
  }

  return errors;
}

function validateResetPassword(req) {
  const errors = [];

  const { email, token, newPassword } = req.body;

  if (!email || !email.trim()) {
    errors.push({
      field: "email",
      message: "Email is required",
    });
  }

  if (!token || !token.trim()) {
    errors.push({
      field: "token",
      message: "Reset token is required",
    });
  }

  if (!newPassword) {
    errors.push({
      field: "newPassword",
      message: "New password is required",
    });
  } else if (newPassword.length < 8) {
    errors.push({
      field: "newPassword",
      message: "New password must be at least 8 characters",
    });
  }

  return errors;
}

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
};
