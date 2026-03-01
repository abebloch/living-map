"use client"
import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#111318", bgLight: "#181c28", surface: "#1f2435", surfaceHover: "#282e42",
  border: "#2a3050", warm: "#f5a623", mint: "#4dd4a0", lavender: "#b8a9e8",
  sky: "#7eb8da", rose: "#e88aaf", gold: "#f0c27a", dim: "#3d4260",
  text: "#e4e4f0", muted: "#7d82a0", faint: "#464c6a", energy: "#ff6b9d",
  red: "#e94560",
};

const CLUSTERS = {
  "Strategic Foresight": { main: "#e94560", bg: "#e9456012" },
  "Venture Building": { main: "#f5a623", bg: "#f5a62312" },
  "Democratic Infrastructure": { main: "#4dd4a0", bg: "#4dd4a012" },
  "Intelligence Systems": { main: "#7eb8da", bg: "#7eb8da12" },
  "AI & Agents": { main: "#b8a9e8", bg: "#b8a9e812" },
  "Culture & Curation": { main: "#f0c27a", bg: "#f0c27a12" },
  "Societal Concepts": { main: "#e88aaf", bg: "#e88aaf12" },
  "Intake Zone": { main: "#666", bg: "#66666612" },
};

const STATUS_ORDER = ["exploring", "forming", "ready", "shipped", "dormant"];
const STATUSES = {
  exploring: { label: "Exploring", icon: "◌", color: C.muted },
  forming: { label: "Forming", icon: "◐", color: C.lavender },
  ready: { label: "Ready", icon: "●", color: C.warm },
  shipped: { label: "Shipped", icon: "✦", color: C.mint },
  dormant: { label: "On ice", icon: "◇", color: C.dim },
};

const SYNERGY_TYPES = {
  lineage: { color: "#f0c27a", label: "Lineage", desc: "One evolved from the other" },
  feeds: { color: "#7eb8da", label: "Feeds into", desc: "Provides input or energy" },
  shares: { color: "#b8a9e8", label: "Shared DNA", desc: "Same intellectual territory" },
  accelerates: { color: "#4dd4a0", label: "Accelerates", desc: "Shipping one helps ship the other" },
};

const DEFAULT_NODES = [
  { id: "bb", title: "Bloch & Beecken", cluster: "Strategic Foresight", status: "forming", x: 120, y: 280, desc: "Your consultancy — positioning, offers, and sales assets in development.", nextMove: "Define minimum viable launch: landing page + 2 clear offers?" },
  { id: "track", title: "Client track record", cluster: "Strategic Foresight", status: "shipped", x: 40, y: 400, desc: "Volvo, SKF, Spotify, Länsförsäkringar. Deep portfolio.", shippedAs: "Completed projects" },
  { id: "method", title: "Foresight methodology", cluster: "Strategic Foresight", status: "exploring", x: 280, y: 180, desc: "Your evolving approach — participatory, systems-based, culturally grounded.", nextMove: "Codify into a shareable framework" },
  { id: "studio", title: "Venture Studio", cluster: "Venture Building", status: "forming", x: 580, y: 120, desc: "Your solo venture studio.", nextMove: "Define the first venture thesis and selection criteria" },
  { id: "palate", title: "Palate", cluster: "Venture Building", status: "forming", x: 750, y: 220, desc: "Taste-driven auction discovery. CLIP embeddings, curation logic.", nextMove: "Build a clickable prototype or demo to show 3 people" },
  { id: "thesis", title: "Agentic disruption thesis", cluster: "Venture Building", status: "forming", x: 520, y: 240, desc: "AI agents consuming knowledge work creates new competitive dynamics.", nextMove: "Publish a condensed version" },
  { id: "daya", title: "Daya / femtech", cluster: "Venture Building", status: "dormant", x: 740, y: 370, desc: "Partnership exploration. On hold.", nextMove: "Light touch in 2–3 months" },
  { id: "ar", title: "AI ventures w/ Andy & Ronja", cluster: "AI & Agents", status: "exploring", x: 1000, y: 100, desc: "Collaboration exploring AI agent business models.", nextMove: "Agree on one concrete build or experiment" },
  { id: "infra", title: "Agent infrastructure", cluster: "AI & Agents", status: "exploring", x: 1120, y: 220, desc: "AI agents as economic actors in European regulatory contexts.", nextMove: "Write a problem statement" },
  { id: "econ", title: "European agent economics", cluster: "AI & Agents", status: "exploring", x: 1200, y: 100, desc: "Where European regulation creates opportunity for AI agents.", nextMove: "Map 3 use cases" },
  { id: "fhai", title: "Folkhems AI", cluster: "Societal Concepts", status: "exploring", x: 580, y: 520, desc: "With Alexandre. Societal OS combining tech sovereignty with social cohesion.", nextMove: "Clarify with Alexandre: next conversation and first deliverable?" },
  { id: "board", title: "Medborgarskolan board", cluster: "Democratic Infrastructure", status: "shipped", x: 80, y: 620, desc: "Board role at Medborgarskolan Väst.", shippedAs: "Board position" },
  { id: "circles", title: "Study circles as social algorithms", cluster: "Democratic Infrastructure", status: "ready", x: 300, y: 700, desc: "Folkbildning as democratic infrastructure for the AI era. Feb 20 presentation delivered.", nextMove: "Turn into a published essay or public talk" },
  { id: "foresight_fb", title: "Folkbildning × AI foresight", cluster: "Democratic Infrastructure", status: "forming", x: 180, y: 550, desc: "Foresight analysis + strategic materials for Medborgarskolan.", nextMove: "Package EU funding analysis as board proposal" },
  { id: "omdom", title: "AI omdömescirklar", cluster: "Democratic Infrastructure", status: "forming", x: 440, y: 620, desc: "Study circle curricula for critical AI literacy.", nextMove: "Draft pilot: 4 sessions, testable with one study circle" },
  { id: "owl", title: "The Night Owl", cluster: "Intelligence Systems", status: "forming", x: 1020, y: 420, desc: "Daily intelligence reports.", nextMove: "Ship 5 editions to a small list" },
  { id: "hunt", title: "The Hunt", cluster: "Intelligence Systems", status: "forming", x: 1180, y: 520, desc: "Venture scanner.", nextMove: "Run one full scan cycle and share the output" },
  { id: "patron", title: "Patron (legacy)", cluster: "Culture & Curation", status: "shipped", x: 520, y: 780, desc: "Your curatorial practice — origin story.", shippedAs: "Completed body of work" },
  { id: "taste", title: "Taste-driven discovery", cluster: "Culture & Curation", status: "exploring", x: 740, y: 760, desc: "Curation, taste, resonance.", nextMove: "Worldview or separate venture?" },
  { id: "intake", title: "Signals & rabbit holes", cluster: "Intake Zone", status: "exploring", x: 1100, y: 720, desc: "Everything new lands here.", nextMove: "Weekly review" },
];

