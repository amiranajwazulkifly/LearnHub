import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getAssignmentById,
  getAssignmentAttachmentUrl,
  getSubmissionAttachmentUrl,
} from "../../services/assignmentService";
import {
  getMySubmission,
  submitAssignment,
} from "../../services/submissionService";
import type { Assignment, Submission } from "../../types/assignment";
import { fieldBorderClasses } from "../../utils/formStyles";
import { ROUTES } from "../../constants/routes";
import {
  describeLoadError,
  type LoadErrorCopy,
} from "../../utils/errorHandler";
import { formatDateTime, formatGrade } from "../../utils/formatters";
import ErrorState from "../../components/common/ErrorState";
import { toast } from "../../store/useToastStore";
import AttachmentLink from "../../components/common/AttachmentLink";

// Mirrors the real layout's rhythm so the page doesn't jump when it loads.
function AssignmentDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse">
      <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-4 h-3 w-40 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-3 h-6 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-3 h-3 w-48 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-6 space-y-2">
        <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="mt-8 h-64 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
    </div>
  );
}

export default function StudentAssignmentDetailPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<LoadErrorCopy | null>(null);
  // Set when the student still has read access but has left the course, so
  // the page shows the record without an active submit form.
  const [canSubmit, setCanSubmit] = useState(true);

  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    if (!assignmentId) return;
    setLoading(true);
    setLoadError(null);
    Promise.all([
      getAssignmentById(assignmentId),
      getMySubmission(assignmentId),
    ])
      .then(([a, s]) => {
        setAssignment(a);
        setSubmission(s);
        setText(s?.submissionText ?? "");
        setLink(s?.submissionLink ?? "");
        // The API reports whether the enrollment is still live; a cancelled
        // one keeps read access to the record but can't submit new work.
        setCanSubmit(a.canSubmit !== false);
      })
      .catch((err) => setLoadError(describeLoadError(err, "assignment")))
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
      toast.success(
        submission
          ? "Submission replaced."
          : "Assignment submitted successfully.",
      );
    } catch {
      toast.error("Unable to submit. Please try again.");
      setSubmitError(
        "Failed to submit. Please check your link is a valid URL and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <AssignmentDetailSkeleton />;
  }

  if (loadError || !assignment) {
    const copy =
      loadError ??
      describeLoadError(new Error("missing assignment"), "assignment");

    return (
      <ErrorState
        title={copy.title}
        description={copy.description}
        onRetry={copy.canRetry ? load : undefined}
        backTo={ROUTES.STUDENT.TASKS}
        backLabel="Back to Tasks"
      />
    );
  }

  const isGraded =
    submission?.grade !== null && submission?.grade !== undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to={ROUTES.STUDENT.TASKS}
        className="font-mono text-sm text-brand-ink hover:underline"
      >
        ← Back to Tasks
      </Link>

      <p className="mt-2 font-mono text-xs font-semibold text-brand-ink">
        {assignment.courseCode} · {assignment.courseTitle}
      </p>
      <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
        {assignment.title}
      </h1>
      <p className="mb-6 font-mono text-xs text-gray-500 dark:text-gray-400">
        {assignment.points ? `${assignment.points} points` : "No points set"}
        {assignment.dueAt
          ? ` · Due ${formatDateTime(assignment.dueAt)}`
          : " · No due date"}
      </p>

      {assignment.description && (
        <p className="mb-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
          {assignment.description}
        </p>
      )}

      {assignment.hasAttachment && (
        <AttachmentLink
          getDownload={() => getAssignmentAttachmentUrl(assignment.id)}
          className="mb-6 inline-block text-sm text-brand-ink hover:underline"
        >
          📎 {assignment.attachmentName}
        </AttachmentLink>
      )}

      {isGraded && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
          <p className="font-mono text-xs uppercase tracking-wide text-green-700 dark:text-green-500">
            Grade
          </p>

          <p className="mt-1 text-2xl font-semibold text-green-800 dark:text-green-400">
            {formatGrade(submission!.grade, assignment.points)}
          </p>

          {submission!.feedback && (
            <>
              <p className="mt-4 font-mono text-xs uppercase tracking-wide text-green-700 dark:text-green-500">
                Instructor Feedback
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-green-800 dark:text-green-400">
                {submission!.feedback}
              </p>
            </>
          )}
        </div>
      )}

      {!canSubmit && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
            Your enrollment in this course has ended
          </p>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-400">
            You can still see your submission and grade, but you can no longer
            submit new work.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Your Submission
        </h2>

        {submission ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/30">
            {submission.hasAttachment ? (
              <AttachmentLink
                getDownload={() =>
                  getSubmissionAttachmentUrl(
                    submission.assignmentId,
                    submission.id,
                  )
                }
                className="text-sm font-medium text-brand-ink hover:underline"
              >
                {submission.attachmentName}
              </AttachmentLink>
            ) : (
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Text {submission.submissionLink ? "and link" : "response"}{" "}
                submitted
              </p>
            )}

            <p className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">
              Submitted {formatDateTime(submission.submittedAt)}
            </p>

            {isGraded && canSubmit && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                Replacing this submission will clear your current grade until
                your instructor reviews it again.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No submission yet.
          </p>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(false)}`}
            placeholder="Write your answer here..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Link
          </label>
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
          {submission?.hasAttachment && !file && (
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Current file:{" "}
              <AttachmentLink
                getDownload={() =>
                  getSubmissionAttachmentUrl(
                    submission.assignmentId,
                    submission.id,
                  )
                }
                className="text-brand-ink hover:underline"
              >
                {submission.attachmentName}
              </AttachmentLink>
            </p>
          )}
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
          />
        </div>

        {submitError && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-fg hover:bg-brand-hover active:bg-brand-active disabled:opacity-50"
        >
          {submitting
            ? "Submitting..."
            : !canSubmit
              ? "Submissions closed"
              : submission
                ? "Replace Submission"
                : "Submit Assignment"}
        </button>
      </form>
    </div>
  );
}
