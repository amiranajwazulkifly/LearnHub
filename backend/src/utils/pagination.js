const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// Reads page/limit off req.query with sane bounds, returning the offset
// needed for a SQL LIMIT/OFFSET clause alongside the normalized values.
function parsePagination(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

function buildPaginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

module.exports = { parsePagination, buildPaginationMeta };
