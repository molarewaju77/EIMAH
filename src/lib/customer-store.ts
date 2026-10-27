import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";

export type CustomerUser = {
  id: string;
  name: string;
  shortName: string;
  initials: string;
  email: string;
  phone?: string;
  avatarBg?: string;
};

export const MOCK_CUSTOMER: CustomerUser = {
  id: "cust-001",
  name: "Michael Oladimeji",
  shortName: "Michael O.",
  initials: "MO",
  email: "M@gmail.com",
  phone: "+234 801 234 5678",
  avatarBg: "#f590dd",
};

interface CustomerAuthState {
  user: CustomerUser | null;
  isAuthed: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}

export const useCustomerAuth = create<CustomerAuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthed: false,

      login: (email: string, pass: string) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanPass = pass.trim();

        // Support M@gmail.com (or m@gmail.com) with 12345
        if (cleanEmail === "m@gmail.com" && cleanPass === "12345") {
          set({
            user: MOCK_CUSTOMER,
            isAuthed: true,
          });
          toast.success(`Welcome back, ${MOCK_CUSTOMER.name}!`);
          return true;
        }

        // Also allow sign-in for any valid formatted email in mock mode with a generated profile
        if (cleanPass === "12345" && cleanEmail.includes("@")) {
          const parts = cleanEmail.split("@")[0].split(/[._-]/);
          const firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : "Customer";
          const lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : "User";
          const initials = (firstName.charAt(0) + (lastName.charAt(0) || "")).toUpperCase();

          const dynamicUser: CustomerUser = {
            id: `cust-${Date.now().toString().slice(-4)}`,
            name: `${firstName} ${lastName}`,
            shortName: `${firstName} ${lastName.charAt(0)}.`,
            initials: initials || "CU",
            email: email.trim(),
            avatarBg: "#f590dd",
          };

          set({
            user: dynamicUser,
            isAuthed: true,
          });
          toast.success(`Welcome back, ${dynamicUser.name}!`);
          return true;
        }

        toast.error("Invalid credentials. Use M@gmail.com and password: 12345");
        return false;
      },

      logout: () => {
        set({ user: null, isAuthed: false });
        toast.info("Signed out successfully.");
      },
    }),
    {
      name: "eimah_customer_auth_v1",
    },
  ),
);
