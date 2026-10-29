import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Trash2, ShoppingCart, User, AlertCircle, Check, X } from "lucide-react";
import { usePos } from "@/lib/pos-store";
import { useAdminStore, type AdminCustomer, type AdminProduct } from "@/lib/admin-store";
import { useProductsQuery } from "@/hooks/queries/useProductsQuery";
import { useCustomersQuery, CUSTOMERS_QUERY_KEY } from "@/hooks/queries/useCustomersQuery";
import { useCreateOrderMutation } from "@/hooks/queries/useOrdersQuery";
import { usePickupStationsQuery } from "@/hooks/queries/usePickupStationsQuery";
import { customerService } from "@/services/customerService";
import { fezDeliveryService } from "@/services/fezDeliveryService";
import { products, formatNaira, generateTrackingId } from "@/lib/mock-data";
import type { Product } from "@/lib/mock-data";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";

const FEZ_DEFAULT_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

function normalizeNigerianState(stateName?: string, stateList = FEZ_DEFAULT_STATES): string {
  if (!stateName) return "";
  const s = stateName.toLowerCase().replace(/state/gi, "").trim();
  if (s.includes("federal capital") || s.includes("abuja") || s === "fct") {
    return "FCT";
  }
  const match = stateList.find(
    (ns) => ns.toLowerCase() === s || ns.toLowerCase().includes(s) || s.includes(ns.toLowerCase()),
  );
  return match || stateName;
}

export const Route = createFileRoute("/admin/pos")({
  component: PosPage,
});

function CustomFilterIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 6H20M7 12H17M10 18H14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="6" r="2" fill="#F590DD" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="12" r="2" fill="#F590DD" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="18" r="2" fill="#F590DD" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PosPage() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const pos = usePos();
  const { data: storeProducts = [], isLoading: isLoadingProducts } = useProductsQuery();
  const { data: storeCustomers = [] } = useCustomersQuery();
  const createOrderMutation = useCreateOrderMutation();
  const { categories: storeCategories } = useAdminStore();

  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showProductModal, setShowProductModal] = useState<Product | null>(null);
  const [posSelectedVariant, setPosSelectedVariant] = useState<string>("");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  const [availableStates, setAvailableStates] = useState<string[]>(FEZ_DEFAULT_STATES);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string>("24 – 48 Hours");
  const [priceFetchError, setPriceFetchError] = useState<string | null>(null);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [customerAddressForm, setCustomerAddressForm] = useState({
    address: "",
    city: "",
    state: "",
  });

  // Pre-load active Fez delivery states on mount
  useEffect(() => {
    fezDeliveryService
      .getStates()
      .then((states) => {
        if (states && states.length > 0) {
          setAvailableStates(states);
        }
      })
      .catch((err) => {
        console.warn("[POS] Failed to load Fez states, using fallback list:", err);
      });
  }, []);

  const activeFilterCount = selectedCategory !== "all" ? 1 : 0;

  const allProducts: Product[] = storeProducts.length > 0 ? storeProducts : products;

  const availableCategories = useMemo(() => {
    const catMap = new Map<string, string>();
    storeCategories.forEach((c: { slug: string; name: string }) => catMap.set(c.slug, c.name));
    allProducts.forEach((p: Product) => {
      if (p.category && !catMap.has(p.category)) {
        const formattedName = p.category.charAt(0).toUpperCase() + p.category.slice(1);
        catMap.set(p.category, formattedName);
      }
    });
    return Array.from(catMap.entries()).map(([slug, name]) => ({ slug, name }));
  }, [storeCategories, allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p: Product) => {
      const sku = (p as any).sku || "";
      if (
        productSearch &&
        !p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
        !sku.toLowerCase().includes(productSearch.toLowerCase())
      ) {
        return false;
      }
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [allProducts, productSearch, selectedCategory]);

  const isProductOutOfStock = (p: Product) => {
    if ((p as any).status === "Out of Stock") return true;
    const stockVal = p.stock !== undefined && p.stock !== null ? Number(p.stock) : undefined;
    if (stockVal !== undefined && stockVal <= 0) return true;
    if (p.variants && p.variants.length > 0) {
      const hasAny = p.variants.some((v) => Number(v.stock ?? 0) > 0);
      if (!hasAny) return true;
    }
    return (stockVal ?? 0) <= 0;
  };

  const getProductAvailableStock = (p: Product, variantId?: string) => {
    if ((p as any).status === "Out of Stock") return 0;
    const mainStock = Number(p.stock ?? 0);
    if (mainStock <= 0) return 0;
    if (variantId && p.variants && p.variants.length > 0) {
      const v = p.variants.find((item) => item.id === variantId);
      if (v) return Math.min(mainStock, Math.max(0, Number(v.stock ?? 0)));
    }
    return Math.max(0, mainStock);
  };

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return [];
    const q = customerSearch.toLowerCase();
    return storeCustomers.filter(
      (c: AdminCustomer) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q),
    );
  }, [storeCustomers, customerSearch]);

  const { data: pickupStations = [] } = usePickupStationsQuery();
  const [courierPricesLoaded, setCourierPricesLoaded] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Invalidate courier price quote when items change
  useEffect(() => {
    setCourierPricesLoaded(false);
    setPriceFetchError(null);
  }, [pos.items]);

  // Invalidate courier price quote when customer address details change
  useEffect(() => {
    setCourierPricesLoaded(false);
    setPriceFetchError(null);
  }, [pos.customer?.address, pos.customer?.city, pos.customer?.state]);

  const handleGetPrices = async () => {
    if (!pos.customer) {
      toast.error("Please select or add a customer to the order first.");
      return;
    }
    if (!pos.customer.address || !pos.customer.city || !pos.customer.state) {
      toast.error("Please complete the customer's delivery address, city, and state.");
      setCustomerAddressForm({
        address: pos.customer.address || "",
        city: pos.customer.city || "",
        state: normalizeNigerianState(pos.customer.state || "", availableStates),
      });
      setShowEditAddressModal(true);
      return;
    }
    if (pos.items.length === 0) {
      toast.error("Please add at least one product to the order first.");
      return;
    }

    setLoadingPrices(true);
    setPriceFetchError(null);

    try {
      const calculatedWeight = pos.items.reduce(
        (sum, item) =>
          sum + (Number(item.qty) || 0) * (Number((item.product as any)?.weight) || 0),
        0,
      );
      const subtotal = pos.getSubtotal();
      const normalizedState = normalizeNigerianState(pos.customer.state, availableStates);

      const quote = await fezDeliveryService.getDeliveryCost({
        recipientState: normalizedState,
        recipientCity: pos.customer.city,
        weightInKg: calculatedWeight > 0 ? calculatedWeight : 1,
        itemsValue: subtotal > 0 ? subtotal : 10000,
      });

      pos.setShippingFee(quote.cost);
      setEstimatedDeliveryTime(quote.estimatedDelivery || "24 – 48 Hours");
      setCourierPricesLoaded(true);
      toast.success(`Fez Delivery fee calculated: ${formatNaira(quote.cost)}`);
    } catch (err: any) {
      setCourierPricesLoaded(false);
      const rawMsg = String(err?.message || err || "");
      const isNetwork =
        !navigator.onLine ||
        /fetch|network|load failed|timeout|connection|econnrefused|failed to fetch/i.test(rawMsg);
      const friendlyMsg = isNetwork
        ? "Unable to connect to Fez Delivery. Please check internet connection and try again."
        : rawMsg && !rawMsg.includes("fetch") && !rawMsg.includes("Error:")
          ? rawMsg
          : "Unable to calculate Fez delivery fee. Please verify the customer address/state and try again.";

      setPriceFetchError(friendlyMsg);
      toast.error(friendlyMsg);
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleCreateOrder = () => {
    if (!pos.customer) {
      toast.error("Please add a customer to the order first");
      return;
    }
    if (pos.items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    // Validate stock for all items
    for (const item of pos.items) {
      const p = allProducts.find((prod) => prod.id === item.product.id) || item.product;
      const available = getProductAvailableStock(p, item.variantId);
      if (available <= 0) {
        toast.error(`Cannot place order: "${item.product.name}" is out of stock.`);
        return;
      }
      if (item.qty > available) {
        toast.error(`Cannot place order: Only ${available} available for "${item.product.name}".`);
        return;
      }
    }

    if (pos.deliveryMethod === "Courier" && !courierPricesLoaded) {
      toast.error("Please click 'Get Delivery Prices' to calculate shipping fee first.");
      return;
    }

    // Generate order
    const orderId = "ORD-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const selectedStationObj = pickupStations.find((ps) => ps.id === pos.selectedPickupStationId);
    const orderAddress =
      pos.deliveryMethod === "Pickup Station" && selectedStationObj
        ? `Pickup Station: ${selectedStationObj.name} (${selectedStationObj.address})`
        : `${pos.customer.address}, ${pos.customer.city}, ${pos.customer.state}`;

    const customerSnapshot = pos.customer;
    const orderTotal = pos.getTotal();

    createOrderMutation.mutate(
      {
        id: orderId,
        trackingId: generateTrackingId(pos.deliveryMethod),
        customer: customerSnapshot.name,
        email: customerSnapshot.email,
        phone: customerSnapshot.phone,
        address: orderAddress,
        date: new Date().toISOString().split("T")[0],
        total: orderTotal,
        subtotal: pos.getSubtotal(),
        shippingFee: pos.shippingFee,
        paymentStatus: pos.paymentStatus === "Paid" ? "Successful" : "Pending",
        deliveryMethod: pos.deliveryMethod,
        status: pos.paymentStatus === "Paid" ? "Paid" : "Processing",
        internalNotes: pos.paymentMethod ? `Payment Method: ${pos.paymentMethod}` : undefined,
        trackingHistory: [
          {
            status: pos.paymentStatus === "Paid" ? "Paid" : "Processing",
            date: new Date().toISOString(),
            admin: "POS Admin",
          },
        ],
        items: pos.items.map((item) => ({
          id: item.product.id,
          productId: item.product.id,
          name: item.product.name + (item.variant ? ` (${item.variant})` : ""),
          qty: item.qty,
          price: item.product.price - item.customDiscount / item.qty,
          subtotal: (item.product.price - item.customDiscount / item.qty) * item.qty,
          variant: item.variant,
          variantId: item.variantId,
          weight:
            item.product.weight !== undefined && item.product.weight !== null
              ? Number(item.product.weight)
              : 0,
        })),
      },
      {
        onSuccess: async () => {
          // Add/upsert customer in the database ONLY when the order is successfully created
          try {
            const custId = `CUST-${customerSnapshot.phone.replace(/\D/g, "") || Math.floor(1000 + Math.random() * 9000)}`;
            await customerService.create({
              id: custId,
              name: customerSnapshot.name,
              email: customerSnapshot.email,
              phone: customerSnapshot.phone,
              orders: 1,
              spent: orderTotal,
              address: customerSnapshot.address || "",
              city: customerSnapshot.city || "",
              state: customerSnapshot.state || "",
              status: "New",
              lastOrder: new Date().toISOString(),
              dateJoined: new Date().toISOString(),
              notes: "Created via Admin POS order",
            });
            queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
          } catch (custErr) {
            console.warn("[POS Customer Creation Warning]", custErr);
          }

          toast.success("Order created successfully!");
          setCourierPricesLoaded(false);
          pos.clear();
          nav({ to: "/admin/orders" });
        },
        onError: (err) => {
          toast.error("Failed to create order: " + (err?.message || "Please try again."));
        },
      },
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-display font-bold text-ink">Create Order (POS)</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Place an order on behalf of a customer.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Products & Cart */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Customer Selection Card */}
          <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5">
            <h2 className="font-semibold text-ink flex items-center gap-2 mb-4">
              <User className="size-4" /> Customer
            </h2>
            {pos.customer ? (
              <div className="p-3.5 rounded-lg border border-brand-pink bg-brand-pink/5 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-ink text-sm">{pos.customer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {pos.customer.email} • {pos.customer.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerAddressForm({
                          address: pos.customer?.address || "",
                          city: pos.customer?.city || "",
                          state: normalizeNigerianState(pos.customer?.state || "", availableStates),
                        });
                        setShowEditAddressModal(true);
                      }}
                      className="text-xs text-brand-pink hover:underline font-semibold cursor-pointer"
                    >
                      Edit Address
                    </button>
                    <span className="text-muted-foreground/40">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        pos.setCustomer(null);
                        setCourierPricesLoaded(false);
                      }}
                      className="text-xs text-muted-foreground hover:text-ink font-medium cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Delivery Address Details */}
                <div className="pt-2 border-t border-brand-pink/20 text-xs">
                  {pos.customer.address && pos.customer.city && pos.customer.state ? (
                    <p className="text-muted-foreground">
                      <span className="font-medium text-ink">Delivery Address: </span>
                      {pos.customer.address}, {pos.customer.city}, {pos.customer.state}
                    </p>
                  ) : (
                    <div className="flex items-center justify-between text-amber-700 bg-amber-500/10 px-2.5 py-1.5 rounded-md border border-amber-500/20">
                      <span>⚠️ Missing delivery address details</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerAddressForm({
                            address: pos.customer?.address || "",
                            city: pos.customer?.city || "",
                            state: normalizeNigerianState(pos.customer?.state || "", availableStates),
                          });
                          setShowEditAddressModal(true);
                        }}
                        className="text-xs font-semibold underline text-amber-800 cursor-pointer ml-2"
                      >
                        Add Address
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search existing customers..."
                    className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-background focus:border-ink focus:ring-1 focus:ring-ink outline-none text-sm"
                  />
                  {filteredCustomers.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-border/50">
                      {filteredCustomers.map((c: AdminCustomer) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            pos.setCustomer({
                              name: c.name,
                              email: c.email,
                              phone: c.phone,
                              address: (c as any).address || "",
                              city: c.city || "",
                              state: normalizeNigerianState((c as any).state || "", availableStates),
                            });
                            setCourierPricesLoaded(false);
                            setCustomerSearch("");
                          }}
                          className="p-2.5 hover:bg-surface cursor-pointer transition-colors flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-semibold text-ink">{c.name}</p>
                            <p className="text-muted-foreground">
                              {c.email} • {c.phone}
                            </p>
                          </div>
                          <span className="text-[10px] bg-brand-pink/15 text-ink font-semibold px-2 py-0.5 rounded-full">
                            Select
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-center text-sm text-muted-foreground">or</div>
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="w-full h-10 bg-surface border border-border rounded-md hover:bg-secondary font-medium transition-colors text-sm cursor-pointer"
                >
                  Create New Customer
                </button>
              </div>
            )}
          </div>

          {/* Product Search & List */}
          <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-border/60 bg-surface/50">
              {/* 1. Mobile Filter Bar (sm:hidden) */}
              <div className="sm:hidden flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-white focus:border-ink focus:ring-1 focus:ring-ink outline-none text-sm"
                  />
                </div>

                {/* Custom Pink Filter Button */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  aria-label="Open filters"
                  className="relative h-10 w-10 rounded-md border border-brand-pink/40 bg-brand-pink/15 text-ink grid place-items-center shrink-0 hover:bg-brand-pink/25 transition-colors shadow-xs cursor-pointer"
                >
                  <CustomFilterIcon className="size-5" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-pink text-ink font-bold text-[10px] grid place-items-center shadow-xs">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* 2. Desktop Filter Bar (hidden sm:flex) */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products by name or SKU..."
                    className="w-full h-11 pl-9 pr-4 rounded-md border border-border bg-white focus:border-ink focus:ring-1 focus:ring-ink outline-none text-sm"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-11 rounded-md border border-border bg-white px-3 text-sm font-medium focus:border-ink focus:ring-1 focus:ring-ink outline-none cursor-pointer shrink-0 min-w-[150px]"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map((c: { slug: string; name: string }) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoadingProducts ? (
                <div className="h-full flex items-center justify-center p-12">
                  <Loader size="lg" label="Loading store inventory..." />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-sm font-semibold text-ink">No products found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting your search query or category filter.
                  </p>
                  {selectedCategory !== "all" && (
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="mt-3 text-xs text-brand-pink font-medium hover:underline cursor-pointer"
                    >
                      Clear category filter
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 p-2">
                  {filteredProducts.map((p: Product) => {
                    const outOfStock = isProductOutOfStock(p);
                    const availableStock = getProductAvailableStock(p);

                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (outOfStock) {
                            toast.error(`"${p.name}" is out of stock`);
                            return;
                          }
                          const firstInStockVariant = p.variants?.find((v) => Number(v.stock ?? 0) > 0);
                          setPosSelectedVariant(firstInStockVariant?.id || p.variants?.[0]?.id || "");
                          setShowProductModal(p);
                        }}
                        className={cn(
                          "group border rounded-lg overflow-hidden transition-all shadow-sm relative",
                          outOfStock
                            ? "border-neutral-300 bg-neutral-100 opacity-60 grayscale cursor-not-allowed select-none"
                            : "border-border/50 hover:border-brand-pink hover:shadow-md cursor-pointer bg-white",
                        )}
                      >
                        <div className="aspect-square bg-surface relative overflow-hidden">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className={cn(
                              "w-full h-full object-cover transition-transform duration-300",
                              outOfStock ? "grayscale contrast-75 brightness-90" : "group-hover:scale-105",
                            )}
                          />

                          {outOfStock ? (
                            <div className="absolute inset-0 bg-neutral-900/40 backdrop-grayscale flex flex-col items-center justify-center p-2 z-10">
                              <span className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                                Out of Stock
                              </span>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors flex items-center justify-center">
                              <div className="text-xs font-semibold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 shadow-sm bg-white text-ink">
                                Select Option
                              </div>
                            </div>
                          )}
                        </div>
                        <div className={cn("p-3 transition-colors", outOfStock ? "bg-neutral-100 text-neutral-400" : "bg-white")}>
                          <p className={cn("text-xs font-medium line-clamp-1", outOfStock ? "text-neutral-500" : "text-ink")}>
                            {p.name}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className={cn("text-xs font-semibold", outOfStock ? "text-neutral-400 line-through" : "text-brand-pink")}>
                              {formatNaira(p.price)}
                            </p>
                            <span
                              className={cn(
                                "text-[10px] font-medium px-1.5 py-0.5 rounded",
                                outOfStock
                                  ? "bg-red-100 text-red-700 font-bold"
                                  : availableStock <= 5
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {outOfStock ? "Out of Stock" : `${availableStock} in stock`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Cart & Checkout */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5 flex flex-col min-h-[600px]">
            <h2 className="font-semibold text-ink flex items-center gap-2 border-b border-border/60 pb-4">
              <ShoppingCart className="size-4" /> Cart Summary
            </h2>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 -mx-5 px-5">
              {pos.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3">
                  <ShoppingCart className="size-10 opacity-20" />
                  <p className="text-sm">Cart is empty</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {pos.items.map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <img
                        src={item.product.images[0]}
                        className="w-14 h-14 rounded-md object-cover border border-border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.variant || "Standard"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => pos.updateItemQty(item.id, item.qty - 1)}
                            className="w-6 h-6 rounded bg-surface border border-border flex items-center justify-center text-xs hover:bg-secondary"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                          <button
                            onClick={() => {
                              const p = allProducts.find((prod) => prod.id === item.product.id) || item.product;
                              const maxStock = getProductAvailableStock(p, item.variantId);
                              if (item.qty >= maxStock) {
                                toast.error(`Only ${maxStock} in stock for "${item.product.name}".`);
                                return;
                              }
                              pos.updateItemQty(item.id, item.qty + 1);
                            }}
                            className="w-6 h-6 rounded bg-surface border border-border flex items-center justify-center text-xs hover:bg-secondary cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end justify-between">
                        <p className="text-sm font-semibold text-ink">
                          {formatNaira(item.product.price * item.qty)}
                        </p>
                        <button
                          onClick={() => pos.removeItem(item.id)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Cart Footer / Totals */}
            <div className="pt-4 border-t border-border/60 space-y-4 mt-auto">
              {/* Delivery Method Selection */}
              <div className="space-y-2 pt-1 border-t border-border/40">
                <label className="text-xs text-muted-foreground font-medium">Delivery Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      pos.setDeliveryMethod("Courier");
                      setCourierPricesLoaded(false);
                      pos.setShippingFee(0);
                    }}
                    className={cn(
                      "p-2.5 rounded-lg border text-xs font-semibold text-left transition-colors cursor-pointer",
                      pos.deliveryMethod === "Courier"
                        ? "border-brand-pink bg-brand-pink/10 text-ink"
                        : "border-border bg-background text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    Courier Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      pos.setDeliveryMethod("Pickup Station");
                      if (pickupStations.length > 0) {
                        const defaultStation =
                          pickupStations.find((ps) => ps.id === pos.selectedPickupStationId) ||
                          pickupStations[0];
                        pos.setSelectedPickupStationId(defaultStation.id);
                        pos.setShippingFee(defaultStation.fee || 0);
                      } else {
                        pos.setShippingFee(0);
                      }
                    }}
                    className={cn(
                      "p-2.5 rounded-lg border text-xs font-semibold text-left transition-colors cursor-pointer",
                      pos.deliveryMethod === "Pickup Station"
                        ? "border-brand-pink bg-brand-pink/10 text-ink"
                        : "border-border bg-background text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    Pick-up Station
                  </button>
                </div>

                {pos.deliveryMethod === "Courier" ? (
                  <div className="pt-1 space-y-2">
                    {loadingPrices ? (
                      <div className="p-3 bg-surface border border-border rounded-lg text-xs text-muted-foreground flex items-center justify-center gap-2.5">
                        <div className="size-3.5 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
                        <span>Calculating Fez Delivery fee...</span>
                      </div>
                    ) : !courierPricesLoaded ? (
                      <div className="space-y-2">
                        {priceFetchError && (
                          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 p-3 text-xs flex gap-2 items-start">
                            <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                            <p className="leading-relaxed">{priceFetchError}</p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleGetPrices}
                          className="w-full h-9 bg-ink text-white font-semibold text-xs rounded-md hover:bg-black transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                        >
                          {priceFetchError ? "Retry Get Delivery Prices" : "Get Delivery Prices (Fez)"}
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-surface border border-brand-pink/40 text-xs flex justify-between items-center font-medium shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-brand-pink/15 text-ink font-bold text-[10px] grid place-items-center shrink-0">
                            FEZ
                          </div>
                          <div>
                            <p className="font-semibold text-ink text-xs">Fez Delivery Express</p>
                            <p className="text-[11px] text-muted-foreground">
                              Estimated Delivery: {estimatedDeliveryTime}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-sm text-ink block">
                            {pos.shippingFee === 0 ? "Free" : formatNaira(pos.shippingFee)}
                          </span>
                          <button
                            type="button"
                            onClick={handleGetPrices}
                            className="text-[10px] text-brand-pink hover:underline cursor-pointer"
                          >
                            Recalculate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-1 space-y-1.5">
                    <label className="text-[11px] text-muted-foreground font-medium">
                      Select Station
                    </label>
                    {pickupStations.length > 0 ? (
                      <select
                        value={pos.selectedPickupStationId || pickupStations[0]?.id || ""}
                        onChange={(e) => {
                          const stId = e.target.value;
                          pos.setSelectedPickupStationId(stId);
                          const station = pickupStations.find((ps) => ps.id === stId);
                          pos.setShippingFee(station?.fee || 0);
                        }}
                        className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs font-medium focus:border-ink focus:ring-1 focus:ring-ink outline-none cursor-pointer"
                      >
                        {pickupStations.map((ps) => (
                          <option key={ps.id} value={ps.id}>
                            {ps.name} — {(ps.fee || 0) === 0 ? "Free" : formatNaira(ps.fee!)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-2 rounded-md bg-brand-pink/10 border border-brand-pink/30 text-xs text-ink">
                        No pickup stations added in settings. Fee: Free
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-medium">Payment Status</label>
                <select
                  value={pos.paymentStatus}
                  onChange={(e) => pos.setPaymentStatus(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:border-ink focus:ring-1 focus:ring-ink outline-none cursor-pointer"
                >
                  <option>Paid</option>
                  <option>Partially Paid</option>
                  <option>Pay on Delivery</option>
                  <option>Pending Payment</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-medium">Payment Method</label>
                <select
                  value={pos.paymentMethod}
                  onChange={(e) => pos.setPaymentMethod(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:border-ink focus:ring-1 focus:ring-ink outline-none cursor-pointer"
                >
                  <option value="">Select Method...</option>
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>POS Terminal / Card Machine</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-1.5 text-sm pt-4 border-t border-border/40">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-ink">{formatNaira(pos.getSubtotal())}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-medium text-ink">{formatNaira(pos.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-ink pt-2">
                  <span>Total</span>
                  <span className="text-brand-pink">{formatNaira(pos.getTotal())}</span>
                </div>
              </div>

              <button
                onClick={handleCreateOrder}
                className="w-full h-12 bg-ink text-white font-semibold rounded-md hover:bg-black transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Check className="size-4" /> Create Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selection Modal */}
      {showProductModal && (() => {
        const selectedVariantObj = showProductModal.variants?.find(
          (v) => v.id === posSelectedVariant,
        );
        const currentStock = selectedVariantObj
          ? Number(selectedVariantObj.stock ?? 0)
          : Number(showProductModal.stock ?? 0);
        const isOutOfStockNow = currentStock <= 0;

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-4 border-b border-border">
                <h3 className="font-semibold text-ink">Add to Order</h3>
                <button
                  onClick={() => setShowProductModal(null)}
                  className="text-muted-foreground hover:text-ink cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="p-5 flex gap-4">
                <img
                  src={showProductModal.images[0]}
                  className="w-24 h-24 rounded-lg object-cover border border-border/50"
                />
                <div>
                  <p className="font-medium text-ink">{showProductModal.name}</p>
                  <p className="text-brand-pink font-bold mt-1">
                    {formatNaira(showProductModal.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                        isOutOfStockNow
                          ? "bg-red-100 text-red-700"
                          : currentStock <= 5
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800",
                      )}
                    >
                      {isOutOfStockNow ? "Out of Stock" : `Stock: ${currentStock} Available`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-5 bg-surface/50 border-t border-border/50 space-y-4">
                {showProductModal.variants && showProductModal.variants.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Select Variant
                    </label>
                    <select
                      value={posSelectedVariant}
                      onChange={(e) => setPosSelectedVariant(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:border-ink focus:ring-1 focus:ring-ink outline-none cursor-pointer"
                    >
                      {showProductModal.variants.map((v) => {
                        const isVOut = Number(v.stock ?? 0) <= 0;
                        return (
                          <option key={v.id} value={v.id} disabled={isVOut}>
                            {Object.entries(v.options)
                              .map(([k, val]) => `${k}: ${val}`)
                              .join(" · ")}{" "}
                            {isVOut ? "(Out of Stock)" : `(${v.stock} in stock)`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                <button
                  disabled={isOutOfStockNow}
                  onClick={() => {
                    if (isOutOfStockNow) {
                      toast.error("Product is out of stock");
                      return;
                    }
                    let variantStr = "";
                    if (selectedVariantObj) {
                      variantStr = Object.entries(selectedVariantObj.options)
                        .map(([k, val]) => `${k}: ${val}`)
                        .join(" · ");
                    }
                    pos.addItem(showProductModal, 1, variantStr, selectedVariantObj?.id);
                    toast.success("Added to order");
                    setShowProductModal(null);
                  }}
                  className={cn(
                    "w-full h-10 font-semibold rounded-md transition-colors",
                    isOutOfStockNow
                      ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                      : "bg-brand-pink text-ink hover:brightness-105 cursor-pointer",
                  )}
                >
                  {isOutOfStockNow ? "Out of Stock" : "Add Item"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* New Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-semibold text-ink">New Customer Details</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-muted-foreground hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>
            <form
              className="p-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCustomer.state) {
                  toast.error("Please select a delivery state.");
                  return;
                }
                pos.setCustomer(newCustomer);
                toast.success("Customer added to order");
                setShowCustomerModal(false);
              }}
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground block">Full Name</label>
                <input
                  required
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-border focus:border-ink focus:ring-1 focus:ring-ink outline-none text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground block">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-border focus:border-ink focus:ring-1 focus:ring-ink outline-none text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground block">
                  Phone Number
                </label>
                <input
                  required
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-border focus:border-ink focus:ring-1 focus:ring-ink outline-none text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground block">Address</label>
                <input
                  required
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-border focus:border-ink focus:ring-1 focus:ring-ink outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground block">City</label>
                  <input
                    required
                    type="text"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-border focus:border-ink focus:ring-1 focus:ring-ink outline-none text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground block">
                    State (Nigeria) *
                  </label>
                  <select
                    required
                    value={newCustomer.state}
                    onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-border bg-white focus:border-ink focus:ring-1 focus:ring-ink outline-none text-sm cursor-pointer"
                  >
                    <option value="">Select Nigerian State...</option>
                    {availableStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-10 bg-ink text-white font-semibold rounded-md hover:bg-black transition-colors cursor-pointer"
                >
                  Save & Add to Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Address Modal */}
      {showEditAddressModal && pos.customer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-semibold text-ink">Edit Customer Delivery Address</h3>
              <button
                onClick={() => setShowEditAddressModal(false)}
                className="text-muted-foreground hover:text-ink cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <form
              className="p-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!customerAddressForm.state) {
                  toast.error("Please select a delivery state.");
                  return;
                }
                pos.setCustomer({
                  ...pos.customer!,
                  address: customerAddressForm.address,
                  city: customerAddressForm.city,
                  state: customerAddressForm.state,
                });
                setCourierPricesLoaded(false);
                toast.success("Delivery address updated");
                setShowEditAddressModal(false);
              }}
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground block">
                  Delivery Street Address *
                </label>
                <input
                  required
                  type="text"
                  value={customerAddressForm.address}
                  onChange={(e) =>
                    setCustomerAddressForm({ ...customerAddressForm, address: e.target.value })
                  }
                  placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                  className="w-full h-10 px-3 rounded-md border border-border focus:border-ink focus:ring-1 focus:ring-ink outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground block">City *</label>
                  <input
                    required
                    type="text"
                    value={customerAddressForm.city}
                    onChange={(e) =>
                      setCustomerAddressForm({ ...customerAddressForm, city: e.target.value })
                    }
                    placeholder="e.g. Lekki / Ikeja"
                    className="w-full h-10 px-3 rounded-md border border-border focus:border-ink focus:ring-1 focus:ring-ink outline-none text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground block">
                    State (Nigeria) *
                  </label>
                  <select
                    required
                    value={customerAddressForm.state}
                    onChange={(e) =>
                      setCustomerAddressForm({ ...customerAddressForm, state: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-md border border-border bg-white focus:border-ink focus:ring-1 focus:ring-ink outline-none text-sm cursor-pointer"
                  >
                    <option value="">Select Nigerian State...</option>
                    {availableStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditAddressModal(false)}
                  className="px-4 h-10 rounded-md border border-border text-sm font-medium hover:bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 h-10 bg-ink text-white font-semibold text-sm rounded-md hover:bg-black transition-colors cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Filter Draw-Up Modal (sm:hidden) */}
      <div
        className={cn(
          "fixed inset-0 z-[110] sm:hidden transition-all duration-300",
          mobileFilterOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0 delay-100",
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-ink/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out",
            mobileFilterOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileFilterOpen(false)}
        />

        {/* Bottom Sheet Card */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 bg-white rounded-t-3xl p-6 shadow-2xl space-y-5 transition-transform duration-300 ease-in-out max-h-[85vh] overflow-y-auto",
            mobileFilterOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          {/* Handle Bar */}
          <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full mx-auto -mt-2 mb-2" />

          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <CustomFilterIcon className="size-5 text-brand-pink" />
              <h3 className="font-display font-bold text-lg text-ink">Filter Products</h3>
            </div>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-medium text-left transition-colors flex items-center justify-between cursor-pointer",
                    selectedCategory === "all"
                      ? "border-brand-pink bg-brand-pink/10 text-ink font-semibold"
                      : "border-border bg-white text-muted-foreground hover:bg-surface",
                  )}
                >
                  All Categories
                  {selectedCategory === "all" && <Check className="size-3.5 text-brand-pink" />}
                </button>
                {availableCategories.map((c: { slug: string; name: string }) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setSelectedCategory(c.slug)}
                    className={cn(
                      "p-3 rounded-xl border text-xs font-medium text-left transition-colors flex items-center justify-between cursor-pointer",
                      selectedCategory === c.slug
                        ? "border-brand-pink bg-brand-pink/10 text-ink font-semibold"
                        : "border-border bg-white text-muted-foreground hover:bg-surface",
                    )}
                  >
                    {c.name}
                    {selectedCategory === c.slug && <Check className="size-3.5 text-brand-pink" />}
                  </button>
                ))}
              </div>
            </div>

            {selectedCategory !== "all" && (
              <button
                onClick={() => setSelectedCategory("all")}
                className="w-full py-2.5 text-xs text-brand-pink font-semibold border border-brand-pink/30 rounded-xl hover:bg-brand-pink/10 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full h-11 bg-ink text-white font-semibold rounded-xl hover:bg-black transition-colors cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
