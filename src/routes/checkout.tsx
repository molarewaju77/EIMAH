import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Lock,
  ShoppingCart,
  User,
  Loader2,
  Truck,
  Store,
  WifiOff,
} from "lucide-react";
import { toast } from "react-toastify";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BrandOverlayLoader } from "@/components/site/BrandOverlayLoader";
import { useCart, useCartHydrated, type CartItem } from "@/lib/cart-store";
import { useCustomerAuth } from "@/lib/customer-store";
import { useAdminStore, type PickupStation } from "@/lib/admin-store";
import { formatNaira, generateTrackingId } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { orderService } from "@/services/orderService";
import { customerService } from "@/services/customerService";
import { fezDeliveryService } from "@/services/fezDeliveryService";
import { contentService } from "@/services/contentService";
import { AddressAutocompleteField } from "@/components/site/AddressAutocompleteField";
// --- PAYSTACK INTEGRATION (COMMENTED OUT FOR NOW - SWITCHED TO FLUTTERWAVE) ---
// import { initializePaystackPayment, verifyPaystackPayment } from "@/services/paystackService";

// --- FLUTTERWAVE INTEGRATION ---
import {
  initializeFlutterwavePayment,
  verifyFlutterwavePayment,
} from "@/services/flutterwaveService";
import { verifyItemsStock } from "@/lib/db/stock-check";

type CheckoutSearch = {
  // Legacy / Paystack params (kept for backward compatibility)
  reference?: string;
  trxref?: string;
  // Flutterwave redirect params
  tx_ref?: string;
  transaction_id?: string;
  charge_id?: string;
  id?: string;
  status?: string;
  buyNow?: boolean;
};

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => ({
    reference:
      search.reference !== undefined && search.reference !== null
        ? String(search.reference)
        : undefined,
    trxref:
      search.trxref !== undefined && search.trxref !== null ? String(search.trxref) : undefined,
    tx_ref:
      search.tx_ref !== undefined && search.tx_ref !== null ? String(search.tx_ref) : undefined,
    transaction_id:
      search.transaction_id !== undefined && search.transaction_id !== null
        ? String(search.transaction_id)
        : undefined,
    charge_id:
      search.charge_id !== undefined && search.charge_id !== null
        ? String(search.charge_id)
        : undefined,
    id: search.id !== undefined && search.id !== null ? String(search.id) : undefined,
    status:
      search.status !== undefined && search.status !== null ? String(search.status) : undefined,
    buyNow: search.buyNow === true || search.buyNow === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Checkout — EIMAH" },
      { name: "description", content: "Complete your EIMAH order." },
    ],
  }),
});

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

function normalizeNigerianState(googleState?: string, stateList = FEZ_DEFAULT_STATES): string {
  if (!googleState) return "";
  const s = googleState.toLowerCase().replace(/state/gi, "").trim();
  if (s.includes("federal capital") || s.includes("abuja") || s === "fct") {
    return "FCT";
  }
  const match = stateList.find(
    (ns) => ns.toLowerCase() === s || ns.toLowerCase().includes(s) || s.includes(ns.toLowerCase()),
  );
  return match || googleState;
}

