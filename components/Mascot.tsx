import React, { useEffect, useRef, useState } from "react";

type Outcome = "correct" | "wrong" | null;

interface MascotProps {
  expression?: "happy" | "thinking" | "excited" | "sad" | "tickled";
  outcome?: Outcome; // parent can set this to trigger celebrate / cry
}

const Mascot: React.FC<MascotProps> = ({ expression = "happy", outcome = null }) => {
  const [isTickled, setIsTickled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentExpression, setCurrentExpression] = useState(expression);
  const [isCrying, setIsCrying] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // preload audio pointing to files you uploaded in public/sounds/
  const audio = useRef<{ correct?: HTMLAudioElement; wrong?: HTMLAudioElement; tickle?: HTMLAudioElement }>({});

  useEffect(() => {
    if (!audio.current.correct) {
      const base = "/sounds";
      audio.current.correct = new Audio(`${base}/correct.wav`);
      audio.current.wrong = new Audio(`${base}/wrong.wav`);
      audio.current.tickle = new Audio(`${base}/tickle.wav`);
      Object.values(audio.current).forEach((a) => {
        if (a) {
          a.preload = "auto";
          a.load();
        }
      });
    }
  }, []);

  const play = (kind: "correct" | "wrong" | "tickle") => {
    const a = audio.current[kind];
    if (!a) return;
    try {
      a.currentTime = 0;
      const p = a.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {
      // swallow autoplay errors
    }
  };

  // inject scoped CSS (only once)
  useEffect(() => {
    if (document.getElementById("mascot-restored-styles")) return;
    const css = `
      .mascot-restored { display:inline-block; cursor:pointer; will-change: transform; }
      /* celebrate: 360 deg spin + little dance — 1s total */
      .mascot-celebrate { animation: mascot-celebrate 1000ms cubic-bezier(.22,.9,.35,1) both; }
      @keyframes mascot-celebrate {
        0% { transform: translateY(0) rotate(0deg) scale(1); }
        30% { transform: translateY(-10px) rotate(160deg) scale(1.03); }
        60% { transform: translateY(-6px) rotate(300deg) scale(0.98); }
        100% { transform: translateY(0) rotate(360deg) scale(1); }
      }

      /* tickle quick wobble */
      .mascot-tickle { animation: mascot-tickle 400ms ease-in-out both; }
      @keyframes mascot-tickle {
        0%,100% { transform: rotate(0deg); }
        20% { transform: rotate(-8deg) translateX(-3px); }
        40% { transform: rotate(8deg) translateX(3px); }
        60% { transform: rotate(-5deg) translateX(-2px); }
        80% { transform: rotate(6deg) translateX(2px); }
      }

      /* crying bob */
      .mascot-cry { animation: mascot-cry 1000ms ease-in-out both; }
      @keyframes mascot-cry { 0% { transform: translateY(0);} 50% { transform: translateY(4px);} 100% { transform: translateY(0);} }

      /* tear drop */
      .mascot-tear { animation: tear-fall 800ms linear forwards; transform-origin: center top; }
      @keyframes tear-fall { 0% { opacity: 1; transform: translateY(0) scaleY(1);} 100% { opacity: 0; transform: translateY(18px) scaleY(1.1);} }

      .mascot-blush { transition: r 0.18s ease-in-out; }

      /* little hover to invite tickle */
      .mascot-restored:focus, .mascot-restored:hover { transform: scale(1.03); transition: transform 140ms ease; }
    `;
    const style = document.createElement("style");
    style.id = "mascot-restored-styles";
    style.innerHTML = css;
    document.head.appendChild(style);
  }, []);

  // respond to outcome prop
  useEffect(() => {
    if (!outcome) return;
    if (isAnimating) return;
    if (outcome === "correct") triggerCorrect();
    else if (outcome === "wrong") triggerWrong();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  const triggerCorrect = () => {
    setIsAnimating(true);
    setCurrentExpression("happy");
    const el = wrapperRef.current;
    if (el) {
      el.classList.remove("mascot-cry", "mascot-tickle");
      el.classList.add("mascot-celebrate");
    }
    play("correct");
    setTimeout(() => {
      if (el) el.classList.remove("mascot-celebrate");
      setIsAnimating(false);
    }, 1000);
  };

  const triggerWrong = () => {
    setIsAnimating(true);
    setCurrentExpression("sad");
    setIsCrying(true);
    const el = wrapperRef.current;
    if (el) {
      el.classList.remove("mascot-celebrate", "mascot-tickle");
      el.classList.add("mascot-cry");
    }
    play("wrong");
    setTimeout(() => {
      setIsCrying(false);
      if (el) el.classList.remove("mascot-cry");
      setIsAnimating(false);
    }, 1000);
  };

  const handleTickle = () => {
    if (isTickled || isAnimating) return;
    setIsTickled(true);
    setCurrentExpression("tickled");
    const el = wrapperRef.current;
    if (el) {
      el.classList.remove("mascot-celebrate", "mascot-cry");
      el.classList.add("mascot-tickle");
    }
    play("tickle");
    setTimeout(() => {
      setIsTickled(false);
      setCurrentExpression(expression);
      if (el) el.classList.remove("mascot-tickle");
    }, 400);
  };

  // restore original-looking face shapes and details
  const expressions: Record<string, React.ReactNode> = {
    happy: (
      <>
        {/* Eyes */}
        <ellipse cx="18" cy="24" rx="2.5" ry="4.5" fill="black" />
        <ellipse cx="32" cy="24" rx="2.5" ry="4.5" fill="black" />
        {/* Eye highlights */}
        <circle cx="19" cy="22" r="1" fill="white" />
        <circle cx="33" cy="22" r="1" fill="white" />
        {/* Mouth smile */}
        <path d="M 21 34 C 23 37, 27 37, 29 34" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </>
    ),
    thinking: (
      <>
        <ellipse cx="16" cy="24" rx="2.5" ry="4.5" fill="black" />
        <ellipse cx="30" cy="24" rx="2.5" ry="4.5" fill="black" />
        <circle cx="17" cy="22" r="1" fill="white" />
        <circle cx="31" cy="22" r="1" fill="white" />
        <path d="M 23 35 L 27 35" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 14 18 C 16 16, 19 16, 21 18" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </>
    ),
    excited: (
      <>
        <ellipse cx="18" cy="25" rx="3.5" ry="5.5" fill="black" />
        <ellipse cx="32" cy="25" rx="3.5" ry="5.5" fill="black" />
        <circle cx="19.5" cy="23" r="1.5" fill="white" />
        <circle cx="33.5" cy="23" r="1.5" fill="white" />
        <ellipse cx="25" cy="36" rx="4" ry="4" stroke="black" strokeWidth="1.5" fill="none" />
      </>
    ),
    tickled: (
      <>
        <path d="M 16 26 C 18 22, 22 22, 24 26" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 30 26 C 32 22, 36 22, 38 26" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 20 33 C 22 38, 28 38, 30 33" stroke="black" strokeWidth="1.5" fill="#FFFBFF" strokeLinecap="round" />
      </>
    ),
    sad: (
      <>
        <ellipse cx="18" cy="26" rx="2" ry="3" fill="black" />
        <ellipse cx="32" cy="26" rx="2" ry="3" fill="black" />
        <path d="M 21 36 C 23 33, 27 33, 29 36" stroke="black" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </>
    ),
  };

  const bodyPath = "M 46 28 C 46 40 38 48 25 48 C 12 48 4 40 4 28 C 4 16 12 5 25 5 C 38 5 46 16 46 28 Z";

  const tears = isCrying ? (
    <g>
      <path className="mascot-tear" d="M13 32 C14 34,16 34,16 36 C16 38,13 38,13 36 C13 34,12 33,13 32 Z" fill="#99ccff" opacity="0.95" />
      <path className="mascot-tear" d="M37 32 C38 34,40 34,40 36 C40 38,37 38,37 36 C37 34,36 33,37 32 Z" fill="#99ccff" opacity="0.95" style={{ animationDelay: "80ms" }} />
    </g>
  ) : null;

  return (
    <div
      ref={wrapperRef}
      className="mascot-restored"
      onClick={handleTickle}
      title="Tickle me!"
      role="button"
      tabIndex={0}
      aria-label="mascot"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleTickle();
        }
      }}
    >
      <svg width="112" height="112" viewBox="0 0 50 50" className="drop-shadow-lg" xmlns="http://www.w3.org/2000/svg" aria-hidden="false">
        <defs>
          <linearGradient id="mascotGradientRestored" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#a855f7", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#ec4899", stopOpacity: 1 }} />
          </linearGradient>
          <filter id="blushFilter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
          </filter>
        </defs>

        {/* Body & Hands */}
        <g>
          <path d={bodyPath} fill="url(#mascotGradientRestored)" />
          <path d="M 4,30 C 0,31 0,36 4,37" fill="url(#mascotGradientRestored)" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
          <path d="M 46,30 C 50,31 50,36 46,37" fill="url(#mascotGradientRestored)" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
        </g>

        {/* Inner sheen */}
        <path d={bodyPath} fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />

        {/* Face group */}
        <g className="transition-opacity duration-300" transform="translate(0,0)">
          {/* Blush */}
          <circle cx="13" cy="30" r={isTickled ? 5.5 : 4} className="mascot-blush" fill="#FFC0CB" opacity={isTickled ? "0.85" : "0.7"} filter="url(#blushFilter)" />
          <circle cx="37" cy="30" r={isTickled ? 5.5 : 4} className="mascot-blush" fill="#FFC0CB" opacity={isTickled ? "0.85" : "0.7"} filter="url(#blushFilter)" />

          {/* Face elements */}
          {expressions[currentExpression]}

          {/* Tears */}
          {tears}
        </g>
      </svg>
    </div>
  );
};

export default Mascot;
