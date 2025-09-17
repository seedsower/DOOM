'use client';

import React, { useEffect, useRef } from 'react';

export const GlitchBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Glitch effect variables
    let animationId: number;
    const glitchLines: Array<{
      y: number;
      height: number;
      offset: number;
      speed: number;
      opacity: number;
    }> = [];

    // Initialize glitch lines
    for (let i = 0; i < 20; i++) {
      glitchLines.push({
        y: Math.random() * canvas.height,
        height: Math.random() * 10 + 2,
        offset: 0,
        speed: (Math.random() - 0.5) * 4,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    // Matrix-style falling characters
    const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*(){}[]|\\:";\'<>?,./`~';
    const drops: Array<{
      x: number;
      y: number;
      char: string;
      speed: number;
      opacity: number;
    }> = [];

    // Initialize matrix drops
    for (let i = 0; i < 50; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
        speed: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const animate = () => {
      // Clear canvas with slight fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw glitch lines
      glitchLines.forEach((line, index) => {
        const characters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        if (Math.random() < 0.1) {
          // Randomly trigger glitch
          line.offset = (Math.random() - 0.5) * 100;
          line.opacity = Math.random() * 0.8 + 0.2;
        } else {
          line.offset *= 0.95; // Fade out glitch
          line.opacity *= 0.98;
        }

        if (line.opacity > 0.01) {
          ctx.fillStyle = `rgba(0, 255, 65, ${line.opacity})`;
          ctx.fillRect(line.offset, line.y, canvas.width, line.height);
          
          // Add red and blue glitch layers
          ctx.fillStyle = `rgba(255, 0, 0, ${line.opacity * 0.5})`;
          ctx.fillRect(line.offset + 2, line.y, canvas.width, line.height);
          
          ctx.fillStyle = `rgba(0, 255, 255, ${line.opacity * 0.3})`;
          ctx.fillRect(line.offset - 2, line.y, canvas.width, line.height);
        }

        // Move line
        line.y += line.speed;
        if (line.y > canvas.height) {
          line.y = -line.height;
          line.offset = 0;
        }
      });

      // Draw matrix drops
      ctx.font = '12px monospace';
      drops.forEach((drop) => {
        ctx.fillStyle = `rgba(0, 255, 65, ${drop.opacity})`;
        ctx.fillText(drop.char, drop.x, drop.y);

        drop.y += drop.speed;
        drop.opacity *= 0.999;

        if (drop.y > canvas.height || drop.opacity < 0.01) {
          drop.y = 0;
          drop.x = Math.random() * canvas.width;
          drop.char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          drop.opacity = Math.random() * 0.5 + 0.1;
        }
      });

      // Occasional screen flash
      if (Math.random() < 0.001) {
        ctx.fillStyle = `rgba(0, 255, 65, ${Math.random() * 0.1})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-20"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
