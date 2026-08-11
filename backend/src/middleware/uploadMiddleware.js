const multer = require("multer");
const { MAX_FILE_BYTES } = require("../utils/fileStorage");

// In-memory storage — files are immediately forwarded to Supabase Storage
// (see utils/fileStorage.js), never written to local disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES },
});

module.exports = upload;
