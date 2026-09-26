"use client";

import React, { useEffect, useRef, useCallback } from "react";

export interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  width: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  phase: number;
}

interface WaterCanvasProps {
  className?: string;
  onWaterClick?: (x: number, y: number) => void;
  windX?: number;
  lotusOffsetY?: number;
  isBlurred?: boolean;
}

export function WaterCanvas({
  className = "",
  onWaterClick,
  windX = 0,
  lotusOffsetY = 0,
  isBlurred = false,
}: WaterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Trigger a water ripple at (x, y)
  const addRipple = useCallback((x: number, y: number, intensity = 1) => {
    ripplesRef.current.push({
      x,
      y,
      radius: 4,
      maxRadius: Math.min(220, 120 * intensity + 50),
      alpha: 0.65 * intensity,
      speed: 1.6 + Math.random() * 0.4,
      width: 2.5,
    });
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addRipple(x, y, 1.2);
    if (onWaterClick) {
      onWaterClick(x, y);
    }
  };

  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      addRipple(x, y, 1.0);
      if (onWaterClick) {
        onWaterClick(x, y);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initialize floating golden hour ambient bokeh particles (inspired by Image 2)
    const particleCount = 28;
    particlesRef.current = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.15 - Math.random() * 0.25,
      size: 1.5 + Math.random() * 3.5,
      alpha: 0.15 + Math.random() * 0.35,
      baseAlpha: 0.15 + Math.random() * 0.35,
      pulseSpeed: 1 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
    }));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Initial gentle ripples for ambient organic presence
    addRipple(width * 0.5, height * 0.58, 0.7);
    setTimeout(() => {
      addRipple(width * 0.44, height * 0.62, 0.5);
    }, 1200);

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      timeRef.current += dt;
      const t = timeRef.current;

      // 1. Deep Serene Aquatic Pond Background (inspired by reference photos 1, 2, 4)
      // Transition from upper ambient golden-hour mist into deep aquatic teal/slate pond
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#1A2024"); // Soft twilight mist
      gradient.addColorStop(0.35, "#101D22"); // Upper surface depth
      gradient.addColorStop(0.65, "#0B161B"); // Still water mirror zone
      gradient.addColorStop(1, "#060D10"); // Deep pond bed
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Golden-Hour Atmospheric Backlight Bloom (Reference Image 2)
      const centerX = width / 2 + (windX || 0) * 0.25;
      const centerY = height / 2 - 58 + (lotusOffsetY || 0);

      const bloomGrad = ctx.createRadialGradient(
        centerX,
        centerY - 60,
        20,
        centerX,
        centerY - 20,
        Math.max(width * 0.4, 380)
      );
      bloomGrad.addColorStop(0, "rgba(255, 225, 210, 0.18)"); // Warm sunset aura
      bloomGrad.addColorStop(0.4, "rgba(232, 122, 144, 0.11)"); // Soft lotus pink dissipation
      bloomGrad.addColorStop(1, "rgba(16, 29, 34, 0)");
      ctx.fillStyle = bloomGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Ambient Water Rippling Wave Strands (Reference Image 2 & 4 water lines)
      const waveCount = 6;
      for (let i = 0; i < waveCount; i++) {
        const yBase = height * 0.48 + i * (height * 0.09);
        ctx.beginPath();
        const waveSpeed = 0.6 + i * 0.15;
        const waveAmp = 4 + i * 1.5;
        const windShift = (windX || 0) * 0.12;

        ctx.moveTo(0, yBase);
        for (let x = 0; x <= width; x += 25) {
          const waveY =
            yBase +
            Math.sin(x * 0.004 + t * waveSpeed + i * 1.2 + windShift) * waveAmp +
            Math.cos(x * 0.01 - t * 0.35) * (waveAmp * 0.4);
          ctx.lineTo(x, waveY);
        }

        // Deep water light refraction line
        ctx.strokeStyle = `rgba(180, 215, 225, ${0.05 + (i % 2) * 0.03})`;
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Soft pink reflection glint on water ridges
        ctx.strokeStyle = `rgba(244, 186, 199, ${0.03 + (i % 2) * 0.02})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }

      // 4. Realistic Lotus Water Reflection (Exact inverted mirror geometry, Image 1 & 4)
      ctx.save();
      // Mirror point sits directly at the water line below the flower base
      const waterLineY = centerY + 95;
      ctx.translate(centerX, waterLineY);
      ctx.scale(1, -0.72); // Vertically inverted and slightly foreshortened

      // Water wave distortion for reflection
      const refDistortX = Math.sin(t * 2.0) * 3 + (windX || 0) * 0.1;
      const refDistortY = Math.cos(t * 1.6) * 2;

      // Reflection Body (layered petal pinks and golden core shimmer)
      const refGrad = ctx.createRadialGradient(
        refDistortX,
        refDistortY + 20,
        15,
        refDistortX,
        refDistortY + 40,
        160
      );
      refGrad.addColorStop(0, "rgba(255, 230, 150, 0.32)"); // Radiant golden core reflection
      refGrad.addColorStop(0.3, "rgba(240, 130, 160, 0.28)"); // Mid petal reflection
      refGrad.addColorStop(0.65, "rgba(222, 108, 130, 0.18)"); // Outer petal reflection
      refGrad.addColorStop(0.9, "rgba(100, 140, 130, 0.08)"); // Lily pad reflection
      refGrad.addColorStop(1, "rgba(11, 22, 27, 0)");

      ctx.beginPath();
      ctx.ellipse(
        refDistortX,
        refDistortY + 35,
        165 + Math.sin(t * 1.8) * 8,
        95,
        0,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = refGrad;
      ctx.fill();

      // Stem & Calyx Reflection in water
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(
        Math.sin(t * 1.5) * 5,
        35,
        (windX || 0) * 0.08,
        75
      );
      ctx.strokeStyle = "rgba(78, 93, 75, 0.35)";
      ctx.lineWidth = 3.5;
      ctx.stroke();

      ctx.restore();

      // 5. Interactive Propagating Water Ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        r.radius += r.speed;
        r.alpha *= 0.982; // Smooth exponential dissipation

        if (r.alpha <= 0.008 || r.radius >= r.maxRadius) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        // Concentric ring 1: Primary water displacement ridge
        ctx.beginPath();
        ctx.ellipse(
          r.x,
          r.y,
          r.radius * 1.35, // Oval perspective foreshortening
          r.radius * 0.65,
          0,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = `rgba(244, 210, 220, ${r.alpha * 0.85})`;
        ctx.lineWidth = r.width;
        ctx.stroke();

        // Concentric ring 2: Specular highlight reflection
        if (r.radius > 15) {
          ctx.beginPath();
          ctx.ellipse(
            r.x,
            r.y,
            (r.radius - 10) * 1.35,
            (r.radius - 10) * 0.65,
            0,
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.95})`;
          ctx.lineWidth = r.width * 0.7;
          ctx.stroke();
        }

        // Concentric ring 3: Soft ambient dispersion wake
        if (r.radius > 30) {
          ctx.beginPath();
          ctx.ellipse(
            r.x,
            r.y,
            (r.radius + 15) * 1.35,
            (r.radius + 15) * 0.65,
            0,
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = `rgba(160, 205, 215, ${r.alpha * 0.35})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // 6. Floating Golden Bokeh / Dew Motes (Reference Image 2)
      for (const p of particlesRef.current) {
        p.x += p.vx + (windX || 0) * 0.01;
        p.y += p.vy;
        p.phase += dt * p.pulseSpeed;

        // Wrap around viewport
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const pulse = Math.sin(p.phase) * 0.3 + 0.7;
        const currentAlpha = p.baseAlpha * pulse;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 235, 195, ${currentAlpha * 0.5})`;
        ctx.fill();

        // Delicate inner sparkle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.85})`;
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [addRipple, lotusOffsetY, windX]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      onTouchStart={handleTouch}
      className={`fixed inset-0 w-full h-full block cursor-crosshair select-none transition-[filter] duration-700 ${
        isBlurred ? "filter blur-md scale-105" : "filter blur-0 scale-100"
      } ${className}`}
      aria-label="Interactive water surface. Click anywhere to create ripples."
    />
  );
}
