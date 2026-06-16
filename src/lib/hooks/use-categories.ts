// src/lib/hooks/use-categories.ts
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  categoriesApi,
  Category,
  CategoryFilters,
  CategoriesResponse,
} from "@/lib/api/categories";

export function useCategories(): UseQueryResult<Category[], Error> {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAllCategories(),
    staleTime: 1000 * 60 * 5, // 5 phút
    gcTime: 1000 * 60 * 10, // 10 phút
  });
}

export function useCategoryBySlug(
  slug: string
): UseQueryResult<Category, Error> {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => categoriesApi.getCategoryBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCategoryById(id: string): UseQueryResult<Category, Error> {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => categoriesApi.getCategoryById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
