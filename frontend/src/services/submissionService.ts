import axiosInstance from "../api/axiosInstance";
import type { Submission, SubmissionRosterEntry } from "../types/assignment";

interface SubmissionApiResponse {
  data: { submission: Submission };
}

interface MySubmissionApiResponse {
  data: { submission: Submission | null };
}

interface RosterApiResponse {
  data: { submissions: SubmissionRosterEntry[]; points: number | null };
}

const multipartConfig = { headers: { "Content-Type": undefined } };

export interface SubmitAssignmentInput {
  submission_text?: string;
  submission_link?: string;
  attachment?: File | null;
}

export async function submitAssignment(
  assignmentId: string,
  input: SubmitAssignmentInput
): Promise<Submission> {
  const formData = new FormData();
  if (input.submission_text) formData.append("submission_text", input.submission_text);
  if (input.submission_link) formData.append("submission_link", input.submission_link);
  if (input.attachment) formData.append("attachment", input.attachment);

  const { data } = await axiosInstance.post<SubmissionApiResponse>(
    `/assignments/${assignmentId}/submit`,
    formData,
    multipartConfig
  );
  return data.data.submission;
}

export async function getMySubmission(assignmentId: string): Promise<Submission | null> {
  const { data } = await axiosInstance.get<MySubmissionApiResponse>(
    `/assignments/${assignmentId}/my-submission`
  );
  return data.data.submission;
}

export async function getSubmissionsForAssignment(
  assignmentId: string
): Promise<{ submissions: SubmissionRosterEntry[]; points: number | null }> {
  const { data } = await axiosInstance.get<RosterApiResponse>(
    `/assignments/${assignmentId}/submissions`
  );
  return data.data;
}

export async function gradeSubmission(
  assignmentId: string,
  submissionId: string,
  payload: { grade?: number | null; feedback?: string }
): Promise<Submission> {
  const { data } = await axiosInstance.patch<SubmissionApiResponse>(
    `/assignments/${assignmentId}/submissions/${submissionId}/grade`,
    payload
  );
  return data.data.submission;
}
