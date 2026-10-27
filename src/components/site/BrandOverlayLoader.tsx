import React from "react";
import { cn } from "@/lib/utils";

export interface BrandOverlayLoaderProps {
  /**
   * Whether the loader is visible
   * @default true
   */
  show?: boolean;
  /**
   * Rendering mode:
   * - "block": Standalone in-flow loading component with built-in responsive height (for page loading states)
   * - "overlay" (or "absolute"): Absolute overlay covering a parent container (for tab switching / filtering)
   * - "fixed": Full screen fixed viewport overlay
   * @default "block"
   */
  mode?: "block" | "overlay" | "absolute" | "fixed";
  /**
   * Optional subtle status text below the emblem
   */
  label?: string;
  /**
   * Additional className for custom sizing or positioning
   */
  className?: string;
}

export function BrandOverlayLoader({
  show = true,
  mode = "block",
  label,
  className,
}: BrandOverlayLoaderProps) {
  if (!show) return null;

  const isBlock = mode === "block";
  const isFixed = mode === "fixed";
  const isOverlay = mode === "overlay" || mode === "absolute";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading content"
      className={cn(
        // Self-contained responsive height on small and large screens (compact on desktop)
        "w-full min-h-[200px] sm:min-h-[220px] md:min-h-[240px] flex flex-col items-center justify-center select-none",
        // Mode-specific positioning: solid clean white background
        isFixed && "fixed inset-0 z-50 bg-white/75 dark:bg-neutral-950/35 backdrop-blur-[2px]",
        isOverlay && "absolute inset-0 z-20 bg-white dark:bg-neutral-950",
        isBlock && "relative py-6 md:py-8 bg-transparent",
        // Smooth transition
        "transition-all duration-200 ease-out",
        className
      )}
    >
      {/* Brand Emblem + Popping 4-Color Circle Container */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Dedicated Concentric Emblem & Rings Container */}
        <div className="relative flex items-center justify-center size-24 sm:size-28">
          {/* Outer Expanding Pulse Ring with subtle ambient touch */}
          <div
            className="absolute inset-0 rounded-full border border-neutral-300/30 dark:border-neutral-700/30 brand-circle-outer pointer-events-none"
            aria-hidden="true"
          />

          {/* Primary Popping Circle composed of the 4 EIMAH Brand Colors (25% each) */}
          <div
            className="absolute inset-1 sm:inset-2 brand-circle-pop pointer-events-none flex items-center justify-center"
            aria-hidden="true"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* 1. Brand Pink (#f590dd) - 25% */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#f590dd"
                strokeWidth="2.5"
                strokeDasharray="64 212.5"
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              {/* 2. Brand Yellow (#ffe784) - 25% */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#ffe784"
                strokeWidth="2.5"
                strokeDasharray="64 212.5"
                strokeDashoffset="-69.1"
                strokeLinecap="round"
              />
              {/* 3. Brand Lime (#caff75) - 25% */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#caff75"
                strokeWidth="2.5"
                strokeDasharray="64 212.5"
                strokeDashoffset="-138.2"
                strokeLinecap="round"
              />
              {/* 4. Brand Mint (#7cf9ce) - 25% */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#7cf9ce"
                strokeWidth="2.5"
                strokeDasharray="64 212.5"
                strokeDashoffset="-207.3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Soft Center Glow */}
          <div
            className="absolute size-16 rounded-full bg-white/50 dark:bg-white/10 blur-md pointer-events-none"
            aria-hidden="true"
          />

          {/* The "E" Logo Emblem in sleek luxury gray */}
          <div className="relative flex items-center justify-center text-neutral-500 dark:text-neutral-400 brand-emblem-pop drop-shadow-[0_4px_10px_rgba(0,0,0,0.08)]">
            <svg
              viewBox="0 40 115 115"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 sm:w-14 sm:h-14"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M27.0877 131.169C27.883 132.261 31.5578 135.17 31.9667 135.493C33.8131 136.955 39.3983 139.31 41.5208 139.499C43.3946 139.665 43.3517 139.83 43.5129 139.843C45.3447 139.986 45.342 140.002 45.5016 140.006C52.3166 140.201 57.2684 138.276 58.8798 137.687C61.9758 136.557 61.8821 136.375 62.1526 136.286C63.258 135.922 66.3149 133.596 68.4718 134.295C69.1494 134.515 69.5992 134.661 76.2787 138.58C82.2029 142.057 83.9715 142.593 84.3871 144.052C85.1069 146.579 81.9137 147.364 78.0348 149.231C73.8268 151.256 64.4572 153.605 59.4322 153.686C57.5856 153.715 57.6004 153.869 57.4405 153.869C45.1846 153.892 37.2743 151.112 30.1514 147.6C25.6593 145.386 20.2151 141.3 18.7274 139.879C16.782 138.021 16.7315 138.104 16.6334 137.992C13.2537 134.108 13.2865 134.104 12.5374 133.217C4.99744 124.286 -0.247721 110.55 0.0090271 97.7282C0.0862868 89.8124 0.949171 82.1435 6.84534 70.8042C7.35938 69.8154 7.45346 69.8918 7.97583 68.9225C9.44249 66.2016 12.7283 62.0779 13.3525 61.418C13.5145 61.2466 13.4994 61.2403 15.3417 59.244C17.2633 57.1616 17.3516 57.2507 17.5122 57.0643C19.5717 54.6754 27.6886 49.0174 32.144 47.1336C39.0626 44.2086 44.8432 42.0844 54.7272 41.9485L55.4491 41.9491L56.1749 41.9485L56.354 41.9484C57.9603 41.9504 68.861 41.4575 82.1917 48.4056C85.1516 49.9484 85.0825 50.0592 85.1503 50.0945C88.314 51.7439 93.7066 56.3892 94.5315 57.1995C98.4157 61.0156 98.2201 61.1857 99.0585 62.0813C100.447 63.5651 107.068 72.1066 109.955 83.2465C115.442 104.415 107.313 119.649 106.918 120.739C105.873 123.626 101.837 130.167 100.698 131.396C98.9813 133.249 96.8898 131.23 96.3018 130.915C92.8394 129.058 92.0514 128.442 91.5974 128.2C88.5251 126.563 72.7571 117.317 59.2184 109.548C53.3126 106.159 52.3781 105.855 52.3613 104.423C52.3508 103.533 53.4177 101.803 53.5466 101.594C55.4562 98.4997 57.9752 93.919 58.6052 92.9039C60.4457 89.9387 62.4057 89.8954 63.4393 92.4315C65.0975 93.2917 66.1276 94.0362 66.517 94.2331C69.1252 95.5521 68.9855 95.7826 71.5801 97.1346C74.2697 98.5359 75.1292 99.1813 75.3776 99.3103C77.5914 100.461 80.579 102.35 80.9901 102.56C82.7927 103.481 84.5625 104.682 84.6189 104.712C88.1323 106.545 88.4871 107.363 88.8441 106.383C88.9491 106.096 89.9851 103.254 90.1091 102.769C90.8938 99.6981 95.8646 84.7301 88.6867 70.434C88.6328 70.3265 86.9041 66.6239 83.2974 63.0057C77.0229 56.7111 68.455 55.8314 68.2892 55.8211C65.1229 55.6235 51.8859 53.9392 36.1123 68.9815C31.6967 73.3247 26.9515 80.4964 25.1302 84.1955C17.5437 99.6045 19.4372 111.478 19.4866 112.925C19.5215 113.947 19.7369 113.898 19.825 114.915C20.2726 120.081 23.5385 126.109 24.0263 127.009C24.8427 128.318 24.88 128.283 26.4025 130.413C26.7664 130.773 26.7749 130.74 27.0877 131.169ZM45.543 82.0939C50.3652 84.9815 52.1664 85.0366 52.0361 87.5991C51.995 88.4084 46.5874 97.1888 45.9114 98.4796C45.8248 98.6448 45.1394 99.9537 44.2358 100.102C43.0731 100.293 43.0635 100.165 42.0222 99.6098C41.6918 99.4335 39.5823 98.3081 37.9562 97.2913C32.8799 94.1167 29.8698 93.5973 30.7622 91.0081C30.8259 90.8232 31.1845 89.783 31.9126 88.8511C32.0508 88.6742 35.1655 83.1374 35.3297 82.8717C36.8033 80.4892 37.5326 77.7038 40.2711 79.0504C40.7546 79.2881 45.3051 81.9271 45.543 82.0939Z"
              />
            </svg>
          </div>
        </div>

        {/* Optional Label (Isolated cleanly below the concentric emblem container) */}
        {label && (
          <p className="mt-4 text-xs font-medium tracking-widest text-neutral-500 dark:text-neutral-400 uppercase select-none text-center">
            {label}
          </p>
        )}
      </div>

      {/* Embedded Popping 4-Color Circle & Breathing Emblem Keyframes */}
      <style>{`
        @keyframes circlePopInOut {
          0% {
            transform: scale(0.72) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.24) rotate(90deg);
            opacity: 1;
          }
          100% {
            transform: scale(0.72) rotate(180deg);
            opacity: 0.3;
          }
        }

        @keyframes circleOuterPulse {
          0% {
            transform: scale(0.85);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.35);
            opacity: 0.35;
          }
          100% {
            transform: scale(0.85);
            opacity: 0.1;
          }
        }

        @keyframes emblemPopInOut {
          0% {
            transform: scale(0.88);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(0.88);
            opacity: 0.7;
          }
        }

        .brand-circle-pop {
          transform-origin: center center;
          animation: circlePopInOut 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: transform, opacity;
        }

        .brand-circle-outer {
          transform-origin: center center;
          animation: circleOuterPulse 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: transform, opacity;
        }

        .brand-emblem-pop {
          transform-origin: center center;
          animation: emblemPopInOut 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
}
