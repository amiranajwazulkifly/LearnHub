import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileText,
  Mail,
  Save,
  User,
} from "lucide-react";

import {
  gradeSubmission,
  getSubmissionsForAssignment,
} from "../../services/submissionService";
import {
  getAssignmentById,
  getSubmissionAttachmentUrl,
} from "../../services/assignmentService";
import type {
  Assignment,
  AssignmentCounts,
  SubmissionRosterEntry,
} from "../../types/assignment";
import {
  describeLoadError,
  type LoadErrorCopy,
} from "../../utils/errorHandler";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";

import StatusBadge from "../../components/common/StatusBadge";
import type { StatusTone } from "../../components/common/StatusBadge";
import { toast } from "../../store/useToastStore";
import AttachmentLink from "../../components/common/AttachmentLink";

interface GradeDraft {
  grade: string;
  feedback: string;
}

// The server already derives submitted/graded/missing for each row; this
// only maps that to a tone, so the page can't drift into its own rule.
const STATUS_TONES: Record<SubmissionRosterEntry["status"], StatusTone> = {
  missing: "gray",
  graded: "green",
  submitted: "amber",
};

function SubmissionsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-4 h-6 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-3 h-3 w-64 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
          />
        ))}
      </div>
      <div className="mt-6 space-y-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-40 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
          />
        ))}
      </div>
    </div>
  );
}

export default function InstructorAssignmentSubmissionsPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [entries, setEntries] = useState<SubmissionRosterEntry[]>([]);
  const [points, setPoints] = useState<number | null>(null);
  // Counts come from the API rather than being recomputed here — this is the
  // same tally the instructor dashboard and assignment list use.
  const [counts, setCounts] = useState<AssignmentCounts | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<LoadErrorCopy | null>(null);
  const [error, setError] = useState("");

  const [drafts, setDrafts] = useState<Record<string, GradeDraft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  function load() {
    if (!assignmentId) return;

    setLoading(true);
    setError("");
    setLoadError(null);

    Promise.all([
      getAssignmentById(assignmentId),
      getSubmissionsForAssignment(assignmentId),
    ])
      .then(([assignmentData, roster]) => {
        setAssignment(assignmentData);
        setEntries(roster.submissions);
        setPoints(roster.points);
        setCounts(roster.counts);

        const nextDrafts: Record<string, GradeDraft> = {};

        roster.submissions.forEach((entry) => {
          if (entry.submission) {
            nextDrafts[entry.submission.id] = {
              grade:
                entry.submission.grade !== null &&
                entry.submission.grade !== undefined
                  ? String(entry.submission.grade)
                  : "",
              feedback: entry.submission.feedback ?? "",
            };
          }
        });

        setDrafts(nextDrafts);
      })
      .catch((err) => {
        setLoadError(describeLoadError(err, "assignment"));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(load, [assignmentId]);

  async function handleGrade(submissionId: string) {
    if (!assignmentId) return;

    const draft = drafts[submissionId];

    if (!draft) return;

    setSavingId(submissionId);
    setError("");

    try {
      await gradeSubmission(assignmentId, submissionId, {
        grade: draft.grade === "" ? null : Number(draft.grade),
        feedback: draft.feedback,
      });

      load();
      toast.success("Grade saved.");
    } catch {
      toast.error("Unable to save the grade. Check the value and try again.");
      setError("Failed to save grade. Check the value and try again.");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return <SubmissionsSkeleton />;
  }

  if (loadError || !assignment) {
    const copy =
      loadError ?? describeLoadError(new Error("missing"), "assignment");

    return (
      <ErrorState
        title={copy.title}
        description={copy.description}
        onRetry={copy.canRetry ? load : undefined}
        backTo="/instructor/courses"
        backLabel="Back to My Courses"
      />
    );
  }

  const submittedCount = counts?.submitted ?? 0;
  const gradedCount = counts?.graded ?? 0;
  const missingCount = counts?.missing ?? 0;

  return (
    <div>
      {/* Back link */}
      <Link
        to={`/instructor/courses/${assignment.courseId}/assignments`}
        className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
      >
        <ArrowLeft size={16} />
        Back to Assignments
      </Link>

      {/* Header */}
      <div className="mb-6">
        <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400">
          instructor / submissions
        </p>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {assignment.title}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-brand-500" />

            <span>{points ? `${points} points` : "No points set"}</span>
          </div>

          {assignment.dueAt && (
            <div className="flex items-center gap-2">
              <CalendarClock size={16} className="text-amber-500" />

              <span>Due {new Date(assignment.dueAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
            <FileText size={18} />
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Submitted
            </p>

            <p className="text-xl font-bold text-gray-900 dark:text-gray-50">
              {submittedCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Graded
            </p>

            <p className="text-xl font-bold text-gray-900 dark:text-gray-50">
              {gradedCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <User size={18} />
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Missing
            </p>

            <p className="text-xl font-bold text-gray-900 dark:text-gray-50">
              {missingCount}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {/* No students */}
      {entries.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          description="Student work will appear here after a submission is made."
        />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const submission = entry.submission;

            const draft = submission ? drafts[submission.id] : null;

            return (
              <div
                key={entry.studentId}
                className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              >
                {/* Student heading */}
                <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                      <User size={18} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                        {entry.studentName}
                      </h3>

                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <Mail size={13} />
                        {entry.studentEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {entry.isHistorical && (
                      <StatusBadge label="cancelled enrollment" tone="gray" />
                    )}

                    {entry.isLate && <StatusBadge label="late" tone="red" />}

                    <StatusBadge
                      label={entry.status}
                      tone={STATUS_TONES[entry.status]}
                    />
                  </div>
                </div>

                {entry.isHistorical && (
                  <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-sm text-amber-800 dark:border-amber-950 dark:bg-amber-950/20 dark:text-amber-400">
                    This student has left the course. Their submission is kept
                    as part of the academic record and can still be graded.
                  </div>
                )}

                {!submission ? (
                  <div className="p-5">
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-center dark:border-gray-700 dark:bg-gray-950/30">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        This student has not submitted the assignment yet.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Submission */}
                    <div className="space-y-4 p-5">
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                          Student Submission
                        </h4>

                        {submission.submissionText ? (
                          <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-300">
                            {submission.submissionText}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 dark:text-gray-500">
                            No written response.
                          </p>
                        )}
                      </div>

                      {(submission.submissionLink ||
                        submission.hasAttachment) && (
                        <div className="flex flex-wrap gap-3">
                          {submission.submissionLink && (
                            <a
                              href={submission.submissionLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-brand-600 transition hover:bg-brand-50 dark:border-gray-700 dark:text-brand-400 dark:hover:bg-brand-950/30"
                            >
                              <ExternalLink size={15} />
                              Open Link
                            </a>
                          )}

                          {submission.hasAttachment && (
                            <AttachmentLink
                              getDownload={() =>
                                getSubmissionAttachmentUrl(
                                  submission.assignmentId,
                                  submission.id,
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-brand-600 transition hover:bg-brand-50 dark:border-gray-700 dark:text-brand-400 dark:hover:bg-brand-950/30"
                            >
                              <FileText size={15} />
                              {submission.attachmentName ?? "View Attachment"}
                            </AttachmentLink>
                          )}
                        </div>
                      )}

                      <p className="font-mono text-xs text-gray-400 dark:text-gray-500">
                        Submitted{" "}
                        {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Grading */}
                    <div className="border-t border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-950/20">
                      <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Grade Submission
                      </h4>

                      <div className="grid gap-4 lg:grid-cols-[140px_1fr_auto] lg:items-start">
                        <div>
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Grade
                          </label>

                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              max={points ?? undefined}
                              value={draft?.grade ?? ""}
                              onChange={(e) =>
                                setDrafts({
                                  ...drafts,
                                  [submission.id]: {
                                    ...draft!,
                                    grade: e.target.value,
                                  },
                                })
                              }
                              placeholder="Grade"
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />

                            {points && (
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                / {points}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Feedback
                          </label>

                          <textarea
                            rows={3}
                            value={draft?.feedback ?? ""}
                            onChange={(e) =>
                              setDrafts({
                                ...drafts,
                                [submission.id]: {
                                  ...draft!,
                                  feedback: e.target.value,
                                },
                              })
                            }
                            placeholder="Feedback for the student (optional)"
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                          />
                        </div>

                        <button
                          onClick={() => handleGrade(submission.id)}
                          disabled={savingId === submission.id}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
                        >
                          <Save size={16} />

                          {savingId === submission.id
                            ? "Saving..."
                            : submission.grade !== null &&
                                submission.grade !== undefined
                              ? "Update Grade"
                              : "Save Grade"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
