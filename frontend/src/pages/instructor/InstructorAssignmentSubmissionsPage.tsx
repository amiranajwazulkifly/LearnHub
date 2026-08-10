import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  gradeSubmission,
  getSubmissionsForAssignment,
} from "../../services/submissionService";
import { getAssignmentById } from "../../services/assignmentService";
import type { Assignment, SubmissionRosterEntry } from "../../types/assignment";
import StatusBadge from "../../components/common/StatusBadge";
import type { StatusTone } from "../../components/common/StatusBadge";

interface GradeDraft {
  grade: string;
  feedback: string;
}

function submissionTone(entry: SubmissionRosterEntry): { label: string; tone: StatusTone } {
  if (!entry.submission) return { label: "missing", tone: "gray" };
  if (entry.submission.grade !== null && entry.submission.grade !== undefined) {
    return { label: "graded", tone: "green" };
  }
  return { label: "submitted", tone: "amber" };
}

export default function InstructorAssignmentSubmissionsPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [entries, setEntries] = useState<SubmissionRosterEntry[]>([]);
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState<Record<string, GradeDraft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  function load() {
    if (!assignmentId) return;
    setLoading(true);
    Promise.all([getAssignmentById(assignmentId), getSubmissionsForAssignment(assignmentId)])
      .then(([assignmentData, roster]) => {
        setAssignment(assignmentData);
        setEntries(roster.submissions);
        setPoints(roster.points);
        const nextDrafts: Record<string, GradeDraft> = {};
        roster.submissions.forEach((entry) => {
          if (entry.submission) {
            nextDrafts[entry.submission.id] = {
              grade: entry.submission.grade !== null && entry.submission.grade !== undefined ? String(entry.submission.grade) : "",
              feedback: entry.submission.feedback ?? "",
            };
          }
        });
        setDrafts(nextDrafts);
      })
      .catch(() => setError("Failed to load submissions"))
      .finally(() => setLoading(false));
  }

  useEffect(load, [assignmentId]);

  async function handleGrade(submissionId: string) {
    if (!assignmentId) return;
    const draft = drafts[submissionId];
    setSavingId(submissionId);
    try {
      await gradeSubmission(assignmentId, submissionId, {
        grade: draft.grade === "" ? null : Number(draft.grade),
        feedback: draft.feedback,
      });
      load();
    } catch {
      setError("Failed to save grade. Check the value and try again.");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading submissions...</p>;
  }

  if (!assignment) {
    return <p className="text-red-600 dark:text-red-400">{error || "Assignment not found."}</p>;
  }

  return (
    <div>
      <Link
        to={`/instructor/courses/${assignment.courseId}/assignments`}
        className="font-mono text-sm text-brand-600 hover:underline dark:text-brand-400"
      >
        ← Back to Assignments
      </Link>

      <h1 className="mb-1 mt-2 text-2xl font-bold text-gray-900 dark:text-gray-50">{assignment.title}</h1>
      <p className="mb-6 font-mono text-xs text-gray-500 dark:text-gray-400">
        {points ? `${points} pts` : "No points set"}
        {assignment.dueAt ? ` · Due ${new Date(assignment.dueAt).toLocaleString()}` : ""}
      </p>

      {error && (
        <p className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {entries.map((entry) => {
          const status = submissionTone(entry);
          const draft = entry.submission ? drafts[entry.submission.id] : null;

          return (
            <div
              key={entry.studentId}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-50">{entry.studentName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{entry.studentEmail}</p>
                </div>
                <StatusBadge label={status.label} tone={status.tone} />
              </div>

              {!entry.submission ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">No submission yet.</p>
              ) : (
                <div className="space-y-3">
                  {entry.submission.submissionText && (
                    <p className="whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {entry.submission.submissionText}
                    </p>
                  )}
                  {entry.submission.submissionLink && (
                    <a
                      href={entry.submission.submissionLink}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-brand-600 hover:underline dark:text-brand-400"
                    >
                      {entry.submission.submissionLink}
                    </a>
                  )}
                  {entry.submission.attachmentUrl && (
                    <a
                      href={entry.submission.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-brand-600 hover:underline dark:text-brand-400"
                    >
                      📎 {entry.submission.attachmentName}
                    </a>
                  )}
                  <p className="font-mono text-xs text-gray-400 dark:text-gray-500">
                    Submitted {new Date(entry.submission.submittedAt).toLocaleString()}
                  </p>

                  <div className="flex flex-col gap-2 border-t border-gray-100 pt-3 sm:flex-row sm:items-center dark:border-gray-800">
                    <input
                      type="number"
                      min={0}
                      max={points ?? undefined}
                      value={draft?.grade ?? ""}
                      onChange={(e) =>
                        setDrafts({
                          ...drafts,
                          [entry.submission!.id]: { ...draft!, grade: e.target.value },
                        })
                      }
                      placeholder={points ? `/ ${points}` : "Grade"}
                      className="w-24 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                    <input
                      type="text"
                      value={draft?.feedback ?? ""}
                      onChange={(e) =>
                        setDrafts({
                          ...drafts,
                          [entry.submission!.id]: { ...draft!, feedback: e.target.value },
                        })
                      }
                      placeholder="Feedback (optional)"
                      className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                    <button
                      onClick={() => handleGrade(entry.submission!.id)}
                      disabled={savingId === entry.submission.id}
                      className="rounded-md bg-linear-to-r from-brand-600 to-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:from-brand-700 hover:to-brand-600 disabled:opacity-50"
                    >
                      {savingId === entry.submission.id ? "Saving..." : "Save Grade"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {entries.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">No students enrolled in this course.</p>
        )}
      </div>
    </div>
  );
}
