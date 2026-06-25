export type CategoryKey =
  | 'madera'
  | 'muebles_cocina'
  | 'muebles_hogar'
  | 'ferias_maquinaria';

export interface Article {
  id: number;
  title: string;
  link: string;
  source: string;
  category: CategoryKey;
  published_at: string;
  summary: string;
  fetched_at: string;
}

export interface NewsResponse {
  items: Article[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
  count: number;
}

export interface CategoriesResponse {
  categories: CategoryInfo[];
}
