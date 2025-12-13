import { Activity } from "lucide-react";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

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
        {/* Logo container with animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary-foreground/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-primary-foreground/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-primary-foreground/20 animate-scale-in">
            <Activity className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-primary-foreground animate-heartbeat" />
          </div>
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-full border-2 border-primary-foreground/30 animate-ping" style={{ animationDuration: "1.5s" }} />
          <div className="absolute inset-0 rounded-full border border-primary-foreground/20 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
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
