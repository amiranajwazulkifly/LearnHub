import axiosInstance from "../api/axiosInstance";
import type { Assignment, AssignmentFormInput } from "../types/assignment";

interface ListApiResponse {
  data: { assignments: Assignment[] };
}

interface OneApiResponse {
  data: { assignment: Assignment };
}

// Explicitly clearing Content-Type lets the browser set the multipart
// boundary itself — axiosInstance hardcodes application/json by default,
// which would otherwise break file uploads.
const multipartConfig = { headers: { "Content-Type": undefined } };

function toFormData(input: AssignmentFormInput): FormData {
  const formData = new FormData();
  if (input.course_id) formData.append("course_id", input.course_id);
  formData.append("title", input.title);
  if (input.description) formData.append("description", input.description);
  if (input.points) formData.append("points", input.points);
  if (input.due_at) formData.append("due_at", input.due_at);
  if (input.attachment) formData.append("attachment", input.attachment);
  if (input.remove_attachment) formData.append("remove_attachment", "true");
  return formData;
}

export async function getCourseAssignments(courseId: string): Promise<Assignment[]> {
  const { data } = await axiosInstance.get<ListApiResponse>(`/assignments/course/${courseId}`);
  return data.data.assignments;
}

// Student's cross-course "Tasks" dashboard.
export async function getMyAssignments(): Promise<Assignment[]> {
  const { data } = await axiosInstance.get<ListApiResponse>("/assignments/mine");
  return data.data.assignments;
}

export async function getAssignmentById(id: string): Promise<Assignment> {
  const { data } = await axiosInstance.get<OneApiResponse>(`/assignments/${id}`);
  return data.data.assignment;
}

export async function createAssignment(input: AssignmentFormInput): Promise<Assignment> {
  const { data } = await axiosInstance.post<OneApiResponse>(
    "/assignments",
    toFormData(input),
    multipartConfig
  );
  return data.data.assignment;
}

export async function updateAssignment(
  id: string,
  input: AssignmentFormInput
): Promise<Assignment> {
  const { data } = await axiosInstance.put<OneApiResponse>(
    `/assignments/${id}`,
    toFormData(input),
    multipartConfig
  );
  return data.data.assignment;
}

export async function deleteAssignment(id: string): Promise<void> {
  await axiosInstance.delete(`/assignments/${id}`);
}
