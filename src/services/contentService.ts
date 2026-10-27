import type { Banner, Popup, Solution, SolutionPayment, Transaction } from "@/lib/admin-data";
import type { PickupStation } from "@/lib/admin-store";
import {
  fetchBanners as fetchBannersDB,
  insertBanner as insertBannerDB,
  updateBanner as updateBannerDB,
  deleteBanner as deleteBannerDB,
  fetchPopups as fetchPopupsDB,
  insertPopup as insertPopupDB,
  updatePopup as updatePopupDB,
  deletePopup as deletePopupDB,
  fetchSolutions as fetchSolutionsDB,
  updateSolutionDB,
  fetchSolutionPayments as fetchSolutionPaymentsDB,
  fetchPaginatedSolutionPayments as fetchPaginatedSolutionPaymentsDB,
  type SolutionPaymentQueryParams,
  type PaginatedSolutionPaymentsResult,
  updateSolutionPaymentStatus as updateSolutionPaymentStatusDB,
  fetchPickupStations as fetchPickupStationsDB,
  insertPickupStation as insertPickupStationDB,
  updatePickupStation as updatePickupStationDB,
  deletePickupStation as deletePickupStationDB,
  fetchTransactions as fetchTransactionsDB,
  fetchPaginatedTransactions as fetchPaginatedTransactionsDB,
  insertTransaction as insertTransactionDB,
  type TransactionQueryParams,
  type PaginatedTransactionsResult,
} from "@/lib/db/content";

export const contentService = {
  // Banners
  async getBanners(): Promise<Banner[]> {
    return await fetchBannersDB();
  },
  async createBanner(b: Banner): Promise<void> {
    await insertBannerDB(b);
  },
  async updateBanner(id: string, patch: Partial<Banner>): Promise<void> {
    await updateBannerDB(id, patch);
  },
  async deleteBanner(id: string): Promise<void> {
    await deleteBannerDB(id);
  },

  // Popups
  async getPopups(): Promise<Popup[]> {
    return await fetchPopupsDB();
  },
  async createPopup(p: Popup): Promise<void> {
    await insertPopupDB(p);
  },
  async updatePopup(id: string, patch: Partial<Popup>): Promise<void> {
    await updatePopupDB(id, patch);
  },
  async deletePopup(id: string): Promise<void> {
    await deletePopupDB(id);
  },

  // Solutions & Registrations
  async getSolutions(): Promise<Solution[]> {
    return await fetchSolutionsDB();
  },
  async updateSolution(id: string, patch: Partial<Solution>): Promise<void> {
    await updateSolutionDB(id, patch);
  },

  // Solution Payments
  async getSolutionPayments(): Promise<SolutionPayment[]> {
    return await fetchSolutionPaymentsDB();
  },
  async getPaginatedSolutionPayments(params?: SolutionPaymentQueryParams): Promise<PaginatedSolutionPaymentsResult> {
    return await fetchPaginatedSolutionPaymentsDB(params);
  },
  async updateSolutionPaymentStatus(id: string, status: SolutionPayment["status"]): Promise<void> {
    await updateSolutionPaymentStatusDB(id, status);
  },

  // Pickup Stations
  async getPickupStations(): Promise<PickupStation[]> {
    return await fetchPickupStationsDB();
  },
  async createPickupStation(ps: PickupStation): Promise<void> {
    await insertPickupStationDB(ps);
  },
  async updatePickupStation(id: string, patch: Partial<PickupStation>): Promise<void> {
    await updatePickupStationDB(id, patch);
  },
  async deletePickupStation(id: string): Promise<void> {
    await deletePickupStationDB(id);
  },
  // Transactions
  async getTransactions() {
    return await fetchTransactionsDB();
  },
  async getPaginatedTransactions(params?: TransactionQueryParams): Promise<PaginatedTransactionsResult> {
    return await fetchPaginatedTransactionsDB(params);
  },
  async createTransaction(t: Transaction): Promise<void> {
    await insertTransactionDB(t);
  },
};
