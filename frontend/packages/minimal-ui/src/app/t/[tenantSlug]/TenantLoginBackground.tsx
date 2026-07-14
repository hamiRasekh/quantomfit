'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  tone: string;
};

const tones = [
  'rgba(168, 182, 194, 0.22)',
  'rgba(124, 144, 161, 0.20)',
  'rgba(207, 216, 224, 0.18)',
  'rgba(95, 118, 138, 0.16)',
];

export function TenantLoginBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const createParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: 0.35 + Math.random() * 0.9,
      size: 0.8 + Math.random() * 2.4,
      alpha: 0.35 + Math.random() * 0.45,
      tone: tones[Math.floor(Math.random() * tones.length)]!,
    });

    const resetCanvas = () => {
      const ratio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = Array.from({ length: Math.max(90, Math.floor((width * height) / 18000)) }, createParticle);
    };

    const render = () => {
      context.clearRect(0, 0, width, height);

      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(238, 243, 247, 0.22)');
      gradient.addColorStop(0.45, 'rgba(178, 190, 201, 0.14)');
      gradient.addColorStop(1, 'rgba(88, 108, 126, 0.12)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      const slabGradient = context.createRadialGradient(width * 0.18, height * 0.2, 0, width * 0.18, height * 0.2, width * 0.7);
      slabGradient.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
      slabGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      context.fillStyle = slabGradient;
      context.fillRect(0, 0, width, height);

      context.strokeStyle = 'rgba(96, 118, 137, 0.07)';
      context.lineWidth = 1;
      for (let index = -1; index < 7; index += 1) {
        const y = ((height / 6) * index) + ((index % 2) * 12);
        context.beginPath();
        context.moveTo(-40, y);
        context.lineTo(width + 40, y - 24);
        context.stroke();
      }

      for (const particle of particles) {
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.hypot(dx, dy);

        if (mouseRef.current.active && distance < 140) {
          const force = (140 - distance) / 140;
          particle.vx -= (dx / Math.max(distance, 1)) * force * 0.038;
          particle.vy -= (dy / Math.max(distance, 1)) * force * 0.018;
          particle.alpha = Math.min(0.82, particle.alpha + force * 0.045);
        } else {
          particle.alpha += (0.3 + Math.random() * 0.35 - particle.alpha) * 0.02;
        }

        particle.vx *= 0.994;
        particle.vy = Math.min(1.8, particle.vy + 0.002);
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.y > height + 8) {
          particle.x = Math.random() * width;
          particle.y = -10;
          particle.vx = (Math.random() - 0.5) * 0.25;
          particle.vy = 0.35 + Math.random() * 0.9;
        }

        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;

        context.beginPath();
        context.fillStyle = particle.tone.replace(/0\.\d+\)/, `${particle.alpha.toFixed(2)})`);
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      if (mouseRef.current.active) {
        const ripple = context.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          140
        );
        ripple.addColorStop(0, 'rgba(236, 242, 247, 0.16)');
        ripple.addColorStop(0.45, 'rgba(185, 199, 211, 0.08)');
        ripple.addColorStop(1, 'rgba(185, 199, 211, 0)');
        context.fillStyle = ripple;
        context.beginPath();
        context.arc(mouseRef.current.x, mouseRef.current.y, 140, 0, Math.PI * 2);
        context.fill();
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    const handleMove = (event: MouseEvent) => {
      mouseRef.current = { x: event.clientX, y: event.clientY, active: true };
    };

    const handleLeave = () => {
      mouseRef.current.active = false;
    };

    resetCanvas();
    render();

    window.addEventListener('resize', resetCanvas);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseout', handleLeave);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resetCanvas);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseout', handleLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
