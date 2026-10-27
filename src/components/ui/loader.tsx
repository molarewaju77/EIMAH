import { cn } from "@/lib/utils";

export interface LoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
  fullscreen?: boolean;
}

const sizeClasses = {
  xs: "size-3.5 border-[1.5px]",
  sm: "size-6 border-[1.5px]",
  md: "size-10 border-2",
  lg: "size-14 border-[2.5px]",
  xl: "size-20 border-[3px]",
};

export function Loader({ size = "md", className = "", label, fullscreen = false }: LoaderProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          sizeClasses[size],
          "rounded-full border-border border-t-brand-pink relative animate-[spin_1s_linear_infinite]"
        )}
      >
        <div
          className="absolute inset-[3px] rounded-full border-[1.5px] border-transparent border-b-brand-yellow animate-[spin_1.8s_linear_infinite_reverse]"
        />
      </div>
      {label && (
        <p className="text-xs font-medium text-muted-foreground tracking-wide animate-pulse">
          {label}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

export default Loader;
