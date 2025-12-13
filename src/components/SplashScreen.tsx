import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const HeartbeatLine = () => {
  return (
    <svg
      viewBox="0 0 200 60"
      className="w-32 sm:w-40 md:w-48 h-12 sm:h-14 md:h-16"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      
      {/* ECG heartbeat path */}
      <path
        d="M 0 30 L 30 30 L 40 30 L 50 30 L 55 30 L 60 20 L 65 40 L 70 10 L 75 50 L 80 25 L 85 30 L 95 30 L 105 30 L 110 30 L 115 20 L 120 40 L 125 10 L 130 50 L 135 25 L 140 30 L 150 30 L 200 30"
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary-foreground animate-[dash_2s_linear_infinite]"
        style={{
          strokeDasharray: "300",
          strokeDashoffset: "300",
        }}
      />
      
      {/* Glowing dot that travels along the path */}
      <circle r="4" fill="currentColor" className="text-primary-foreground">
        <animateMotion
          dur="2s"
          repeatCount="indefinite"
          path="M 0 30 L 30 30 L 40 30 L 50 30 L 55 30 L 60 20 L 65 40 L 70 10 L 75 50 L 80 25 L 85 30 L 95 30 L 105 30 L 110 30 L 115 20 L 120 40 L 125 10 L 130 50 L 135 25 L 140 30 L 150 30 L 200 30"
        />
      </circle>
      
      {/* Glow effect for the dot */}
      <circle r="8" fill="currentColor" className="text-primary-foreground opacity-30">
        <animateMotion
          dur="2s"
          repeatCount="indefinite"
          path="M 0 30 L 30 30 L 40 30 L 50 30 L 55 30 L 60 20 L 65 40 L 70 10 L 75 50 L 80 25 L 85 30 L 95 30 L 105 30 L 110 30 L 115 20 L 120 40 L 125 10 L 130 50 L 135 25 L 140 30 L 150 30 L 200 30"
        />
      </circle>
    </svg>
  );
};

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/95 to-secondary transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-secondary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* Heartbeat ECG Animation */}
        <div className="relative animate-scale-in">
          <div className="absolute inset-0 bg-primary-foreground/20 blur-xl animate-pulse" />
          <HeartbeatLine />
        </div>

        {/* App name */}
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground tracking-tight">
            Self-Learning
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-primary-foreground/90">
            Medical Analyst
          </h2>
        </div>

        {/* Tagline */}
        <p className="text-sm sm:text-base md:text-lg text-primary-foreground/70 max-w-xs sm:max-w-sm md:max-w-md animate-fade-in" style={{ animationDelay: "0.5s" }}>
          AI-Powered Healthcare Analytics
        </p>

        {/* Loading indicator */}
        <div className="mt-8 flex items-center gap-2 animate-fade-in" style={{ animationDelay: "0.7s" }}>
          <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
