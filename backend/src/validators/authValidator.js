const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePasswordStrength(password, field = 'password') {
  const errors = [];

  if (password.length < 8) {
    errors.push({
      field,
      message: 'Password must contain at least 8 characters',
    });
  }

  if (!/[a-z]/.test(password)) {
    errors.push({
      field,
      message: 'Password must contain a lowercase letter',
    });
  }

  if (!/[A-Z]/.test(password)) {
    errors.push({
      field,
      message: 'Password must contain an uppercase letter',
    });
  }

  if (!/[0-9]/.test(password)) {
    errors.push({
      field,
      message: 'Password must contain a number',
    });
  }

  return errors;
}

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
    errors.push(...validatePasswordStrength(password));
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

function validateUpdateProfile(req) {
  const errors = [];

  const hasFullName =
    Object.prototype.hasOwnProperty.call(
      req.body,
      'fullName'
    );

  const hasEmail =
    Object.prototype.hasOwnProperty.call(
      req.body,
      'email'
    );

  if (!hasFullName && !hasEmail) {
    errors.push({
      field: 'profile',
      message: 'Provide a full name or email to update',
    });

    return errors;
  }

  if (hasFullName) {
    const fullName =
      typeof req.body.fullName === 'string'
        ? req.body.fullName.trim()
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
  }

  if (hasEmail) {
    const email =
      typeof req.body.email === 'string'
        ? req.body.email.trim()
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
    } else if (email.length > 255) {
      errors.push({
        field: 'email',
        message: 'Email cannot exceed 255 characters',
      });
    }
  }

  return errors;
}

function validateChangePassword(req) {
  const errors = [];

  const currentPassword =
    typeof req.body.currentPassword === 'string'
      ? req.body.currentPassword
      : '';

  const newPassword =
    typeof req.body.newPassword === 'string'
      ? req.body.newPassword
      : '';

  if (!currentPassword) {
    errors.push({
      field: 'currentPassword',
      message: 'Current password is required',
    });
  }

  if (!newPassword) {
    errors.push({
      field: 'newPassword',
      message: 'New password is required',
    });
  } else {
    errors.push(
      ...validatePasswordStrength(
        newPassword,
        'newPassword'
      )
    );
  }

  if (
    currentPassword &&
    newPassword &&
    currentPassword === newPassword
  ) {
    errors.push({
      field: 'newPassword',
      message:
        'New password must be different from the current password',
    });
  }

  return errors;
}

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
};
