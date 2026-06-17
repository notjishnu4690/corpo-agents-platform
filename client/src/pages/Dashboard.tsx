import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  LayoutDashboard,
  Activity,
  Calendar,
  Sun,
  Moon,
  LogOut,
  Send,
  Brain,
  PieChart,
  Users,
  Server,
  Plus,
  Settings,
  Trash2,
  AlertCircle,
  Network,
  Check,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const AGENTS = [
  { id: "ceo", name: "CEO", role: "Strategic Advisor", icon: Brain, color: "text-cyan-400" },
  { id: "finance", name: "Finance", role: "Ledger Core", icon: PieChart, color: "text-amber-400" },
  { id: "hr", name: "HR", role: "Personnel Array", icon: Users, color: "text-purple-400" },
  { id: "reporter", name: "Reporter", role: "Telemetry Stream", icon: Server, color: "text-green-400" },
];

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: Date;
}

interface MeetingDisplay {
  id: string;
  day: string;
  time: string;
  title: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"messages" | "boardroom" | "vitals" | "calendar">("messages");
  const [selectedAgent, setSelectedAgent] = useState<string>("ceo");
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    ceo: [],
    finance: [],
    hr: [],
    reporter: [],
  });
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const meetingsQuery = trpc.meetings.list.useQuery();
  const createMeetingMutation = trpc.meetings.create.useMutation();
  const updateMeetingMutation = trpc.meetings.update.useMutation();
  const deleteMeetingMutation = trpc.meetings.delete.useMutation();
  const utils = trpc.useUtils();
  
  const meetings = (meetingsQuery.data || []).map(m => ({
    id: m.id.toString(),
    day: m.day,
    time: m.time,
    title: m.title,
  }));
  const [editingMeeting, setEditingMeeting] = useState<string | null>(null);
  const [newMeetingForm, setNewMeetingForm] = useState({ day: "Mon", time: "09:00", title: "" });
  const [vitalsData, setVitalsData] = useState({
    systemLoad: 42,
    neuralHealth: 87,
    riskIndex: 23,
    activeNodes: 1847,
  });
  const [isScanning, setIsScanning] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const agentChatMutation = trpc.agents.chat.useMutation();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: chatInput,
      timestamp: new Date(),
    };

      setChatMessages((prev) => ({
        ...prev,
        [selectedAgent]: [...(prev[selectedAgent] || []), userMessage],
      }));
      const messageToSend = chatInput;
      setChatInput("");
      setIsLoading(true);

      try {
      const result = await agentChatMutation.mutateAsync({
        agentId: selectedAgent as any,
        message: messageToSend,
      });

      const responseText = typeof result.response === 'string' ? result.response : JSON.stringify(result.response);
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        text: responseText,
        timestamp: new Date(),
      };

      setChatMessages((prev) => ({
        ...prev,
        [selectedAgent]: [...(prev[selectedAgent] || []), agentMessage],
      }));
    } catch (error) {
      toast.error("Failed to get agent response");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSweep = async () => {
    setIsScanning(true);
    setTimeout(() => {
      setVitalsData({
        systemLoad: Math.min(98, vitalsData.systemLoad + 4),
        neuralHealth: Math.min(98, vitalsData.neuralHealth + 2),
        riskIndex: Math.max(10, vitalsData.riskIndex - 4),
        activeNodes: vitalsData.activeNodes + 2,
      });
      setIsScanning(false);
      toast.success("Sweep complete: 4 agents online, 1 risk flagged");
    }, 1800);
  };

  const handleAddMeeting = async () => {
    if (!newMeetingForm.title.trim()) return;
    try {
      if (editingMeeting === "new") {
        await createMeetingMutation.mutateAsync(newMeetingForm);
        toast.success("Meeting created");
      } else if (editingMeeting) {
        await updateMeetingMutation.mutateAsync({
          id: parseInt(editingMeeting),
          ...newMeetingForm,
        });
        toast.success("Meeting updated");
      }
      await utils.meetings.list.invalidate();
      setNewMeetingForm({ day: "Mon", time: "09:00", title: "" });
      setEditingMeeting(null);
    } catch (error) {
      toast.error("Failed to save meeting");
      console.error(error);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    try {
      await deleteMeetingMutation.mutateAsync({ id: parseInt(id) });
      await utils.meetings.list.invalidate();
      toast.success("Meeting deleted");
    } catch (error) {
      toast.error("Failed to delete meeting");
      console.error(error);
    }
  };

  const bgColor = theme === "dark" ? "bg-[#020206]" : "bg-slate-50";
  const textColor = theme === "dark" ? "text-white" : "text-slate-900";
  const borderColor = theme === "dark" ? "border-white/10" : "border-black/10";
  const cardBg = theme === "dark" ? "bg-white/5" : "bg-white";

  return (
    <main className={`h-screen flex overflow-hidden font-sans ${bgColor} ${textColor}`}>
      {/* Sidebar */}
      <div
        className={`w-20 border-r flex flex-col items-center py-8 gap-8 shrink-0 backdrop-blur-xl z-50 ${borderColor} ${
          theme === "dark" ? "bg-black/40" : "bg-white/40"
        }`}
      >
        <div className="h-10 w-10 bg-cyan-400 rounded-xl flex items-center justify-center text-black cursor-pointer font-bold">
          CA
        </div>

        {/* Navigation Icons */}
        <nav className="flex flex-col gap-2 w-full px-2">
          {[
            { id: "messages", icon: MessageSquare, label: "Messages" },
            { id: "boardroom", icon: LayoutDashboard, label: "Boardroom" },
            { id: "vitals", icon: Activity, label: "Vitals" },
            { id: "calendar", icon: Calendar, label: "Calendar" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`p-3 rounded-2xl transition-all flex items-center justify-center hover:scale-110 ${
                activeTab === id
                  ? `bg-white/10 text-cyan-400 shadow-lg`
                  : `text-slate-500 hover:text-slate-300`
              }`}
              title={label}
            >
              <Icon size={20} />
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-4 items-center">
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-2xl transition-all ${
              theme === "dark"
                ? "text-yellow-400 hover:bg-white/5"
                : "text-indigo-600 hover:bg-black/5"
            }`}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={logout}
            className="p-3 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header
          className={`h-16 border-b flex items-center justify-between px-8 shrink-0 backdrop-blur-md z-40 ${borderColor} ${
            theme === "dark" ? "bg-black/20" : "bg-white/40"
          }`}
        >
          <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
            {activeTab === "messages"
              ? "Communication Hub"
              : activeTab === "boardroom"
                ? "Executive Boardroom"
                : activeTab === "calendar"
                  ? "Strategic Calendar"
                  : "System Vitals"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-black uppercase">{user?.name || "User"}</div>
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
                Director Level 7
              </div>
            </div>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-800 to-black border border-white/10 flex items-center justify-center text-xs font-black text-cyan-400 shadow-lg">
              {user?.name?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {/* Messages Tab */}
            {activeTab === "messages" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 flex"
              >
                {/* Agent List */}
                <div
                  className={`w-72 border-r flex flex-col shrink-0 ${borderColor} ${
                    theme === "dark" ? "bg-black/20" : "bg-slate-100"
                  }`}
                >
                  <div className="p-6 space-y-3">
                    {AGENTS.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent.id)}
                        className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 ${
                          selectedAgent === agent.id
                            ? `${cardBg} border border-cyan-400/50 shadow-lg`
                            : `hover:${cardBg} ${borderColor}`
                        }`}
                      >
                        <agent.icon className={`${agent.color} shrink-0`} size={20} />
                        <div className="min-w-0">
                          <div className="text-xs font-black uppercase">{agent.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{agent.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col min-w-0 ${theme === "dark" ? "bg-black/40" : "bg-white"}`}>
                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {(chatMessages[selectedAgent] || []).map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-5 rounded-3xl text-sm leading-relaxed shadow-xl ${
                            msg.sender === "user"
                              ? "bg-cyan-400 text-black font-medium rounded-tr-none"
                              : `${theme === "dark" ? "bg-white/[0.03] border-white/10 text-slate-200" : "bg-slate-100 border-black/5 text-slate-700"} rounded-tl-none`
                          }`}
                        >
                          {msg.text}
                          <div
                            className={`text-[9px] mt-2 font-mono uppercase tracking-widest ${
                              msg.sender === "user" ? "text-black/50" : "text-slate-400"
                            }`}
                          >
                            {msg.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-8 pt-0">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="relative group"
                    >
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={`Message ${AGENTS.find((a) => a.id === selectedAgent)?.name}...`}
                        className={`w-full rounded-2xl py-5 pl-6 pr-16 text-sm outline-none focus:border-cyan-500/50 transition-all shadow-2xl ${
                          theme === "dark"
                            ? "bg-white/[0.03] border-white/10 text-white"
                            : "bg-white border-black/10 text-slate-900"
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !chatInput.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all bg-cyan-400 text-black hover:scale-105 shadow-lg disabled:opacity-50"
                      >
                        <Send size={18} />
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Boardroom Tab */}
            {activeTab === "boardroom" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 p-8 overflow-y-auto"
              >
                <div className="max-w-6xl mx-auto space-y-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className={`md:col-span-2 ${cardBg} border ${borderColor} rounded-3xl p-8`}>
                      <h2 className="text-xl font-black uppercase tracking-tight mb-6">
                        Swarm Intelligence Feed
                      </h2>
                      <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={`flex gap-6 p-5 rounded-2xl hover:bg-white/[0.02] transition-all border ${borderColor}`}>
                            <Brain className="text-cyan-400 shrink-0" size={24} />
                            <div className="space-y-2">
                              <div className="text-sm font-bold">Strategic Alignment Recommendation #{i}</div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Agent swarm has detected a 14% efficiency gap in sector {i}. Recommendation: Reallocate
                                20% of compute resources from legacy arrays to neural bridging.
                              </p>
                              <div className="flex gap-4 pt-2">
                                <button className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300">
                                  Execute Link
                                </button>
                                <button className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400">
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`space-y-8`}>
                      <div className={`${cardBg} border ${borderColor} rounded-3xl p-8`}>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
                          Decision Matrix
                        </h3>
                        <div className="space-y-4">
                          {["Resource Allocation", "Security Protocol", "Market Entry"].map((task, i) => (
                            <div key={i} className={`p-4 rounded-2xl ${theme === "dark" ? "bg-black/40" : "bg-slate-100"} border ${borderColor} flex items-center justify-between`}>
                              <span className="text-xs font-bold">{task}</span>
                              <div className="flex gap-2">
                                <div className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                  <Check size={14} />
                                </div>
                                <div className="h-6 w-6 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                  <XCircle size={14} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Vitals Tab */}
            {activeTab === "vitals" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 p-8 overflow-y-auto"
              >
                <div className="max-w-6xl mx-auto space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: "System Load", value: `${vitalsData.systemLoad}%`, icon: Activity, color: "text-cyan-400" },
                      { label: "Neural Health", value: `${vitalsData.neuralHealth}%`, icon: Brain, color: "text-emerald-400" },
                      { label: "Risk Index", value: `${vitalsData.riskIndex}%`, icon: AlertCircle, color: "text-rose-400" },
                      { label: "Active Nodes", value: vitalsData.activeNodes, icon: Network, color: "text-purple-400" },
                    ].map((stat, i) => (
                      <div key={i} className={`${cardBg} border ${borderColor} rounded-3xl p-6 shadow-xl`}>
                        <stat.icon className={`${stat.color} mb-4`} size={18} />
                        <div className="text-2xl font-black">{stat.value}</div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`${cardBg} border ${borderColor} rounded-3xl p-8 shadow-2xl`}>
                    <div className="flex items-center justify-between mb-12">
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Telemetry Stream</h2>
                        <p className="text-xs text-slate-500 mt-1">Real-time performance metrics</p>
                      </div>
                      <button
                        onClick={handleRunSweep}
                        disabled={isScanning}
                        className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-cyan-400 text-black shadow-lg hover:scale-105 disabled:opacity-50"
                      >
                        {isScanning ? "Scanning..." : "Run Global Sweep"}
                      </button>
                    </div>

                    <div className="h-64 flex items-end gap-2 px-4">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.random() * 100}%` }}
                          className={`flex-1 rounded-t-lg transition-all duration-1000 ${
                            i === 9 ? "bg-cyan-400" : "bg-white/5"
                          }`}
                        />
                      ))}
                    </div>

                    <div className={`mt-8 p-6 rounded-2xl ${theme === "dark" ? "bg-black/40" : "bg-slate-100"} border ${borderColor} flex items-center gap-4`}>
                      <div className={`h-2 w-2 rounded-full ${isScanning ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                      <span className="text-xs font-mono text-slate-400">
                        {isScanning
                          ? "Sweep in progress… checking agent health, risks, and collaboration threads."
                          : "Sweep complete: 4 agents online, 1 risk flagged, and the shared group is aligned."}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Calendar Tab */}
            {activeTab === "calendar" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 p-8 overflow-y-auto"
              >
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className={`${cardBg} border ${borderColor} rounded-3xl p-8 shadow-2xl`}>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Strategic Calendar</h2>
                        <p className="text-xs text-slate-500 mt-1">Scheduled agent synchronization events</p>
                      </div>
                      <button
                        onClick={() => setEditingMeeting("new")}
                        className="p-3 rounded-2xl text-cyan-400 hover:scale-110 transition-transform"
                      >
                        <Plus size={24} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {meetings.map((meeting) => (
                        <div
                          key={meeting.id}
                          className={`group p-5 rounded-2xl ${cardBg} border ${borderColor} flex items-center justify-between hover:border-cyan-400/50 transition-all`}
                        >
                          <div className="flex items-center gap-6">
                            <div className="text-center w-12">
                              <div className="text-[10px] font-black text-slate-500 uppercase">{meeting.day}</div>
                              <div className="text-sm font-bold">{meeting.time}</div>
                            </div>
                            <div className={`h-8 w-[1px] ${theme === "dark" ? "bg-white/10" : "bg-black/10"}`} />
                            <div className="text-sm font-bold">{meeting.title}</div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingMeeting(meeting.id);
                              setNewMeetingForm(meeting);
                            }}
                            className="p-2 hover:text-cyan-400"
                          >
                            <Settings size={16} />
                          </button>
                            <button
                              onClick={() => handleDeleteMeeting(meeting.id)}
                              className="p-2 hover:text-rose-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {editingMeeting && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`mt-8 p-8 rounded-3xl ${theme === "dark" ? "bg-white/5" : "bg-slate-100"} border ${borderColor} space-y-6`}
                      >
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Day</label>
                            <select
                              value={newMeetingForm.day}
                              onChange={(e) =>
                                setNewMeetingForm({ ...newMeetingForm, day: e.target.value })
                              }
                              className={`w-full rounded-xl p-3 text-xs outline-none focus:border-cyan-500 ${
                                theme === "dark"
                                  ? "bg-black border-white/10 text-white"
                                  : "bg-white border-black/10 text-slate-900"
                              }`}
                            >
                              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Time</label>
                            <input
                              type="time"
                              value={newMeetingForm.time}
                              onChange={(e) =>
                                setNewMeetingForm({ ...newMeetingForm, time: e.target.value })
                              }
                              className={`w-full rounded-xl p-3 text-xs outline-none focus:border-cyan-500 ${
                                theme === "dark"
                                  ? "bg-black border-white/10 text-white"
                                  : "bg-white border-black/10 text-slate-900"
                              }`}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase">
                            Event Title
                          </label>
                          <input
                            value={newMeetingForm.title}
                            onChange={(e) =>
                              setNewMeetingForm({ ...newMeetingForm, title: e.target.value })
                            }
                            placeholder="Enter event title..."
                            className={`w-full rounded-xl p-3 text-xs outline-none focus:border-cyan-500 ${
                              theme === "dark"
                                ? "bg-black border-white/10 text-white"
                                : "bg-white border-black/10 text-slate-900"
                            }`}
                          />
                        </div>
                        <div className="flex gap-4 pt-2">
                          <button
                            onClick={handleAddMeeting}
                            className="flex-1 py-3 bg-cyan-400 text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:scale-105"
                          >
                            {editingMeeting === "new" ? "Create Event" : "Save Changes"}
                          </button>
                          <button
                            onClick={() => setEditingMeeting(null)}
                            className={`flex-1 py-3 font-black text-xs uppercase tracking-widest rounded-xl border ${borderColor} ${
                              theme === "dark" ? "bg-white/5" : "bg-white"
                            }`}
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
