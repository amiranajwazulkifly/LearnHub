const { pool } = require('../config/db');
const ApiError = require('../utils/apiError');

const LIST_LIMIT = 20;

function formatNotification(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    link: row.link,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

// GET /api/notifications — the newest notifications plus the unread total.
// Every query is scoped to req.user.id; there is no way to name another
// user's notifications through this API.
async function listMine(req, res) {
  const [list, unread] = await Promise.all([
    pool.query(
      `SELECT * FROM public.notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [req.user.id, LIST_LIMIT]
    ),
    pool.query(
      `SELECT COUNT(*) FROM public.notifications
       WHERE user_id = $1 AND read_at IS NULL`,
      [req.user.id]
    ),
  ]);

  res.status(200).json({
    success: true,
    message: 'Notifications retrieved successfully',
    data: {
      notifications: list.rows.map(formatNotification),
      unreadCount: Number(unread.rows[0].count),
    },
  });
}

// PATCH /api/notifications/:id/read
async function markRead(req, res) {
  const result = await pool.query(
    `UPDATE public.notifications
     SET read_at = COALESCE(read_at, now())
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [req.params.id, req.user.id]
  );

  // Someone else's notification and a missing one both look like "not found",
  // so the response never confirms that an id exists.
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Notification not found');
  }

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: { notification: formatNotification(result.rows[0]) },
  });
}

// PATCH /api/notifications/read-all
async function markAllRead(req, res) {
  const result = await pool.query(
    `UPDATE public.notifications
     SET read_at = now()
     WHERE user_id = $1 AND read_at IS NULL`,
    [req.user.id]
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    data: { updated: result.rowCount },
  });
}

module.exports = { listMine, markRead, markAllRead };
