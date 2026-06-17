import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Users, Server, PieChart, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";

const CYBER_BG = "#020206";
const NEON_CYAN = "#00f0ff";
const NEON_PURPLE = "#bd00ff";
const NEON_GREEN = "#39ff14";

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

const agents = [
  {
    name: "Finance Copilot",
    icon: <PieChart size={24} />,
    color: "text-cyan-400",
    desc: "Checks spending, highlights risks, and flags unusual money movement.",
  },
  {
    name: "HR Copilot",
    icon: <Users size={24} />,
    color: "text-purple-400",
    desc: "Keeps people data organized, updates access rules, and ensures compliance.",
  },
  {
    name: "Ops Copilot",
    icon: <Server size={24} />,
    color: "text-green-400",
    desc: "Monitors cluster health, spots delays, and helps recovery.",
  },
  {
    name: "CEO Advisor",
    icon: <Brain size={24} />,
    color: "text-cyan-400",
    desc: "Turns signals into clear recommendations for quick action.",
  },
];

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <main
      className="text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden min-h-screen"
      style={{ backgroundColor: CYBER_BG }}
    >
      <div className="fixed bottom-4 left-4 z-[100] px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-[10px] font-mono text-cyan-400 animate-pulse">
        CYBER_CORE_V2_ACTIVE
      </div>

      <CursorGlow />
      <AnimatedNetworkBackground />

      <div
        className="fixed top-[-25%] left-[-10%] w-[700px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none z-0"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 max-w-7xl w-full mx-auto backdrop-blur-xl border-b bg-[#020206]/60 border-white/5">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="h-10 w-10 bg-white/5 border border-cyan-400 rounded-xl flex items-center justify-center text-cyan-400 shadow-lg">
            <Brain size={24} />
          </div>
          <span className="font-black text-xl tracking-tight uppercase">CorpoAgents</span>
        </div>

        <div className="hidden md:flex gap-8 text-xs font-mono uppercase tracking-widest text-slate-400">
          <span className="cursor-pointer transition-colors hover:text-white">Documentation</span>
          <span className="cursor-pointer transition-colors hover:text-white">Features</span>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-cyan-400 text-black font-black rounded-full text-sm transition-all shadow-[0_0_25px_rgba(0,240,255,0.55)] hover:scale-105"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-7xl mx-auto px-6 sm:px-12 grid lg:grid-cols-2 gap-12 items-center relative z-10"
        >
          <div className="flex flex-col justify-center space-y-8 text-left">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] text-white">
              Your company,
              <br />
              now powered
              <br />
              <span
                className="inline-block rounded-2xl px-3 py-1.5"
                style={{
                  color: "transparent",
                  backgroundClip: "text",
                  backgroundImage: "linear-gradient(to right, #00f0ff, #bd00ff)",
                  WebkitTextStroke: "1.4px #00f0ff",
                  textShadow: "0 0 30px rgba(0, 240, 255, 0.5)",
                }}
              >
                by AI teams.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed">
              Build your AI-native organization. Deploy autonomous departments, assign specialized agents, and let your digital workforce collaborate—just like a real company.
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-cyan-400 text-black rounded-xl font-bold text-lg flex items-center gap-3 transition-all shadow-[0_0_25px_rgba(0,240,255,0.55)] hover:scale-105"
              >
                Build Your Org <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-lg text-white transition-all">
                Explore Blueprint
              </button>
            </div>
          </div>

          <div className="flex justify-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-[280px] h-[540px] sm:w-[300px] sm:h-[560px] lg:w-[320px] lg:h-[600px] bg-black border-[8px] border-slate-900 rounded-[50px] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-black ml-auto mr-4" />
              </div>
              <div className="p-5 pt-10 text-black flex items-center gap-3 shrink-0 shadow-lg bg-cyan-400">
                <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center font-black text-sm">
                  Finance
                </div>
              </div>
              <div className="flex-1 p-5 space-y-5 overflow-y-auto text-[11px] font-mono bg-[#020206]/95">
                <div className="text-center text-slate-600 text-[9px] tracking-wider uppercase font-bold">
                  Today
                </div>
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none text-slate-300">
                  <span className="font-bold block mb-1 text-[10px] text-cyan-400">Finance AI</span>
                  Flagged a payroll risk for Q3. Investigating now.
                </div>
                <div className="bg-cyan-500/10 border border-cyan-400/20 p-4 rounded-2xl rounded-tr-none max-w-[90%] ml-auto text-cyan-100 text-right">
                  HR confirms: 12 new hires this quarter.
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative z-20 w-full border-t py-32 bg-[#020206]/95 border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-32">
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-3"
            >
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                Built for the <br />
                <span
                  style={{
                    color: "transparent",
                    backgroundClip: "text",
                    backgroundImage: "linear-gradient(to right, #00f0ff, #bd00ff)",
                  }}
                >
                  Autonomous Era.
                </span>
              </h2>
              <p className="leading-relaxed text-lg text-slate-400">
                Connect real AI agents to your organization. Each agent specializes in a department—Finance, HR, Operations, Leadership—and they work together seamlessly.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {agents.map((agent, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-7 rounded-3xl flex flex-col justify-between h-56 transition-all bg-white/[0.03] border border-white/10 hover:border-cyan-500/50"
                  style={{
                    boxShadow: `0 20px 40px rgba(0, 240, 255, 0.1)`,
                  }}
                >
                  <div className={`${agent.color} p-3 bg-white/5 border border-white/10 rounded-2xl w-fit`}>
                    {agent.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-white">{agent.name}</h4>
                    <p className="text-sm mt-2 leading-relaxed text-slate-500">{agent.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Footer */}
      <div className="relative z-20 w-full border-t py-16 border-white/5 bg-[#020206]">
        <div className="max-w-7xl mx-auto px-8 flex flex-wrap justify-center md:justify-between items-center gap-8 text-xs font-mono tracking-widest text-slate-500 uppercase">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-cyan-500" />
            AI Swarm Deployment Core v2.0
          </div>
          <a
            href={getLoginUrl()}
            className="px-8 py-3.5 rounded-2xl text-black font-black uppercase transition-all tracking-wider text-sm bg-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.55)] hover:scale-105"
          >
            Launch Platform Core
          </a>
        </div>
      </div>
    </main>
  );
}
