import { supabase } from "../supabase";
import { type AdminProduct } from "../admin-data";
import type { AdminCategory } from "../admin-store";

// Map Supabase row → AdminProduct shape
function rowToProduct(row: Record<string, unknown>): AdminProduct {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    price: Number(row.price),
    compareAt: row.compare_at ? Number(row.compare_at) : undefined,
    category: (row.category as string) || "clothing",
    description: (row.description as string) || "",
    stock: Number(row.stock ?? 0),
    featured: Boolean(row.featured),
    weight: row.weight !== undefined && row.weight !== null ? Number(row.weight) : 0,
    images: (row.images as string[]) ?? [],
    sku: (row.sku as string) || "",

    costPrice: Number(row.cost_price ?? 0),
    status: (row.status as AdminProduct["status"]) ?? "Active",
    sold: Number(row.sold ?? 0),
    createdAt: (row.created_at as string) || new Date().toISOString(),
    attributes: (row.attributes as AdminProduct["attributes"]) ?? [],
    variants: (row.variants as AdminProduct["variants"]) ?? [],
  };
}

export type ProductQueryParams = {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  status?: string;
  inStock?: boolean;
  featured?: boolean;
  sort?: "price-asc" | "price-desc" | "name" | "newest" | "featured" | string;
};

export type PaginatedProductsResult = {
  products: AdminProduct[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function fetchPaginatedProducts(
  params: ProductQueryParams = {},
): Promise<PaginatedProductsResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = params.pageSize || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let query = supabase.from("products").select("*", { count: "exact" });

    // Status filtering
    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status);
    }

    // Category filtering (case-insensitive & flexible)
    if (params.category && params.category !== "all") {
      const cleanCat = params.category.trim();
      query = query.or(`category.ilike.${cleanCat},category.ilike.%${cleanCat}%`);
    }

    // In-Stock filtering
    if (params.inStock) {
      query = query.gt("stock", 0);
    }

    // Featured filtering
    if (params.featured !== undefined) {
      query = query.eq("featured", params.featured);
    }

    // Search query
    if (params.search && params.search.trim()) {
      const s = params.search.trim();
      query = query.or(`name.ilike.%${s}%,sku.ilike.%${s}%`);
    }

    // Sorting
    switch (params.sort) {
      case "price-asc":
        query = query.order("price", { ascending: true });
        break;
      case "price-desc":
        query = query.order("price", { ascending: false });
        break;
      case "name":
        query = query.order("name", { ascending: true });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "featured":
        query = query
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    query = query.range(from, to);

    const { data: products, count, error } = await query;
    if (error) throw error;

    const mapped = (products || []).map((p) => rowToProduct(p as Record<string, unknown>));
    const total = count ?? mapped.length;

    return {
      products: mapped,
      totalCount: total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch (err) {
    console.warn("Failed to fetch paginated products from Supabase:", err);
    return {
      products: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 1,
    };
  }
}

export async function fetchProducts(): Promise<AdminProduct[]> {
  try {
    const { data: products, error: pErr } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (pErr) throw pErr;

    if (!products || products.length === 0) {
      return [];
    }

    return products.map((p) => rowToProduct(p as Record<string, unknown>));
  } catch (err) {
    console.warn("Failed to fetch products from Supabase:", err);
    return [];
  }
}

export async function insertProduct(p: AdminProduct): Promise<void> {
  const generatedSlug =
    p.slug && p.slug.trim()
      ? p.slug
      : p.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        Math.random().toString(36).slice(2, 6);

  const payload: Record<string, unknown> = {
    id: p.id,
    name: p.name,
    slug: generatedSlug,
    price: p.price,
    compare_at: p.compareAt ?? null,
    category: p.category || null,
    description: p.description || "",
    stock: p.stock ?? 0,
    featured: p.featured ?? false,
    images: p.images || [],
    cost_price: p.costPrice ?? 0,
    status: p.status || "Active",
    sold: p.sold ?? 0,
    weight: p.weight !== undefined ? Number(p.weight) : 0,
    attributes: p.attributes ?? [],
    variants: p.variants ?? [],
  };

  // Only send SKU if explicitly provided. Otherwise omitted so Supabase DB trigger assigns it!
  if (p.sku && p.sku.trim()) {
    payload.sku = p.sku.trim();
  }

  const { error } = await supabase.from("products").insert(payload);

  if (error) {
    console.error("Error inserting product into Supabase:", error);
    throw error;
  }
}

export async function updateProduct(id: string, patch: Partial<AdminProduct>): Promise<void> {
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.slug !== undefined) update.slug = patch.slug;
  if (patch.price !== undefined) update.price = patch.price;
  if (patch.compareAt !== undefined) update.compare_at = patch.compareAt ?? null;
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.stock !== undefined) update.stock = patch.stock;
  if (patch.featured !== undefined) update.featured = patch.featured;
  if (patch.weight !== undefined) update.weight = patch.weight;
  if (patch.images !== undefined) update.images = patch.images;
  if (patch.sku !== undefined) update.sku = patch.sku;
  if (patch.costPrice !== undefined) update.cost_price = patch.costPrice;
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.sold !== undefined) update.sold = patch.sold;
  if (patch.attributes !== undefined) update.attributes = patch.attributes;
  if (patch.variants !== undefined) update.variants = patch.variants;

  if (Object.keys(update).length > 0) {
    const { error } = await supabase.from("products").update(update).eq("id", id);
    if (error) throw error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchProductById(idOrSlug: string): Promise<AdminProduct | null> {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
      .limit(1)
      .maybeSingle();

    if (error || !product) {
      return null;
    }
    return rowToProduct(product as Record<string, unknown>);
  } catch (err) {
    console.warn("Failed to fetch product by id from Supabase:", err);
    return null;
  }
}

// ── CATEGORIES ──────────────────────────────────────────────
export async function fetchCategoriesDB(): Promise<AdminCategory[]> {
  try {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) throw error;
    if (!data || data.length === 0) {
      return [];
    }
    return data.map((r) => ({
      slug: r.slug as string,
      name: r.name as string,
      blurb: (r.blurb as string) ?? "",
      image: (r.image as string) ?? "",
      featured: Boolean(r.featured),
      active: Boolean(r.active ?? true),
      productCount: Number(r.product_count ?? 0),
    }));
  } catch (err) {
    console.warn("Failed to fetch categories from Supabase:", err);
    return [];
  }
}

export async function insertCategoryDB(c: AdminCategory): Promise<void> {
  const { error } = await supabase.from("categories").insert({
    slug: c.slug,
    name: c.name,
    blurb: c.blurb || "",
    image: c.image || "",
    featured: c.featured ?? false,
    active: c.active ?? true,
    product_count: c.productCount ?? 0,
  });
  if (error) throw error;
}

export async function updateCategoryDB(slug: string, patch: Partial<AdminCategory>): Promise<void> {
  const u: Record<string, unknown> = {};
  if (patch.name !== undefined) u.name = patch.name;
  if (patch.blurb !== undefined) u.blurb = patch.blurb;
  if (patch.image !== undefined) u.image = patch.image;
  if (patch.featured !== undefined) u.featured = patch.featured;
  if (patch.active !== undefined) u.active = patch.active;
  if (patch.productCount !== undefined) u.product_count = patch.productCount;

  const { error } = await supabase.from("categories").update(u).eq("slug", slug);
  if (error) throw error;
}

export async function deleteCategoryDB(slug: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("slug", slug);
  if (error) throw error;
}
