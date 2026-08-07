import api from "./api";

export const getCourses = async (params?: {
  search?: string;
  category?: string;
  instructor?: string;
  status?: string;
}) => {
  const response = await api.get("/courses", {
    params,
  });

  return response.data;
};

export const createCourse = async (course: any) => {
  const response = await api.post("/courses", course);

  return response.data;
};

export const updateCourse = async (id: string, course: any) => {
  const response = await api.put(`/courses/${id}`, course);

  return response.data;
};

export const deleteCourse = async (id: string) => {
  const response = await api.delete(`/courses/${id}`);

  return response.data;
};

export const getCourseById = async (id: string) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};
