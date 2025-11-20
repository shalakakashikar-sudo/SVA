
import React, { useState } from 'react';

interface MascotProps {
  expression?: 'happy' | 'thinking' | 'excited';
  isCelebrating?: boolean;
}

const Mascot: React.FC<MascotProps> = ({ expression = 'happy', isCelebrating = false }) => {
  const [isTickled, setIsTickled] = useState(false);

  const handleTickle = () => {
    if (isTickled) return; // Prevent re-triggering while animation is playing
    setIsTickled(true);
    setTimeout(() => {
      setIsTickled(false);
    }, 400); // Corresponds to the animation duration
  };

  const expressions = {
    happy: (
      <>
        {/* Eyes */}
        <ellipse cx="18" cy="24" rx="2.5" ry="4.5" fill="black" />
        <ellipse cx="32" cy="24" rx="2.5" ry="4.5" fill="black" />
        {/* Eye Highlights */}
        <circle cx="19" cy="22" r="1" fill="white" />
        <circle cx="33" cy="22" r="1" fill="white" />
        {/* Mouth */}
        <path d="M 21 34 C 23 37, 27 37, 29 34" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </>
    ),
    thinking: (
      <>
        {/* Eyes */}
        <ellipse cx="16" cy="24" rx="2.5" ry="4.5" fill="black" />
        <ellipse cx="30" cy="24" rx="2.5" ry="4.5" fill="black" />
        {/* Eye Highlights */}
        <circle cx="17" cy="22" r="1" fill="white" />
        <circle cx="31" cy="22" r="1" fill="white" />
        {/* Mouth */}
        <path d="M 23 35 L 27 35" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Thinking Eyebrow */}
        <path d="M 14 18 C 16 16, 19 16, 21 18" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </>
    ),
    // This will be used for incorrect answers, so it's more of a surprised/oops face
    excited: (
      <>
        {/* Eyes */}
        <ellipse cx="18" cy="25" rx="3.5" ry="5.5" fill="black" />
        <ellipse cx="32" cy="25" rx="3.5" ry="5.5" fill="black" />
         {/* Eye Highlights */}
        <circle cx="19.5" cy="23" r="1.5" fill="white" />
        <circle cx="33.5" cy="23" r="1.5" fill="white" />
        {/* Mouth */}
        <ellipse cx="25" cy="36" rx="4" ry="4" stroke="black" strokeWidth="1.5" fill="none" />
      </>
    ),
    tickled: (
        <>
          {/* Eyes (squinted laughing) */}
          <path d="M 16 26 C 18 22, 22 22, 24 26" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 30 26 C 32 22, 36 22, 38 26" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Mouth (big laugh) */}
          <path d="M 20 33 C 22 38, 28 38, 30 33" stroke="black" strokeWidth="1.5" fill="#FFFBFF" strokeLinecap="round" />
        </>
      )
  };

  const bodyPath = "M 46 28 C 46 40 38 48 25 48 C 12 48 4 40 4 28 C 4 16 12 5 25 5 C 38 5 46 16 46 28 Z";

  const currentAnimation = isTickled 
    ? 'mascot-tickle-animation' 
    : isCelebrating 
    ? 'mascot-celebrate-animation' 
    : 'mascot-bob-animation';

  return (
    <div 
      className={`flex flex-col items-center transition-transform duration-300 ease-in-out hover:scale-105 ${currentAnimation}`}
      onClick={handleTickle}
      style={{ cursor: 'pointer' }}
      title="Tickle me!"
    >
      <svg width="112" height="112" viewBox="0 0 50 50" className="drop-shadow-lg">
        <defs>
          <linearGradient id="mascotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} /> 
            <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="blush">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
          </filter>
        </defs>
        
        {/* Body & Hands Group */}
        <g>
            {/* Body */}
            <path d={bodyPath} fill="url(#mascotGradient)" />
            {/* Hands */}
            <path d="M 4,30 C 0,31 0,36 4,37" fill="url(#mascotGradient)" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
            <path d="M 46,30 C 50,31 50,36 46,37" fill="url(#mascotGradient)" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
        </g>
        
        {/* Inner shadow for depth */}
        <path 
          d={bodyPath}
          fill="transparent"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="3"
        />
        
        {/* Face */}
        <g className="transition-opacity duration-300">
          {/* Blush */}
          <circle cx="13" cy="30" r={isTickled ? 5.5 : 4} fill="#FFC0CB" opacity={isTickled ? "0.8" : "0.7"} filter="url(#blush)" style={{transition: 'r 0.2s ease-in-out'}} />
          <circle cx="37" cy="30" r={isTickled ? 5.5 : 4} fill="#FFC0CB" opacity={isTickled ? "0.8" : "0.7"} filter="url(#blush)" style={{transition: 'r 0.2s ease-in-out'}}/>

          {isTickled ? expressions.tickled : expressions[expression]}
        </g>
      </svg>
    </div>
  );
};

export default Mascot;