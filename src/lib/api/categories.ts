// src/lib/api/categories.ts
import { apiClient } from './client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CategoriesResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
}

export const categoriesApi = {
  // ── Public endpoints ──────────────────────────────────────────────────
  getAllCategories: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>('/categories');
  },

  getCategoryBySlug: async (slug: string): Promise<Category> => {
    return apiClient.get<Category>(`/categories/slug/${slug}`);
  },

  getCategoryById: async (id: string): Promise<Category> => {
    return apiClient.get<Category>(`/categories/${id}`);
  },


};
