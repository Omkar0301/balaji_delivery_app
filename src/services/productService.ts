import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import { Category, Product } from '../types/product';

export interface HomeBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  imageUrl: string;
  ctaText: string;
  targetRoute: string;
}

export interface HomePayload {
  categories: Category[];
  banners: HomeBanner[];
  flashDeals: Product[];
  freshlyPicked: Product[];
  popularProducts: Product[];
}

export interface GetProductsFilter {
  categoryId?: string;
  categorySlug?: string;
  subCategoryId?: string;
  searchQuery?: string;
  grade?: string;
  maxPrice?: number;
  sortBy?: 'default' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

export const productService = {
  async getHome(): Promise<ApiResponse<HomePayload>> {
    return apiClient.get<HomePayload>('/home', undefined, 2 * 60 * 1000);
  },

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient.get<Category[]>('/categories', undefined, 5 * 60 * 1000);
  },

  async getProducts(filter?: GetProductsFilter): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams();
    if (filter?.categoryId) params.append('categoryId', filter.categoryId);
    if (filter?.categorySlug) params.append('categorySlug', filter.categorySlug);
    if (filter?.subCategoryId) params.append('subCategoryId', filter.subCategoryId);
    if (filter?.searchQuery) params.append('q', filter.searchQuery);
    if (filter?.grade) params.append('grade', filter.grade);
    if (filter?.maxPrice !== undefined) params.append('maxPrice', String(filter.maxPrice));
    if (filter?.sortBy) params.append('sort', filter.sortBy);
    if (filter?.page !== undefined) params.append('page', String(filter.page));
    if (filter?.limit !== undefined) params.append('limit', String(filter.limit));

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<Product[]>(`/products${query}`, undefined, 30 * 1000);
  },

  async getPopularSearches(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/products/popular-searches', undefined, 10 * 60 * 1000);
  },

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get<Product>(`/products/${id}`, undefined, 60 * 1000);
  },
};
