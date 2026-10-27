import type { AdminProduct } from "@/lib/admin-data";
import type { AdminCategory } from "@/lib/admin-store";
import {
  fetchProducts as fetchProductsDB,
  fetchPaginatedProducts,
  fetchProductById,
  insertProduct as insertProductDB,
  updateProduct as updateProductDB,
  deleteProduct as deleteProductDB,
  fetchCategoriesDB,
  insertCategoryDB,
  updateCategoryDB,
  deleteCategoryDB,
  type ProductQueryParams,
  type PaginatedProductsResult,
} from "@/lib/db/products";

export const productService = {
  async getPaginated(params?: ProductQueryParams): Promise<PaginatedProductsResult> {
    return await fetchPaginatedProducts(params);
  },

  async getAll(): Promise<AdminProduct[]> {
    return await fetchProductsDB();
  },

  async getById(id: string): Promise<AdminProduct | null> {
    return await fetchProductById(id);
  },

  async create(product: AdminProduct): Promise<void> {
    await insertProductDB(product);
  },

  async update(id: string, patch: Partial<AdminProduct>): Promise<void> {
    await updateProductDB(id, patch);
  },

  async delete(id: string): Promise<void> {
    await deleteProductDB(id);
  },

  // Categories
  async getCategories(): Promise<AdminCategory[]> {
    return await fetchCategoriesDB();
  },

  async createCategory(c: AdminCategory): Promise<void> {
    await insertCategoryDB(c);
  },

  async updateCategory(slug: string, patch: Partial<AdminCategory>): Promise<void> {
    await updateCategoryDB(slug, patch);
  },

  async deleteCategory(slug: string): Promise<void> {
    await deleteCategoryDB(slug);
  },
};
