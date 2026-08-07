// dzul
const ALLOWED_AUDIENCES = ['all', 'students', 'instructors'];

function validateCreateAnnouncement(req) {
  const errors = [];

  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
  const audience = req.body.audience;

  if (!title) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (title.length < 2) {
    errors.push({ field: 'title', message: 'Title must contain at least 2 characters' });
  } else if (title.length > 180) {
    errors.push({ field: 'title', message: 'Title cannot exceed 180 characters' });
  }

  if (!content) {
    errors.push({ field: 'content', message: 'Content is required' });
  }

  if (audience !== undefined && !ALLOWED_AUDIENCES.includes(audience)) {
    errors.push({
      field: 'audience',
      message: `audience must be one of: ${ALLOWED_AUDIENCES.join(', ')}`,
    });
  }

  return errors;
}

function validateUpdateAnnouncement(req) {
  const errors = [];

  const hasTitle = Object.prototype.hasOwnProperty.call(req.body, 'title');
  const hasContent = Object.prototype.hasOwnProperty.call(req.body, 'content');
  const hasAudience = Object.prototype.hasOwnProperty.call(req.body, 'audience');

  if (hasTitle) {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    if (!title) {
      errors.push({ field: 'title', message: 'Title cannot be empty' });
    } else if (title.length > 180) {
      errors.push({ field: 'title', message: 'Title cannot exceed 180 characters' });
    }
  }

  if (hasContent) {
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
    if (!content) {
      errors.push({ field: 'content', message: 'Content cannot be empty' });
    }
  }

  if (hasAudience && !ALLOWED_AUDIENCES.includes(req.body.audience)) {
    errors.push({
      field: 'audience',
      message: `audience must be one of: ${ALLOWED_AUDIENCES.join(', ')}`,
    });
  }

  return errors;
}

module.exports = { validateCreateAnnouncement, validateUpdateAnnouncement };
