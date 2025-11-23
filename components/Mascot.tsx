import React, { useEffect, useRef, useState } from "react";

type Outcome = "correct" | "wrong" | null;

interface MascotProps {
  expression?: "happy" | "thinking" | "excited" | "sad" | "tickled";
  outcome?: Outcome;
}

const Mascot: React.FC<MascotProps> = ({ expression = "happy", outcome = null }) => {
  const [isTickled, setIsTickled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentExpression, setCurrentExpression] = useState(expression);
  const [isCrying, setIsCrying] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // preload audio
  const audio = useRef({
    correct: typeof window !== "undefined" ? new Audio("/sounds/correct.wav") : undefined,
    wrong: typeof window !== "undefined" ? new Audio("/sounds/wrong.wav") : undefined,
    tickle: typeof window !== "undefined" ? new Audio("/sounds/tickle.wav") : undefined,
  });

  const play = (k: "correct" | "wrong" | "tickle") => {
    const a = audio.current[k];
    if (!a) return;
    try {
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch {}
  };

  // inject animations + tear keyframes once
  useEffect(() => {
    if (document.getElementById("mascot-css")) return;
    const style = document.createElement("style");
    style.id = "mascot-css";
    style.innerHTML = `
      .mascot-wrapper { display:inline-block; cursor:pointer; }
      
      .mascot-celebrate {
        animation: spinDance 1s ease-in-out both;
      }
      @keyframes spinDance {
        0%   { transform: rotate(0deg) scale(1); }
        40%  { transform: rotate(180deg) scale(1.03); }
        100% { transform: rotate(360deg) scale(1); }
      }

      .mascot-tickle {
        animation: tickle 0.4s ease-in-out both;
      }
      @keyframes tickle {
        0%,100% { transform: rotate(0deg); }
        25% { transform: rotate(-8deg); }
        50% { transform: rotate(8deg); }
        75% { transform: rotate(-5deg); }
      }

      .mascot-cry {
        animation: cryBob 1s ease both;
      }
      @keyframes cryBob {
        0% { transform: translateY(0); }
        50% { transform: translateY(4px); }
        100% { transform: translateY(0); }
      }

      .tear {
        animation: tearFall 0.8s linear forwards;
      }
      @keyframes tearFall {
        0%   { opacity:1; transform:translateY(0); }
        100% { opacity:0; transform:translateY(20px); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // handle outcome animations
  useEffect(() => {
    if (!outcome || isAnimating) return;

    if (outcome === "correct") {
      correctAnim();
    } else if (outcome === "wrong") {
      wrongAnim();
    }
  }, [outcome]);

  const correctAnim = () => {
    setIsAnimating(true);
    setCurrentExpression("happy");
    play("correct");

    const el = wrapperRef.current;
    el?.classList.add("mascot-celebrate");

    setTimeout(() => {
      el?.classList.remove("mascot-celebrate");
      setIsAnimating(false);
    }, 1000);
  };

  const wrongAnim = () => {
    setIsAnimating(true);
    setCurrentExpression("sad");
    setIsCrying(true);
    play("wrong");

    const el = wrapperRef.current;
    el?.classList.add("mascot-cry");

    setTimeout(() => {
      setIsCrying(false);
      el?.classList.remove("mascot-cry");
      setIsAnimating(false);
    }, 1000);
  };

  const handleTickle = () => {
    if (isAnimating) return;

    setIsTickled(true);
    setCurrentExpression("tickled");
    play("tickle");

    const el = wrapperRef.current;
    el?.classList.add("mascot-tickle");

    setTimeout(() => {
      setIsTickled(false);
      setCurrentExpression(expression);
      el?.classList.remove("mascot-tickle");
    }, 400);
  };

  // facial expressions
  const faces: Record<string, React.ReactNode> = {
    happy: (
      <>
        <ellipse cx="18" cy="24" rx="2.5" ry="4.5" fill="black" />
        <ellipse cx="32" cy="24" rx="2.5" ry="4.5" fill="black" />
        <path d="M 20 32 C 23 36, 27 36, 30 32" stroke="black" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </>
    ),
    tickled: (
      <>
        <path d="M 16 26 C 18 22, 22 22, 24 26" stroke="black" strokeWidth="1.5" fill="none" />
        <path d="M 30 26 C 32 22, 36 22, 38 26" stroke="black" strokeWidth="1.5" fill="none" />
        <path d="M 20 33 C 22 38, 28 38, 30 33" stroke="black" strokeWidth="1.5" fill="#fff" />
      </>
    ),
    sad: (
      <>
        <ellipse cx="18" cy="26" rx="2" ry="3" fill="black" />
        <ellipse cx="32" cy="26" rx="2" ry="3" fill="black" />
        <path d="M 21 36 C 23 33, 27 33, 29 36" stroke="black" strokeWidth="1.2" fill="none" />
      </>
    ),
    thinking: null,
    excited: null,
  };

  const bodyPath = "M 46 28 C 46 40 38 48 25 48 C 12 48 4 40 4 28 C 4 16 12 5 25 5 C 38 5 46 16 46 28 Z";

  const tears = isCrying ? (
    <g>
      <path className="tear" d="M13 32 C14 34,16 34,16 36 C16 38,13 38,13 36 Z" fill="#99ccff" />
      <path className="tear" style={{ animationDelay: "100ms" }} d="M37 32 C38 34,40 34,40 36 C40 38,37 38,37 36 Z" fill="#99ccff" />
    </g>
  ) : null;

  return (
    <div ref={wrapperRef} className="mascot-wrapper" onClick={handleTickle}>
      <svg width="112" height="112" viewBox="0 0 50 50">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        <path d={bodyPath} fill="url(#g1)" />
        <path d={bodyPath} fill="transparent" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />

        {faces[currentExpression]}
        {tears}
      </svg>
    </div>
  );
};

export default Mascot;
