import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { Heart, ShoppingBag, X } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-store";
import { useCart } from "@/lib/cart-store";
import { useCartDrawer } from "@/lib/cart-drawer-store";
import { formatNaira } from "@/lib/mock-data";
import { toast } from "react-toastify";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
  head: () => ({
    meta: [
      { title: "Wishlist — EIMAH" },
      { name: "description", content: "Your saved products on EIMAH." },
    ],
  }),
});

function WishlistPage() {
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);

  const add = useCart((s) => s.add);
  const openDrawer = useCartDrawer((s) => s.openDrawer);

  return (
    <SiteLayout>
      <div className="bg-surface/50 border-b border-border/50 py-12 md:py-20 text-center px-4">
        <Heart className="size-10 mx-auto mb-4 text-brand-pink fill-brand-pink/20" />
        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight text-ink">
          Your Wishlist
        </h1>
        <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
          {items.length === 0
            ? "You haven't saved any items yet."
            : `You have ${items.length} item${items.length === 1 ? "" : "s"} saved to your wishlist.`}
        </p>
      </div>

      <div className="container-eimah py-16 min-h-[50vh]">
        {items.length === 0 ? (
          <div className="text-center py-10">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center h-12 px-8 bg-ink text-white font-semibold rounded-md hover:bg-black transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {items.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