const DEFAULT_SYNERGIES = [
  { from: "patron", to: "palate", type: "lineage", label: "Patron evolved into Palate" },
  { from: "patron", to: "taste", type: "lineage", label: "Curatorial sensibility feeds taste thesis" },
  { from: "taste", to: "palate", type: "feeds", label: "Palate is the product; taste is the worldview" },
  { from: "fhai", to: "circles", type: "shares", label: "Both reimagine democratic infrastructure for AI era" },
  { from: "fhai", to: "foresight_fb", type: "shares", label: "Societal OS meets folkbildning strategy" },
  { from: "fhai", to: "infra", type: "shares", label: "Both about AI governance in European context" },
  { from: "circles", to: "omdom", type: "accelerates", label: "Publishing essay legitimizes omdömescirklar" },
  { from: "foresight_fb", to: "omdom", type: "feeds", label: "Strategic analysis provides rationale" },
  { from: "thesis", to: "ar", type: "feeds", label: "Thesis frames the space with Andy & Ronja" },
  { from: "thesis", to: "econ", type: "shares", label: "Thesis is the argument, economics is the evidence" },
  { from: "ar", to: "econ", type: "feeds", label: "Venture exploration needs the regulatory map" },
  { from: "method", to: "studio", type: "feeds", label: "Foresight method is the studio's engine" },
  { from: "method", to: "bb", type: "feeds", label: "Methodology is what B&B sells" },
  { from: "owl", to: "hunt", type: "feeds", label: "Night Owl signals become Hunt candidates" },
  { from: "owl", to: "thesis", type: "feeds", label: "Scanning sharpens the thesis" },
  { from: "bb", to: "track", type: "lineage", label: "Track record is B&B's proof" },
  { from: "circles", to: "fhai", type: "accelerates", label: "Study circles thinking builds Folkhems AI legitimacy" },
  { from: "hunt", to: "studio", type: "feeds", label: "The Hunt feeds Venture Studio pipeline" },
];

const clr = (c) => CLUSTERS[c] || { main: C.muted, bg: C.dim };
const stl = (s) => STATUSES[s] || STATUSES.exploring;

/* ═══════════════════════════════════
   STORAGE via API routes → Supabase
   ═══════════════════════════════════ */
const STORAGE_KEYS = { mapState: "anna-map-state", logs: "anna-map-logs", chat: "anna-map-chat" };

async function storageGet(key) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`/api/storage?key=${encodeURIComponent(key)}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return data.value ? JSON.parse(data.value) : null;
  } catch { return null; }
}

async function storageSet(key, value) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch('/api/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: JSON.stringify(value) }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch (e) { console.error('Storage save error:', e); }
}

async function storageDel(key) {
  try { await fetch(`/api/storage?key=${encodeURIComponent(key)}`, { method: 'DELETE' }); } catch {}
}

/* ═══════════════════════════════════
   CLAUDE CHAT PANEL
   ═══════════════════════════════════ */
function ClaudePanel({ nodes, synergies, shipLog, activityLog, energySet, messages, setMessages }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, loading]);

  const buildSystemPrompt = () => {
    const nodesSummary = nodes.map(n => {
      const conns = synergies.filter(s => s.from === n.id || s.to === n.id).length;
      const ships = shipLog.filter(s => s.nodeId === n.id).length;
      const isEnergy = energySet.has(n.id);
      return `"${n.title}" [${n.cluster}] ${n.status}${isEnergy ? " ⚡" : ""} | Next: ${n.nextMove || "—"} | ${conns} connections, ${ships} ships`;
    }).join("\n");
    const recentShips = shipLog.slice(-5).map(s => { const n = nodes.find(x => x.id === s.nodeId); return `${s.date}: "${s.text}" (${n?.title})`; }).join("\n");
    const recentActivity = activityLog.slice(-8).map(a => `${a.date}: ${a.text}`).join("\n");
    return `You are Claude inside Anna's Living Map. You see her full project landscape.

ANNA: Strategic foresight practitioner, co-founder BlochBeecken. Experimental design BA, former art curator (Patron). Has ADD — explores widely, struggles with execution. Feels alive when people react to her work.

YOUR ROLE: Direct, warm, strategic. Give honest map reads. Flag synergies and leverage. When scattered, identify ONE thing. Celebrate ships. Gently name stalled items. Strategic partner, not productivity coach.

