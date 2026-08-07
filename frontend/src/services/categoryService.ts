import api from "./api";
import type { Category } from "../types/category";

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get("/categories");
  return response.data;
};

export const createCategory = async (category: {
  name: string;
  description: string;
}) => {
  const response = await api.post("/categories", category);
  return response.data;
};

export const updateCategory = async (
  id: string,
  category: {
    name: string;
    description: string;
  },
) => {
  const response = await api.put(`/categories/${id}`, category);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};
