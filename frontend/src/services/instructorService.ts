import api from "./api";
import type { Instructor } from "../types/instructor";

export const getInstructors = async (): Promise<Instructor[]> => {
  const response = await api.get("/instructors");
  return response.data;
};

export const createInstructor = async (instructor: {
  full_name: string;
  email: string;
  phone: string;
  expertise: string;
  biography: string;
  is_active: boolean;
}) => {
  const response = await api.post("/instructors", instructor);
  return response.data;
};

export const updateInstructor = async (
  id: string,
  instructor: {
    full_name: string;
    email: string;
    phone: string;
    expertise: string;
    biography: string;
    is_active: boolean;
  },
) => {
  const response = await api.put(`/instructors/${id}`, instructor);
  return response.data;
};

export const deleteInstructor = async (id: string) => {
  const response = await api.delete(`/instructors/${id}`);
  return response.data;
};

// Admin-only: grants (or resets) an instructor's login access.
export const setInstructorAccount = async (id: string, password: string) => {
  const response = await api.post(`/instructors/${id}/account`, { password });
  return response.data;
};
