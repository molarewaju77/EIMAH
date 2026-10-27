import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSolutionApplications,
  insertSolutionApplication,
  updateSolutionApplicationStatus,
  updateSolutionApplicationPaymentStatus,
  updateSolutionApplicationNotes,
  deleteSolutionApplication,
} from "@/lib/db/content";
import {
  type SolutionSubmission,
  type SolutionStatus,
  type PaymentStatus,
} from "@/lib/solution-data";
import { toast } from "react-toastify";

export function useSolutionSubmissionsQuery(filters?: {
  solution?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["solution-submissions", filters],
    queryFn: async () => {
      let list = await fetchSolutionApplications();

      if (filters?.solution && filters.solution !== "all") {
        list = list.filter(
          (s) =>
            s.solutionTitle.toLowerCase() === filters.solution?.toLowerCase() ||
            s.track.toLowerCase() === filters.solution?.toLowerCase(),
        );
      }

      if (filters?.status && filters.status !== "all") {
        list = list.filter((s) => s.status === filters.status);
      }

      if (filters?.search) {
        const query = filters.search.toLowerCase().trim();
        list = list.filter(
          (s) =>
            s.id.toLowerCase().includes(query) ||
            s.fullName.toLowerCase().includes(query) ||
            s.email.toLowerCase().includes(query) ||
            s.phone.toLowerCase().includes(query) ||
            s.solutionTitle.toLowerCase().includes(query) ||
            (s.businessName && s.businessName.toLowerCase().includes(query)),
        );
      }

      if (filters?.startDate) {
        list = list.filter((s) => s.date >= (filters.startDate as string));
      }

      if (filters?.endDate) {
        const endIso = `${filters.endDate}T23:59:59.999Z`;
        list = list.filter((s) => s.date <= endIso);
      }

      // Sort newest first
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
  });
}

export function useSolutionSubmissionDetailQuery(id?: string | null) {
  return useQuery({
    queryKey: ["solution-submission", id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) return null;
      const list = await fetchSolutionApplications();
      return list.find((s) => s.id === id) || null;
    },
  });
}

export function useSubmitApplicationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      appData: Partial<
        SolutionSubmission & { solutionId?: string; category?: string; txnId?: string }
      >,
    ) => {
      await insertSolutionApplication(appData);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["solution-submissions"] });
      qc.invalidateQueries({ queryKey: ["solution_payments"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Application submitted successfully! We will be in touch shortly.");
    },
    onError: (err) => {
      console.error("Failed to submit application:", err);
      toast.error(`Failed to submit application: ${(err as Error).message}`);
    },
  });
}

export function useUpdateSolutionSubmissionStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SolutionStatus }) => {
      await updateSolutionApplicationStatus(id, status);
      return { id, status };
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["solution-submissions"] });
      qc.invalidateQueries({ queryKey: ["solution-submission", vars.id] });
      toast.success(`Status updated to "${vars.status}".`);
    },
    onError: () => {
      toast.error("Failed to update status.");
    },
  });
}

export function useUpdateSolutionSubmissionNotesMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, internalNotes }: { id: string; internalNotes: string }) => {
      await updateSolutionApplicationNotes(id, internalNotes);
      return { id, internalNotes };
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["solution-submissions"] });
      qc.invalidateQueries({ queryKey: ["solution-submission", vars.id] });
      toast.success("Internal notes saved.");
    },
    onError: () => {
      toast.error("Failed to save internal notes.");
    },
  });
}

export function useUpdateSolutionSubmissionPaymentStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: string; paymentStatus: PaymentStatus }) => {
      await updateSolutionApplicationPaymentStatus(id, paymentStatus);
      return { id, paymentStatus };
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["solution-submissions"] });
      qc.invalidateQueries({ queryKey: ["solution-submission", vars.id] });
      toast.success(`Payment status updated to "${vars.paymentStatus}".`);
    },
    onError: () => {
      toast.error("Failed to update payment status.");
    },
  });
}

export function useDeleteSolutionSubmissionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteSolutionApplication(id);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["solution-submissions"] });
      toast.success("Application deleted successfully.");
    },
    onError: () => {
      toast.error("Failed to delete application.");
    },
  });
}

// Aliases for Applications terminology
export const useApplicationsQuery = useSolutionSubmissionsQuery;
export const useApplicationDetailQuery = useSolutionSubmissionDetailQuery;
export const useUpdateApplicationStatusMutation = useUpdateSolutionSubmissionStatusMutation;
export const useUpdateApplicationPaymentStatusMutation =
  useUpdateSolutionSubmissionPaymentStatusMutation;
export const useUpdateApplicationNotesMutation = useUpdateSolutionSubmissionNotesMutation;
export const useDeleteApplicationMutation = useDeleteSolutionSubmissionMutation;
