const crypto = require("crypto");
const supabase = require("../config/supabaseStorage");
const ApiError = require("./apiError");
const env = require("../config/env");

// Private bucket: objects are never publicly readable. Downloads go through
// createSignedDownloadUrl, after the caller has checked the user may see the
// file.
const BUCKET = "assignment-files";
const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB

// A signed link is minted per click and used straight away, so it only needs
// to outlive the redirect. Short enough that a copied link is useless.
const SIGNED_URL_TTL_SECONDS = 60;

// Uploads a multer in-memory file to the bucket under a folder ("assignments"
// or "submissions"). Returns the object path, which is what gets stored, not
// a URL.
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

  return { path, name: file.originalname };
}

/**
 * A short-lived URL for downloading one object. Callers must authorize the
 * user first; this function does no access checks of its own.
 *
 * `downloadName` makes the browser save the file under its original name
 * rather than the UUID-prefixed storage path.
 */
async function createSignedDownloadUrl(path, downloadName) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS, {
      download: downloadName || true,
    });

  if (error || !data?.signedUrl) {
    console.error("Signed URL error:", error);
    throw new ApiError(404, "File not found");
  }

  return {
    // Signed through the internal container address; the browser needs the
    // host-reachable one. (Identical outside Docker.)
    url: data.signedUrl.replace(env.supabaseUrl, env.supabasePublicUrl),
    expiresIn: SIGNED_URL_TTL_SECONDS,
  };
}

// Best-effort delete, used when an assignment or submission is deleted or its
// file replaced. Failures are logged, not thrown: an orphaned object is
// harmless and shouldn't fail the user's request.
async function deleteAssignmentFile(path) {
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error("File delete error:", error);
  }
}

module.exports = {
  uploadAssignmentFile,
  createSignedDownloadUrl,
  deleteAssignmentFile,
  MAX_FILE_BYTES,
};
