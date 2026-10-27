import { useState } from "react";
import { X } from "lucide-react";

export function AnnouncementBar() {
  const [show, setShow] = useState(true);
  if (!show) return null;
  return (
    <div className="relative bg-ink text-white text-xs md:text-sm">
      <div className="container-eimah flex items-center justify-center gap-3 py-2.5">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand-pink" />
        <p className="text-center">
          Fast nationwide delivery via Fez Express · Use code <span className="font-semibold text-brand-yellow">EIMAHVIP</span> for exclusive perks
        </p>
      </div>
      <button
        onClick={() => setShow(false)}
        aria-label="Dismiss"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/60 hover:text-white"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
