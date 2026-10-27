import { useEffect, useState } from "react";
import { useIsFetching } from "@tanstack/react-query";

export function Preloader() {
  const [alreadyShown] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem("eimah_preloader_shown") === "true";
    } catch {
      return false;
    }
  });

  const [phase, setPhase] = useState<"loading" | "fading" | "done">("loading");
  const isFetching = useIsFetching();

  useEffect(() => {
    if (alreadyShown) return;

    // Mark as shown immediately for this session
    try {
      sessionStorage.setItem("eimah_preloader_shown", "true");
    } catch (e) {
      // ignore
    }

    const startTime = Date.now();
    const MIN_TIME = 1300; // Allow full dropping sequence to play smoothly
    const MAX_TIMEOUT = 2800; // Safety fallback timeout

    let timer: NodeJS.Timeout;
    let safetyTimer: NodeJS.Timeout;

    const completePreloader = () => {
      setPhase("fading");
      setTimeout(() => setPhase("done"), 750); // 750ms curtain fade transition
    };

    const checkCompletion = () => {
      const elapsed = Date.now() - startTime;
      const remainingMinTime = Math.max(0, MIN_TIME - elapsed);

      timer = setTimeout(() => {
        completePreloader();
      }, remainingMinTime);
    };

    safetyTimer = setTimeout(() => {
      completePreloader();
    }, MAX_TIMEOUT);

    if (isFetching === 0) {
      checkCompletion();
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
    };
  }, [isFetching, alreadyShown]);

  if (alreadyShown || phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070709] text-white transition-all duration-750 ease-out select-none overflow-hidden ${
        phase === "fading" ? "opacity-0 scale-105 backdrop-blur-none pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Dynamic Background Glow & Ambient Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-brand-pink/20 via-brand-yellow/10 to-transparent rounded-full blur-[120px] pointer-events-none animate-pulse duration-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-brand-pink/15 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* Animated Staggered Logo SVG */}
        <div className="relative flex items-center justify-center mb-8">
          <svg
            width="280"
            height="98"
            viewBox="72 143.04024 216.72 76.32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-56 sm:w-72 md:w-80 h-auto overflow-visible filter drop-shadow-[0_10px_25px_rgba(245,144,221,0.2)]"
          >
            {/* 1. Spiral Emblem (Drops first with spring bounce & subtle spin) */}
            <g className="animate-[dropBounce_0.75s_cubic-bezier(0.34,1.56,0.64,1)_0.05s_both]">
              <path
                d="M94.111,182.027c2.101,1.258,2.886,1.282,2.83,2.399-.018.353-2.375,4.179-2.669,4.742-.038.072-.336.642-.73.707-.507.083-.511.027-.965-.214-.144-.077-1.063-.567-1.772-1.01-2.212-1.383-3.524-1.61-3.135-2.738.028-.081.184-.534.501-.94.06-.077,1.418-2.49,1.489-2.606.642-1.038.96-2.252,2.153-1.665.211.104,2.194,1.254,2.297,1.326ZM86.068,203.414c.347.476,1.948,1.744,2.126,1.885.805.637,3.239,1.664,4.164,1.746.817.072.798.144.868.15.798.062.797.069.867.071,2.97.085,5.128-.754,5.83-1.011,1.349-.493,1.308-.572,1.426-.611.482-.159,1.814-1.172,2.754-.868.295.096.491.159,3.402,1.867,2.582,1.515,3.353,1.749,3.534,2.385.314,1.101-1.078,1.443-2.768,2.257-1.834.882-5.917,1.906-8.107,1.942-.805.013-.798.08-.868.08-5.341.01-8.788-1.202-11.893-2.732-1.958-.965-4.33-2.746-4.979-3.365-.848-.81-.87-.773-.913-.823-1.473-1.692-1.459-1.694-1.785-2.081-3.286-3.892-5.572-9.878-5.46-15.466.034-3.45.41-6.792,2.979-11.733.224-.431.265-.398.493-.82.639-1.186,2.071-2.983,2.343-3.27.071-.075.064-.077.867-.947.837-.908.876-.869.946-.95.897-1.041,4.435-3.507,6.376-4.328,3.015-1.275,5.534-2.2,9.842-2.26h.315s.316,0,.316,0h.078c.7,0,5.451-.214,11.26,2.814,1.29.672,1.26.721,1.289.736,1.379.719,3.729,2.743,4.088,3.096,1.693,1.663,1.607,1.737,1.973,2.128.605.647,3.49,4.369,4.749,9.224,2.391,9.225-1.151,15.864-1.323,16.339-.455,1.258-2.215,4.109-2.711,4.644-.748.808-1.66-.072-1.916-.21-1.509-.809-1.852-1.078-2.05-1.183-1.339-.713-8.211-4.743-14.111-8.129-2.574-1.477-2.981-1.609-2.988-2.233-.005-.388.46-1.142.517-1.233.832-1.349,1.93-3.345,2.205-3.787.802-1.292,1.656-.44,2.107-.206.723.375,1.172.699,1.341.785,1.137.575,1.076.675,2.207,1.264,1.172.611,1.547.892,1.655.948.965.501,2.267,1.325,2.446,1.416.786.402,1.557.925,1.581.938,1.531.799,1.686,1.155,1.841.728.046-.125.497-1.364.551-1.575.342-1.338,2.508-7.862-.62-14.092-.023-.047-.777-1.661-2.349-3.237-2.734-2.743-6.468-3.127-6.54-3.131-1.38-.086-7.149-.82-14.023,5.735-1.924,1.893-3.992,5.018-4.786,6.63-3.306,6.715-2.481,11.889-2.459,12.52.015.446.109.424.147.867.195,2.251,1.618,4.878,1.831,5.271.356.57.372.555,1.036,1.483.159.157.162.142.299.329Z"
                fill="#f590dd"
                fillRule="evenodd"
              />
              <path
                d="M94.224,181.661c2.101,1.258,2.886,1.282,2.83,2.399-.018.353-2.375,4.179-2.669,4.742-.038.072-.336.642-.73.707-.507.083-.511.027-.965-.214-.144-.077-1.063-.567-1.772-1.01-2.212-1.383-3.524-1.61-3.135-2.738.028-.081.184-.534.501-.94.06-.077,1.418-2.49,1.489-2.606.642-1.038.96-2.252,2.153-1.665.211.104,2.194,1.254,2.297,1.326Z"
                fill="#ffffff"
                fillRule="evenodd"
              />
            </g>

            {/* 2. Letter "M" Path (Drops second) */}
            <g className="animate-[dropBounce_0.75s_cubic-bezier(0.34,1.56,0.64,1)_0.22s_both]">
              <path
                d="M136.719,167.894h2.499v9.132c1.12-1.205,2.384-2.361,3.79-3.467,1.408-1.105,2.859-2.082,4.351-2.929,1.493-.847,2.987-1.516,4.48-2.003,1.493-.489,2.915-.732,4.265-.732,1.293,0,2.606.229,3.942.688,1.336.461,2.571,1.106,3.705,1.939s2.11,1.816,2.929,2.95c.819,1.135,1.357,2.377,1.615,3.727.718-1.292,1.717-2.506,2.994-3.64,1.278-1.135,2.692-2.117,4.243-2.95,1.551-.833,3.196-1.495,4.932-1.982,1.738-.489,3.439-.732,5.105-.732s3.224.365,4.674,1.098c1.45.732,2.721,1.724,3.813,2.973,1.09,1.249,1.953,2.714,2.585,4.394.632,1.68.948,3.467.948,5.364v31.103h-8.745v-29.898c0-1.235-.208-2.405-.625-3.511-.416-1.105-.985-2.073-1.703-2.906-.716-.835-1.558-1.495-2.52-1.983-.962-.487-1.974-.732-3.037-.732-1.207,0-2.433.166-3.683.496-1.249.33-2.435.784-3.556,1.357-1.119.575-2.138,1.242-3.058,2.003-.919.762-1.652,1.574-2.197,2.435v32.74h-8.745v-29.898c0-1.235-.215-2.405-.646-3.511-.431-1.105-1.006-2.073-1.724-2.906-.718-.835-1.565-1.495-2.541-1.983-.978-.487-1.996-.732-3.06-.732-1.119,0-2.276.173-3.467.517-1.191.346-2.355.805-3.49,1.38-1.133.573-2.19,1.242-3.166,2.003-.976.761-1.78,1.558-2.412,2.391v32.74h-8.789v-42.477l6.291-2.455Z"
                fill="#ffffff"
              />
            </g>

            {/* 3. Letter "A" Path (Drops third) */}
            <g className="animate-[dropBounce_0.75s_cubic-bezier(0.34,1.56,0.64,1)_0.38s_both]">
              <path
                d="M231.149,187.15c-1.263.402-2.569.861-3.919,1.378-1.35.517-2.671,1.099-3.963,1.745-1.293.646-2.529,1.343-3.706,2.089-1.177.746-2.211,1.551-3.102,2.412-.889.861-1.593,1.766-2.11,2.714-.517.948-.776,1.939-.776,2.973,0,1.09.201,2.117.604,3.079.402.963.933,1.81,1.595,2.543.66.732,1.42,1.306,2.281,1.722.863.416,1.752.625,2.672.625.978,0,1.909-.129,2.8-.386.891-.259,1.752-.611,2.585-1.057.833-.445,1.666-.955,2.499-1.528.833-.575,1.68-1.193,2.541-1.853v-16.456ZM235.243,212.826c-1.149-.575-2.119-1.387-2.908-2.435-.791-1.048-1.186-2.246-1.186-3.596-1.034.775-2.045,1.579-3.037,2.412-.99.833-2.068,1.586-3.231,2.262-1.163.674-2.456,1.226-3.876,1.657-1.422.432-3.067.648-4.934.648-1.722,0-3.28-.281-4.674-.84-1.392-.561-2.569-1.329-3.531-2.306-.963-.976-1.71-2.138-2.241-3.488-.531-1.35-.798-2.8-.798-4.351,0-1.895.374-3.605,1.12-5.126.746-1.523,1.773-2.88,3.081-4.071,1.306-1.193,2.822-2.255,4.544-3.188,1.724-.933,3.563-1.766,5.514-2.499,1.953-.732,3.963-1.385,6.031-1.96,2.068-.573,4.079-1.104,6.031-1.593v-2.758c0-2.01-.143-3.704-.43-5.082-.288-1.38-.732-2.492-1.336-3.34-.602-.847-1.371-1.45-2.304-1.808s-2.045-.538-3.338-.538c-1.235,0-2.37.243-3.404.732-1.034.489-1.945,1.142-2.735,1.96-.789.819-1.436,1.781-1.939,2.885-.501,1.106-.84,2.276-1.011,3.511h-8.013c.229-1.895.882-3.589,1.961-5.083,1.076-1.493,2.433-2.749,4.071-3.769,1.636-1.02,3.495-1.802,5.577-2.347,2.082-.547,4.244-.819,6.485-.819,2.871,0,5.283.279,7.236.84,1.953.559,3.518,1.343,4.695,2.347,1.179,1.006,2.019,2.234,2.522,3.684.501,1.45.753,3.051.753,4.803v27.226c0,1.35.395,2.548,1.184,3.596.79,1.048,1.759,1.86,2.908,2.435h-8.787Z"
                fill="#ffffff"
              />
            </g>

            {/* 4. Letter "H" Path (Drops fourth) */}
            <g className="animate-[dropBounce_0.75s_cubic-bezier(0.34,1.56,0.64,1)_0.54s_both]">
              <path
                d="M257.605,176.813c2.615-2.986,5.371-5.219,8.272-6.698,2.901-1.479,5.83-2.218,8.787-2.218,1.551,0,2.994.344,4.33,1.034,1.336.688,2.506,1.636,3.512,2.843,1.004,1.207,1.794,2.62,2.37,4.244.573,1.622.861,3.353.861,5.191v31.62h-8.745v-30.113c0-2.929-.662-5.147-1.982-6.656-1.322-1.507-3.016-2.262-5.084-2.262-.919,0-1.895.159-2.929.475-1.034.316-2.082.753-3.144,1.315-1.064.559-2.126,1.226-3.188,2.003-1.062.775-2.082,1.637-3.06,2.585v32.654h-8.787v-64.103l6.289-2.499h2.499v30.586Z"
                fill="#ffffff"
              />
            </g>
          </svg>

          {/* Shimmer Wave Across Logo */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmerSweep_2s_infinite_ease-in-out_1s] pointer-events-none" />
        </div>

        {/* Sleek Underline Bar */}
        <div className="w-40 h-[2.5px] bg-white/10 rounded-full overflow-hidden relative mb-4 animate-[fadeIn_0.6s_ease-out_0.7s_both]">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-pink via-brand-yellow to-brand-pink animate-[shimmer_1.8s_infinite_linear]" />
        </div>

        {/* Micro Tagline */}
        <p className="text-[10px] uppercase tracking-[0.35em] font-semibold text-white/60 animate-[fadeIn_0.8s_ease-out_0.85s_both]">
          Quality • Procurement • Retail
        </p>
      </div>

      {/* Embedded Custom Keyframe Animations */}
      <style>{`
        @keyframes dropBounce {
          0% {
            opacity: 0;
            transform: translateY(-60px) scale(0.8);
          }
          65% {
            opacity: 1;
            transform: translateY(8px) scale(1.03);
          }
          85% {
            transform: translateY(-3px) scale(0.99);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shimmerSweep {
          0% {
            transform: translateX(-100%) rotate(15deg);
          }
          100% {
            transform: translateX(200%) rotate(15deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
