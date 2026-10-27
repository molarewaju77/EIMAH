import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface AddressDetails {
  streetAddress: string;
  city?: string;
  state?: string;
}

interface AddressAutocompleteFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (details: AddressDetails) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

declare global {
  interface Window {
    google?: any;
    __googleMapsLoadingPromise?: Promise<void>;
  }
}

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();

  if (window.__googleMapsLoadingPromise) {
    return window.__googleMapsLoadingPromise;
  }

  window.__googleMapsLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });

  return window.__googleMapsLoadingPromise;
}

export function AddressAutocompleteField({
  label,
  value,
  onChange,
  onAddressSelect,
  placeholder = "Start typing your address...",
  required,
  error,
}: AddressAutocompleteFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!GOOGLE_API_KEY) return;

    loadGoogleMapsScript(GOOGLE_API_KEY)
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err) => {
        console.warn("[Google Places] Failed to load Google Maps script:", err);
      });
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google?.maps?.places) return;

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "ng" },
        fields: ["address_components", "formatted_address", "name"],
      });

      const listener = autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place || !place.address_components) return;

        let streetNumber = "";
        let route = "";
        let city = "";
        let state = "";

        for (const component of place.address_components) {
          const types = component.types as string[];

          if (types.includes("street_number")) {
            streetNumber = component.long_name;
          }
          if (types.includes("route")) {
            route = component.long_name;
          }
          if (types.includes("locality") || types.includes("sublocality") || types.includes("administrative_area_level_2")) {
            if (!city) city = component.long_name;
          }
          if (types.includes("administrative_area_level_1")) {
            state = component.long_name;
          }
        }

        const formattedStreet = [streetNumber, route].filter(Boolean).join(" ");
        const finalAddress = formattedStreet || place.formatted_address || place.name || "";

        if (finalAddress) {
          onChange(finalAddress);
        }

        if (onAddressSelect) {
          onAddressSelect({
            streetAddress: finalAddress,
            city,
            state,
          });
        }
      });

      return () => {
        if (window.google?.maps?.event) {
          window.google.maps.event.removeListener(listener);
        }
      };
    } catch (err) {
      console.warn("[Google Places] Error initializing Autocomplete:", err);
    }
  }, [isLoaded, onChange, onAddressSelect, value]);

  return (
    <label className="block relative">
      <span className="text-xs font-medium text-foreground mb-1 flex items-center justify-between">
        <span>
          {label}
          {required && <span className="text-brand-pink ml-0.5">*</span>}
        </span>
        {GOOGLE_API_KEY && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-normal opacity-75">
            <MapPin className="size-3 text-brand-pink" /> Google Address Suggestions
          </span>
        )}
      </span>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full h-11 px-3 pr-8 rounded-md bg-background border text-sm transition-colors focus:outline-none ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-border focus:border-ink focus:ring-1 focus:ring-ink"
          }`}
        />
      </div>
      {error && <span className="text-[11px] text-red-500 mt-1 block font-medium">{error}</span>}
    </label>
  );
}
