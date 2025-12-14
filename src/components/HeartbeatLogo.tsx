import { cn } from "@/lib/utils";

interface HeartbeatLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32",
};

const waveformSizes = {
  sm: "w-6 h-4",
  md: "w-10 h-6",
  lg: "w-12 h-8",
  xl: "w-20 h-12 sm:w-24 sm:h-14 md:w-28 md:h-16",
};

export const HeartbeatLogo = ({ size = "md", className }: HeartbeatLogoProps) => {
  return (
    <div
      className={cn(
        "relative rounded-full flex items-center justify-center overflow-hidden",
        "bg-primary/10 border border-primary/20",
        sizeClasses[size],
        className
      )}
    >
      <div className={cn(waveformSizes[size])}>
        <svg
          viewBox="0 0 200 60"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d="M0,30 L20,30 L25,30 L30,30 L35,10 L40,50 L45,20 L50,35 L55,30 L75,30 L80,30 L85,30 L90,10 L95,50 L100,20 L105,35 L110,30 L130,30 L135,30 L140,30 L145,10 L150,50 L155,20 L160,35 L165,30 L185,30 L190,30 L195,30 L200,30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary heartbeat-line"
          />
        </svg>
      </div>
    </div>
  );
};

export default HeartbeatLogo;
