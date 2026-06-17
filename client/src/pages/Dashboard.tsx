import { useRef, useState, useEffect } from "react";
import {
  MessageSquare,
  LayoutDashboard,
  Activity,
  Calendar,
  Settings,
  Sun,
  Moon,
  Send,
  Zap,
  LogOut,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AGENTS = [
  { id: "ceo", name: "CEO", role: "Executive", icon: Users, color: "text-cyan-400" },
  { id: "finance", name: "Finance", role: "Analyst", icon: Users, color: "text-yellow-400" },
  { id: "hr", name: "HR", role: "Personnel", icon: Users, color: "text-purple-400" },
  { id: "reporter", name: "Reporter", role: "Operations", icon: Users, color: "text-green-400" },
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
  const [chatMode, setChatMode] = useState<"individual" | "group">("individual");
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    ceo: [],
    finance: [],
    hr: [],
    reporter: [],
    group: [],
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

    const currentChat = chatMode === "group" ? "group" : selectedAgent;
    setChatMessages((prev) => ({
      ...prev,
      [currentChat]: [...(prev[currentChat] || []), userMessage],
    }));
    const messageToSend = chatInput;
    setChatInput("");
    setIsLoading(true);

    try {
      if (chatMode === "group") {
        const agents = ["ceo", "finance", "hr", "reporter"];
        for (const agentId of agents) {
          const result = await agentChatMutation.mutateAsync({
            agentId: agentId as any,
            message: messageToSend,
          });
          const responseText = typeof result.response === 'string' ? result.response : JSON.stringify(result.response);
          const agentMessage: ChatMessage = {
            id: Date.now().toString() + agentId,
            sender: "agent",
            text: `[${agentId.toUpperCase()}] ${responseText}`,
            timestamp: new Date(),
          };
          setChatMessages((prev) => ({
            ...prev,
            group: [...(prev.group || []), agentMessage],
          }));
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } else {
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
      }
    } catch (error) {
      toast.error("Failed to get agent response");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSweep = async () => {
    setIsScanning(true);
    toast.loading("Running global sweep...");
    setTimeout(() => {
      setVitalsData({
        systemLoad: vitalsData.systemLoad + 5,
        neuralHealth: vitalsData.neuralHealth - 3,
        riskIndex: vitalsData.riskIndex + 2,
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
      <div
        className={`w-20 border-r flex flex-col items-center py-8 gap-8 shrink-0 backdrop-blur-xl z-50 ${borderColor} ${
          theme === "dark" ? "bg-black/40" : "bg-white/40"
        }`}
      >
        <div className="h-10 w-10 bg-cyan-400 rounded-xl flex items-center justify-center text-black cursor-pointer font-bold">
          CA
        </div>

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

        <div className="mt-auto flex flex-col gap-4">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-2xl text-slate-500 hover:text-slate-300 transition-all"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => logout()}
            className="p-3 rounded-2xl text-slate-500 hover:text-rose-400 transition-all"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
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

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {activeTab === "messages" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 flex flex-col"
              >
                {/* Chat Mode Toggle */}
                <div className={`px-8 py-4 border-b flex gap-4 items-center ${borderColor}`}>
                  <button
                    onClick={() => setChatMode("individual")}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      chatMode === "individual"
                        ? "bg-cyan-400 text-black"
                        : `${theme === "dark" ? "bg-white/5 text-slate-400" : "bg-black/5 text-slate-600"}`
                    }`}
                  >
                    Individual Chat
                  </button>
                  <button
                    onClick={() => setChatMode("group")}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                      chatMode === "group"
                        ? "bg-cyan-400 text-black"
                        : `${theme === "dark" ? "bg-white/5 text-slate-400" : "bg-black/5 text-slate-600"}`
                    }`}
                  >
                    <Users size={16} /> Group Chat
                  </button>
                </div>

                <div className="flex-1 overflow-hidden flex">
                  {chatMode === "individual" && (
                    <>
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
                          <div className={`flex gap-3 ${borderColor}`}>
                            <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                              placeholder="Ask the agent..."
                              className={`flex-1 px-6 py-3 rounded-2xl font-mono text-sm transition-all focus:outline-none ${
                                theme === "dark"
                                  ? "bg-white/5 border-white/10 text-white placeholder-slate-500"
                                  : "bg-slate-100 border-black/10 text-black placeholder-slate-400"
                              }`}
                              disabled={isLoading}
                            />
                            <button
                              onClick={handleSendMessage}
                              disabled={isLoading || !chatInput.trim()}
                              className="px-6 py-3 bg-cyan-400 text-black rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                            >
                              <Send size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {chatMode === "group" && (
                    <div className={`flex-1 flex flex-col min-w-0 ${theme === "dark" ? "bg-black/40" : "bg-white"}`}>
                      <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        <div className={`p-4 rounded-2xl text-center text-sm font-semibold ${theme === "dark" ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
                          Group Chat - All Agents Responding
                        </div>
                        {(chatMessages.group || []).map((msg) => (
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
                        <div className={`flex gap-3 ${borderColor}`}>
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            placeholder="Ask all agents..."
                            className={`flex-1 px-6 py-3 rounded-2xl font-mono text-sm transition-all focus:outline-none ${
                              theme === "dark"
                                ? "bg-white/5 border-white/10 text-white placeholder-slate-500"
                                : "bg-slate-100 border-black/10 text-black placeholder-slate-400"
                            }`}
                            disabled={isLoading}
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={isLoading || !chatInput.trim()}
                            className="px-6 py-3 bg-cyan-400 text-black rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "boardroom" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 overflow-y-auto p-8"
              >
                <div className="max-w-6xl mx-auto space-y-8">
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className={`lg:col-span-2 ${cardBg} rounded-3xl p-8 border ${borderColor}`}>
                      <h2 className="text-lg font-black uppercase mb-6 text-cyan-400">Swarm Intelligence Feed</h2>
                      <div className="space-y-4">
                        {[
                          { agent: "Finance AI", msg: "Flagged a payroll risk for Q3. Investigating now." },
                          { agent: "HR Copilot", msg: "HR confirms: 12 new hires this quarter due to surge." },
                          { agent: "CEO Advisor", msg: "Strategic recommendation: Expand market presence in Asia." },
                          { agent: "Reporter", msg: "System health at 87%. All nodes responding normally." },
                        ].map((item, i) => (
                          <div key={i} className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-white/[0.02] border-white/10" : "bg-slate-50 border-black/5"}`}>
                            <div className="font-bold text-cyan-400 text-sm mb-1">{item.agent}</div>
                            <div className="text-sm leading-relaxed">{item.msg}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={`${cardBg} rounded-3xl p-8 border ${borderColor}`}>
                      <h2 className="text-lg font-black uppercase mb-6 text-cyan-400">Decision Matrix</h2>
                      <div className="space-y-4">
                        {[
                          { label: "Confidence", value: "94%" },
                          { label: "Risk Level", value: "Low" },
                          { label: "Consensus", value: "Strong" },
                          { label: "Action Items", value: "3" },
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-400">{item.label}</span>
                            <span className="font-black text-cyan-400">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "vitals" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 overflow-y-auto p-8"
              >
                <div className="max-w-6xl mx-auto space-y-8">
                  <div className="grid md:grid-cols-4 gap-4">
                    {[
                      { label: "System Load", value: vitalsData.systemLoad, unit: "%" },
                      { label: "Neural Health", value: vitalsData.neuralHealth, unit: "%" },
                      { label: "Risk Index", value: vitalsData.riskIndex, unit: "pts" },
                      { label: "Active Nodes", value: vitalsData.activeNodes, unit: "" },
                    ].map((stat, i) => (
                      <div key={i} className={`${cardBg} rounded-2xl p-6 border ${borderColor}`}>
                        <div className="text-xs font-mono uppercase text-slate-500 mb-2">{stat.label}</div>
                        <div className="text-3xl font-black text-cyan-400">
                          {stat.value}{stat.unit}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`${cardBg} rounded-3xl p-8 border ${borderColor}`}>
                    <h2 className="text-lg font-black uppercase mb-6 text-cyan-400">Telemetry Stream</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { time: "00:00", load: 35 },
                        { time: "04:00", load: 42 },
                        { time: "08:00", load: 55 },
                        { time: "12:00", load: 48 },
                        { time: "16:00", load: vitalsData.systemLoad },
                        { time: "20:00", load: vitalsData.systemLoad + 3 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#ffffff10" : "#00000010"} />
                        <XAxis dataKey="time" stroke={theme === "dark" ? "#64748b" : "#475569"} />
                        <YAxis stroke={theme === "dark" ? "#64748b" : "#475569"} />
                        <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#1e293b" : "#f1f5f9", border: "1px solid #00f0ff" }} />
                        <Bar dataKey="load" fill="#00f0ff" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <button
                    onClick={handleRunSweep}
                    disabled={isScanning}
                    className="w-full py-4 bg-cyan-400 text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all disabled:opacity-50"
                  >
                    <Zap size={20} />
                    Run Global Sweep
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "calendar" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 overflow-y-auto p-8"
              >
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className={`${cardBg} rounded-3xl p-8 border ${borderColor}`}>
                    <h2 className="text-lg font-black uppercase mb-6 text-cyan-400">Add Meeting</h2>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <select
                        value={newMeetingForm.day}
                        onChange={(e) => setNewMeetingForm({ ...newMeetingForm, day: e.target.value })}
                        className={`px-4 py-3 rounded-xl font-mono text-sm focus:outline-none ${
                          theme === "dark"
                            ? "bg-white/5 border-white/10 text-white"
                            : "bg-slate-100 border-black/10 text-black"
                        }`}
                      >
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={newMeetingForm.time}
                        onChange={(e) => setNewMeetingForm({ ...newMeetingForm, time: e.target.value })}
                        className={`px-4 py-3 rounded-xl font-mono text-sm focus:outline-none ${
                          theme === "dark"
                            ? "bg-white/5 border-white/10 text-white"
                            : "bg-slate-100 border-black/10 text-black"
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Meeting title"
                        value={newMeetingForm.title}
                        onChange={(e) => setNewMeetingForm({ ...newMeetingForm, title: e.target.value })}
                        className={`px-4 py-3 rounded-xl font-mono text-sm focus:outline-none ${
                          theme === "dark"
                            ? "bg-white/5 border-white/10 text-white placeholder-slate-500"
                            : "bg-slate-100 border-black/10 text-black placeholder-slate-400"
                        }`}
                      />
                    </div>
                    <button
                      onClick={handleAddMeeting}
                      className="w-full py-3 bg-cyan-400 text-black font-bold rounded-xl hover:scale-105 transition-all"
                    >
                      {editingMeeting ? "Update Meeting" : "Add Meeting"}
                    </button>
                  </div>

                  <div className={`${cardBg} rounded-3xl p-8 border ${borderColor}`}>
                    <h2 className="text-lg font-black uppercase mb-6 text-cyan-400">Weekly Schedule</h2>
                    {meetings.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-slate-500 mb-4">No meetings scheduled</div>
                        <div className="text-sm text-slate-600">Add your first meeting above to get started</div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                          const dayMeetings = meetings.filter((m) => m.day === day).sort((a, b) => a.time.localeCompare(b.time));
                          if (dayMeetings.length === 0) return null;
                          return (
                            <div key={day}>
                              <div className="text-xs font-black uppercase text-cyan-400 mb-3">{day}</div>
                              <div className="space-y-2 pl-4 border-l-2 border-cyan-400/30">
                                {dayMeetings.map((meeting) => (
                                  <div
                                    key={meeting.id}
                                    className={`p-4 rounded-2xl border flex items-center justify-between group ${
                                      theme === "dark" ? "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]" : "bg-slate-50 border-black/5 hover:bg-slate-100"
                                    } transition-all`}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-bold text-cyan-400 mb-1">{meeting.time}</div>
                                      <div className="font-bold truncate">{meeting.title}</div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4 shrink-0">
                                      <button
                                        onClick={() => {
                                          setEditingMeeting(meeting.id);
                                          setNewMeetingForm(meeting);
                                        }}
                                        className="p-2 hover:text-cyan-400 transition-colors"
                                      >
                                        <Settings size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMeeting(meeting.id)}
                                        className="p-2 hover:text-rose-500 transition-colors"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