NODES:\n${nodesSummary}\n\nRECENT SHIPS:\n${recentShips || "None."}\n\nACTIVITY:\n${recentActivity || "None."}\n\nENERGY: ${[...energySet].map(id => nodes.find(n => n.id === id)?.title).filter(Boolean).join(", ") || "None"}\nTOTAL: ${nodes.length} nodes, ${synergies.length} connections, ${shipLog.length} ships`;
  };

  const sendMessage = async (directMsg, isRetry) => {
    const msgText = directMsg || input.trim();
    if (!msgText || loading) return;
    if (!directMsg) setInput("");
    const cleanMessages = messages.filter(m => !m.isError);
    const newMessages = isRetry ? cleanMessages : [...cleanMessages, { role: "user", content: msgText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const history = newMessages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-opus-4-6", max_tokens: 1000, system: buildSystemPrompt(), messages: history }),
      });
      if (!response.ok) {
        setMessages(prev => [...prev, { role: "assistant", content: `API error (${response.status}). Hit retry.`, isError: true }]);
        setLoading(false); return;
      }
      const data = await response.json();
      let text = "";
      if (data.content && Array.isArray(data.content)) text = data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
      if (!text) text = "Couldn't generate a response. Try again?";
      setMessages(prev => [...prev.filter(m => !m.isError), { role: "assistant", content: text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `Connection error: ${err.message}. Hit retry.`, isError: true }]);
    } finally { setLoading(false); }
  };

  const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content;
  const quickPrompts = ["What do you see?", "Where's my leverage?", "I'm scattered — help me focus", "What should I ship first?", "What connections am I missing?"];

  return (
    <div style={{ position: "fixed", left: 0, top: 48, bottom: 0, width: "100%", background: C.bg, zIndex: 180, display: "flex", flexDirection: "column" }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px 32px", maxWidth: 720, margin: "0 auto", width: "100%" }}>
        {messages.length === 0 && (
          <div style={{ paddingTop: 40 }}>
            <h2 style={{ color: C.text, fontSize: 20, fontWeight: 700, margin: "0 0 8px", fontFamily: "'Playfair Display',serif" }}>Talk to Claude</h2>
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>I can see your full map. Ask me anything. Chat persists across sessions.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {quickPrompts.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q, false)}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "8px 16px", color: C.text, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.surfaceHover; }} onMouseLeave={e => { e.currentTarget.style.background = C.surface; }}
                >{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 20, display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ fontSize: 9, color: C.faint, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{m.role === "user" ? "You" : "Claude"}</div>
            <div style={{
              background: m.isError ? `${C.red}15` : m.role === "user" ? `${C.sky}15` : C.surface,
              border: `1px solid ${m.isError ? `${C.red}30` : m.role === "user" ? `${C.sky}25` : C.border}`,
              borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              padding: "12px 16px", maxWidth: "85%", color: C.text, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap",
            }}>
              {m.content}
              {m.isError && (
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button onClick={() => { if (lastUserMsg) sendMessage(lastUserMsg, true); }} style={{ background: `${C.lavender}20`, border: `1px solid ${C.lavender}40`, borderRadius: 8, padding: "4px 12px", color: C.lavender, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Retry</button>
                  <button onClick={() => setMessages(prev => prev.filter(x => !x.isError))} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 12px", color: C.muted, fontSize: 11, cursor: "pointer" }}>Dismiss</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0" }}>
            <div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map(i => (<div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.lavender, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />))}</div>
            <span style={{ color: C.muted, fontSize: 11 }}>Reading your map...</span>
          </div>
        )}
      </div>
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 32px", maxWidth: 720, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask about your map..."
            style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 16px", color: C.text, fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif" }}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
            style={{ background: loading || !input.trim() ? C.dim : C.lavender, border: "none", borderRadius: 12, padding: "12px 20px", color: loading || !input.trim() ? C.faint : C.bg, fontSize: 12, fontWeight: 700, cursor: loading ? "wait" : "pointer" }}>Send</button>
        </div>
        {messages.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <button onClick={() => { setMessages([]); storageDel(STORAGE_KEYS.chat); }}
              style={{ background: `${C.red}15`, border: `1px solid ${C.red}30`, borderRadius: 8, padding: "6px 14px", color: C.red, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Clear chat</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   MAIN APP
   ═══════════════════════════════════ */
export default function LivingMap() {
  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [synergies, setSynergies] = useState(DEFAULT_SYNERGIES);
  const [sel, setSel] = useState(null);
  const [hov, setHov] = useState(null);
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState("map");
  const [energySet, setEnergySet] = useState(new Set());
  const [shipLog, setShipLog] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [addingNode, setAddingNode] = useState(false);
  const [addingConn, setAddingConn] = useState(null);
  const [capOpen, setCapOpen] = useState(false);
  const [capText, setCapText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const canvasRef = useRef(null);
  const capRef = useRef(null);
  const saveTimerRef = useRef(null);

  const selNode = nodes.find(n => n.id === sel);
  const filtered = filter === "All" ? nodes : nodes.filter(n => n.cluster === filter);

  /* LOAD */
  useEffect(() => {
    (async () => {
      try {
        const mapState = await storageGet(STORAGE_KEYS.mapState);
        if (mapState) {
          if (mapState.nodes?.length) setNodes(mapState.nodes);
          if (mapState.synergies) setSynergies(mapState.synergies);
          if (mapState.energySet) setEnergySet(new Set(mapState.energySet));
        }
        const logs = await storageGet(STORAGE_KEYS.logs);
        if (logs) {
          if (logs.shipLog) setShipLog(logs.shipLog);
          if (logs.activityLog) setActivityLog(logs.activityLog);
        }
        const chat = await storageGet(STORAGE_KEYS.chat);
        if (chat?.messages) {
          setChatMessages(chat.messages.filter(m => m.role && m.content && !m.isError && !m.content.includes("Connection error")));
        }
      } catch (e) {
        console.error("Load error:", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  /* AUTO-SAVE */
  const saveAll = useCallback(async () => {
    if (!loaded) return;
    setSaveStatus("saving");
    try {
      await storageSet(STORAGE_KEYS.mapState, { nodes, synergies, energySet: [...energySet] });
      await storageSet(STORAGE_KEYS.logs, { shipLog, activityLog });
      await storageSet(STORAGE_KEYS.chat, { messages: chatMessages });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch { setSaveStatus("error"); setTimeout(() => setSaveStatus(""), 3000); }
  }, [loaded, nodes, synergies, energySet, shipLog, activityLog, chatMessages]);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveAll, 1200);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [nodes, synergies, energySet, shipLog, activityLog, chatMessages, saveAll]);

  /* ACTIONS */
  const logAct = (t) => setActivityLog(p => [...p, { text: t, date: new Date().toISOString().slice(0, 10), time: new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }) }]);
  const updateNode = (id, ch) => setNodes(p => p.map(n => n.id === id ? { ...n, ...ch } : n));
  const changeStatus = (id, ns) => { const n = nodes.find(x => x.id === id); if (n) { updateNode(id, { status: ns }); logAct(`${n.title}: ${stl(n.status).label} → ${stl(ns).label}`); } };
  const toggleEnergy = (id) => setEnergySet(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else { if (n.size >= 2) n.delete([...n][0]); n.add(id); } return n; });
  const addShip = (nid, txt) => { setShipLog(p => [...p, { nodeId: nid, text: txt, date: new Date().toISOString().slice(0, 10) }]); const n = nodes.find(x => x.id === nid); logAct(`Shipped: "${txt}" (${n?.title})`); };
  const addNodeFn = (title, cluster) => { const cn = nodes.filter(n => n.cluster === cluster); const x = cn.length ? cn.reduce((s, n) => s + n.x, 0) / cn.length + (Math.random() - 0.5) * 80 : 400; const y = cn.length ? Math.max(...cn.map(n => n.y)) + 50 + Math.random() * 30 : 300; const nn = { id: `n_${Date.now()}`, title, cluster, status: "exploring", x, y, desc: "", nextMove: "" }; setNodes(p => [...p, nn]); logAct(`Added: "${title}" to ${cluster}`); setSel(nn.id); setAddingNode(false); };
  const addConnectionFn = (from, to, type) => { if (from === to || synergies.some(s => (s.from === from && s.to === to) || (s.from === to && s.to === from))) return; setSynergies(p => [...p, { from, to, type, label: "" }]); const a = nodes.find(n => n.id === from); const b = nodes.find(n => n.id === to); logAct(`Connected: ${a?.title} ↔ ${b?.title}`); setAddingConn(null); };
  const removeNode = (id) => { const n = nodes.find(x => x.id === id); setNodes(p => p.filter(x => x.id !== id)); setSynergies(p => p.filter(s => s.from !== id && s.to !== id)); logAct(`Removed: "${n?.title}"`); setSel(null); };
  const removeConnection = (idx) => { const s = synergies[idx]; const a = nodes.find(n => n.id === s.from); const b = nodes.find(n => n.id === s.to); setSynergies(p => p.filter((_, i) => i !== idx)); logAct(`Disconnected: ${a?.title} ↔ ${b?.title}`); };
  const quickCapture = (txt) => { const n = { id: `cap_${Date.now()}`, title: txt.length > 50 ? txt.slice(0, 50) + "…" : txt, cluster: "Intake Zone", status: "exploring", x: 720 + Math.random() * 100, y: 510 + Math.random() * 60, desc: txt, nextMove: "" }; setNodes(p => [...p, n]); logAct(`Captured: "${n.title}"`); };
  const resetAll = async () => { if (!confirm("Reset everything?")) return; setNodes(DEFAULT_NODES); setSynergies(DEFAULT_SYNERGIES); setEnergySet(new Set()); setShipLog([]); setActivityLog([]); setChatMessages([]); await storageDel(STORAGE_KEYS.mapState); await storageDel(STORAGE_KEYS.logs); await storageDel(STORAGE_KEYS.chat); };

  useEffect(() => { if (capOpen && capRef.current) capRef.current.focus(); }, [capOpen]);

  /* PAN + NODE DRAG */
  const getPointerPos = (e) => e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
  const [dragNode, setDragNode] = useState(null);
  const dragNodeOffset = useRef({ x: 0, y: 0 });
  const didDragNode = useRef(false);
  const onMD = useCallback((e) => { const pos = getPointerPos(e); setDragging(true); setDragStart({ x: pos.x - pan.x, y: pos.y - pan.y }); }, [pan]);
  const onNodeMD = useCallback((e, nodeId) => {
    e.stopPropagation();
    const pos = getPointerPos(e);
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    dragNodeOffset.current = { x: pos.x - (node.x + pan.x), y: pos.y - (node.y + pan.y) };
    didDragNode.current = false;
    setDragNode(nodeId);
  }, [nodes, pan]);
  const onMM = useCallback((e) => {
    const pos = getPointerPos(e);
    if (dragNode) {
      e.preventDefault(); didDragNode.current = true;
      const newX = pos.x - dragNodeOffset.current.x - pan.x;
      const newY = pos.y - dragNodeOffset.current.y - pan.y;
      setNodes(prev => prev.map(n => n.id === dragNode ? { ...n, x: Math.round(newX), y: Math.round(newY) } : n));
    } else if (dragging) { e.preventDefault(); setPan({ x: pos.x - dragStart.x, y: pos.y - dragStart.y }); }
  }, [dragging, dragStart, dragNode, pan]);
  const onMU = useCallback(() => { setDragging(false); setDragNode(null); }, []);
  useEffect(() => { window.addEventListener("mousemove", onMM); window.addEventListener("mouseup", onMU); window.addEventListener("touchmove", onMM, { passive: false }); window.addEventListener("touchend", onMU); return () => { window.removeEventListener("mousemove", onMM); window.removeEventListener("mouseup", onMU); window.removeEventListener("touchmove", onMM); window.removeEventListener("touchend", onMU); }; }, [onMM, onMU]);

  const pill = (active, color) => ({ background: active ? `${color}20` : "transparent", border: `1px solid ${active ? `${color}55` : C.border}`, borderRadius: 14, padding: "3px 10px", color: active ? color : C.muted, fontSize: 10, fontWeight: active ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap" });
  const btn = (color, filled) => ({ background: filled ? color : `${color}15`, border: `1px solid ${color}40`, borderRadius: 8, padding: "5px 12px", color: filled ? C.bg : color, fontSize: 11, fontWeight: 600, cursor: "pointer" });
  const inputStyle = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", color: C.text, fontSize: 12, outline: "none", fontFamily: "'DM Sans',sans-serif", width: "100%" };
  const panelBox = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 12 };

  if (!loaded) return (
    <div style={{ width: "100vw", height: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 12 }}>Anna's Living Map</div>
        <div style={{ color: C.muted, fontSize: 13 }}>Loading…</div>
      </div>
    </div>
  );

  /* COMPONENTS */
  const SynergyCanvas = () => {
    const nm = {}; nodes.forEach(n => nm[n.id] = n);
    return (
      <svg style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, overflow: "visible" }} width="3000" height="2000">
        {synergies.map((s, i) => {
          const a = nm[s.from], b = nm[s.to]; if (!a || !b) return null;
          if (filter !== "All" && a.cluster !== filter && b.cluster !== filter) return null;
          const x1 = a.x + 90, y1 = a.y + 25, x2 = b.x + 90, y2 = b.y + 25;
          const isH = hov && (s.from === hov || s.to === hov);
          const st = SYNERGY_TYPES[s.type] || SYNERGY_TYPES.feeds;
          return (<g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={st.color} strokeWidth={isH ? 3 : 1.5} strokeDasharray={s.type === "lineage" ? "" : s.type === "accelerates" ? "8,4" : "5,4"} opacity={hov ? (isH ? 1 : 0.05) : 0.3} style={{ transition: "opacity 0.3s" }} />{isH && <><circle cx={x1} cy={y1} r={4} fill={st.color} opacity={0.8} /><circle cx={x2} cy={y2} r={4} fill={st.color} opacity={0.8} /></>}</g>);
        })}
      </svg>
    );
  };

  const Node = ({ node }) => {
    const s = stl(node.status); const cl = clr(node.cluster); const isSel = sel === node.id; const isE = energySet.has(node.id);
    const isConn = addingConn && addingConn.from !== node.id;
    const isDragging = dragNode === node.id;
    const dimmed = hov && hov !== node.id && !synergies.some(sy => (sy.from === hov && sy.to === node.id) || (sy.to === hov && sy.from === node.id));
    return (
      <div onMouseEnter={() => !addingConn && !dragNode && setHov(node.id)} onMouseLeave={() => setHov(null)}
        onMouseDown={e => onNodeMD(e, node.id)} onTouchStart={e => onNodeMD(e, node.id)}
        onClick={(e) => { e.stopPropagation(); if (didDragNode.current) return; if (addingConn) addConnectionFn(addingConn.from, node.id, addingConn.type); else setSel(node.id); }}
        style={{ position: "absolute", left: node.x, top: node.y, zIndex: isDragging ? 200 : isSel ? 100 : 10, transform: isSel && !isDragging ? "scale(1.06)" : isDragging ? "scale(1.08)" : "scale(1)", opacity: dimmed ? 0.18 : 1, cursor: isDragging ? "grabbing" : isConn ? "crosshair" : "grab", transition: isDragging ? "none" : "all 0.25s cubic-bezier(0.4,0,0.2,1)", userSelect: "none" }}>
        <div style={{ background: isSel ? `${cl.main}18` : `${C.bgLight}dd`, border: `1.5px solid ${isSel ? cl.main : isE ? C.energy : isDragging ? "#fff" : isConn ? "#fff" : `${cl.main}25`}`, borderRadius: 11, padding: "9px 13px", minWidth: 130, maxWidth: 195, boxShadow: isDragging ? `0 8px 32px rgba(0,0,0,0.6)` : isSel ? `0 0 20px ${cl.main}30` : isE ? `0 0 14px ${C.energy}25` : "0 2px 10px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ color: s.color, fontSize: 10 }}>{s.icon}</span><span style={{ color: C.muted, fontSize: 9, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</span></div>
            {isE && <span style={{ fontSize: 9, color: C.energy }}>⚡</span>}
          </div>
          <div style={{ color: C.text, fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{node.title}</div>
        </div>
      </div>
    );
  };

  const Blobs = () => {
    const vis = [...new Set(filtered.map(n => n.cluster))];
    return vis.map(c => {
      const cn = filtered.filter(n => n.cluster === c); const p = 50;
      const x1 = Math.min(...cn.map(n => n.x)) - p, y1 = Math.min(...cn.map(n => n.y)) - p;
      const x2 = Math.max(...cn.map(n => n.x)) + 200 + p, y2 = Math.max(...cn.map(n => n.y)) + 60 + p;
      const cc = clr(c);
      return (<div key={c}><div style={{ position: "absolute", left: x1, top: y1, width: x2 - x1, height: y2 - y1, background: `radial-gradient(ellipse at center, ${cc.bg} 0%, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }} /><div style={{ position: "absolute", left: cn.reduce((s, n) => s + n.x, 0) / cn.length - 30, top: Math.min(...cn.map(n => n.y)) - 36, color: `${cc.main}35`, fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", pointerEvents: "none", whiteSpace: "nowrap" }}>{c}</div></div>);
    });
  };

  const Detail = () => {
    const n = selNode; if (!n) return null;
    const cl = clr(n.cluster); const isE = energySet.has(n.id);
    const nodeShips = shipLog.filter(sl => sl.nodeId === n.id);
    const nodeConns = synergies.map((sy, i) => ({ ...sy, idx: i })).filter(sy => sy.from === n.id || sy.to === n.id);
    const [shipInput, setShipInput] = useState(""); const [showShip, setShowShip] = useState(false);
    const [editDesc, setEditDesc] = useState(false); const [editNext, setEditNext] = useState(false);
    const [descVal, setDescVal] = useState(n.desc); const [nextVal, setNextVal] = useState(n.nextMove || "");
    useEffect(() => { setDescVal(n.desc); setNextVal(n.nextMove || ""); setEditDesc(false); setEditNext(false); }, [n.id]);
    return (
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 390, background: C.bgLight, borderLeft: `1px solid ${C.border}`, padding: "24px 20px", zIndex: 200, overflowY: "auto", boxShadow: "-6px 0 30px rgba(0,0,0,0.5)" }}>
        <button onClick={() => setSel(null)} style={{ position: "absolute", top: 12, right: 14, background: "none", border: "none", color: C.muted, fontSize: 16, cursor: "pointer" }}>✕</button>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ padding: "3px 9px", borderRadius: 14, background: `${cl.main}15`, color: cl.main, fontSize: 10, fontWeight: 600 }}>{n.cluster}</span>
          <button onClick={() => toggleEnergy(n.id)} style={{ ...pill(isE, C.energy), padding: "3px 9px" }}>{isE ? "⚡ Energy" : "⚡ Mark"}</button>
        </div>
        <h2 style={{ color: C.text, fontSize: 19, fontWeight: 700, margin: "0 0 10px", lineHeight: 1.3, fontFamily: "'Playfair Display',serif" }}>{n.title}</h2>
        <div style={{ display: "flex", gap: 3, marginBottom: 16, flexWrap: "wrap" }}>
          {STATUS_ORDER.map(st => (<button key={st} onClick={() => changeStatus(n.id, st)} style={pill(n.status === st, STATUSES[st].color)}>{STATUSES[st].icon} {STATUSES[st].label}</button>))}
        </div>
        <div style={panelBox}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ color: C.muted, fontSize: 9, fontWeight: 600, textTransform: "uppercase" }}>Description</span>
            <button onClick={() => { if (editDesc) updateNode(n.id, { desc: descVal }); setEditDesc(!editDesc); }} style={{ background: "none", border: "none", color: C.sky, fontSize: 10, cursor: "pointer" }}>{editDesc ? "Save" : "Edit"}</button>
          </div>
          {editDesc ? <textarea value={descVal} onChange={e => setDescVal(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} /> : <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.6, margin: 0 }}>{n.desc || "Click Edit to add."}</p>}
        </div>
        {n.status !== "shipped" && (
          <div style={{ ...panelBox, borderColor: n.status === "ready" ? `${C.warm}30` : C.border }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: C.warm, fontSize: 9, fontWeight: 600, textTransform: "uppercase" }}>→ Next move</span>
              <button onClick={() => { if (editNext) updateNode(n.id, { nextMove: nextVal }); setEditNext(!editNext); }} style={{ background: "none", border: "none", color: C.sky, fontSize: 10, cursor: "pointer" }}>{editNext ? "Save" : "Edit"}</button>
            </div>
            {editNext ? <textarea value={nextVal} onChange={e => setNextVal(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} /> : <p style={{ color: C.text, fontSize: 12, lineHeight: 1.5, margin: 0 }}>{n.nextMove || "None yet."}</p>}
          </div>
        )}
        {n.shippedAs && <div style={{ ...panelBox, borderColor: `${C.mint}25` }}><span style={{ color: C.mint, fontSize: 9, fontWeight: 600, textTransform: "uppercase" }}>Shipped as</span><p style={{ color: C.text, fontSize: 12, margin: "4px 0 0" }}>{n.shippedAs}</p></div>}
        {n.status === "ready" && <div style={{ ...panelBox, background: `${C.warm}08`, borderColor: `${C.warm}25`, borderStyle: "dashed" }}><div style={{ color: C.warm, fontSize: 11, fontWeight: 700 }}>🚩 Ready Line</div><div style={{ color: C.muted, fontSize: 11 }}>One move gets this out.</div></div>}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ color: C.muted, fontSize: 9, fontWeight: 600, textTransform: "uppercase" }}>Connections ({nodeConns.length})</span>
            <button onClick={() => setAddingConn({ from: n.id, type: "feeds" })} style={{ ...btn(C.lavender, false), padding: "3px 8px", fontSize: 10 }}>+ Connect</button>
          </div>
          {nodeConns.map(sy => {
            const oid = sy.from === n.id ? sy.to : sy.from; const o = nodes.find(nd => nd.id === oid); const st = SYNERGY_TYPES[sy.type];
            return (<div key={sy.idx} style={{ display: "flex", gap: 6, marginBottom: 6, padding: "7px 9px", background: `${st.color}08`, border: `1px solid ${st.color}18`, borderRadius: 8 }}>
              <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setSel(oid)}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 2, background: st.color, borderRadius: 1 }} /><span style={{ color: st.color, fontSize: 9, fontWeight: 600, textTransform: "uppercase" }}>{st.label}</span><span style={{ color: C.muted, fontSize: 9 }}>→</span><span style={{ color: C.text, fontSize: 11, fontWeight: 500 }}>{o?.title}</span></div>
                {sy.label && <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>{sy.label}</div>}
              </div>
              <button onClick={e => { e.stopPropagation(); removeConnection(sy.idx); }} style={{ background: "none", border: "none", color: C.faint, fontSize: 11, cursor: "pointer" }}>✕</button>
            </div>);
          })}
        </div>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ color: C.muted, fontSize: 9, fontWeight: 600, textTransform: "uppercase" }}>Ship log ({nodeShips.length})</span>
            <button onClick={() => setShowShip(!showShip)} style={{ ...btn(C.mint, false), padding: "3px 8px", fontSize: 10 }}>+ Log</button>
          </div>
          {showShip && (<div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <input value={shipInput} onChange={e => setShipInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && shipInput.trim()) { addShip(n.id, shipInput.trim()); setShipInput(""); setShowShip(false); } }} placeholder="What did you put out?" style={inputStyle} />
            <button onClick={() => { if (shipInput.trim()) { addShip(n.id, shipInput.trim()); setShipInput(""); setShowShip(false); } }} style={btn(C.mint, true)}>✓</button>
          </div>)}
          {nodeShips.length === 0 && !showShip && <div style={{ color: C.faint, fontSize: 11, fontStyle: "italic" }}>Nothing shipped yet.</div>}
          {nodeShips.map((sl, i) => (<div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: C.mint, fontSize: 10 }}>✦</span><span style={{ color: C.text, fontSize: 11 }}>{sl.text}</span><span style={{ color: C.faint, fontSize: 10 }}>{sl.date}</span></div>))}
        </div>
        <div style={{ marginTop: 24, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => { if (confirm(`Remove "${n.title}"?`)) removeNode(n.id); }} style={{ background: "none", border: `1px solid ${C.red}30`, borderRadius: 8, padding: "4px 10px", color: C.red, fontSize: 10, cursor: "pointer", opacity: 0.5 }}>Remove</button>
        </div>
      </div>
    );
  };

  const ConnectionsView = () => (
    <div style={{ position: "fixed", left: 0, top: 48, bottom: 0, width: "100%", background: C.bg, zIndex: 180, overflowY: "auto", padding: "24px 32px" }}>
      <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: "0 0 6px", fontFamily: "'Playfair Display',serif" }}>All Connections</h2>
      <p style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>How your projects relate. Shipping one often moves several.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 900 }}>
        {Object.entries(SYNERGY_TYPES).map(([type, info]) => {
          const m = synergies.filter(s => s.type === type); if (!m.length) return null;
          return (<div key={type} style={{ background: C.surface, borderRadius: 12, padding: "16px 18px", border: `1px solid ${info.color}20` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><div style={{ width: 20, height: 3, background: info.color, borderRadius: 2 }} /><span style={{ color: info.color, fontSize: 12, fontWeight: 700 }}>{info.label}</span><span style={{ color: C.faint, fontSize: 10 }}>({m.length})</span></div>
            <p style={{ color: C.muted, fontSize: 10, marginBottom: 12 }}>{info.desc}</p>
            {m.map((s, i) => { const a = nodes.find(n => n.id === s.from); const b = nodes.find(n => n.id === s.to);
              return (<div key={i} style={{ marginBottom: 8, padding: "6px 8px", borderRadius: 6, background: `${info.color}08`, cursor: "pointer" }} onClick={() => { setView("map"); setSel(s.from); }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ color: clr(a?.cluster).main, fontSize: 11, fontWeight: 500 }}>{a?.title}</span><span style={{ color: C.faint }}>→</span><span style={{ color: clr(b?.cluster).main, fontSize: 11, fontWeight: 500 }}>{b?.title}</span></div>
                {s.label && <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>{s.label}</div>}
              </div>);
            })}
          </div>);
        })}
      </div>
    </div>
  );

  const LogView = () => (
    <div style={{ position: "fixed", left: 0, top: 48, bottom: 0, width: "100%", background: C.bg, zIndex: 180, overflowY: "auto", padding: "24px 32px" }}>
      <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: "0 0 6px", fontFamily: "'Playfair Display',serif" }}>Activity & Ship Log</h2>
      {shipLog.length > 0 && <div style={{ marginBottom: 24 }}><div style={{ color: C.mint, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>✦ Shipped ({shipLog.length})</div>
        {[...shipLog].reverse().map((s, i) => { const n = nodes.find(x => x.id === s.nodeId); return (<div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, padding: "8px 12px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}><span style={{ color: C.mint }}>✦</span><div><span style={{ color: C.text, fontSize: 12 }}>{s.text}</span><div style={{ display: "flex", gap: 8, marginTop: 3 }}><span style={{ color: clr(n?.cluster).main, fontSize: 10 }}>{n?.title}</span><span style={{ color: C.faint, fontSize: 10 }}>{s.date}</span></div></div></div>); })}
      </div>}
      <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Activity ({activityLog.length})</div>
      {activityLog.length === 0 && <div style={{ color: C.faint, fontSize: 12, fontStyle: "italic" }}>Start making changes.</div>}
      {[...activityLog].reverse().map((a, i) => (<div key={i} style={{ display: "flex", gap: 10, marginBottom: 4 }}><span style={{ color: C.faint, fontSize: 10, whiteSpace: "nowrap" }}>{a.date} {a.time}</span><span style={{ color: C.muted, fontSize: 11 }}>{a.text}</span></div>))}
      {(shipLog.length > 0 || activityLog.length > 0) && <div style={{ marginTop: 28, paddingTop: 14, borderTop: `1px solid ${C.border}` }}><button onClick={resetAll} style={{ background: "none", border: `1px solid ${C.red}30`, borderRadius: 8, padding: "5px 12px", color: C.red, fontSize: 10, cursor: "pointer", opacity: 0.5 }}>Reset everything</button></div>}
    </div>
  );

  const AddModal = () => {
    const [t, setT] = useState(""); const [c, setC] = useState("Intake Zone");
    if (!addingNode) return null;
    return (<div onClick={() => setAddingNode(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.bgLight, border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px", width: 350 }}>
        <h3 style={{ color: C.text, fontSize: 16, fontWeight: 700, margin: "0 0 14px" }}>Add to map</h3>
        <input value={t} onChange={e => setT(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && t.trim()) addNodeFn(t.trim(), c); }} placeholder="What is it?" style={{ ...inputStyle, marginBottom: 12 }} autoFocus />
        <div style={{ color: C.muted, fontSize: 10, marginBottom: 6, fontWeight: 600, textTransform: "uppercase" }}>Cluster</div>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 16 }}>{Object.keys(CLUSTERS).map(cl => (<button key={cl} onClick={() => setC(cl)} style={pill(c === cl, CLUSTERS[cl].main)}>{cl.split(" ")[0]}</button>))}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><button onClick={() => setAddingNode(false)} style={btn(C.muted, false)}>Cancel</button><button onClick={() => { if (t.trim()) addNodeFn(t.trim(), c); }} style={btn(C.mint, true)}>Add</button></div>
      </div>
    </div>);
  };

  const readyItems = nodes.filter(n => n.status === "ready" || n.status === "forming").sort((a, b) => ({ ready: 0, forming: 1 }[a.status] ?? 2) - ({ ready: 0, forming: 1 }[b.status] ?? 2));

  return (
    <div style={{ width: "100vw", height: "100vh", background: `radial-gradient(ellipse at 25% 35%, ${C.bgLight} 0%, ${C.bg} 60%)`, overflow: "hidden", position: "relative" }}>
      {/* TOP BAR */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 210, background: `${C.bg}ee`, backdropFilter: "blur(14px)", borderBottom: `1px solid ${C.border}`, padding: "10px 18px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: C.text, marginRight: 10, whiteSpace: "nowrap" }}>Anna's Living Map</div>
        <div style={{ display: "flex", gap: 2, marginRight: 8 }}>
          {[["map", "Map"], ["connections", "Connections"], ["log", "Log"], ["claude", "Claude"]].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)} style={{ ...pill(view === v, v === "claude" ? C.lavender : C.text), ...(v === "claude" && view !== "claude" ? { borderColor: `${C.lavender}40` } : {}) }}>{v === "claude" ? "💬 " + l : l}</button>
          ))}
        </div>
        {view === "map" && <div style={{ display: "flex", gap: 2, flex: 1, flexWrap: "wrap" }}>
          {["All", ...Object.keys(CLUSTERS)].filter(c => c === "All" || nodes.some(n => n.cluster === c)).map(c => (<button key={c} onClick={() => setFilter(c)} style={pill(filter === c, c === "All" ? C.text : CLUSTERS[c].main)}>{c === "All" ? "All" : c.split(" ").slice(0, 2).join(" ")}</button>))}
        </div>}
        {saveStatus && <span style={{ fontSize: 9, color: saveStatus === "saved" ? C.mint : saveStatus === "error" ? C.red : C.muted, whiteSpace: "nowrap" }}>{saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "✓ Saved" : "Save error"}</span>}
        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          {view === "map" && <button onClick={() => setAddingNode(true)} style={btn(C.sky, false)}>+ Node</button>}
          {!capOpen ? <button onClick={() => setCapOpen(true)} style={btn(C.dim, false)}>+ Capture</button> : (
            <div style={{ display: "flex", gap: 4 }}>
              <input ref={capRef} value={capText} onChange={e => setCapText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && capText.trim()) { quickCapture(capText.trim()); setCapText(""); setCapOpen(false); } if (e.key === "Escape") setCapOpen(false); }} placeholder="Quick capture…" style={{ ...inputStyle, width: 200, padding: "4px 8px", fontSize: 11 }} />
              <button onClick={() => { if (capText.trim()) { quickCapture(capText.trim()); setCapText(""); setCapOpen(false); } }} style={btn(C.dim, true)}>+</button>
            </div>
          )}
        </div>
      </div>

      {view === "map" && (
        <div ref={canvasRef} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <div onMouseDown={onMD} onTouchStart={onMD} style={{ position: "absolute", inset: 0, zIndex: 1, cursor: dragging ? "grabbing" : "grab" }} />
          <div style={{ transform: `translate(${pan.x}px, ${pan.y}px)`, position: "relative", width: "100%", height: "100%", zIndex: 2, pointerEvents: "none" }}>
            <Blobs />
            <SynergyCanvas />
            <div style={{ pointerEvents: "auto" }}>{filtered.map(n => <Node key={n.id} node={n} />)}</div>
          </div>
        </div>
      )}

      {view === "connections" && <ConnectionsView />}
      {view === "log" && <LogView />}
      {view === "claude" && <ClaudePanel nodes={nodes} synergies={synergies} shipLog={shipLog} activityLog={activityLog} energySet={energySet} messages={chatMessages} setMessages={setChatMessages} />}

      {view === "map" && (
        <div style={{ position: "fixed", bottom: 14, right: 14, zIndex: 150, background: `${C.bgLight}f0`, backdropFilter: "blur(10px)", borderRadius: 11, padding: "12px 14px", border: `1px solid ${C.border}`, maxWidth: 260, maxHeight: 280, overflowY: "auto" }}>
          <div style={{ color: C.warm, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>→ Ready line</div>
          {readyItems.slice(0, 7).map(n => (<div key={n.id} onClick={() => setSel(n.id)} style={{ marginBottom: 5, display: "flex", alignItems: "flex-start", gap: 5, cursor: "pointer", padding: "3px 4px", borderRadius: 5 }} onMouseEnter={e => e.currentTarget.style.background = C.surface} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ color: stl(n.status).color, fontSize: 9, marginTop: 3 }}>{stl(n.status).icon}</span>
            <div><div style={{ color: C.text, fontSize: 11, fontWeight: 500 }}>{n.title}</div>{n.nextMove && <div style={{ color: C.muted, fontSize: 9, marginTop: 1 }}>→ {n.nextMove.length > 40 ? n.nextMove.slice(0, 40) + "…" : n.nextMove}</div>}</div>
          </div>))}
        </div>
      )}

      {view === "map" && (
        <div style={{ position: "fixed", bottom: 14, left: 14, zIndex: 150, background: `${C.bgLight}e8`, backdropFilter: "blur(10px)", borderRadius: 11, padding: "10px 12px", border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {Object.entries(STATUSES).map(([k, v]) => (<div key={k} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ color: v.color, fontSize: 10 }}>{v.icon}</span><span style={{ color: C.muted, fontSize: 9 }}>{v.label}</span></div>))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
            {Object.entries(SYNERGY_TYPES).map(([k, v]) => (<div key={k} style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 14, height: 2, background: v.color, borderRadius: 1 }} /><span style={{ color: C.muted, fontSize: 9 }}>{v.label}</span></div>))}
          </div>
        </div>
      )}

      {selNode && view === "map" && (<><div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 195 }} /><Detail /></>)}
      <AddModal />
      {addingConn && (<div style={{ position: "fixed", top: 50, left: "50%", transform: "translateX(-50%)", zIndex: 250, background: C.surface, border: `1px solid ${C.lavender}40`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
        <span style={{ color: C.text, fontSize: 12 }}>Click a node to connect from <strong>{nodes.find(n => n.id === addingConn.from)?.title}</strong></span>
        <div style={{ display: "flex", gap: 3 }}>{Object.entries(SYNERGY_TYPES).map(([t, info]) => (<button key={t} onClick={() => setAddingConn({ ...addingConn, type: t })} style={pill(addingConn.type === t, info.color)}>{info.label}</button>))}</div>
        <button onClick={() => setAddingConn(null)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>✕</button>
      </div>)}
      <svg style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.02 }} width="100%" height="100%"><defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#g)" /></svg>
    </div>
  );
}
