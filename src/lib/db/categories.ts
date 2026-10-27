import { supabase } from "../supabase";
import { type AdminCategory } from "../admin-data";

// Map Supabase snake_case row → AdminCategory shape
function rowToCategory(row: Record<string, unknown>): AdminCategory {
  return {
    slug: row.slug as string,
    name: row.name as string,
    blurb: row.blurb as string,
    image: row.image as string,
    featured: Boolean(row.featured),
    active: row.active !== false,
    productCount: Number(row.product_count ?? 0),
  };
}

export async function fetchCategories(): Promise<AdminCategory[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (error) throw error;
    if (!data || data.length === 0) {
      return [];
    }
    return data.map(rowToCategory);
  } catch (err) {
    console.warn("Failed to fetch categories from Supabase:", err);
    return [];
  }
}

export async function insertCategory(c: AdminCategory): Promise<void> {
  const { error } = await supabase.from("categories").insert({
    slug: c.slug,
    name: c.name,
    blurb: c.blurb,
    image: c.image,
    featured: c.featured ?? false,
    active: c.active ?? true,
    product_count: c.productCount ?? 0,
  });
  if (error) throw error;
}

export async function updateCategory(
  slug: string,
  patch: Partial<AdminCategory>,
): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .update({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.blurb !== undefined && { blurb: patch.blurb }),
      ...(patch.image !== undefined && { image: patch.image }),
      ...(patch.featured !== undefined && { featured: patch.featured }),
      ...(patch.active !== undefined && { active: patch.active }),
      ...(patch.productCount !== undefined && { product_count: patch.productCount }),
    })
    .eq("slug", slug);
  if (error) throw error;
}

export async function deleteCategory(slug: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("slug", slug);
  if (error) throw error;
}
