import React, { useEffect, useRef, useState } from "react";

interface MascotProps {
  expression?: "happy" | "thinking" | "excited" | "sad" | "tickled";
  outcome?: "correct" | "wrong" | null; // parent can set this to trigger celebrate/cry
  // optional override if you want to use a different sound system
  playSound?: (kind: "correct" | "wrong" | "tickle") => void;
}

const Mascot: React.FC<MascotProps> = ({ expression = "happy", outcome = null, playSound }) => {
  const [isTickled, setIsTickled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentExpression, setCurrentExpression] = useState(expression);
  const [isCrying, setIsCrying] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Preload audio elements pointing to files you uploaded in public/sounds/
  const audios = useRef<{
    correct: HTMLAudioElement;
    wrong: HTMLAudioElement;
    tickle: HTMLAudioElement;
  } | null>(null);

  useEffect(() => {
    // Create audio objects once
    if (!audios.current) {
      const base = "/sounds";
      audios.current = {
        correct: new Audio(`${base}/correct.wav`),
        wrong: new Audio(`${base}/wrong.wav`),
        tickle: new Audio(`${base}/tickle.wav`),
      };
      // allow faster playback next time
      Object.values(audios.current).forEach((a) => {
        a.preload = "auto";
        a.load();
      });
    }
  }, []);

  // small helper to play audio (tries play, swallows promise rejection from autoplay policies)
  const playLocal = (kind: "correct" | "wrong" | "tickle") => {
    if (playSound) {
      try {
        playSound(kind);
      } catch {
        // ignore
      }
      return;
    }
    const a = audios.current ? audios.current[kind] : null;
    if (!a) return;
    try {
      a.currentTime = 0;
      const p = a.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {
      /* ignore autoplay errors */
    }
  };

  // Inject minimal scoped CSS for mascot animations (only once)
  useEffect(() => {
    if (document.getElementById("mascot-styles")) return;
    const css = `
      .mascot-wrapper { display:inline-block; cursor:pointer; will-change: transform; }
      .mascot-celebrate { animation: mascot-celebrate 1000ms ease-in-out both; }
      .mascot-tickle-animation { animation: mascot-tickle 400ms ease-in-out both; }
      .mascot-crying { animation: mascot-cry 1000ms linear both; }
      @keyframes mascot-celebrate { 0% { transform: translateY(0) rotate(0deg) scale(1); } 50% { transform: translateY(-8px) rotate(180deg) scale(1.03);} 100% { transform: translateY(0) rotate(360deg) scale(1);} }
      @keyframes mascot-tickle { 0% { transform: rotate(0deg) translateX(0);} 25% { transform: rotate(-6deg) translateX(-2px);} 50% { transform: rotate(6deg) translateX(2px);} 75% { transform: rotate(-4deg) translateX(-1px);} 100% { transform: rotate(0deg) translateX(0);} }
      @keyframes mascot-cry { 0% { transform: translateY(0);} 50% { transform: translateY(2px);} 100% { transform: translateY(0);} }
      .tear { animation: tear-fall 700ms linear forwards; }
      @keyframes tear-fall { 0% { opacity: 1; transform: translateY(0) scaleY(1);} 100% { opacity: 0; transform: translateY(12px) scaleY(1.2);} }
    `;
    const style = document.createElement("style");
    style.id = "mascot-styles";
    style.innerHTML = css;
    document.head.appendChild(style);
  }, []);

  // respond to outcome prop
  useEffect(() => {
    if (!outcome) return;
    if (isAnimating) return;

    if (outcome === "correct") {
      triggerCorrect();
    } else if (outcome === "wrong") {
      triggerWrong();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  const triggerCorrect = () => {
    setIsAnimating(true);
    setCurrentExpression("happy");
    const el = wrapperRef.current;
    if (el) {
      el.classList.remove("mascot-crying", "mascot-tickle-animation");
      el.classList.add("mascot-celebrate");
    }
    playLocal("correct");
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
      el.classList.remove("mascot-celebrate", "mascot-tickle-animation");
      el.classList.add("mascot-crying");
    }
    playLocal("wrong");
    setTimeout(() => {
      setIsCrying(false);
      if (el) el.classList.remove("mascot-crying");
      setIsAnimating(false);
    }, 1000);
  };

  const handleTickle = () => {
    if (isTickled || isAnimating) return;
    setIsTickled(true);
    setCurrentExpression("tickled");
    const el = wrapperRef.current;
    if (el) {
      el.classList.remove("mascot-celebrate", "mascot-crying");
      el.classList.add("mascot-tickle-animation");
    }
    playLocal("tickle");
    setTimeout(() => {
      setIsTickled(false);
      setCurrentExpression(expression);
      if (el) el.classList.remove("mascot-tickle-animation");
    }, 400);
  };

  const expressions: any = {
    happy: (
      <>
        <ellipse cx="18" cy="24" rx="2.5" ry="4.5" fill="black" />
        <ellipse cx="32" cy="24" rx="2.5" ry="4.5" fill="black" />
        <circle cx="19" cy="22" r="1" fill="white" />
        <circle cx="33" cy="22" r="1" fill="white" />
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
      <path className="tear" d="M13 32 C14 34,16 34,16 36 C16 38,13 38,13 36 C13 34,12 33,13 32 Z" fill="#99ccff" opacity="0.95" />
      <path className="tear" d="M37 32 C38 34,40 34,40 36 C40 38,37 38,37 36 C37 34,36 33,37 32 Z" fill="#99ccff" opacity="0.95" style={{ animationDelay: "80ms" }} />
    </g>
  ) : null;

  return (
    <div
      ref={wrapperRef}
      className={`mascot-wrapper ${isTickled ? "mascot-tickle-animation" : ""}`}
      onClick={handleTickle}
      title="Tickle me!"
      role="button"
      aria-label="mascot"
    >
      <svg width="112" height="112" viewBox="0 0 50 50" className="drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mascotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#a855f7", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#ec4899", stopOpacity: 1 }} />
          </linearGradient>
          <filter id="blush">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
          </filter>
        </defs>

        <g>
          <path d={bodyPath} fill="url(#mascotGradient)" />
          <path d="M 4,30 C 0,31 0,36 4,37" fill="url(#mascotGradient)" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
          <path d="M 46,30 C 50,31 50,36 46,37" fill="url(#mascotGradient)" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
        </g>

        <path d={bodyPath} fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />

        <g className="transition-opacity duration-300">
          <circle cx="13" cy="30" r={isTickled ? 5.5 : 4} fill="#FFC0CB" opacity={isTickled ? "0.8" : "0.7"} filter="url(#blush)" style={{ transition: "r 0.2s ease-in-out" }} />
          <circle cx="37" cy="30" r={isTickled ? 5.5 : 4} fill="#FFC0CB" opacity={isTickled ? "0.8" : "0.7"} filter="url(#blush)" style={{ transition: "r 0.2s ease-in-out" }} />

          {expressions[currentExpression]}

          {tears}
        </g>
      </svg>
    </div>
  );
};

export default Mascot;

/* ------------------------------------------------------------------
  Optional: a tiny demo component that wires a sample quiz to the Mascot.
  Keep this below if you want to drop <MascotQuizDemo /> into a page to test.
  You can remove it later if you prefer only the Mascot component.
-------------------------------------------------------------------*/

export const MascotQuizDemo: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);

  const sampleQuestions = [
    { q: 'Select the correct past tense of "go".', choices: ["goed", "went", "gone"], answerIndex: 1 },
    { q: 'Which is a synonym of "quick"?', choices: ["slow", "rapid", "dull"], answerIndex: 1 },
  ];

  const handleChoice = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    const q = sampleQuestions[current];
    const correct = i === q.answerIndex;
    if (correct) {
      setScore((s) => s + 1);
      setOutcome("correct");
    } else {
      setOutcome("wrong");
    }
    // clear outcome after animation
    setTimeout(() => setOutcome(null), 1000);
  };

  const next = () => {
    setSelected(null);
    setOutcome(null);
    setCurrent((c) => (c + 1) % sampleQuestions.length);
  };

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center", padding: 20 }}>
      <div>
        <Mascot outcome={outcome} />
        <div style={{ marginTop: 8, fontSize: 12, color: "#444" }}>Click mascot to tickle (plays tickle sound)</div>
      </div>

      <div style={{ maxWidth: 420 }}>
        <h3>Question {current + 1}</h3>
        <p style={{ marginTop: 6, marginBottom: 12 }}>{sampleQuestions[current].q}</p>

        <div style={{ display: "grid", gap: 8 }}>
          {sampleQuestions[current].choices.map((c, i) => (
            <button
              key={i}
              onClick={() => handleChoice(i)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: selected === null ? "1px solid #ddd" : i === sampleQuestions[current].answerIndex ? "2px solid #22c55e" : selected === i ? "2px solid #ef4444" : "1px solid #eee",
                background: "#fff",
                cursor: selected === null ? "pointer" : "default",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button onClick={next} style={{ padding: "6px 10px", borderRadius: 6 }}>
            Next Question
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Score:</strong> {score}
        </div>
      </div>
    </div>
  );
};
