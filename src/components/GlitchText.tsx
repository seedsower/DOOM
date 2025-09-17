'use client';

import React, { useState, useEffect } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchIntensity?: number;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ 
  text, 
  className = '', 
  glitchIntensity = 0.1 
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const glitchChars = '!@#$%^&*(){}[]|\\:";\'<>?,./`~ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
    const glitchInterval = setInterval(() => {
      if (Math.random() < glitchIntensity) {
        setIsGlitching(true);
        
        // Create glitched version of text
        const glitchedText = text
          .split('')
          .map(char => {
            if (Math.random() < 0.3) {
              return glitchChars[Math.floor(Math.random() * glitchChars.length)];
            }
            return char;
          })
          .join('');
        
        setDisplayText(glitchedText);
        
        // Restore original text after brief glitch
        setTimeout(() => {
          setDisplayText(text);
          setIsGlitching(false);
        }, 100 + Math.random() * 200);
      }
    }, 1000 + Math.random() * 3000);

    return () => clearInterval(glitchInterval);
  }, [text, glitchIntensity]);

  return (
    <span 
      className={`glitch ${className} ${isGlitching ? 'animate-pulse' : ''}`}
      data-text={displayText}
    >
      {displayText}
    </span>
  );
};
