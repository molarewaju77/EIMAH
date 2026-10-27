import { supabase } from "@/lib/supabase";

export interface StockCheckItem {
  cartItemId?: string;
  productId: string;
  name?: string;
  image?: string;
  slug?: string;
  qty: number;
  selectedOptions?: Record<string, string>;
  variantId?: string;
}

export interface StockConflict {
  cartItemId?: string;
  productId: string;
  name: string;
  image: string;
  slug: string;
  selectedOptions?: Record<string, string>;
  variantSummary?: string;
  requestedQty: number;
  availableStock: number;
  isOutOfStock: boolean;
}

export interface StockCheckResult {
  isValid: boolean;
  conflicts: StockConflict[];
  /** Map of cartItemId or productId to latest verified available stock */
  stockMap: Record<string, number>;
}

/**
 * Live stock verification against Supabase products table.
 * Accurately handles variants and fallback data.
 */
export async function verifyItemsStock(items: StockCheckItem[]): Promise<StockCheckResult> {
  if (!items || items.length === 0) {
    return { isValid: true, conflicts: [], stockMap: {} };
  }

  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const conflicts: StockConflict[] = [];
  const stockMap: Record<string, number> = {};

  try {
    const { data: dbProducts, error } = await supabase
      .from("products")
      .select("id, name, slug, images, stock, status, variants")
      .in("id", productIds);

    if (error) {
      console.warn("[StockCheck] Supabase query error:", error);
    }

    const fetchedProducts = dbProducts || [];

    for (const item of items) {
      // Find product in DB results
      const product = fetchedProducts.find((p) => p.id === item.productId);

      let availableStock = 0;
      let productName = item.name || product?.name || "Product";
      let productSlug = item.slug || product?.slug || "";
      let productImage =
        item.image ||
        (Array.isArray(product?.images) ? product?.images[0] : "") ||
        "";

      if (product) {
        productName = product.name;
        productSlug = product.slug;
        if (!productImage && Array.isArray(product.images) && product.images.length > 0) {
          productImage = product.images[0];
        }

        const isMarkedOutOfStock =
          (product as any).status === "Out of Stock" ||
          product.status === "Archived" ||
          product.status === "Draft";

        if (isMarkedOutOfStock) {
          availableStock = 0;
        } else {
          // Check variant if applicable
          const variants = (product.variants as any[]) || [];
          let matchedVariant: any = null;

          if (item.variantId) {
            matchedVariant = variants.find((v) => v.id === item.variantId);
          } else if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
            matchedVariant = variants.find(
              (v) =>
                v.options &&
                item.selectedOptions &&
                Object.entries(item.selectedOptions).every(([k, val]) => v.options[k] === val)
            );
          }

          if (matchedVariant) {
            availableStock = Math.max(0, Number(matchedVariant.stock ?? 0));
          } else if (variants.length > 0 && !item.selectedOptions) {
            // Aggregate in-stock count across variants
            const sumVariants = variants.reduce(
              (acc, v) => acc + Math.max(0, Number(v.stock ?? 0)),
              0
            );
            availableStock = sumVariants > 0 ? sumVariants : Math.max(0, Number(product.stock ?? 0));
          } else {
            availableStock = Math.max(0, Number(product.stock ?? 0));
          }
        }
      }

      const key = item.cartItemId || item.productId;
      stockMap[key] = availableStock;

      const variantSummary = item.selectedOptions
        ? Object.entries(item.selectedOptions)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ")
        : undefined;

      if (item.qty > availableStock || availableStock <= 0) {
        conflicts.push({
          cartItemId: item.cartItemId,
          productId: item.productId,
          name: productName,
          image: productImage,
          slug: productSlug,
          selectedOptions: item.selectedOptions,
          variantSummary,
          requestedQty: item.qty,
          availableStock,
          isOutOfStock: availableStock <= 0,
        });
      }
    }
  } catch (err) {
    console.error("[StockCheck] Failed to verify stock:", err);
  }

  return {
    isValid: conflicts.length === 0,
    conflicts,
    stockMap,
  };
}

/**
 * Quick single-item stock verification for Add to Cart and Buy Now.
 */
export async function verifySingleItemStock(
  productId: string,
  qty = 1,
  selectedOptions?: Record<string, string>,
  variantId?: string
): Promise<{
  isValid: boolean;
  availableStock: number;
  isOutOfStock: boolean;
  conflict?: StockConflict;
}> {
  const result = await verifyItemsStock([
    {
      productId,
      qty,
      selectedOptions,
      variantId,
    },
  ]);

  const availableStock = result.stockMap[productId] ?? 0;
  const conflict = result.conflicts[0];

  return {
    isValid: result.isValid,
    availableStock,
    isOutOfStock: availableStock <= 0,
    conflict,
  };
}
