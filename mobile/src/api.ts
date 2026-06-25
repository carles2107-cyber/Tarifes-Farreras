import { CategoriesResponse, CategoryKey, NewsResponse } from './types';

// Configure via EXPO_PUBLIC_API_URL, e.g. EXPO_PUBLIC_API_URL=https://my-backend.onrender.com
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchNews(params: {
  category?: CategoryKey;
  page?: number;
  pageSize?: number;
}): Promise<NewsResponse> {
  const { category, page = 1, pageSize = 20 } = params;
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (category) {
    query.set('category', category);
  }

  const res = await fetch(`${API_BASE_URL}/api/news?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Error al cargar noticias: ${res.status}`);
  }
  return res.json();
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  const res = await fetch(`${API_BASE_URL}/api/categories`);
  if (!res.ok) {
    throw new Error(`Error al cargar categorias: ${res.status}`);
  }
  return res.json();
}
