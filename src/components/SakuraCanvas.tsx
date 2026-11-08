import { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  flip: number;
  flipSpeed: number;
}

export default function SakuraCanvas({ isEnabled = true }: { isEnabled?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Create 35 delicate petals
    const petalCount = Math.min(35, Math.floor(width / 35));
    const petals: Petal[] = [];

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 7,
        speedX: Math.random() * 1.2 + 0.4,
        speedY: Math.random() * 1.4 + 0.8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        opacity: Math.random() * 0.45 + 0.4,
        flip: Math.random() * Math.PI,
        flipSpeed: Math.random() * 0.03 + 0.01,
      });
    }

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(Math.cos(p.flip), 1);

      // Gradient for cherry blossom petal
      const gradient = ctx.createRadialGradient(0, 0, 1, 0, 0, p.size);
      gradient.addColorStop(0, `rgba(255, 230, 235, ${p.opacity})`);
      gradient.addColorStop(0.6, `rgba(255, 183, 197, ${p.opacity * 0.85})`);
      gradient.addColorStop(1, `rgba(230, 57, 70, ${p.opacity * 0.4})`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      // Natural heart/notch petal shape
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-p.size * 0.5, -p.size * 0.8, -p.size * 0.9, -p.size * 0.3, -p.size * 0.3, p.size * 0.8);
      ctx.bezierCurveTo(-p.size * 0.1, p.size * 1.1, p.size * 0.1, p.size * 1.1, p.size * 0.3, p.size * 0.8);
      ctx.bezierCurveTo(p.size * 0.9, -p.size * 0.3, p.size * 0.5, -p.size * 0.8, 0, 0);
      ctx.fill();

      ctx.restore();
    };

    let wind = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      wind += 0.005;
      const currentWind = Math.sin(wind) * 0.8;

      for (const p of petals) {
        p.x += p.speedX + currentWind;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.flip += p.flipSpeed;

        // Reset if offscreen
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) {
          p.x = -20;
        }

        drawPetal(p);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20 transition-opacity duration-700"
      aria-hidden="true"
    />
  );
}
