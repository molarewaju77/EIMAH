import { createFileRoute, useParams } from "@tanstack/react-router";
import { ProductDetailView } from "@/components/site/ProductDetailView";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  head: () => ({
    meta: [
      { title: "Product Details — EIMAH" },
      { name: "description", content: "View product details and shop online at EIMAH." },
    ],
  }),
});

function ProductPage() {
  const { id } = useParams({ from: "/product/$id" });
  return <ProductDetailView productId={id} />;
}
