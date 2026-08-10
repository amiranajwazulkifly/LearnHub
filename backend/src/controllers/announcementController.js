// dzul
const { pool } = require('../config/db');
const ApiError = require('../utils/apiError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

function formatAnnouncement(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    audience: row.audience,
    status: row.status,
    createdBy: row.created_by,
    authorName: row.author_name ?? undefined,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET /api/announcements?page=&limit=  (admin — sees all statuses)
async function listAll(req, res) {
  const { page, limit, offset } = parsePagination(req.query);

  const result = await pool.query(
    `
    SELECT a.*, u.full_name AS author_name
    FROM public.announcements a
    LEFT JOIN public.users u ON u.id = a.created_by
    ORDER BY a.created_at DESC
    LIMIT $1 OFFSET $2
  `,
    [limit, offset]
  );

  const countResult = await pool.query('SELECT COUNT(*) FROM public.announcements');

  res.status(200).json({
    success: true,
    message: 'Announcements retrieved successfully',
    data: {
      announcements: result.rows.map(formatAnnouncement),
      pagination: buildPaginationMeta({ page, limit, total: Number(countResult.rows[0].count) }),
    },
  });
}

// GET /api/announcements/published
// Filters by the logged-in user's role: students see 'all' + 'students',
// admins (browsing this route) see everything published regardless.
async function listPublished(req, res) {
  const audiences =
    req.user.role === 'student' ? ['all', 'students'] : ['all', 'students', 'instructors'];

  const result = await pool.query(
    `
      SELECT id, title, content, audience, published_at
      FROM public.announcements
      WHERE status = 'published' AND audience = ANY($1)
      ORDER BY published_at DESC
    `,
    [audiences]
  );

  res.status(200).json({
    success: true,
    message: 'Published announcements retrieved successfully',
    data: { announcements: result.rows.map(formatAnnouncement) },
  });
}

async function getOne(req, res) {
  const result = await pool.query(`SELECT * FROM public.announcements WHERE id = $1`, [req.params.id]);
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Announcement not found');
  }
  res.status(200).json({
    success: true,
    message: 'Announcement retrieved successfully',
    data: { announcement: formatAnnouncement(result.rows[0]) },
  });
}

// POST /api/announcements  (created as draft)
async function create(req, res) {
  const { title, content, audience } = req.body;

  const result = await pool.query(
    `
      INSERT INTO public.announcements (title, content, audience, status, created_by)
      VALUES ($1, $2, $3, 'draft', $4)
      RETURNING *
    `,
    [title.trim(), content.trim(), audience || 'all', req.user.id]
  );

  res.status(201).json({
    success: true,
    message: 'Announcement created successfully',
    data: { announcement: formatAnnouncement(result.rows[0]) },
  });
}

async function update(req, res) {
  const { title, content, audience } = req.body;

  const result = await pool.query(
    `
      UPDATE public.announcements SET
        title = COALESCE($2, title),
        content = COALESCE($3, content),
        audience = COALESCE($4, audience)
      WHERE id = $1
      RETURNING *
    `,
    [req.params.id, title?.trim() ?? null, content?.trim() ?? null, audience ?? null]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Announcement not found');
  }

  res.status(200).json({
    success: true,
    message: 'Announcement updated successfully',
    data: { announcement: formatAnnouncement(result.rows[0]) },
  });
}

// PATCH /api/announcements/:id/publish
// published_at MUST be set — the schema's CHECK constraint rejects
// status='published' with a null published_at.
async function publish(req, res) {
  const result = await pool.query(
    `UPDATE public.announcements SET status = 'published', published_at = now() WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Announcement not found');
  }
  res.status(200).json({
    success: true,
    message: 'Announcement published successfully',
    data: { announcement: formatAnnouncement(result.rows[0]) },
  });
}

// PATCH /api/announcements/:id/archive
// Real schema has 3 statuses (draft/published/archived) — 'unpublish' back
// to draft would actually violate nothing, but 'archive' better matches
// the schema's intent for a published announcement being retired.
async function archive(req, res) {
  const result = await pool.query(
    `UPDATE public.announcements SET status = 'archived' WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Announcement not found');
  }
  res.status(200).json({
    success: true,
    message: 'Announcement archived successfully',
    data: { announcement: formatAnnouncement(result.rows[0]) },
  });
}

async function backToDraft(req, res) {
  const result = await pool.query(
    `UPDATE public.announcements SET status = 'draft', published_at = NULL WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Announcement not found');
  }
  res.status(200).json({
    success: true,
    message: 'Announcement moved back to draft',
    data: { announcement: formatAnnouncement(result.rows[0]) },
  });
}

async function remove(req, res) {
  const result = await pool.query(`DELETE FROM public.announcements WHERE id = $1 RETURNING id`, [
    req.params.id,
  ]);
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Announcement not found');
  }
  res.status(200).json({
    success: true,
    message: 'Announcement deleted successfully',
  });
}

module.exports = { listAll, listPublished, getOne, create, update, publish, archive, backToDraft, remove };
