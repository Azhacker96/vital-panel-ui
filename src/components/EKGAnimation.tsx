import { useEffect, useState } from "react";

const EKGAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  return (
    <svg
      viewBox="0 0 500 500"
      className="w-full h-full"
      style={{ overflow: "visible" }}
    >
      {/* Glow filter */}
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background pulse circle */}
      <circle
        cx="250"
        cy="250"
        r="200"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-primary-foreground/10"
      />

      {/* EKG Path - Background trace */}
      <path
        d="M50,250 L130,250 L145,230 L160,250 L175,250 L185,270 L210,80 L235,420 L255,250 L285,250 L315,200 L345,250 L450,250"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary-foreground/20"
      />

      {/* EKG Path - Animated trace */}
      <path
        d="M50,250 L130,250 L145,230 L160,250 L175,250 L185,270 L210,80 L235,420 L255,250 L285,250 L315,200 L345,250 L450,250"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        className="text-primary-foreground"
        style={{
          strokeDasharray: 1000,
          strokeDashoffset: isAnimating ? 0 : 1000,
          transition: "stroke-dashoffset 1.5s ease-in-out",
        }}
      />

      {/* Repeating animation overlay */}
      <path
        d="M50,250 L130,250 L145,230 L160,250 L175,250 L185,270 L210,80 L235,420 L255,250 L285,250 L315,200 L345,250 L450,250"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        className="text-primary-foreground ekg-trace"
      />

      <style>{`
        .ekg-trace {
          stroke-dasharray: 1000;
          animation: ekg-draw 1.5s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        
        @keyframes ekg-draw {
          0% {
            stroke-dashoffset: 1000;
            opacity: 1;
          }
          80% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }
      `}</style>
    </svg>
  );
};

export default EKGAnimation;
