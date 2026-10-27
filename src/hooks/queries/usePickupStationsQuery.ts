import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contentService } from "@/services/contentService";
import type { PickupStation } from "@/lib/admin-store";
import { toast } from "react-toastify";

export const PICKUP_STATIONS_QUERY_KEY = ["pickup_stations"];

export function usePickupStationsQuery() {
  return useQuery({
    queryKey: PICKUP_STATIONS_QUERY_KEY,
    queryFn: () => contentService.getPickupStations(),
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreatePickupStationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (station: PickupStation) => contentService.createPickupStation(station),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PICKUP_STATIONS_QUERY_KEY });
      toast.success("Pickup station created successfully");
    },
    onError: (err) => {
      toast.error(`Failed to create station: ${(err as Error).message}`);
    },
  });
}

export function useUpdatePickupStationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<PickupStation> }) =>
      contentService.updatePickupStation(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PICKUP_STATIONS_QUERY_KEY });
      toast.success("Pickup station updated successfully");
    },
    onError: (err) => {
      toast.error(`Failed to update station: ${(err as Error).message}`);
    },
  });
}

export function useDeletePickupStationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contentService.deletePickupStation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PICKUP_STATIONS_QUERY_KEY });
      toast.success("Pickup station deleted successfully");
    },
    onError: (err) => {
      toast.error(`Failed to delete station: ${(err as Error).message}`);
    },
  });
}
