import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  initializeFlutterwavePayment,
  verifyFlutterwavePayment,
} from "@/services/flutterwaveService";
import { insertSolutionApplication, insertTransaction } from "@/lib/db/content";
import { type SolutionSubmission } from "@/lib/solution-data";
import { type PaymentSuccessModalData } from "@/components/site/PaymentSuccessModal";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type StartSolutionCheckoutInput = {
  solutionId: string;
  solutionTitle: string;
  solutionSlug: string;
  track: "Business" | "Academy";
  category: "Business" | "Learning";
  fullName: string;
  email: string;
  phone: string;
  location?: string;
  businessName?: string;
  hasBusiness?: string;
  productCategory?: string;
  sourcingNeed?: string;
  orderSize?: string;
  budget?: string;
  supplierStatus?: string;
  supplierName?: string;
  supplierWebsite?: string;
  negotiationSupport?: string;
  experienceLevel?: string;
  mainGoal?: string;
  timeline?: string;
  additionalNotes?: string;
  amount: number;
};

export function useSolutionFlutterwaveCheckout() {
  const qc = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [successModalData, setSuccessModalData] = useState<PaymentSuccessModalData>(null);

  // Reset processing state on back navigation
  useEffect(() => {
    const handleRestore = () => {
      setIsProcessing(false);
      toast.dismiss();
    };
    window.addEventListener("pageshow", handleRestore);
    window.addEventListener("focus", handleRestore);
    return () => {
      window.removeEventListener("pageshow", handleRestore);
      window.removeEventListener("focus", handleRestore);
    };
  }, []);

  // Check URL query parameters for Flutterwave payment verification callback
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const rawTxRef =
      urlParams.get("tx_ref") || urlParams.get("reference") || urlParams.get("trxref");
    const transactionId =
      urlParams.get("transaction_id") || urlParams.get("charge_id") || urlParams.get("id");
    const statusParam = urlParams.get("status");

    const storedRef =
      typeof window !== "undefined"
        ? sessionStorage.getItem("last_solution_order_id") ||
          localStorage.getItem("last_solution_order_id")
        : null;

    const reference = rawTxRef || (statusParam || transactionId ? storedRef : null);

    if (!reference && !transactionId) return;

    let isMounted = true;
    setIsVerifying(true);

    async function fulfillSolutionPayment() {
      try {
        const finalTxnId =
          reference || transactionId || `TXN-${Math.floor(7000 + Math.random() * 2000)}`;

        // 1. Pre-check if application already exists in Supabase (e.g. inserted by Webhook or prior run)
        const { data: existingApp } = await supabase
          .from("solution_applications")
          .select("*")
          .or(`txn_id.eq.${finalTxnId},id.eq.${finalTxnId}`)
          .maybeSingle();

        if (existingApp) {
          console.log(
            `[Solution Application] ℹ️ Application ${finalTxnId} already created in DB. Finalizing UI modal.`,
          );
          if (reference) {
            sessionStorage.removeItem(`pending_solution_app_${reference}`);
            localStorage.removeItem(`pending_solution_app_${reference}`);
          }

          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);

          if (isMounted) {
            setSuccessModalData({
              id: existingApp.id || finalTxnId,
              solutionTitle: existingApp.solution_title || "Solution Service",
              amount: Number(existingApp.amount || 0),
              customerName: existingApp.full_name || "Valued Applicant",
              customerEmail: existingApp.email || "",
              track: existingApp.track || "Business",
              category: existingApp.category || "Business",
            });
            toast.success("Payment verified! Your application has been received.");
          }
          return;
        }

        // 2. Perform payment verification via Edge Function
        const verifyRes = await verifyFlutterwavePayment({
          data: reference || transactionId!,
          transaction_id: transactionId || undefined,
        });

        const statusLower = String(verifyRes?.status || "").toLowerCase();
        const isVerifiedPaid =
          statusLower === "successful" ||
          statusLower === "succeeded" ||
          statusLower === "completed";

        if (isVerifiedPaid) {
          // Restore draft application details from storage or from Flutterwave metadata fallback
          const savedDraftStr =
            (reference ? sessionStorage.getItem(`pending_solution_app_${reference}`) : null) ||
            (reference ? localStorage.getItem(`pending_solution_app_${reference}`) : null);

          const localDraft = savedDraftStr ? JSON.parse(savedDraftStr) : null;
          const metaDraft = verifyRes.meta || {};
          const draft = localDraft || (metaDraft.solutionTitle ? metaDraft : null);

          const appId =
            draft?.id || draft?.appId || `SOL-${Math.floor(1000 + Math.random() * 9000)}`;
          const customerName =
            draft?.fullName ||
            draft?.customerName ||
            verifyRes.customer?.name ||
            "Valued Applicant";
          const customerEmail = draft?.email || metaDraft?.email || verifyRes.customer?.email || "";
          const solutionTitle =
            draft?.solutionTitle || metaDraft?.solutionTitle || "Solution Service";
          const amountPaid = draft?.amount
            ? Number(draft.amount)
            : verifyRes.amount
              ? Number(verifyRes.amount)
              : 0;
          const payChannel = verifyRes.payment_type
            ? verifyRes.payment_type.charAt(0).toUpperCase() + verifyRes.payment_type.slice(1)
            : "Card";

          // 3. Insert row into solution_applications table safely
          try {
            await insertSolutionApplication({
              id: appId,
              txnId: finalTxnId,
              solutionId: draft?.solutionId || "S-01",
              solutionTitle: solutionTitle,
              solutionSlug: draft?.solutionSlug || "solutions",
              track: draft?.track || "Business",
              category: draft?.category || "Business",
              fullName: customerName,
              email: customerEmail,
              phone: draft?.phone || "",
              location: draft?.location || "",
              businessName: draft?.businessName || "",
              hasBusiness: draft?.hasBusiness || "",
              productCategory: draft?.productCategory || "",
              sourcingNeed: draft?.sourcingNeed || "",
              orderSize: draft?.orderSize || "",
              budget: draft?.budget || "",
              supplierStatus: draft?.supplierStatus || "",
              supplierName: draft?.supplierName || "",
              supplierWebsite: draft?.supplierWebsite || "",
              negotiationSupport: draft?.negotiationSupport || "",
              experienceLevel: draft?.experienceLevel || "",
              mainGoal: draft?.mainGoal || "",
              timeline: draft?.timeline || "",
              additionalNotes: draft?.additionalNotes || "",
              amount: amountPaid,
              status: "Pending",
              paymentStatus: "Successful",
              date: new Date().toISOString(),
            });
          } catch (appErr) {
            console.warn("[Solution Application] Insert notice (may already exist):", appErr);
          }

          // 4. Insert row into unified transactions table safely with unique ID
          try {
            await insertTransaction({
              id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
              customer: customerName,
              type: "Solution",
              orderId: appId,
              amount: amountPaid,
              method: payChannel,
              status: "Successful",
              date: new Date().toISOString(),
            });
          } catch (txnErr) {
            console.warn("[Solution Application] Transaction insert notice:", txnErr);
          }

          // 5. Dispatch confirmation emails via Edge Function with toast feedback
          try {
            if (!customerEmail) {
              console.warn(
                "[Solution Application] No customer email found in draft or payment metadata.",
              );
              toast.warn("Payment verified, but no email address was found to send confirmation.", {
                autoClose: 6000,
              });
            } else {
              const { data: emailRes, error: emailErr } = await supabase.functions.invoke(
                "handle-application-event",
                {
                  body: {
                    record: {
                      id: appId,
                      solution_title: solutionTitle,
                      category:
                        draft?.category || (draft?.track === "Academy" ? "Learning" : "Business"),
                      track: draft?.track || "Business",
                      full_name: customerName,
                      email: customerEmail,
                      phone: draft?.phone || "",
                      business_name: draft?.businessName || "",
                      amount: amountPaid,
                      details: {
                        productCategory: draft?.productCategory || "",
                        sourcingNeed: draft?.sourcingNeed || "",
                        orderSize: draft?.orderSize || "",
                        budget: draft?.budget || "",
                        additionalNotes: draft?.additionalNotes || "",
                      },
                    },
                  },
                },
              );

              if (emailErr) {
                console.error("[Solution Application] Email invoke error:", emailErr);
                toast.warn(
                  `Email notice: ${emailErr.message || "Failed to trigger confirmation email."}`,
                  { autoClose: 7000 },
                );
              } else if (emailRes && emailRes.success === false) {
                console.warn("[Solution Application] Email dispatch failure:", emailRes);
                const failureDetails = Array.isArray(emailRes.failures)
                  ? emailRes.failures.map((f: any) => `${f.target}: ${f.error}`).join("; ")
                  : emailRes.error ||
                    emailRes.message ||
                    "Confirmation email could not be delivered.";
                toast.warn(`Email dispatch alert: ${failureDetails}`, { autoClose: 9000 });
              } else {
                console.log(
                  "[Solution Application] Confirmation emails dispatched successfully:",
                  emailRes,
                );
              }
            }
          } catch (emailErr: any) {
            console.error("[Solution Application] Automated email notice:", emailErr);
            toast.warn(
              `Email notice: ${emailErr?.message || "Could not complete email dispatch."}`,
              { autoClose: 7000 },
            );
          }

          // Invalidate React Query caches
          qc.invalidateQueries({ queryKey: ["solution-submissions"] });
          qc.invalidateQueries({ queryKey: ["solution_payments"] });
          qc.invalidateQueries({ queryKey: ["transactions"] });

          // Clean up storage draft
          if (reference) {
            sessionStorage.removeItem(`pending_solution_app_${reference}`);
            localStorage.removeItem(`pending_solution_app_${reference}`);
          }

          // Remove query params from URL clean without refresh
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);

          if (isMounted) {
            setSuccessModalData({
              id: appId,
              solutionTitle,
              amount: amountPaid,
              customerName,
              customerEmail,
              track: draft?.track || "Business",
              category: draft?.category || "Business",
            });
            toast.success("Payment verified! Your application has been received.");
          }
        } else {
          toast.error("Payment was not completed.");
        }
      } catch (err: any) {
        console.error("Failed to verify solution payment:", err);
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

    fulfillSolutionPayment();

    return () => {
      isMounted = false;
    };
  }, [qc]);

  const startFlutterwaveCheckout = async (input: StartSolutionCheckoutInput) => {
    setIsProcessing(true);
    try {
      const appId = `SOL-${Math.floor(1000 + Math.random() * 9000)}`;
      const txnId = `TXN-${Math.floor(7000 + Math.random() * 2000)}`;

      const draftPayload = {
        ...input,
        id: appId,
        txnId,
      };

      // Store pending application draft & last order ID in storage
      sessionStorage.setItem("last_solution_order_id", txnId);
      localStorage.setItem("last_solution_order_id", txnId);
      sessionStorage.setItem(`pending_solution_app_${txnId}`, JSON.stringify(draftPayload));
      localStorage.setItem(`pending_solution_app_${txnId}`, JSON.stringify(draftPayload));

      const cleanCallbackUrl = window.location.origin + window.location.pathname;

      const res = await initializeFlutterwavePayment({
        data: {
          email: input.email,
          amount: input.amount,
          orderId: txnId,
          callbackUrl: cleanCallbackUrl,
          customerName: input.fullName,
          phone: input.phone,
          metadata: {
            appId,
            solutionTitle: input.solutionTitle,
            solutionId: input.solutionId,
            solutionSlug: input.solutionSlug,
            customerName: input.fullName,
            email: input.email,
            phone: input.phone,
            track: input.track,
            category: input.category,
            businessName: input.businessName || "",
            location: input.location || "",
            hasBusiness: input.hasBusiness || "",
            productCategory: input.productCategory || "",
            sourcingNeed: input.sourcingNeed || "",
            orderSize: input.orderSize || "",
            budget: input.budget || "",
            supplierStatus: input.supplierStatus || "",
            supplierName: input.supplierName || "",
            supplierWebsite: input.supplierWebsite || "",
            negotiationSupport: input.negotiationSupport || "",
            experienceLevel: input.experienceLevel || "",
            mainGoal: input.mainGoal || "",
            timeline: input.timeline || "",
            additionalNotes: input.additionalNotes || "",
            type: "Solution",
          },
        },
      });

      if (res?.link) {
        setIsProcessing(false);
        window.location.href = res.link;
      } else {
        throw new Error("Did not receive a valid checkout URL from Flutterwave.");
      }
    } catch (err: any) {
      console.error("Flutterwave initialization error:", err);
      toast.error(err?.message || "Failed to initialize Flutterwave checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  const closeSuccessModal = () => {
    setSuccessModalData(null);
  };

  return {
    startFlutterwaveCheckout,
    startPaystackCheckout: startFlutterwaveCheckout,
    isProcessing,
    isVerifying,
    successModalData,
    closeSuccessModal,
  };
}

// Backward-compatibility alias
export const useSolutionPaystackCheckout = useSolutionFlutterwaveCheckout;
