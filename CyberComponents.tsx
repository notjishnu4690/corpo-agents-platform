import React, { useState, useEffect } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlitchTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ text, className = "", speed = 3000 }) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, speed);
    return () => clearInterval(interval);
  }, [speed]);

  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      {isGlitching && (
        <>
          <span className="absolute top-0 left-0 -z-10 text-cyan-400 opacity-70 animate-pulse translate-x-1">
            {text}
          </span>
          <span className="absolute top-0 left-0 -z-10 text-purple-500 opacity-70 animate-pulse -translate-x-1">
            {text}
          </span>
        </>
      )}
    </div>
  );
};

interface GlitchButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "cyan" | "purple" | "green";
}

export const GlitchButton: React.FC<GlitchButtonProps> = ({ 
  children, 
  variant = "cyan", 
  className = "", 
  ...props 
}) => {
  const colors = {
    cyan: "bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]",
    purple: "bg-purple-500 text-white shadow-[0_0_15px_rgba(189,0,255,0.4)]",
    green: "bg-green-500 text-black shadow-[0_0_15px_rgba(57,255,20,0.4)]",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative px-6 py-3 font-black uppercase tracking-widest rounded-xl transition-all overflow-hidden group ${colors[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      <div className="absolute top-0 left-0 w-full h-[2px] bg-white/50 opacity-0 group-hover:opacity-100 group-hover:animate-scan" />
    </motion.button>
  );
};

export const AgentMoodIndicator: React.FC<{ mood: "optimal" | "stressed" | "idle" | "processing" }> = ({ mood }) => {
  const configs = {
    optimal: { color: "bg-green-400", label: "Optimal", glow: "shadow-[0_0_8px_#39ff14]" },
    stressed: { color: "bg-rose-500", label: "Stressed", glow: "shadow-[0_0_8px_#ff003c]" },
    idle: { color: "bg-slate-500", label: "Idle", glow: "shadow-[0_0_8px_#64748b]" },
    processing: { color: "bg-cyan-400", label: "Processing", glow: "shadow-[0_0_8px_#00f0ff]" },
  };

  const config = configs[mood];

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${config.color} ${config.glow} animate-pulse`} />
      <span className="text-[10px] font-mono uppercase text-slate-500 tracking-tighter">
        {config.label}
      </span>
    </div>
  );
};
