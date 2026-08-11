import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getAssignmentById } from "../../services/assignmentService";
import { getMySubmission, submitAssignment } from "../../services/submissionService";
import type { Assignment, Submission } from "../../types/assignment";
import { fieldBorderClasses } from "../../utils/formStyles";
import { ROUTES } from "../../constants/routes";

export default function StudentAssignmentDetailPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    if (!assignmentId) return;
    setLoading(true);
    Promise.all([getAssignmentById(assignmentId), getMySubmission(assignmentId)])
      .then(([a, s]) => {
        setAssignment(a);
        setSubmission(s);
        setText(s?.submissionText ?? "");
        setLink(s?.submissionLink ?? "");
      })
      .catch(() => setError("Failed to load this assignment"))
      .finally(() => setLoading(false));
  }

  useEffect(load, [assignmentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assignmentId) return;
    setSubmitError("");

    if (!text.trim() && !link.trim() && !file) {
      setSubmitError("Add some text, a link, or a file before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await submitAssignment(assignmentId, {
        submission_text: text,
        submission_link: link,
        attachment: file,
      });
      setFile(null);
      load();
    } catch {
      setSubmitError("Failed to submit. Please check your link is a valid URL and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading assignment...</p>;
  }

  if (!assignment) {
    return <p className="text-red-600 dark:text-red-400">{error || "Assignment not found."}</p>;
  }

  const isGraded = submission?.grade !== null && submission?.grade !== undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to={ROUTES.STUDENT.TASKS}
        className="font-mono text-sm text-brand-600 hover:underline dark:text-brand-400"
      >
        ← Back to Tasks
      </Link>

      <p className="mt-2 font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
        {assignment.courseCode} · {assignment.courseTitle}
      </p>
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-50">{assignment.title}</h1>
      <p className="mb-6 font-mono text-xs text-gray-500 dark:text-gray-400">
        {assignment.points ? `${assignment.points} pts` : "No points set"}
        {assignment.dueAt ? ` · Due ${new Date(assignment.dueAt).toLocaleString()}` : " · No due date"}
      </p>

      {assignment.description && (
        <p className="mb-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
          {assignment.description}
        </p>
      )}

      {assignment.attachmentUrl && (
        <a
          href={assignment.attachmentUrl}
          target="_blank"
          rel="noreferrer"
          className="mb-6 inline-block text-sm text-brand-600 hover:underline dark:text-brand-400"
        >
          📎 {assignment.attachmentName}
        </a>
      )}

      {isGraded && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
          <p className="font-semibold text-green-800 dark:text-green-400">
            Grade: {submission!.grade}
            {assignment.points ? ` / ${assignment.points}` : ""}
          </p>
          {submission!.feedback && (
            <p className="mt-1 text-sm text-green-700 dark:text-green-400">{submission!.feedback}</p>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          {submission ? "Your Submission" : "Submit Your Work"}
        </h2>

        {submission && (
          <p className="font-mono text-xs text-gray-400 dark:text-gray-500">
            Last submitted {new Date(submission.submittedAt).toLocaleString()}
            {isGraded && " — resubmitting will clear your current grade"}
          </p>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(false)}`}
            placeholder="Write your answer here..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Link</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(false)}`}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Attachment
          </label>
          {submission?.attachmentUrl && !file && (
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Current file:{" "}
              <a
                href={submission.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 hover:underline dark:text-brand-400"
              >
                {submission.attachmentName}
              </a>
            </p>
          )}
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
          />
        </div>

        {submitError && <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white hover:from-brand-700 hover:to-brand-600 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : submission ? "Resubmit" : "Submit"}
        </button>
      </form>
    </div>
  );
}
