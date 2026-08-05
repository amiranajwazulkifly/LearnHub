const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(req) {
  const errors = [];

  const fullName =
    typeof req.body.fullName === 'string'
      ? req.body.fullName.trim()
      : '';

  const email =
    typeof req.body.email === 'string'
      ? req.body.email.trim()
      : '';

  const password =
    typeof req.body.password === 'string'
      ? req.body.password
      : '';

  if (!fullName) {
    errors.push({
      field: 'fullName',
      message: 'Full name is required',
    });
  } else if (fullName.length < 2) {
    errors.push({
      field: 'fullName',
      message: 'Full name must contain at least 2 characters',
    });
  } else if (fullName.length > 120) {
    errors.push({
      field: 'fullName',
      message: 'Full name cannot exceed 120 characters',
    });
  }

  if (!email) {
    errors.push({
      field: 'email',
      message: 'Email is required',
    });
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.push({
      field: 'email',
      message: 'Enter a valid email address',
    });
  } else if (email.length > 255) {
    errors.push({
      field: 'email',
      message: 'Email cannot exceed 255 characters',
    });
  }

  if (!password) {
    errors.push({
      field: 'password',
      message: 'Password is required',
    });
  } else {
    if (password.length < 8) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least 8 characters',
      });
    }

    if (!/[a-z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain a lowercase letter',
      });
    }

    if (!/[A-Z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain an uppercase letter',
      });
    }

    if (!/[0-9]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain a number',
      });
    }
  }

  return errors;
}

function validateLogin(req) {
  const errors = [];

  const email =
    typeof req.body.email === 'string'
      ? req.body.email.trim()
      : '';

  const password =
    typeof req.body.password === 'string'
      ? req.body.password
      : '';

  if (!email) {
    errors.push({
      field: 'email',
      message: 'Email is required',
    });
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.push({
      field: 'email',
      message: 'Enter a valid email address',
    });
  }

  if (!password) {
    errors.push({
      field: 'password',
      message: 'Password is required',
    });
  }

  return errors;
}

module.exports = {
  validateRegister,
  validateLogin,
};
