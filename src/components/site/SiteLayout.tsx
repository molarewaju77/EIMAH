import type { ReactNode } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { PromoPopupModal } from "./PromoPopupModal";
import { useInitAdminData } from "@/hooks/useInitAdminData";

export function SiteLayout({
  children,
  transparentHeader = false,
  showAnnouncement = true,
}: {
  children: ReactNode;
  transparentHeader?: boolean;
  showAnnouncement?: boolean;
}) {
  useInitAdminData();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* {showAnnouncement && <AnnouncementBar />} */}
      <Header transparentOnTop={transparentHeader} />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <CartDrawer />
      <PromoPopupModal />
    </div>
  );
}
