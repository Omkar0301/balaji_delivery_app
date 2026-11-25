import { apiClient } from './apiClient';
import { Product, Category } from '../types/product';
import { ApiResponse } from '../types/api';

export interface GetProductsFilter {
  categoryId?: string;
  searchQuery?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'popular' | 'freshness';
}

export const productService = {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient.get('/categories');
  },

  async getProducts(filter?: GetProductsFilter): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams();
    if (filter?.categoryId) params.append('categoryId', filter.categoryId);
    if (filter?.searchQuery) params.append('q', filter.searchQuery);
    if (filter?.sortBy) params.append('sort', filter.sortBy);

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get(`/products${query}`);
  },

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get(`/products/${id}`);
  },
};
