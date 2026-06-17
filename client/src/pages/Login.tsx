import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

const CYBER_BG = "#020206";
const NEON_CYAN = "#00f0ff";

// Animated canvas network background
function AnimatedNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -2000, y: -1000 });

  useEffect(() => {
    const trackMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener("mousemove", trackMouse);
    return () => window.removeEventListener("mousemove", trackMouse);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: number;
    let particles: any[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const init = () => {
      particles = [];
      const num = Math.floor((canvas.width * canvas.height) / 13000);
      for (let i = 0; i < num; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 1.5 + 0.5,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = NEON_CYAN + "44";
      ctx.lineWidth = 0.4;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.hypot(dx, dy);
        const radius = 220;

        if (dist < radius) {
          const force = (radius - dist) / radius;
          p.x += (dx / dist) * force * 2.5;
          p.y += (dy / dist) * force * 2.5;
        }

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const d = Math.hypot(p.x - particles[j].x, p.y - particles[j].y);
          if (d < 115) {
            ctx.beginPath();
            ctx.strokeStyle = NEON_CYAN + (dist < radius ? "35" : "11");
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      frameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-40"
    />
  );
}

// Cursor glow effect
function CursorGlow() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handle = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-[800px] h-[800px] rounded-full pointer-events-none z-10 opacity-40"
      style={{
        background: `radial-gradient(circle, ${NEON_CYAN}22 0%, transparent 70%)`,
        x: mousePos.x - 400,
        y: mousePos.y - 400,
      }}
    />
  );
}

export default function Login() {
  const [, navigate] = useLocation();

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 relative font-sans"
      style={{ backgroundColor: CYBER_BG }}
    >
      <CursorGlow />
      <AnimatedNetworkBackground />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/20 blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-black/80 border border-white/10 text-white backdrop-blur-2xl rounded-3xl p-8 relative z-10 shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 bg-white/5 border border-cyan-400 rounded-full flex items-center justify-center text-cyan-400 shadow-lg">
            <Brain size={32} />
          </div>
        </div>

        <h1 className="text-3xl font-black text-center mb-2 uppercase tracking-tight">
          CorpoAgents
        </h1>
        <p className="text-center text-slate-400 text-sm mb-8">
          AI-Powered Organization Platform
        </p>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-8" />

        {/* Sign In with Google */}
        <a
          href={getLoginUrl()}
          className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-slate-100 shadow-lg"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </a>

        {/* Footer Text */}
        <p className="text-center text-xs text-slate-500 mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>

        {/* Back to Landing */}
        <button
          onClick={() => navigate("/")}
          className="w-full mt-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← Back to Home
        </button>
      </motion.div>
    </main>
  );
}
