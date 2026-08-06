// backend/src/controllers/announcementController.js
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

// GET /api/announcements  (admin — sees drafts + published)
exports.listAll = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`
    SELECT a.*, u.full_name AS author_name
    FROM announcements a
    JOIN users u ON u.id = a.author_id
    ORDER BY a.created_at DESC
  `);
  res.status(200).json(rows);
});

// GET /api/announcements/published  (student-facing — published only)
exports.listPublished = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`
    SELECT id, title, content, published_at
    FROM announcements
    WHERE status = 'published'
    ORDER BY published_at DESC
  `);
  res.status(200).json(rows);
});

// GET /api/announcements/:id
exports.getOne = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM announcements WHERE id = $1`, [req.params.id]);
  if (rows.length === 0) throw new ApiError(404, 'ANNOUNCEMENT_NOT_FOUND', 'Announcement not found');
  res.status(200).json(rows[0]);
});

// POST /api/announcements  (created as draft)
exports.create = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO announcements (title, content, status, author_id)
     VALUES ($1, $2, 'draft', $3) RETURNING *`,
    [title, content, req.user.id]
  );
  res.status(201).json(rows[0]);
});

// PATCH /api/announcements/:id  (edit title/content while draft or published)
exports.update = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const { rows } = await pool.query(
    `UPDATE announcements SET
       title = COALESCE($2, title),
       content = COALESCE($3, content),
       updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [req.params.id, title ?? null, content ?? null]
  );
  if (rows.length === 0) throw new ApiError(404, 'ANNOUNCEMENT_NOT_FOUND', 'Announcement not found');
  res.status(200).json(rows[0]);
});

// PATCH /api/announcements/:id/publish
exports.publish = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE announcements SET status = 'published', published_at = NOW()
     WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (rows.length === 0) throw new ApiError(404, 'ANNOUNCEMENT_NOT_FOUND', 'Announcement not found');
  res.status(200).json(rows[0]);
});

// PATCH /api/announcements/:id/unpublish
exports.unpublish = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE announcements SET status = 'draft', published_at = NULL
     WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (rows.length === 0) throw new ApiError(404, 'ANNOUNCEMENT_NOT_FOUND', 'Announcement not found');
  res.status(200).json(rows[0]);
});

// DELETE /api/announcements/:id
exports.remove = asyncHandler(async (req, res) => {
  await pool.query(`DELETE FROM announcements WHERE id = $1`, [req.params.id]);
  res.status(204).send();
});