function CheckoutPage() {
  const search = useSearch({ from: "/checkout" });
  // Flutterwave uses `tx_ref`, `transaction_id`, `status`. We also keep fallback to Paystack's `reference` or `trxref`.
  const paymentRef = search.tx_ref || search.reference || search.trxref;
  const transactionId = search.transaction_id || search.charge_id || search.id;
  const paystackRef = paymentRef;
  const isBuyNow = Boolean(search.buyNow);
  const [buyNowItem] = useState<CartItem | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored =
          sessionStorage.getItem("eimah_buy_now_item") ||
          localStorage.getItem("eimah_buy_now_item");
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const cartItems = useCart((s) => s.items);
  const items: CartItem[] = isBuyNow && buyNowItem ? [buyNowItem] : cartItems;
  const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);
  const clear = useCart((s) => s.clear);
  const nav = useNavigate();
  const [availableStates, setAvailableStates] = useState<string[]>(FEZ_DEFAULT_STATES);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [estimatedTime, setEstimatedTime] = useState<string>("24 – 48 Hours");
  const [pickupStations, setPickupStations] = useState<PickupStation[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [stationsLoaded, setStationsLoaded] = useState(false);
  const [stationsError, setStationsError] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState("");
  const selectedStationObj = pickupStations.find((ps) => ps.id === selectedStation);
  const pickupFee = deliveryMethod === "pickup" ? selectedStationObj?.fee || 0 : 0;
  const total = subtotal + (deliveryMethod === "pickup" ? pickupFee : shippingCost || 0);

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    country: "Nigeria",
    shippingPhone: "",
    diffBilling: false,
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingCountry: "Nigeria",
    note: "",
  });

  const [placed, setPlaced] = useState<string | null>(null);
  const [placedTrackingId, setPlacedTrackingId] = useState<string | null>(null);
  const [showItems, setShowItems] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pricesLoaded, setPricesLoaded] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [priceFetchError, setPriceFetchError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Helper to update form, clear relevant error, and reset calculated delivery price
  const updateForm = (patch: Partial<typeof form> | ((prev: typeof form) => typeof form)) => {
    setForm((prev) => {
      const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      return next;
    });
    setPricesLoaded(false);
    setPriceFetchError(null);
    setShippingCost(null);

    // Auto-clear validation errors for edited fields
    if (typeof patch !== "function") {
      setErrors((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(patch)) {
          delete next[key];
        }
        return next;
      });
    }
  };

  const { user } = useCustomerAuth();

  // Pre-fill customer details when logged in
  useEffect(() => {
    if (user) {
      const parts = user.name.split(" ");
      setForm((prev) => ({
        ...prev,
        email: prev.email || user.email,
        firstName: prev.firstName || parts[0] || "",
        lastName: prev.lastName || parts.slice(1).join(" ") || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // Pre-warm Fez authentication and load active delivery states on mount
  useEffect(() => {
    fezDeliveryService
      .getStates()
      .then((states) => {
        if (states && states.length > 0) {
          setAvailableStates(states);
        }
      })
      .catch((err) => {
        console.warn("[Checkout] Failed to load Fez states, using default list:", err);
      });
  }, []);

  // Fetch pickup stations on-demand when the user activates the Pick-up Station tab or clicks retry
  const loadPickupStations = async () => {
    setLoadingStations(true);
    setStationsError(null);
    try {
      const stations = await contentService.getPickupStations();
      if (stations && stations.length > 0) {
        setPickupStations(stations);
        setSelectedStation((prev) => {
          if (prev && stations.some((s) => s.id === prev)) return prev;
          return stations[0].id;
        });
      } else {
        setPickupStations([]);
        setSelectedStation("");
      }
      setStationsLoaded(true);
    } catch (err: any) {
      console.warn("[Checkout] Failed to load pickup stations from DB:", err);
      setStationsError(
        "Network connection error while loading pick-up stations. Please check your network and try again.",
      );
      setPickupStations([]);
      setSelectedStation("");
    } finally {
      setLoadingStations(false);
    }
  };

  useEffect(() => {
    if (deliveryMethod === "pickup" && !stationsLoaded && !loadingStations && !stationsError) {
      loadPickupStations();
    }
  }, [deliveryMethod, stationsLoaded, loadingStations, stationsError]);

  // Reset submitting state and dismiss pending toasts when returning to the checkout page via browser Back button
  useEffect(() => {
    const handlePageRestored = () => {
      if (!paystackRef) {
        setIsSubmitting(false);
        toast.dismiss();
      }
    };

    window.addEventListener("pageshow", handlePageRestored);
    window.addEventListener("focus", handlePageRestored);
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && !paystackRef) {
        handlePageRestored();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("pageshow", handlePageRestored);
      window.removeEventListener("focus", handlePageRestored);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [paystackRef]);

  /*
  // --- PAYSTACK VERIFICATION (COMMENTED OUT FOR NOW - SWITCHED TO FLUTTERWAVE) ---
  useEffect(() => {
    if (!paystackRef || placed) return;

    let isMounted = true;
    setIsVerifying(true);

    async function fulfillPayment() {
      try {
        const verifyRes = await verifyPaystackPayment({ data: paystackRef! });

        if (verifyRes?.status === "success") {
          const orderId = paystackRef!;

          // 1. Check if webhook already processed and created this order
          const existingOrder = await orderService.getById(orderId);
          if (existingOrder) {
            console.log(
              `[Checkout] ℹ️ Order ${orderId} already created by webhook. Finalizing client UI.`,
            );
            sessionStorage.removeItem(`pending_order_${orderId}`);
            localStorage.removeItem(`pending_order_${orderId}`);
            clear();

            if (isMounted) {
              setPlaced(orderId);
              setPlacedTrackingId(existingOrder.trackingId || orderId);
              toast.success("Payment verified! Order placed successfully.");
            }
            return;
          }

          // 2. Retrieve draft order from storage or fallback to Paystack metadata
          const savedDraftStr =
            sessionStorage.getItem(`pending_order_${paystackRef}`) ||
            localStorage.getItem(`pending_order_${paystackRef}`);

          const draft = savedDraftStr ? JSON.parse(savedDraftStr) : null;
          const meta = verifyRes.metadata || {};

          console.log("[Checkout] 📋 Draft/Metadata restore:", {
            storageKey: `pending_order_${paystackRef}`,
            draftFound: !!draft,
            metaFound: !!verifyRes.metadata,
            itemCount: draft?.items?.length || meta?.items?.length || 0,
          });

          const customerEmail = verifyRes.customer?.email || draft?.form?.email || meta.email || "";
          const customerName =
            draft?.fullName ||
            meta.customerName ||
            `${verifyRes.customer?.first_name || ""} ${verifyRes.customer?.last_name || ""}`.trim() ||
            "Valued Customer";
          const customerPhone =
            draft?.form?.shippingPhone ||
            draft?.form?.phone ||
            meta.phone ||
            verifyRes.customer?.phone ||
            "";
          const destinationAddress =
            draft?.fullAddress ||
            meta.address ||
            `${draft?.form?.address || ""}, ${draft?.form?.city || ""}, ${draft?.form?.state || ""}`;
          const orderItems = draft?.items || meta.items || items || [];
          const orderTotal =
            draft?.total || meta.total || (verifyRes.amount ? verifyRes.amount / 100 : total);
          const orderSubtotal = draft?.subtotal || meta.subtotal || subtotal;
          const orderFee =
            draft?.calculatedFee ?? meta.calculatedFee ?? Math.max(0, orderTotal - orderSubtotal);
          const dMethod = draft?.deliveryMethod || meta.deliveryMethod || "delivery";
          const deliveryMethod =
            dMethod === "pickup" || dMethod === "Pickup Station" ? "Pickup Station" : "Courier";
          const trackingId = meta.trackingId || generateTrackingId(deliveryMethod);

          const formattedOrderItems = orderItems.map((i: any) => ({
            id: i.id || i.productId || i.product?.id,
            productId: i.id || i.productId || i.product?.id,
            name: i.name,
            qty: Number(i.qty || 1),
            price: Number(i.price || 0),
            subtotal: Number(i.qty || 1) * Number(i.price || 0),
            variant:
              i.variant ||
              (i.selectedOptions ? Object.values(i.selectedOptions).join(", ") : undefined),
            variantId: i.variantId || i.selectedVariant?.id,
            weight:
              i.weight !== undefined && i.weight !== null
                ? Number(i.weight)
                : Number(i.product?.weight) || 0,
          }));

          // 3. Create order in Supabase
          const savedOrder = await orderService.create({
            id: orderId,
            trackingId: trackingId,
            customer: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: destinationAddress,
            total: orderTotal,
            subtotal: orderSubtotal,
            shippingFee: orderFee,
            status: "Paid",
            paymentStatus: "Successful",
            deliveryMethod: deliveryMethod,
            items: formattedOrderItems,
            trackingHistory: [
              { status: "Paid", date: new Date().toISOString(), admin: "Paystack Payment Gateway" },
            ],
            date: new Date().toISOString(),
          });

          // 4. Upsert customer profile
          await customerService.create({
            id: `CUST-${customerPhone.replace(/\D/g, "") || Math.floor(Math.random() * 10000)}`,
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            orders: 1,
            spent: orderTotal,
            address: destinationAddress,
            city: draft?.form?.city || meta.city || "",
            state: draft?.form?.state || meta.state || "",
            status: "New",
            lastOrder: new Date().toISOString(),
            dateJoined: new Date().toISOString(),
            notes: draft?.form?.note || meta.note || "Paid via Paystack Standard Checkout",
          });

          // 5. Create transaction record for Admin Payments dashboard
          const rawChannel = (verifyRes.channel || "").toLowerCase();
          const paymentMethod = rawChannel.includes("card")
            ? "Card"
            : rawChannel.includes("transfer") || rawChannel.includes("bank")
              ? "Bank Transfer"
              : rawChannel.includes("ussd")
                ? "USSD"
                : "Card";

          try {
            await contentService.createTransaction({
              id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
              customer: customerName,
              orderId: orderId,
              amount: orderTotal,
              method: paymentMethod,
              status: "Successful",
              date: new Date().toISOString(),
            });
          } catch (txnErr) {
            console.warn("[Transaction Save Warning]", txnErr);
          }

          // Clean up storage & cart
          sessionStorage.removeItem(`pending_order_${orderId}`);
          localStorage.removeItem(`pending_order_${orderId}`);
          clear();

          if (isMounted) {
            setPlaced(orderId);
            setPlacedTrackingId(savedOrder?.trackingId || trackingId);
            toast.success("Payment verified! Order placed successfully.");
          }
        } else {
          toast.error(`Payment was not successful (Status: ${verifyRes?.status || "failed"}).`);
        }
      } catch (err: any) {
        console.error("[Paystack Verification Error]", err);
        toast.error(`Payment verification failed: ${err.message || "Please try again."}`);
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    }

    fulfillPayment();

    return () => {
      isMounted = false;
    };
  }, [paystackRef]);
  */

  // --- FLUTTERWAVE VERIFICATION ---
  // Verify Flutterwave redirect payment callback (via tx_ref / transaction_id)
  useEffect(() => {
    if (!paymentRef || placed) return;

    let isMounted = true;
    setIsVerifying(true);

    async function fulfillPayment() {
      try {
        const orderId = paymentRef!;

        // 1. Check if webhook already processed and created this order
        const existingOrder = await orderService.getById(orderId);
        if (existingOrder) {
          console.log(
            `[Checkout] ℹ️ Order ${orderId} already created by Flutterwave webhook. Finalizing client UI.`,
          );
          sessionStorage.removeItem(`pending_order_${orderId}`);
          localStorage.removeItem(`pending_order_${orderId}`);
          const isBuyNowOrder = Boolean(
            search.buyNow || sessionStorage.getItem("eimah_buy_now_item"),
          );
          if (isBuyNowOrder) {
            sessionStorage.removeItem("eimah_buy_now_item");
            localStorage.removeItem("eimah_buy_now_item");
          } else {
            clear();
          }

          if (isMounted) {
            setPlaced(orderId);
            setPlacedTrackingId(existingOrder.trackingId || orderId);
            toast.success("Payment verified! Order placed successfully.");
          }
          return;
        }

        // 2. Perform payment verification via Edge Function
        const verifyRes = await verifyFlutterwavePayment({
          data: orderId,
          transaction_id: transactionId,
        });

        const statusLower = String(verifyRes?.status || "").toLowerCase();
        const isVerifiedPaid =
          statusLower === "successful" ||
          statusLower === "succeeded" ||
          statusLower === "completed";

        if (isVerifiedPaid) {
          // 2. Retrieve draft order from storage or fallback to Flutterwave metadata
          const savedDraftStr =
            sessionStorage.getItem(`pending_order_${paymentRef}`) ||
            localStorage.getItem(`pending_order_${paymentRef}`);

          const draft = savedDraftStr ? JSON.parse(savedDraftStr) : null;
          const meta = (verifyRes.meta as Record<string, any>) || {};

          console.log("[Checkout] 📋 Draft/Metadata restore (Flutterwave):", {
            storageKey: `pending_order_${paymentRef}`,
            draftFound: !!draft,
            metaFound: !!verifyRes.meta,
            itemCount: draft?.items?.length || meta?.items?.length || 0,
          });

          const customerEmail = verifyRes.customer?.email || draft?.form?.email || meta.email || "";
          const customerName =
            draft?.fullName || meta.customerName || verifyRes.customer?.name || "Valued Customer";
          const customerPhone =
            draft?.form?.shippingPhone ||
            draft?.form?.phone ||
            meta.phone ||
            verifyRes.customer?.phone ||
            "";
          const destinationAddress =
            draft?.fullAddress ||
            meta.address ||
            `${draft?.form?.address || ""}, ${draft?.form?.city || ""}, ${draft?.form?.state || ""}`;
          const orderItems = draft?.items || meta.items || items || [];
          const orderTotal =
            draft?.total || meta.total || (verifyRes.amount ? Number(verifyRes.amount) : total);
          const orderSubtotal = draft?.subtotal || meta.subtotal || subtotal;
          const orderFee =
            draft?.calculatedFee ?? meta.calculatedFee ?? Math.max(0, orderTotal - orderSubtotal);
          const dMethod = draft?.deliveryMethod || meta.deliveryMethod || "delivery";
          const deliveryMethod =
            dMethod === "pickup" || dMethod === "Pickup Station" ? "Pickup Station" : "Courier";
          const trackingId = meta.trackingId || generateTrackingId(deliveryMethod);

          const formattedOrderItems = orderItems.map((i: any) => ({
            id: i.id || i.productId || i.product?.id,
            productId: i.id || i.productId || i.product?.id,
            name: i.name,
            qty: Number(i.qty || 1),
            price: Number(i.price || 0),
            subtotal: Number(i.qty || 1) * Number(i.price || 0),
            variant:
              i.variant ||
              (i.selectedOptions ? Object.values(i.selectedOptions).join(", ") : undefined),
            variantId: i.variantId || i.selectedVariant?.id,
            weight:
              i.weight !== undefined && i.weight !== null
                ? Number(i.weight)
                : Number(i.product?.weight) || 0,
          }));

          // 3. Create order in Supabase
          const savedOrder = await orderService.create({
            id: orderId,
            trackingId: trackingId,
            customer: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: destinationAddress,
            total: orderTotal,
            subtotal: orderSubtotal,
            shippingFee: orderFee,
            status: "Paid",
            paymentStatus: "Successful",
            deliveryMethod: deliveryMethod,
            items: formattedOrderItems,
            trackingHistory: [
              {
                status: "Paid",
                date: new Date().toISOString(),
                admin: "Flutterwave Payment Gateway",
              },
            ],
            date: new Date().toISOString(),
          });

          // 4. Upsert customer profile
          await customerService.create({
            id: `CUST-${customerPhone.replace(/\D/g, "") || Math.floor(Math.random() * 10000)}`,
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            orders: 1,
            spent: orderTotal,
            address: destinationAddress,
            city: draft?.form?.city || meta.city || "",
            state: draft?.form?.state || meta.state || "",
            status: "New",
            lastOrder: new Date().toISOString(),
            dateJoined: new Date().toISOString(),
            notes: draft?.form?.note || meta.note || "Paid via Flutterwave Hosted Checkout",
          });

          // 5. Create transaction record for Admin Payments dashboard
          const rawChannel = String(verifyRes.payment_type || "").toLowerCase();
          const paymentMethod = rawChannel.includes("card")
            ? "Card"
            : rawChannel.includes("transfer") || rawChannel.includes("bank")
              ? "Bank Transfer"
              : rawChannel.includes("ussd")
                ? "USSD"
                : "Card";

          try {
            await contentService.createTransaction({
              id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
              customer: customerName,
              orderId: orderId,
              amount: orderTotal,
              method: paymentMethod,
              status: "Successful",
              date: new Date().toISOString(),
            });
          } catch (txnErr) {
            console.warn("[Transaction Save Warning]", txnErr);
          }

          // Clean up storage & cart
          sessionStorage.removeItem(`pending_order_${orderId}`);
          localStorage.removeItem(`pending_order_${orderId}`);
          const isBuyNowOrder = Boolean(draft?.isBuyNow || search.buyNow);
          if (isBuyNowOrder) {
            sessionStorage.removeItem("eimah_buy_now_item");
            localStorage.removeItem("eimah_buy_now_item");
          } else {
            clear();
          }

          if (isMounted) {
            setPlaced(orderId);
            setPlacedTrackingId(savedOrder?.trackingId || trackingId);
            toast.success("Payment verified! Order placed successfully.");
          }
        } else {
          toast.error("Payment was not completed.");
        }
      } catch (err: any) {
        console.error("[Flutterwave Verification Error]", err);
        toast.error("Payment failed or was not completed.");
      } finally {
        if (typeof window !== "undefined") {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    }

    fulfillPayment();

    return () => {
      isMounted = false;
    };
  }, [paymentRef, transactionId]);

  const isCartHydrated = useCartHydrated();

  if (isVerifying) {
    return (
      <SiteLayout>
        <div className="container-eimah py-32 text-center max-w-md mx-auto">
          <BrandOverlayLoader show mode="block" />
          <h1 className="font-display font-bold text-3xl mt-6">Verifying payment...</h1>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            Please wait while we verify your payment and process your order.
          </p>
        </div>
      </SiteLayout>
    );
  }

  if (placed) {
    const finalTracking = placedTrackingId || placed;
    return (
      <SiteLayout>
        <div className="container-eimah py-24 max-w-lg text-center">
          <div className="mx-auto h-16 w-16 grid place-items-center rounded-full bg-brand-lime">
            <Check className="size-7 text-ink" />
          </div>
          <h1 className="mt-6 font-display font-bold text-3xl md:text-4xl">Order placed</h1>
          <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed max-w-md mx-auto">
            Thank you for shopping with EIMAH. Your order{" "}
            <span className="font-semibold text-foreground font-mono">{finalTracking}</span> has
            been successfully received.
          </p>
          <div className="mt-8 flex gap-3 justify-center">
            <Link
              to="/track"
              search={{ id: finalTracking }}
              className="bg-foreground text-background font-display font-semibold px-6 py-3 rounded-full hover:bg-brand-pink hover:text-ink transition-colors text-sm"
            >
              Track order
            </Link>
            <Link
              to="/shop"
              className="border border-foreground font-display font-semibold px-6 py-3 rounded-full text-sm hover:bg-secondary transition-colors"
            >
              Keep shopping
            </Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  // If cart is still rehydrating from local storage on refresh, show the brand loader
  if (!isBuyNow && !isCartHydrated && !paystackRef) {
    return (
      <SiteLayout>
        <div className="container-eimah py-32 flex flex-col items-center justify-center min-h-[60vh]">
          <BrandOverlayLoader show mode="block" />
        </div>
      </SiteLayout>
    );
  }

  if ((isBuyNow ? !buyNowItem : isCartHydrated && items.length === 0) && !paystackRef) {
    return (
      <SiteLayout>
        <div className="container-eimah py-24 text-center">
          <h1 className="font-display font-bold text-3xl">Your bag is empty.</h1>
          <Link
            to="/shop"
            className="mt-6 inline-flex bg-foreground text-background font-display font-semibold px-6 py-3 rounded-full"
          >
            Shop now
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const handleGetPrices = async () => {
    if (!form.address || !form.city || !form.state) {
      toast.error("Please enter your address, city, and state to get delivery prices.");
      return;
    }
    setLoadingPrices(true);
    setPriceFetchError(null);
    try {
      const calculatedWeight = items.reduce(
        (sum, item: any) =>
          sum + (Number(item.qty) || 0) * (Number(item.weight ?? item.product?.weight) || 0),
        0,
      );
      const fezQuote = await fezDeliveryService.getDeliveryCost({
        recipientState: form.state,
        recipientCity: form.city,
        weightInKg: calculatedWeight,
        itemsValue: subtotal,
      });

      const finalCost = fezQuote.cost;
      setShippingCost(finalCost);
      setEstimatedTime(fezQuote.estimatedDelivery);
      setPricesLoaded(true);
    } catch (err: any) {
      setPricesLoaded(false);
      const rawMsg = String(err?.message || err || "");
      const isNetwork =
        !navigator.onLine ||
        /fetch|network|load failed|timeout|connection|econnrefused|failed to fetch/i.test(rawMsg);
      const friendlyMsg = isNetwork
        ? "Unable to get delivery price . Please check your internet connection and try again."
        : rawMsg && !rawMsg.includes("fetch") && !rawMsg.includes("Error:")
          ? rawMsg
          : "Unable to calculate delivery fee at the moment. Please try again.";

      setPriceFetchError(friendlyMsg);
      toast.error(friendlyMsg);
    } finally {
      setLoadingPrices(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // 1. Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g. you@example.com).";
    }

    // 2. First Name validation (letters only)
    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    } else if (form.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters.";
    } else if (!/^[A-Za-z\s'-]+$/.test(form.firstName.trim())) {
      newErrors.firstName = "First name must contain letters only.";
    }

    // 3. Last Name validation (letters only)
    if (!form.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    } else if (form.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters.";
    } else if (!/^[A-Za-z\s'-]+$/.test(form.lastName.trim())) {
      newErrors.lastName = "Last name must contain letters only.";
    }

    // 4. Phone Number validation (numbers only, min 11 digits)
    const cleanPhone = form.phone.trim().replace(/[\s\-()]/g, "");
    const phoneDigits = cleanPhone.replace(/\D/g, "");
    if (!cleanPhone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\+?[0-9]{11,15}$/.test(cleanPhone) || phoneDigits.length < 11) {
      newErrors.phone = "Phone number must be at least 11 digits (e.g. 08000000000).";
    }

    // 5. Delivery method specific validation
    if (deliveryMethod === "delivery") {
      if (!form.address.trim()) {
        newErrors.address = "Street address is required.";
      } else if (form.address.trim().length < 5) {
        newErrors.address = "Please enter your complete street address.";
      }

      if (!form.state.trim()) {
        newErrors.state = "Please select a delivery state.";
      }

      if (!form.city.trim()) {
        newErrors.city = "City / Area is required.";
      }

      const cleanShippingPhone = form.shippingPhone.trim().replace(/[\s\-()]/g, "");
      const shippingPhoneDigits = cleanShippingPhone.replace(/\D/g, "");
      if (!cleanShippingPhone) {
        newErrors.shippingPhone = "Rider contact phone number is required.";
      } else if (!/^\+?[0-9]{11,15}$/.test(cleanShippingPhone) || shippingPhoneDigits.length < 11) {
        newErrors.shippingPhone = "Rider phone must be at least 11 digits (e.g. 08012345678).";
      }

      if (form.diffBilling) {
        if (!form.billingAddress.trim()) {
          newErrors.billingAddress = "Billing street address is required.";
        }
        if (!form.billingState.trim()) {
          newErrors.billingState = "Please select a billing state.";
        }
        if (!form.billingCity.trim()) {
          newErrors.billingCity = "Billing city / area is required.";
        }
      }

      if (Object.keys(newErrors).length === 0 && (!pricesLoaded || shippingCost === null)) {
        toast.error("Please click 'Get Delivery Prices' to calculate your delivery fee.");
        const calcBtn = document.getElementById("fez-calc-box");
        if (calcBtn) calcBtn.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    } else {
      if (!selectedStation) {
        newErrors.pickupStation = "Please select a pick-up station to continue.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields correctly.");
      const firstErrorKey = Object.keys(newErrors)[0];
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setErrors({});

    setIsSubmitting(true);
    const orderId = "EMH-" + Math.floor(10000 + Math.random() * 90000);
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    const fullAddress =
      deliveryMethod === "pickup"
        ? `Pick-up Station: ${selectedStationObj?.name || "Pickup Hub"}, ${selectedStationObj?.address || ""}`
        : `${form.address}${form.apartment ? `, ${form.apartment}` : ""}, ${form.city}, ${form.state}`;
    const calculatedFee = deliveryMethod === "pickup" ? pickupFee : shippingCost || 0;

    // Get current items for this order: if Buy Now, use buyNowItem; otherwise freshest cart snapshot
    const currentCartItems = isBuyNow && buyNowItem ? [buyNowItem] : useCart.getState().items;

    // Final Live Stock Verification before payment gateway redirection:
    try {
      const stockRes = await verifyItemsStock(
        currentCartItems.map((i: any) => ({
          cartItemId: i.cartItemId,
          productId: i.id || i.productId,
          name: i.name,
          image: i.image,
          slug: i.slug,
          qty: i.qty,
          selectedOptions: i.selectedOptions,
          variantId: i.variantId,
        })),
      );

      if (!stockRes.isValid) {
        setIsSubmitting(false);
        const first = stockRes.conflicts[0];
        if (first.isOutOfStock) {
          toast.error(`"${first.name}" has just sold out and is no longer available.`);
        } else {
          toast.error(
            `Only ${first.availableStock} available for "${first.name}". Please adjust quantity.`,
          );
        }
        return;
      }
    } catch (stockErr) {
      console.warn("[Checkout] Stock pre-check warning:", stockErr);
    }

    const currentSubtotal = currentCartItems.reduce((n, i) => n + i.qty * i.price, 0);
    const currentTotal = currentSubtotal + calculatedFee;

    // Save pending draft for callback fulfillment
    const orderDraft = {
      orderId,
      fullName,
      fullAddress,
      form,
      items: currentCartItems,
      subtotal: currentSubtotal,
      total: currentTotal,
      deliveryMethod,
      calculatedFee,
      selectedStationObj,
      estimatedTime,
      isBuyNow: Boolean(isBuyNow),
    };

    console.log("[Checkout] 💾 Saving order draft:", {
      orderId,
      itemCount: currentCartItems.length,
      subtotal: currentSubtotal,
      total: currentTotal,
      itemNames: currentCartItems.map((i) => `${i.qty}x ${i.name}`),
    });

    sessionStorage.setItem(`pending_order_${orderId}`, JSON.stringify(orderDraft));
    localStorage.setItem(`pending_order_${orderId}`, JSON.stringify(orderDraft));

    try {
      /*
      // --- PAYSTACK CHECKOUT INITIATION (COMMENTED OUT FOR NOW - SWITCHED TO FLUTTERWAVE) ---
      const callbackUrl = `${window.location.origin}/checkout?reference=${orderId}`;
      const res = await initializePaystackPayment({
        data: {
          email: form.email,
          amount: currentTotal,
          orderId,
          callbackUrl,
          metadata: {
            orderId,
            customerName: fullName,
            email: form.email,
            phone: form.shippingPhone || form.phone,
            address: fullAddress,
            city: form.city,
            state: form.state,
            deliveryMethod: deliveryMethod === "pickup" ? "Pickup Station" : "Courier",
            calculatedFee,
            subtotal: currentSubtotal,
            total: currentTotal,
            note: form.note || "",
            items: currentCartItems.map((i) => ({
              name: i.name,
              qty: Number(i.qty || 1),
              price: Number(i.price || 0),
              subtotal: Number(i.qty || 1) * Number(i.price || 0),
              variant: i.selectedOptions ? Object.values(i.selectedOptions).join(", ") : undefined,
              weight: Number(i.weight || 0),
            })),
            custom_fields: [
              { display_name: "Order ID", variable_name: "order_id", value: orderId },
              { display_name: "Customer Name", variable_name: "customer_name", value: fullName },
              {
                display_name: "Delivery Method",
                variable_name: "delivery_method",
                value: deliveryMethod === "pickup" ? "Pickup Station" : "Courier",
              },
            ],
          },
        },
      });

      if (res?.authorization_url) {
        toast.info("Redirecting to Paystack secure checkout...", { autoClose: 3500 });
        window.location.href = res.authorization_url;
        setTimeout(() => {
          setIsSubmitting(false);
        }, 8000);
      } else {
        throw new Error("Unable to retrieve Paystack authorization link.");
      }
      */

      // --- FLUTTERWAVE CHECKOUT INITIATION ---
      const callbackUrl = isBuyNow
        ? `${window.location.origin}/checkout?buyNow=true`
        : `${window.location.origin}/checkout`;
      sessionStorage.setItem("last_flw_order_id", orderId);
      localStorage.setItem("last_flw_order_id", orderId);

      const res = await initializeFlutterwavePayment({
        data: {
          email: form.email,
          amount: currentTotal,
          orderId,
          callbackUrl,
          customerName: fullName,
          phone: form.shippingPhone || form.phone,
          metadata: {
            orderId,
            customerName: fullName,
            email: form.email,
            phone: form.shippingPhone || form.phone,
            address: fullAddress,
            city: form.city,
            state: form.state,
            deliveryMethod: deliveryMethod === "pickup" ? "Pickup Station" : "Courier",
            calculatedFee: Number(calculatedFee || 0),
            subtotal: Number(currentSubtotal || 0),
            total: Number(currentTotal || 0),
            note: form.note || "",
            itemCount: Number(currentCartItems.length || 0),
          },
        },
      });

      if (res?.link) {
        toast.info("Redirecting to Flutterwave secure checkout...", { autoClose: 3500 });
        window.location.href = res.link;
        // Safety timeout to reset button if browser stays on page or user cancels before navigation completes
        setTimeout(() => {
          setIsSubmitting(false);
        }, 8000);
      } else {
        throw new Error("Unable to retrieve Flutterwave payment link.");
      }
    } catch (err: any) {
      console.error("[Checkout error]", err);
      toast.error(`Checkout initiation failed: ${err.message || String(err)}`);
      setIsSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      {/* Brand Loader overlay while creating order & redirecting to Flutterwave */}
      <BrandOverlayLoader
        show={isSubmitting}
        mode="fixed"
        label="Redirecting to secure payment..."
      />

      <div className="lg:hidden bg-background text-center py-6 border-b border-border/50">
        <h1 className="font-display font-bold text-4xl tracking-tight">Checkout</h1>
        <p className="text-muted-foreground mt-1 text-sm">Where to deliver it?</p>
      </div>

      <div className="flex flex-col-reverse lg:flex-row min-h-screen">
        <div className="flex-1 lg:pl-10 xl:pl-20 py-8 lg:py-10 pr-4 pl-4 lg:pr-14 max-w-4xl mx-auto lg:mx-0 w-full">
          <div className="hidden lg:block text-center mb-6">
            <h1 className="font-display font-bold text-5xl md:text-6xl tracking-tight text-ink">
              Checkout
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Where to deliver it?</p>
          </div>
          <hr className="hidden lg:block border-t-[3px] border-brand-pink mb-6" />

          {/* <div className="mb-4 text-sm text-left text-muted-foreground border-b border-border/50 pb-4 flex flex-wrap items-center gap-1">
            Returning customer?
            <button
              type="button"
              onClick={() => setShowLogin(!showLogin)}
              className="text-brand-pink font-semibold hover:underline flex items-center gap-1.5 ml-1"
            >
              <User className="size-3.5" /> Click here to login
              {showLogin ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
          </div> */}

          <div
            className={cn(
              "overflow-hidden transition-all duration-500 ease-in-out",
              showLogin ? "max-h-[500px] mb-8" : "max-h-0 mb-0",
            )}
          >
            <div className="p-6 rounded-r-md border-y border-r border-l-4 border-l-brand-pink border-y-border border-r-border bg-surface">
              <p className="text-sm text-muted-foreground mb-4">
                If you have shopped with us before, please enter your details below. If you are a
                new customer, please proceed to the Billing section.
              </p>
              <div className="space-y-4">
                <Field label="Username or email" value="" onChange={() => {}} required />
                <Field label="Password" value="" onChange={() => {}} required type="password" />
                <div className="flex flex-row items-center justify-between gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-border text-brand-pink focus:ring-brand-pink accent-brand-pink"
                    />
                    Remember me
                  </label>
                  <button type="button" className="text-sm text-brand-pink hover:underline">
                    Lost your password?
                  </button>
                </div>
                <button
                  type="button"
                  className="px-10 h-12 bg-ink text-white font-semibold rounded-md hover:bg-black transition-colors mt-4"
                >
                  Login
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-10">
            {/* 1. Contact Information */}
            <section>
              <h2 className="font-display font-semibold text-xl mb-4 text-ink border-b border-border/50 pb-2">
                Contact Information
              </h2>
              <div className="space-y-4">
                <Field
                  id="field-email"
                  label="Email"
                  value={form.email}
                  onChange={(v) => updateForm({ email: v })}
                  required
                  type="email"
                  placeholder="Email Address"
                  error={errors.email}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    id="field-firstName"
                    label="First name"
                    value={form.firstName}
                    onChange={(v) => updateForm({ firstName: v })}
                    required
                    placeholder="First Name"
                    onlyLetters={true}
                    error={errors.firstName}
                  />
                  <Field
                    id="field-lastName"
                    label="Last name"
                    value={form.lastName}
                    onChange={(v) => updateForm({ lastName: v })}
                    required
                    placeholder="Last Name"
                    onlyLetters={true}
                    error={errors.lastName}
                  />
                </div>
                <Field
                  id="field-phone"
                  label="Phone Number"
                  value={form.phone}
                  onChange={(v) => updateForm({ phone: v })}
                  required
                  placeholder="Phone Number"
                  onlyNumbers={true}
                  error={errors.phone}
                />
              </div>
            </section>

            {/* 2. Delivery Method Selection */}
            <section>
              <h2 className="font-display font-semibold text-xl mb-4 text-ink border-b border-border/50 pb-2">
                Delivery Method
              </h2>

              {/* Segmented Delivery Method Tabs */}
              <div className="grid grid-cols-2 p-1 bg-surface-2/90 rounded-xl border border-border/70 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryMethod("delivery");
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.pickupStation;
                      return next;
                    });
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg font-semibold text-sm transition-all cursor-pointer select-none",
                    deliveryMethod === "delivery"
                      ? "bg-background text-foreground shadow-sm border border-border/50 ring-1 ring-black/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40",
                  )}
                >
                  <Truck
                    className={cn(
                      "size-4 shrink-0",
                      deliveryMethod === "delivery" ? "text-brand-pink" : "",
                    )}
                  />
                  <span>Courier Delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeliveryMethod("pickup");
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.address;
                      delete next.state;
                      delete next.city;
                      delete next.shippingPhone;
                      return next;
                    });
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg font-semibold text-sm transition-all cursor-pointer select-none",
                    deliveryMethod === "pickup"
                      ? "bg-background text-foreground shadow-sm border border-border/50 ring-1 ring-black/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40",
                  )}
                >
                  <Store
                    className={cn(
                      "size-4 shrink-0",
                      deliveryMethod === "pickup" ? "text-brand-pink" : "",
                    )}
                  />
                  <span>Pick-up Station</span>
                </button>
              </div>

              {/* Conditional Content based on delivery method */}
              {deliveryMethod === "delivery" ? (
                <div className="space-y-6 pt-2">
                  <h3 className="font-semibold text-base text-ink">Delivery Address</h3>
                  <div className="space-y-4">
                    <div id="field-address">
                      <AddressAutocompleteField
                        label="Street address"
                        value={form.address}
                        onChange={(v) => updateForm({ address: v })}
                        onAddressSelect={({ streetAddress, city, state }) => {
                          updateForm((prev) => ({
                            ...prev,
                            address: streetAddress,
                            city: city || prev.city,
                            state: normalizeNigerianState(state, availableStates) || prev.state,
                          }));
                        }}
                        placeholder="Street Address"
                        required
                        error={errors.address}
                      />
                    </div>
                    <Field
                      label="Apartment, suite, unit, etc. (optional)"
                      value={form.apartment}
                      onChange={(v) => updateForm({ apartment: v })}
                      placeholder="Apartment, Suite, Unit, etc. (Optional)"
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <SelectField
                        id="field-state"
                        label="State"
                        value={form.state}
                        onChange={(v) => updateForm({ state: v })}
                        options={["", ...availableStates]}
                        required
                        error={errors.state}
                      />
                      <Field
                        id="field-city"
                        label="City / Area"
                        value={form.city}
                        onChange={(v) => updateForm({ city: v })}
                        placeholder="City Or Town"
                        required
                        error={errors.city}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <SelectField
                        label="Country / Region"
                        value={form.country}
                        onChange={(v) => updateForm({ country: v })}
                        options={["Nigeria"]}
                        required
                      />
                      <Field
                        id="field-shippingPhone"
                        label="Shipping Phone (Rider Contact)"
                        value={form.shippingPhone}
                        onChange={(v) => updateForm({ shippingPhone: v })}
                        required
                        placeholder="Rider Contact Phone Number"
                        onlyNumbers={true}
                        error={errors.shippingPhone}
                      />
                    </div>
                  </div>

                  {/* Fez Price Calculator */}
                  <div className="pt-2" id="fez-calc-box">
                    {loadingPrices ? (
                      <div className="space-y-3 animate-pulse bg-background border border-border p-5 rounded-md">
                        <p className="text-sm font-semibold mb-2">Calculating delivery fee...</p>
                        <div className="h-10 bg-border/40 rounded w-full"></div>
                        <div className="h-10 bg-border/40 rounded w-full"></div>
                      </div>
                    ) : !pricesLoaded ? (
                      <>
                        {priceFetchError ? (
                          <div className="rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 p-3.5 text-xs flex gap-2.5 items-start mb-4">
                            <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                            <p className="leading-relaxed">{priceFetchError}</p>
                          </div>
                        ) : (
                          <div className="rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 p-3.5 text-xs flex gap-2.5 items-start mb-4">
                            <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                            <p className="leading-relaxed">
                              Please click{" "}
                              <span className="font-semibold">Get Delivery Prices</span> below to
                              get delivery fee.
                            </p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleGetPrices}
                          className="bg-ink text-white font-semibold text-sm px-6 py-3 rounded-md hover:bg-black transition-colors cursor-pointer"
                        >
                          {priceFetchError ? "Retry Get Delivery Prices" : "Get Delivery Prices"}
                        </button>
                      </>
                    ) : (
                      <div className="rounded-md bg-background border border-brand-pink/30 p-4 text-sm font-medium flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-brand-pink/10 grid place-items-center text-brand-pink font-bold text-xs">
                            FEZ
                          </div>
                          <div>
                            <p className="font-semibold text-ink">Fez Delivery Express</p>
                            <p className="text-xs text-muted-foreground">
                              Estimated Delivery: {estimatedTime}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-ink text-base">
                          {shippingCost === 0 ? "Free" : formatNaira(shippingCost!)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Optional Billing Address (Courier Delivery only) */}
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.diffBilling}
                        onChange={(e) => updateForm({ diffBilling: e.target.checked })}
                        className="rounded border-border text-brand-pink focus:ring-brand-pink accent-brand-pink"
                      />
                      Use a different billing address (optional)
                    </label>
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-500 ease-in-out",
                        form.diffBilling ? "max-h-[500px] mt-4" : "max-h-0 mt-0",
                      )}
                    >
                      <div className="pt-2 pb-4 space-y-4 border-t border-border/50">
                        <div id="field-billingAddress">
                          <AddressAutocompleteField
                            label="Street address"
                            value={form.billingAddress}
                            onChange={(v) => updateForm({ billingAddress: v })}
                            onAddressSelect={({ streetAddress, city, state }) => {
                              updateForm((prev) => ({
                                ...prev,
                                billingAddress: streetAddress,
                                billingCity: city || prev.billingCity,
                                billingState:
                                  normalizeNigerianState(state, availableStates) ||
                                  prev.billingState,
                              }));
                            }}
                            placeholder="Billing Street Address"
                            required={form.diffBilling}
                            error={errors.billingAddress}
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <SelectField
                            id="field-billingState"
                            label="State"
                            value={form.billingState}
                            onChange={(v) => updateForm({ billingState: v })}
                            options={["", ...availableStates]}
                            required={form.diffBilling}
                            error={errors.billingState}
                          />
                          <Field
                            id="field-billingCity"
                            label="City / Area"
                            value={form.billingCity}
                            onChange={(v) => updateForm({ billingCity: v })}
                            placeholder="Billing City Or Town"
                            required={form.diffBilling}
                            error={errors.billingCity}
                          />
                        </div>
                        <SelectField
                          label="Country / Region"
                          value={form.billingCountry}
                          onChange={(v) => updateForm({ billingCountry: v })}
                          options={["Nigeria"]}
                          required={form.diffBilling}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Pick-up Station Selection */
                <div className="space-y-4 pt-1" id="field-pickupStation">
                  {errors.pickupStation && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{errors.pickupStation}</span>
                    </div>
                  )}
                  {loadingStations ? (
                    <div className="space-y-3 animate-pulse bg-background border border-border p-5 rounded-md">
                      <p className="text-sm font-semibold mb-2">Getting pick-up stations...</p>
                      <div className="h-16 bg-border/40 rounded-md w-full"></div>
                      <div className="h-16 bg-border/40 rounded-md w-full"></div>
                      <div className="h-16 bg-border/40 rounded-md w-full"></div>
                    </div>
                  ) : stationsError ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <WifiOff className="size-11 text-muted-foreground/40 mb-3 stroke-[1.25]" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Please check your internet connection and try again
                      </p>
                      <button
                        type="button"
                        onClick={loadPickupStations}
                        className="px-6 py-1.5 rounded-md border border-border text-foreground hover:bg-secondary text-sm font-[500] transition-colors cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  ) : pickupStations.length > 0 ? (
                    <div className="grid gap-3">
                      {pickupStations.map((ps) => (
                        <label
                          key={ps.id}
                          className={cn(
                            "p-4 border rounded-xl cursor-pointer transition-colors flex justify-between items-start gap-3",
                            selectedStation === ps.id
                              ? "border-brand-pink bg-brand-pink/5 shadow-xs"
                              : "border-border bg-surface hover:bg-surface-2",
                          )}
                        >
                          <div className="flex gap-3 items-start">
                            <input
                              type="radio"
                              checked={selectedStation === ps.id}
                              onChange={() => {
                                setSelectedStation(ps.id);
                                setErrors((prev) => {
                                  const next = { ...prev };
                                  delete next.pickupStation;
                                  return next;
                                });
                              }}
                              className="accent-brand-pink mt-1 cursor-pointer"
                            />
                            <div>
                              <p className="font-semibold text-ink text-sm">{ps.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                {ps.address}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-pink/15 text-ink shrink-0">
                            {(ps.fee || 0) === 0 ? "Free" : formatNaira(ps.fee!)}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border bg-surface p-6 flex items-start gap-3.5">
                      <div className="size-9 rounded-full bg-surface-2 text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                        <Store className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-ink">
                          No Pick-up Stations Available
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          There are currently no active pick-up stations configured. Please select{" "}
                          <button
                            type="button"
                            onClick={() => setDeliveryMethod("delivery")}
                            className="font-semibold text-brand-pink hover:underline cursor-pointer"
                          >
                            Courier Delivery
                          </button>{" "}
                          to have your order delivered directly to your doorstep.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pick-up Instructions (ALWAYS visible in the Pick-up tab) */}
                  <div className="p-4 rounded-xl bg-brand-pink/5 border border-brand-pink/20 text-sm text-ink flex gap-3 items-start mt-4">
                    <Check className="size-5 shrink-0 text-brand-pink mt-0.5" />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-ink block mb-1">
                        Pick-up Instructions
                      </span>
                      We'll notify you when your order is ready for pickup. Please wait for our
                      confirmation and bring your order confirmation when collecting your order.
                    </p>
                  </div>
                </div>
              )}
            </section>

            <div className="bg-ink text-white p-4 font-display font-semibold flex justify-between items-center text-lg mt-8 rounded-md shadow-sm border border-ink/80">
              <span>Order Total</span>
              <span className="text-brand-pink">{formatNaira(total)}</span>
            </div>

            <section>
              <h2 className="font-display font-semibold text-xl mb-4 text-ink border-b border-border/50 pb-2">
                Order Notes (optional)
              </h2>
              <textarea
                className="w-full rounded-md border border-border bg-background p-3 text-sm focus:border-ink focus:ring-1 focus:ring-ink focus:outline-none min-h-[120px] resize-y"
                placeholder="Notes About Your Order, e.g. Special Delivery Instructions (Optional)"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl mb-2 text-ink border-b border-border/50 pb-2">
                Payment
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                All transactions are secure and encrypted.
              </p>

              <div className="border border-border rounded-md overflow-hidden bg-background">
                <div className="p-4 border-b border-border flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                  {/* PAYSTACK BANNER (COMMENTED OUT FOR NOW)
                  <span className="font-medium text-sm">
                    PAYSTACK - Bank Transfer, Ussd, Debit / Credit Cards
                  </span>
                  */}
                  <span className="font-medium text-sm">
                    FLUTTERWAVE - Bank Transfer, USSD, Debit / Credit Cards
                  </span>
                  <div className="flex gap-1.5 opacity-80">
                    <div className="h-6 w-9 bg-[#011B33] rounded grid place-items-center">
                      <span className="text-[7px] text-white font-bold leading-none">PAY</span>
                    </div>
                    <div className="h-6 w-9 bg-[#1A1F71] rounded grid place-items-center">
                      <span className="text-[7px] text-white font-bold italic leading-none">
                        VISA
                      </span>
                    </div>
                    <div className="h-6 w-9 bg-[#EB001B] rounded grid place-items-center">
                      <div className="flex -space-x-1">
                        <div className="w-3 h-3 rounded-full bg-[#F79E1B] mix-blend-screen" />
                        <div className="w-3 h-3 rounded-full bg-[#EB001B] mix-blend-screen" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-surface text-sm text-muted-foreground">
                  Please pay the exact fees when using the Bank Transfer option. Do not pay less or
                  more to avoid dispense errors.
                </div>
              </div>
            </section>

            {/* PREVIOUS PAYSTACK BUTTON (COMMENTED OUT FOR NOW)
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-ink text-white font-display font-bold h-14 hover:bg-black transition-all rounded-md shadow-xl shadow-ink/10 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-5 animate-spin text-brand-pink" /> REDIRECTING TO
                  PAYSTACK...
                </>
              ) : (
                <>
                  <Lock className="size-4" /> PAY WITH PAYSTACK · {formatNaira(total)}
                </>
              )}
            </button>
            */}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-ink text-white font-display font-bold h-14 hover:bg-black transition-all rounded-md shadow-xl shadow-ink/10 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-5 animate-spin text-brand-pink" /> REDIRECTING TO
                  FLUTTERWAVE...
                </>
              ) : (
                <>
                  <Lock className="size-4" /> PAY WITH FLUTTERWAVE · {formatNaira(total)}
                </>
              )}
            </button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              We Respect Your Privacy & Information
            </p>
          </form>
        </div>

        <div className="w-full lg:w-[45%] xl:w-[40%] bg-background lg:bg-surface border-border lg:pr-10 xl:pr-20 lg:py-10 lg:pl-10 relative">
          <div className="lg:sticky lg:top-24 max-w-4xl lg:max-w-xl mx-auto lg:mx-0 w-full">
            <button
              onClick={() => setShowItems(!showItems)}
              className="flex w-full items-center justify-between py-5 px-4 text-left font-display text-lg bg-ink text-white lg:hidden shadow-md"
            >
              <span className="flex items-center gap-2 font-semibold">
                <ShoppingCart className="size-5" />
                Order summary
                {showItems ? (
                  <ChevronUp className="size-4 ml-1 opacity-70" />
                ) : (
                  <ChevronDown className="size-4 ml-1 opacity-70" />
                )}
              </span>
              <span className="font-bold text-brand-pink">{formatNaira(total)}</span>
            </button>

            <h2 className="hidden lg:block font-display font-semibold text-2xl mb-6">Your order</h2>

            <div
              className={cn(
                "overflow-hidden transition-all duration-500 ease-in-out lg:!max-h-none lg:!overflow-visible lg:!mt-0 lg:!py-0",
                showItems
                  ? "max-h-[800px] overflow-y-auto mt-4 py-2 px-4 lg:px-0"
                  : "max-h-0 px-4 lg:px-0",
              )}
            >
              <ul className="divide-y divide-border/50 mb-6">
                {items.map((i) => (
                  <li key={i.cartItemId} className="py-4 flex gap-4 items-center pr-2">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-white border border-border shrink-0">
                      <img src={i.image} alt="" className="h-full w-full object-cover" />
                      <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-ink text-white text-[10px] grid place-items-center border border-white">
                        {i.qty}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{i.name}</p>
                      {i.selectedOptions && Object.keys(i.selectedOptions).length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {Object.entries(i.selectedOptions)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-semibold">{formatNaira(i.price * i.qty)}</p>
                  </li>
                ))}
              </ul>

              <dl className="space-y-4 text-sm text-muted-foreground border-t border-border/50 pt-6 lg:mb-0 mb-6">
                <div className="flex justify-between items-center">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold text-foreground">{formatNaira(subtotal)}</dd>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <dt className="shrink-0 mt-0.5">Shipping</dt>
                  <dd className="text-right text-xs">
                    {pricesLoaded ? (
                      <span className="font-semibold text-foreground text-sm">
                        {shippingCost === 0 ? "Free" : formatNaira(shippingCost!)}
                      </span>
                    ) : (
                      "To View Delivery Options, Please Click The Get Delivery Prices Button To Load Delivery Prices, Then Choose A Delivery Option"
                    )}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-border/50 pt-4 text-base text-foreground mt-4">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-display font-bold text-xl">{formatNaira(total)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  error,
  id,
  onlyNumbers,
  onlyLetters,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  error?: string;
  id?: string;
  onlyNumbers?: boolean;
  onlyLetters?: boolean;
  inputMode?: "text" | "numeric" | "tel" | "email" | "decimal" | "search";
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (onlyNumbers) {
      // Allow only numeric digits and optional leading '+'
      val = val.replace(/[^0-9+]/g, "");
      if (val.indexOf("+") > 0) {
        val = val[0] === "+" ? "+" + val.slice(1).replace(/\+/g, "") : val.replace(/\+/g, "");
      }
    } else if (onlyLetters) {
      // Allow only letters, spaces, hyphens, and apostrophes
      val = val.replace(/[^a-zA-Z\s'-]/g, "");
    }
    onChange(val);
  };

  return (
    <label className="block" id={id}>
      <span className="text-xs font-medium text-foreground mb-1 block">
        {label}
        {required && <span className="text-brand-pink ml-0.5">*</span>}
      </span>
      <input
        type={onlyNumbers ? "tel" : type}
        inputMode={inputMode || (onlyNumbers ? "numeric" : undefined)}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "w-full h-11 px-3 rounded-md bg-background border text-sm transition-colors focus:outline-none",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            : "border-border focus:border-ink focus:ring-1 focus:ring-ink",
        )}
      />
      {error && <span className="text-[11px] text-red-500 mt-1 block font-medium">{error}</span>}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  error,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  error?: string;
  id?: string;
}) {
  return (
    <label className="block" id={id}>
      <span className="text-xs font-medium text-foreground mb-1 block">
        {label}
        {required && <span className="text-brand-pink ml-0.5">*</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full h-11 px-3 rounded-md bg-background border text-sm appearance-none focus:outline-none transition-colors",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            : "border-border focus:border-ink focus:ring-1 focus:ring-ink",
        )}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "" ? "Select an option..." : o}
          </option>
        ))}
      </select>
      {error && <span className="text-[11px] text-red-500 mt-1 block font-medium">{error}</span>}
    </label>
  );
}
