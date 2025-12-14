import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const HeartbeatWaveform = () => {
  return (
    <div className="relative w-16 h-12 sm:w-20 sm:h-14 md:w-24 md:h-16 overflow-hidden">
      <svg
        viewBox="0 0 200 80"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Animated heartbeat path */}
        <path
          d="M0,40 L30,40 L40,40 L50,20 L60,60 L70,10 L80,70 L90,40 L100,40 L130,40 L140,40 L150,20 L160,60 L170,10 L180,70 L190,40 L200,40 L230,40 L240,40 L250,20 L260,60 L270,10 L280,70 L290,40 L300,40"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary-foreground animate-heartbeat-wave"
        />
      </svg>
      {/* Gradient overlay for smooth edges */}
      <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-primary-foreground/10 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-primary-foreground/10 to-transparent" />
    </div>
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
        {/* Logo container with heartbeat animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary-foreground/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-primary-foreground/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-primary-foreground/20 animate-scale-in">
            <HeartbeatWaveform />
          </div>
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
