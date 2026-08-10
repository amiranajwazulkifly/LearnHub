const crypto = require("crypto");
const supabase = require("../config/supabaseStorage");
const ApiError = require("./apiError");

const BUCKET = "assignment-files";
const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB

// Uploads a multer in-memory file to the assignment-files bucket under a
// given folder ("assignments" or "submissions") and returns a public URL.
async function uploadAssignmentFile(file, folder) {
  if (!file) return null;

  if (file.size > MAX_FILE_BYTES) {
    throw new ApiError(400, "File must be smaller than 15MB");
  }

  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) {
    console.error("File upload error:", error);
    throw new ApiError(500, "Failed to upload file");
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
    name: file.originalname,
  };
}

// Best-effort delete — used when an assignment/submission with an
// attachment is deleted or replaced. Failures are logged, not thrown,
// since a dangling storage object is harmless and shouldn't block the
// user-facing request.
async function deleteAssignmentFileByUrl(url) {
  if (!url) return;

  const marker = `/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;

  const path = url.slice(index + marker.length);

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error("File delete error:", error);
  }
}

module.exports = { uploadAssignmentFile, deleteAssignmentFileByUrl, MAX_FILE_BYTES };
