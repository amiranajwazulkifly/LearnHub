import axiosInstance from "../api/axiosInstance";
import type { Course, CourseListResponse } from "../types/course";

export const getCourses = async (params?: {
  search?: string;
  category?: string;
  instructor?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<CourseListResponse> => {
  const response = await axiosInstance.get("/courses", {
    params,
  });

  return response.data.data;
};

export const getCourseById = async (id: string): Promise<Course> => {
  const response = await axiosInstance.get(`/courses/${id}`);

  return response.data.data.course;
};

export const createCourse = async (course: any) => {
  const response = await axiosInstance.post("/courses", course);

  return response.data;
};

export const updateCourse = async (id: string, course: any) => {
  const response = await axiosInstance.put(`/courses/${id}`, course);

  return response.data;
};

export const deleteCourse = async (id: string) => {
  const response = await axiosInstance.delete(`/courses/${id}`);

  return response.data;
};
