export interface WeightOption {
  id: string;
  label: string; // e.g. "500g", "1kg", "2kg"
  weightInGrams: number;
  price: number;
  mrp: number;
  isPopular?: boolean;
}

export interface SubCategory {
  id: string;
  slug: string;
  name: string;
  regionalName?: string;
}

export interface Product {
  id: string;
  name: string;
  regionalName: string; // e.g. "Tamatar (ટામેટા)"
  categoryId: string;
  categorySlug?: string;
  subCategoryId?: string;
  categoryName: string;
  imageUrl: string;
  basePrice: number;
  baseMrp: number;
  unit: string; // e.g. "/kg", "/bunch", "/pack"
  harvestTime?: string; // e.g. "4:30 AM"
  grade: 'A-Grade' | 'Premium' | 'Organic';
  origin: string;
  description: string;
  packagingType: string;
  weightOptions: WeightOption[];
  inStock: boolean;
}

export interface Category {
  id: string;
  slug?: string;
  name: string;
  regionalName?: string;
  subtitle: string;
  imageUrl: string;
  tag?: string; // e.g. "Core", "Fresh", "Special"
  itemCount: number;
  displayOrder?: number;
  isActive?: boolean;
  subcategories?: SubCategory[];
}
