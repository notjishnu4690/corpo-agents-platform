import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Users, Brain } from "lucide-react";
import { GlitchText, GlitchButton } from "@/components/CyberComponents";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const AGENTS = [
  { id: "ceo", name: "CEO Advisor", description: "Executive strategy & decision making", icon: Brain, color: "text-cyan-400" },
  { id: "finance", name: "Finance Copilot", description: "Financial analysis & risk management", icon: Zap, color: "text-yellow-400" },
  { id: "hr", name: "HR Copilot", description: "Personnel & compliance management", icon: Users, color: "text-purple-400" },
  { id: "reporter", name: "Reporter Agent", description: "Operations & system telemetry", icon: Users, color: "text-green-400" },
];

export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>(["ceo", "finance", "hr", "reporter"]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTip, setShowTip] = useState(true);

  const utils = trpc.useUtils();
  const setupMutation = trpc.company.setup.useMutation({
    onSuccess: () => {
      utils.company.profile.invalidate();
    },
  });

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]
    );
  };

  const handleSubmit = async () => {
    if (!companyName.trim() || !companyDescription.trim() || selectedAgents.length === 0) {
      toast.error("Please fill in all fields and select at least one agent");
      return;
    }

    setIsLoading(true);
    try {
      const result = await setupMutation.mutateAsync({
        companyName,
        companyDescription,
        selectedAgents: JSON.stringify(selectedAgents),
      });
      
      if (result === null) {
        throw new Error("Database not available. Please check your connection.");
      }

      toast.success("Company setup complete!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to save company setup");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020206] text-white overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black uppercase mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              <GlitchText text="Welcome to CorpoAgents" />
            </h1>
            <p className="text-slate-400 text-lg">Let's set up your AI-powered organization</p>
            
            <AnimatePresence>
              {showTip && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-cyan-400/10 border border-cyan-400/30 rounded-2xl text-xs text-cyan-200 flex items-center justify-between"
                >
                  <span>Tip: You can customize your agents later in the dashboard.</span>
                  <button onClick={() => setShowTip(false)} className="hover:text-white transition-colors">✕</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2 mb-12 justify-center">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s <= step ? "bg-cyan-400 w-8" : "bg-white/10 w-2"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Company Info */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-black uppercase mb-6 text-cyan-400">Company Information</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold uppercase mb-3 text-slate-300">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g., TechCorp Industries"
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase mb-3 text-slate-300">Company Description</label>
                    <textarea
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      placeholder="Tell us about your company, industry, and goals..."
                      rows={5}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all resize-none"
                    />
                  </div>

                  <GlitchButton
                    onClick={() => setStep(2)}
                    disabled={!companyName.trim() || !companyDescription.trim()}
                    className="w-full"
                  >
                    Next: Select Agents →
                  </GlitchButton>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Agent Selection */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-black uppercase mb-6 text-cyan-400">Select Your Agents</h2>
                <p className="text-slate-400 mb-8">Choose which AI agents you want in your organization</p>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {AGENTS.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => toggleAgent(agent.id)}
                      className={`p-6 rounded-2xl border-2 transition-all text-left ${
                        selectedAgents.includes(agent.id)
                          ? "border-cyan-400 bg-cyan-400/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <agent.icon className={`${agent.color} shrink-0 mt-1`} size={24} />
                        <div>
                          <div className="font-bold uppercase mb-1">{agent.name}</div>
                          <div className="text-sm text-slate-400">{agent.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/5 transition-all"
                  >
                    ← Back
                  </button>
                  <GlitchButton
                    onClick={handleSubmit}
                    disabled={isLoading || selectedAgents.length === 0}
                    className="flex-1"
                  >
                    {isLoading ? "Setting up..." : "Complete Setup"}
                  </GlitchButton>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
