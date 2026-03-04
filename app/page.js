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
  { id: "bb", title: "Bloch & Beecken", cluster: "Strategic Foresight", status: "forming", x: 120, y: 280, desc: "Your consultancy — positioning, offers, and sales assets in development.", nextSteps: [{ id: "s_0", text: "Define minimum viable launch: landing page + 2 clear offers?", done: false }] },
  { id: "track", title: "Client track record", cluster: "Strategic Foresight", status: "shipped", x: 40, y: 400, desc: "Volvo, SKF, Spotify, Länsförsäkringar. Deep portfolio.", shippedAs: "Completed projects", nextSteps: [] },
  { id: "method", title: "Foresight methodology", cluster: "Strategic Foresight", status: "exploring", x: 280, y: 180, desc: "Your evolving approach — participatory, systems-based, culturally grounded.", nextSteps: [] },
  { id: "studio", title: "Venture Studio", cluster: "Venture Building", status: "forming", x: 580, y: 120, desc: "Your solo venture studio.", nextSteps: [{ id: "s_0", text: "Define the first venture thesis and selection criteria", done: false }] },
  { id: "palate", title: "Palate", cluster: "Venture Building", status: "forming", x: 750, y: 220, desc: "Taste-driven auction discovery. CLIP embeddings, curation logic.", nextSteps: [{ id: "s_0", text: "Build a clickable prototype or demo to show 3 people", done: false }] },
  { id: "thesis", title: "Agentic disruption thesis", cluster: "Venture Building", status: "forming", x: 520, y: 240, desc: "AI agents consuming knowledge work creates new competitive dynamics.", nextSteps: [{ id: "s_0", text: "Publish a condensed version", done: false }] },
  { id: "daya", title: "Daya / femtech", cluster: "Venture Building", status: "dormant", x: 740, y: 370, desc: "Partnership exploration. On hold.", nextSteps: [{ id: "s_0", text: "Light touch in 2–3 months", done: false }] },
  { id: "ar", title: "AI ventures w/ Andy & Ronja", cluster: "AI & Agents", status: "exploring", x: 1000, y: 100, desc: "Collaboration exploring AI agent business models.", nextSteps: [{ id: "s_0", text: "Agree on one concrete build or experiment", done: false }] },
  { id: "infra", title: "Agent infrastructure", cluster: "AI & Agents", status: "exploring", x: 1120, y: 220, desc: "AI agents as economic actors in European regulatory contexts.", nextSteps: [{ id: "s_0", text: "Write a problem statement", done: false }] },
  { id: "econ", title: "European agent economics", cluster: "AI & Agents", status: "exploring", x: 1200, y: 100, desc: "Where European regulation creates opportunity for AI agents.", nextSteps: [{ id: "s_0", text: "Map 3 use cases", done: false }] },
  { id: "fhai", title: "Folkhems AI", cluster: "Societal Concepts", status: "exploring", x: 580, y: 520, desc: "With Alexandre. Societal OS combining tech sovereignty with social cohesion.", nextSteps: [{ id: "s_0", text: "Clarify with Alexandre: next conversation and first deliverable?", done: false }] },
  { id: "board", title: "Medborgarskolan board", cluster: "Democratic Infrastructure", status: "shipped", x: 80, y: 620, desc: "Board role at Medborgarskolan Väst.", shippedAs: "Board position", nextSteps: [] },
  { id: "circles", title: "Study circles as social algorithms", cluster: "Democratic Infrastructure", status: "ready", x: 300, y: 700, desc: "Folkbildning as democratic infrastructure for the AI era. Feb 20 presentation delivered.", nextSteps: [{ id: "s_0", text: "Turn into a published essay or public talk", done: false }] },
  { id: "foresight_fb", title: "Folkbildning × AI foresight", cluster: "Democratic Infrastructure", status: "forming", x: 180, y: 550, desc: "Foresight analysis + strategic materials for Medborgarskolan.", nextSteps: [{ id: "s_0", text: "Package EU funding analysis as board proposal", done: false }] },
  { id: "omdom", title: "AI omdömescirklar", cluster: "Democratic Infrastructure", status: "forming", x: 440, y: 620, desc: "Study circle curricula for critical AI literacy.", nextSteps: [{ id: "s_0", text: "Draft pilot: 4 sessions, testable with one study circle", done: false }] },
  { id: "owl", title: "The Night Owl", cluster: "Intelligence Systems", status: "forming", x: 1020, y: 420, desc: "Daily intelligence reports.", nextSteps: [{ id: "s_0", text: "Ship 5 editions to a small list", done: false }] },
  { id: "hunt", title: "The Hunt", cluster: "Intelligence Systems", status: "forming", x: 1180, y: 520, desc: "Venture scanner.", nextSteps: [{ id: "s_0", text: "Run one full scan cycle and share the output", done: false }] },
  { id: "patron", title: "Patron (legacy)", cluster: "Culture & Curation", status: "shipped", x: 520, y: 780, desc: "Your curatorial practice — origin story.", shippedAs: "Completed body of work", nextSteps: [] },
  { id: "taste", title: "Taste-driven discovery", cluster: "Culture & Curation", status: "exploring", x: 740, y: 760, desc: "Curation, taste, resonance.", nextSteps: [] },
  { id: "intake", title: "Signals & rabbit holes", cluster: "Intake Zone", status: "exploring", x: 1100, y: 720, desc: "Everything new lands here.", nextSteps: [] },
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

const ENERGY_LEVELS = {
  high: { color: "#e94560", bg: "#e9456022", border: "#e9456055", glow: "#e9456038", label: "High" },
  medium: { color: "#f5a623", bg: "#f5a62320", border: "#f5a62348", glow: "#f5a62330", label: "Medium" },
  low: { color: "#7eb8da", bg: "#7eb8da1c", border: "#7eb8da45", glow: "#7eb8da28", label: "Low" },
};
const DORMANT_STYLE = { bg: "#3d426018", border: "#3d426040", glow: "0 2px 8px rgba(0,0,0,0.3)" };

const GRAVITY_LEVELS = {
  heavy: { scale: 1.18, label: "Heavy", color: C.text },
  normal: { scale: 1.0, label: "Normal", color: C.muted },
  light: { scale: 0.82, label: "Light", color: C.faint },
};

/* NEXT STEPS HELPERS */
const getSteps = (node) => node.nextSteps || (node.nextMove ? [{ id: "s_0", text: node.nextMove, done: false }] : []);
const pendingSteps = (node) => getSteps(node).filter(s => !s.done);
const firstPending = (node) => pendingSteps(node)[0]?.text || "";
const hasAnySteps = (node) => getSteps(node).length > 0;

const clr = (c) => CLUSTERS[c] || { main: C.muted, bg: C.dim };
const stl = (s) => STATUSES[s] || STATUSES.exploring;
const nrg = (id, map) => map[id] ? ENERGY_LEVELS[map[id]] : null;

/* ═══════════════════════════════════
   STORAGE via API routes → Supabase
   ═══════════════════════════════════ */
const STORAGE_KEYS = { mapState: "anna-map-state", logs: "anna-map-logs", chat: "anna-map-chat", suggestions: "anna-map-suggestions", today: "anna-map-today" };

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
function ClaudePanel({ nodes, synergies, shipLog, activityLog, energyMap, gravityMap, messages, setMessages }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, loading]);

  const buildSystemPrompt = () => {
    const nodesSummary = nodes.map(n => {
      const conns = synergies.filter(s => s.from === n.id || s.to === n.id).length;
      const ships = shipLog.filter(s => s.nodeId === n.id).length;
      const isEnergy = energyMap[n.id];
      const isGravity = gravityMap[n.id];
      return `"${n.title}" [${n.cluster}] ${n.status}${isEnergy ? ` energy:${isEnergy}` : ""}${isGravity ? ` gravity:${isGravity}` : ""} | Steps: ${pendingSteps(n).map(s => s.text).join("; ") || "—"} | ${conns} connections, ${ships} ships`;
    }).join("\n");
    const recentShips = shipLog.slice(-5).map(s => { const n = nodes.find(x => x.id === s.nodeId); return `${s.date}: "${s.text}" (${n?.title})`; }).join("\n");
    const recentActivity = activityLog.slice(-8).map(a => `${a.date}: ${a.text}`).join("\n");
    return `You are Claude inside Anna's Living Map. You see her full project landscape.

ANNA: Strategic foresight practitioner, co-founder BlochBeecken. Experimental design BA, former art curator (Patron). Has ADD — explores widely, struggles with execution. Feels alive when people react to her work.

YOUR ROLE: Direct, warm, strategic. Give honest map reads. Flag synergies and leverage. When scattered, identify ONE thing. Celebrate ships. Gently name stalled items. Strategic partner, not productivity coach.

NODES:\n${nodesSummary}\n\nRECENT SHIPS:\n${recentShips || "None."}\n\nACTIVITY:\n${recentActivity || "None."}\n\nENERGY: ${Object.entries(energyMap).map(([id, level]) => { const n = nodes.find(x => x.id === id); return n ? `${n.title}(${level})` : null; }).filter(Boolean).join(", ") || "None set"}\nTOTAL: ${nodes.length} nodes, ${synergies.length} connections, ${shipLog.length} ships`;
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
   TODAY VIEW
   ═══════════════════════════════════ */
function TodayPanel({ nodes, synergies, shipLog, energyMap, gravityMap, suggestions, todayList, setTodayList, todayLoading, setTodayLoading, todayCompleted, setTodayCompleted, todaySkipped, setTodaySkipped, todayCacheTime, addShip, logAct }) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const weekShips = shipLog.filter(s => s.date >= sevenDaysAgo);
  const parkingCount = nodes.filter(n => n.cluster === "Intake Zone").length;
  const allDone = todayList && todayList.length > 0 && todayList.every(t => todayCompleted.includes(t.projectId) || todaySkipped.includes(t.projectId));

  const generateToday = async () => {
    if (todayLoading) return;
    // Use cache if less than 30 min old
    if (todayList && todayCacheTime.current && Date.now() - todayCacheTime.current < 30 * 60 * 1000) return;
    setTodayLoading(true);
    const projectData = nodes.filter(n => n.status !== "shipped" && n.status !== "dormant").map(n => {
      const ships = weekShips.filter(s => s.nodeId === n.id);
      const lastShip = shipLog.filter(s => s.nodeId === n.id).slice(-1)[0];
      const daysSince = lastShip ? Math.floor((Date.now() - new Date(lastShip.date).getTime()) / 86400000) : 999;
      const conns = synergies.filter(s => s.from === n.id || s.to === n.id).map(s => {
        const otherId = s.from === n.id ? s.to : s.from;
        const other = nodes.find(x => x.id === otherId);
        return `→ ${other?.title} (${s.type}${s.label ? ": " + s.label : ""})`;
      });
      const steps = pendingSteps(n);
      return `id:${n.id} "${n.title}" [${n.cluster}] gravity:${gravityMap[n.id] || "normal"} energy:${energyMap[n.id] || "none"} ships_7d:${ships.length} days_since:${daysSince} steps:"${steps.map(s => s.text).join("; ") || "none"}" connections:[${conns.join(", ")}]`;
    }).join("\n");

    const clusterTemps = {};
    weekShips.forEach(s => { const n = nodes.find(x => x.id === s.nodeId); if (n) clusterTemps[n.cluster] = (clusterTemps[n.cluster] || 0) + 1; });

    const prompt = `You build a focused daily task list for Anna's project management system. Based on the full project state, suggest 3-5 highest-leverage tasks for today.

PROJECTS:\n${projectData}

CLUSTER TEMPERATURES (ships this week): ${Object.entries(clusterTemps).sort((a,b) => b[1]-a[1]).map(([c,n]) => `${c}: ${n}`).join(", ") || "None"}

PARKING LOT: ${parkingCount} unprocessed items
SKIPPED TODAY: ${todaySkipped.length > 0 ? todaySkipped.join(", ") : "none"}

Return ONLY valid JSON (no markdown, no backticks) as an array:
[
  {
    "projectId": "the project id",
    "task": "specific task starting with a physical verb, under 15 words",
    "reason": "why this ranks here, max 15 words",
    "rank": 1
  }
]

Ranking factors (in order of weight):
1. Gravity level — heavy projects come first
2. Cluster temperature — cold high-gravity clusters get priority
3. Synergy multiplier — tasks feeding multiple projects rank higher
4. Dormancy — projects untouched 7+ days get a boost
- Use the project's pending steps as the task if available. Only generate a new task if steps are empty.
- If parking lot has 5+ items, include "Sort your parking lot (${parkingCount} ideas waiting)" with projectId "parking"
- Exclude any project IDs in the skipped list
- Do NOT suggest more than one task per project
- Always start tasks with a physical verb (open, write, send, sketch, review, list, draft)
- Return exactly 3-5 items`;

    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-5-20250514", max_tokens: 500, messages: [{ role: "user", content: prompt }] }),
      });
      if (!response.ok) throw new Error("API error " + response.status);
      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text?.trim();
      if (text) {
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed)) {
          setTodayList(parsed.sort((a, b) => a.rank - b.rank));
          todayCacheTime.current = Date.now();
        }
      }
    } catch (err) { console.error("Today generation error:", err); }
    finally { setTodayLoading(false); }
  };

  useEffect(() => { generateToday(); }, []);

  const completeTask = (item) => {
    if (item.projectId === "parking") {
      // Can't "ship" parking lot sorting, just mark done
      setTodayCompleted(p => [...p, "parking"]);
      logAct("Today: sorted parking lot");
      return;
    }
    addShip(item.projectId, item.task);
    setTodayCompleted(p => [...p, item.projectId]);
  };

  const skipTask = (item) => {
    setTodaySkipped(p => [...p, item.projectId]);
    logAct(`Today: skipped "${item.task}"`);
  };

  const visibleItems = todayList ? todayList.filter(t => !todayCompleted.includes(t.projectId) && !todaySkipped.includes(t.projectId)) : [];
  const completedCount = todayCompleted.length;

  return (
    <div style={{ position: "fixed", left: 0, top: 48, bottom: 0, width: "100%", background: C.bg, zIndex: 180, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 24px", maxWidth: 560, margin: "0 auto", width: "100%" }}>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ color: C.text, fontSize: 22, fontWeight: 700, margin: "0 0 6px", fontFamily: "'Playfair Display',serif" }}>Today</h2>
          <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>
            {todayLoading ? "Building your focus list…" : todayList ? `${visibleItems.length} tasks remaining` : "Loading…"}
          </p>
        </div>

        {todayLoading && !todayList && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ background: C.surface, borderRadius: 12, padding: "20px", border: `1px solid ${C.border}`, opacity: 0.5 + i * 0.15 }}>
                <div style={{ width: "60%", height: 12, background: C.border, borderRadius: 4, marginBottom: 8 }} />
                <div style={{ width: "40%", height: 8, background: C.border, borderRadius: 4, opacity: 0.5 }} />
              </div>
            ))}
          </div>
        )}

        {allDone && (
          <div style={{ paddingTop: 40, textAlign: "center" }}>
            <div style={{ color: C.text, fontSize: 16, fontWeight: 600, fontFamily: "'Playfair Display',serif", marginBottom: 8 }}>Day complete.</div>
            <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>You moved {completedCount} project{completedCount !== 1 ? "s" : ""} forward today.</p>
          </div>
        )}

        {!allDone && todayList && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visibleItems.map((item, idx) => {
              const node = nodes.find(n => n.id === item.projectId);
              const cl = node ? CLUSTERS[node.cluster] : null;
              const isParking = item.projectId === "parking";
              return (
                <div key={item.projectId} style={{ background: C.surface, borderRadius: 12, padding: "16px 18px", border: `1px solid ${idx === 0 ? `${C.warm}25` : C.border}`, transition: "all 0.3s" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ color: idx === 0 ? C.warm : C.faint, fontSize: 18, fontWeight: 700, fontFamily: "'Playfair Display',serif", minWidth: 24, paddingTop: 2 }}>{idx + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: C.text, fontSize: 14, fontWeight: 500, lineHeight: 1.5, marginBottom: 4 }}>{item.task}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        {!isParking && cl && <span style={{ color: cl.main, fontSize: 10, fontWeight: 600 }}>{node.title}</span>}
                        {!isParking && cl && <span style={{ color: C.faint, fontSize: 9 }}>·</span>}
                        {!isParking && cl && <span style={{ color: C.faint, fontSize: 9 }}>{node.cluster}</span>}
                        {isParking && <span style={{ color: C.gold, fontSize: 10, fontWeight: 600 }}>Intake Zone</span>}
                      </div>
                      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.4, fontStyle: "italic" }}>{item.reason}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <button onClick={() => completeTask(item)}
                          style={{ background: `${C.mint}15`, border: `1px solid ${C.mint}40`, borderRadius: 8, padding: "6px 14px", color: C.mint, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✓ Done</button>
                        <button onClick={() => skipTask(item)}
                          style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 14px", color: C.faint, fontSize: 11, cursor: "pointer" }}>Not today</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {todayList && !allDone && completedCount > 0 && (
          <div style={{ marginTop: 16, padding: "10px 14px", background: `${C.mint}08`, borderRadius: 10, border: `1px solid ${C.mint}15` }}>
            <span style={{ color: C.mint, fontSize: 11 }}>✓ {completedCount} completed</span>
            {todaySkipped.length > 0 && <span style={{ color: C.faint, fontSize: 11, marginLeft: 10 }}>· {todaySkipped.length} skipped</span>}
          </div>
        )}

        {todayList && !todayLoading && (
          <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
            <button onClick={() => { todayCacheTime.current = null; setTodayList(null); setTodayCompleted([]); generateToday(); }}
              style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 14px", color: C.faint, fontSize: 10, cursor: "pointer" }}>↻ Refresh list</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   WEEKLY REVIEW PANEL
   ═══════════════════════════════════ */
function ReviewPanel({ nodes, synergies, shipLog, energyMap, gravityMap, setGravityMap, setNodes, setView }) {
  const [step, setStep] = useState(1);
  const [mirrorData, setMirrorData] = useState(null);
  const [mirrorLoading, setMirrorLoading] = useState(false);
  const [mirrorError, setMirrorError] = useState(false);
  const [parkingIdx, setParkingIdx] = useState(0);
  const [gravityDraft, setGravityDraft] = useState({ ...gravityMap });
  const [reviewDone, setReviewDone] = useState(false);

  const parkingItems = nodes.filter(n => n.cluster === "Intake Zone");
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const weekShips = shipLog.filter(s => s.date >= sevenDaysAgo);
  const activeProjects = nodes.filter(n => n.status !== "shipped" && n.status !== "dormant");

  /* STEP 1: THE MIRROR — AI analysis */
  const generateMirror = async () => {
    if (mirrorLoading) return;
    setMirrorLoading(true); setMirrorError(false);
    const clusterShips = {};
    weekShips.forEach(s => {
      const n = nodes.find(x => x.id === s.nodeId);
      if (n) { clusterShips[n.cluster] = (clusterShips[n.cluster] || 0) + 1; }
    });
    const nodesSummary = nodes.filter(n => n.status !== "shipped").map(n => {
      const ships = weekShips.filter(s => s.nodeId === n.id).length;
      const g = gravityMap[n.id] || "normal";
      const e = energyMap[n.id] || "none";
      return `"${n.title}" [${n.cluster}] status:${n.status} gravity:${g} energy:${e} ships_this_week:${ships}`;
    }).join("\n");
    const shipDetails = weekShips.map(s => { const n = nodes.find(x => x.id === s.nodeId); return `${s.date}: "${s.text}" → ${n?.title} [${n?.cluster}]`; }).join("\n");
    const prompt = `You are analyzing Anna's weekly project activity for her Living Map review.

PROJECTS:\n${nodesSummary}

THIS WEEK'S SHIPS (${weekShips.length} total):\n${shipDetails || "None this week."}

SHIPS BY CLUSTER: ${Object.entries(clusterShips).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}: ${n}`).join(", ") || "None"}

INTAKE ZONE: ${parkingItems.length} unprocessed items

Analyze and return ONLY valid JSON (no markdown, no backticks):
{
  "hotClusters": ["cluster name", "cluster name"],
  "coldCluster": "cluster name or null if none",
  "mismatch": "One sentence about gravity vs behavior mismatch, or null if aligned",
  "observation": "One honest, warm observation about the week's pattern (1-2 sentences)",
  "suggestion": "One concrete suggestion for next week (1 sentence)",
  "totalShips": ${weekShips.length}
}

Be honest. If nothing happened, say so plainly. If there's real momentum, name it. Never generic.`;
    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-5-20250514", max_tokens: 400, messages: [{ role: "user", content: prompt }] }),
      });
      if (!response.ok) { setMirrorError(true); setMirrorLoading(false); return; }
      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text?.trim();
      if (text) {
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        setMirrorData(parsed);
      } else { setMirrorError(true); }
    } catch (err) { console.error("Mirror error:", err); setMirrorError(true); }
    finally { setMirrorLoading(false); }
  };

  useEffect(() => { if (step === 1 && !mirrorData && !mirrorLoading) generateMirror(); }, [step]);

  /* STEP 2: PARKING LOT — assign or discard */
  const assignParking = (nodeId, targetCluster) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, cluster: targetCluster } : n));
  };
  const deleteParking = (nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
  };
  const skipParking = () => setParkingIdx(i => i + 1);

  /* STEP 3: THE RESET — commit gravity changes */
  const commitReset = () => {
    setGravityMap(gravityDraft);
    setReviewDone(true);
  };

  const stepColor = step === 1 ? C.sky : step === 2 ? C.gold : C.mint;
  const stepLabels = { 1: "The Mirror", 2: "The Parking Lot", 3: "The Reset" };

  return (
    <div style={{ position: "fixed", left: 0, top: 48, bottom: 0, width: "100%", background: C.bg, zIndex: 180, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", maxWidth: 640, margin: "0 auto", width: "100%" }}>
        {/* STEP INDICATOR */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28, alignItems: "center" }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => { if (s < step || (s === 2 && step >= 1) || (s === 3 && step >= 2)) setStep(s); }}
                style={{ width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${s === step ? stepColor : s < step ? `${C.mint}50` : C.border}`, background: s < step ? `${C.mint}18` : s === step ? `${stepColor}15` : "transparent", color: s < step ? C.mint : s === step ? stepColor : C.faint, fontSize: 11, fontWeight: 700, cursor: s <= step ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>{s < step ? "✓" : s}</button>
              {s < 3 && <div style={{ width: 32, height: 1.5, background: s < step ? `${C.mint}40` : C.border, borderRadius: 1 }} />}
            </div>
          ))}
          <span style={{ color: stepColor, fontSize: 11, fontWeight: 600, marginLeft: 8 }}>{stepLabels[step]}</span>
        </div>

        {/* STEP 1: THE MIRROR */}
        {step === 1 && (
          <div>
            <h2 style={{ color: C.text, fontSize: 20, fontWeight: 700, margin: "0 0 4px", fontFamily: "'Playfair Display',serif" }}>The Mirror</h2>
            <p style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>What your map says about this week.</p>
            {mirrorLoading && (
              <div style={{ background: C.surface, borderRadius: 12, padding: "24px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map(i => (<div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.sky, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />))}</div>
                <span style={{ color: C.muted, fontSize: 12 }}>Reading your week…</span>
              </div>
            )}
            {mirrorError && !mirrorLoading && (
              <div style={{ background: `${C.red}10`, borderRadius: 12, padding: "18px", border: `1px solid ${C.red}25` }}>
                <p style={{ color: C.muted, fontSize: 12, margin: "0 0 10px" }}>Couldn't generate the analysis. Here's the raw data:</p>
                <div style={{ color: C.text, fontSize: 12, marginBottom: 6 }}>{weekShips.length} ships this week across {[...new Set(weekShips.map(s => { const n = nodes.find(x => x.id === s.nodeId); return n?.cluster; }).filter(Boolean))].length} clusters.</div>
                <button onClick={generateMirror} style={{ background: `${C.sky}18`, border: `1px solid ${C.sky}40`, borderRadius: 8, padding: "6px 14px", color: C.sky, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Retry</button>
              </div>
            )}
            {mirrorData && !mirrorLoading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Ship count */}
                <div style={{ background: C.surface, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: C.mint, fontSize: 28, fontWeight: 700, fontFamily: "'Playfair Display',serif" }}>{mirrorData.totalShips}</span>
                    <span style={{ color: C.muted, fontSize: 12 }}>ships this week</span>
                  </div>
                  {mirrorData.hotClusters?.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ color: C.faint, fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>Hot</span>
                      {mirrorData.hotClusters.map((c, i) => (<span key={i} style={{ padding: "2px 8px", borderRadius: 10, background: `${CLUSTERS[c]?.main || C.muted}15`, color: CLUSTERS[c]?.main || C.muted, fontSize: 10, fontWeight: 600 }}>{c}</span>))}
                    </div>
                  )}
                  {mirrorData.coldCluster && (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ color: C.faint, fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>Cold</span>
                      <span style={{ padding: "2px 8px", borderRadius: 10, background: `${C.dim}30`, color: C.faint, fontSize: 10 }}>{mirrorData.coldCluster}</span>
                    </div>
                  )}
                </div>
                {/* Mismatch */}
                {mirrorData.mismatch && (
                  <div style={{ background: `${C.warm}08`, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.warm}20` }}>
                    <div style={{ color: C.warm, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Gravity mismatch</div>
                    <p style={{ color: C.text, fontSize: 12, lineHeight: 1.6, margin: 0 }}>{mirrorData.mismatch}</p>
                  </div>
                )}
                {/* Observation */}
                <div style={{ background: C.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.sky}18` }}>
                  <p style={{ color: C.text, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{mirrorData.observation}</p>
                </div>
                {/* Suggestion */}
                <div style={{ background: `${C.lavender}08`, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.lavender}18` }}>
                  <div style={{ color: C.lavender, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>For next week</div>
                  <p style={{ color: C.text, fontSize: 12, lineHeight: 1.5, margin: 0 }}>{mirrorData.suggestion}</p>
                </div>
              </div>
            )}
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setStep(2)} style={{ background: `${C.sky}18`, border: `1px solid ${C.sky}45`, borderRadius: 10, padding: "10px 22px", color: C.sky, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Next → The Parking Lot</button>
            </div>
          </div>
        )}

        {/* STEP 2: THE PARKING LOT */}
        {step === 2 && (
          <div>
            <h2 style={{ color: C.text, fontSize: 20, fontWeight: 700, margin: "0 0 4px", fontFamily: "'Playfair Display',serif" }}>The Parking Lot</h2>
            <p style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>{parkingItems.length} unprocessed items in your Intake Zone.</p>
            {parkingItems.length === 0 || parkingIdx >= parkingItems.length ? (
              <div style={{ background: C.surface, borderRadius: 12, padding: "28px", border: `1px solid ${C.border}`, textAlign: "center" }}>
                <div style={{ color: C.mint, fontSize: 18, marginBottom: 8 }}>✓</div>
                <p style={{ color: C.text, fontSize: 13, margin: "0 0 4px" }}>{parkingItems.length === 0 ? "Intake Zone is clear." : "All items reviewed."}</p>
                <p style={{ color: C.muted, fontSize: 11 }}>Nothing parked to sort through.</p>
              </div>
            ) : (
              <div>
                <div style={{ color: C.faint, fontSize: 10, marginBottom: 8 }}>{parkingIdx + 1} of {parkingItems.length}</div>
                <div style={{ background: C.surface, borderRadius: 12, padding: "20px", border: `1px solid ${C.gold}20`, marginBottom: 14 }}>
                  <div style={{ color: C.text, fontSize: 15, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{parkingItems[parkingIdx].title}</div>
                  {parkingItems[parkingIdx].desc && parkingItems[parkingIdx].desc !== parkingItems[parkingIdx].title && (
                    <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, margin: "0 0 6px" }}>{parkingItems[parkingIdx].desc}</p>
                  )}
                  {parkingItems[parkingIdx].capturedDuring && (
                    <span style={{ padding: "2px 7px", borderRadius: 8, background: `${C.gold}12`, color: C.gold, fontSize: 9 }}>captured during {parkingItems[parkingIdx].capturedDuring}</span>
                  )}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ color: C.faint, fontSize: 9, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Assign to cluster</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {Object.entries(CLUSTERS).filter(([c]) => c !== "Intake Zone").map(([c, info]) => (
                      <button key={c} onClick={() => assignParking(parkingItems[parkingIdx].id, c)}
                        style={{ background: `${info.main}10`, border: `1px solid ${info.main}30`, borderRadius: 8, padding: "6px 12px", color: info.main, fontSize: 10, fontWeight: 500, cursor: "pointer" }}>{c.split(" ").slice(0, 2).join(" ")}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => deleteParking(parkingItems[parkingIdx].id)} style={{ background: `${C.red}10`, border: `1px solid ${C.red}25`, borderRadius: 8, padding: "6px 14px", color: C.red, fontSize: 11, cursor: "pointer" }}>Delete</button>
                  <button onClick={skipParking} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 14px", color: C.muted, fontSize: 11, cursor: "pointer" }}>Leave parked</button>
                </div>
              </div>
            )}
            <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(1)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 18px", color: C.muted, fontSize: 12, cursor: "pointer" }}>← Back</button>
              <button onClick={() => setStep(3)} style={{ background: `${C.gold}18`, border: `1px solid ${C.gold}45`, borderRadius: 10, padding: "10px 22px", color: C.gold, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Next → The Reset</button>
            </div>
          </div>
        )}

        {/* STEP 3: THE RESET */}
        {step === 3 && !reviewDone && (
          <div>
            <h2 style={{ color: C.text, fontSize: 20, fontWeight: 700, margin: "0 0 4px", fontFamily: "'Playfair Display',serif" }}>The Reset</h2>
            <p style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Set your gravity weights for the coming week. What deserves your attention?</p>
            {mirrorData?.mismatch && (
              <div style={{ background: `${C.warm}08`, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.warm}18`, marginBottom: 16 }}>
                <div style={{ color: C.warm, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>From the mirror</div>
                <p style={{ color: C.muted, fontSize: 11, margin: 0, lineHeight: 1.5 }}>{mirrorData.mismatch}</p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeProjects.sort((a, b) => {
                const grav = { heavy: 0, normal: 1, light: 2, undefined: 1 };
                return (grav[gravityDraft[a.id]] ?? 1) - (grav[gravityDraft[b.id]] ?? 1);
              }).map(n => {
                const cl = CLUSTERS[n.cluster] || { main: C.muted };
                const ships = weekShips.filter(s => s.nodeId === n.id).length;
                const cur = gravityDraft[n.id] || "normal";
                return (
                  <div key={n.id} style={{ background: C.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ color: cl.main, fontSize: 9, fontWeight: 600, textTransform: "uppercase" }}>{n.cluster.split(" ").slice(0, 2).join(" ")}</span>
                        {ships > 0 && <span style={{ color: C.mint, fontSize: 9 }}>✦ {ships}</span>}
                      </div>
                      <div style={{ color: C.text, fontSize: 12, fontWeight: 500 }}>{n.title}</div>
                    </div>
                    <div style={{ display: "flex", gap: 3 }}>
                      {Object.entries(GRAVITY_LEVELS).map(([level, info]) => {
                        const active = cur === level;
                        return (<button key={level} onClick={() => setGravityDraft(p => { const nm = { ...p }; if (level === "normal") delete nm[n.id]; else nm[n.id] = level; return nm; })}
                          style={{ width: level === "heavy" ? 28 : level === "normal" ? 24 : 20, height: level === "heavy" ? 28 : level === "normal" ? 24 : 20, borderRadius: "50%", border: `1.5px solid ${active ? C.text : C.border}`, background: active ? `${C.text}15` : "transparent", color: active ? C.text : C.faint, fontSize: 8, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{info.label[0]}</button>);
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(2)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 18px", color: C.muted, fontSize: 12, cursor: "pointer" }}>← Back</button>
              <button onClick={commitReset} style={{ background: `${C.mint}20`, border: `1px solid ${C.mint}50`, borderRadius: 10, padding: "10px 22px", color: C.mint, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✓ Complete review</button>
            </div>
          </div>
        )}

        {/* DONE */}
        {reviewDone && (
          <div style={{ paddingTop: 40, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
            <h2 style={{ color: C.text, fontSize: 20, fontWeight: 700, margin: "0 0 8px", fontFamily: "'Playfair Display',serif" }}>Weekly review complete</h2>
            <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.6, marginBottom: 6 }}>
              {weekShips.length} ships this week. {Object.values(gravityDraft).filter(v => v === "heavy").length} projects set to Heavy.
              {parkingItems.length > 0 ? ` ${parkingItems.length} items still parked.` : " Intake Zone clear."}
            </p>
            {mirrorData?.suggestion && <p style={{ color: C.lavender, fontSize: 12, fontStyle: "italic", marginBottom: 20 }}>{mirrorData.suggestion}</p>}
            <button onClick={() => setView("map")} style={{ background: `${C.mint}18`, border: `1px solid ${C.mint}45`, borderRadius: 10, padding: "10px 22px", color: C.mint, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Back to map</button>
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
  const [energyMap, setEnergyMap] = useState({});
  const [gravityMap, setGravityMap] = useState({});
  const [shipLog, setShipLog] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.65);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [addingNode, setAddingNode] = useState(false);
  const [addingConn, setAddingConn] = useState(null);
  const [capOpen, setCapOpen] = useState(false);
  const [capText, setCapText] = useState("");
  const [focusCapOpen, setFocusCapOpen] = useState(false);
  const [focusCapText, setFocusCapText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [legendOpen, setLegendOpen] = useState(true);
  const [suggestions, setSuggestions] = useState({});
  const [harvestPrompt, setHarvestPrompt] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [pulsingNode, setPulsingNode] = useState(null);
  const [voiceState, setVoiceState] = useState("idle"); // idle | listening | classifying | countdown
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceResult, setVoiceResult] = useState(null); // { action, nodeId, nodeTitle, text, confidence }
  const [voiceCountdown, setVoiceCountdown] = useState(0);
  const [todayList, setTodayList] = useState(null);
  const [todayLoading, setTodayLoading] = useState(false);
  const [todayCompleted, setTodayCompleted] = useState([]);
  const [todaySkipped, setTodaySkipped] = useState([]);
  const todayCacheTime = useRef(null);
  const [advisorCache, setAdvisorCache] = useState({});
  const [momentumSource, setMomentumSource] = useState(null);
  const momentumTimer = useRef(null);
  const harvestTimerRef = useRef(null);
  const celebrationTimerRef = useRef(null);
  const sessionShipCount = useRef(0);
  const voiceRecRef = useRef(null);
  const voiceCountdownRef = useRef(null);
  const voiceCountdownInterval = useRef(null);
  const hasSpeechAPI = typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const suggestionsGenerating = useRef(new Set());
  const canvasRef = useRef(null);
  const capRef = useRef(null);
  const focusCapRef = useRef(null);
  const saveTimerRef = useRef(null);

  const selNode = nodes.find(n => n.id === sel);
  const focusActive = filter !== "All";
  const focusedIds = focusActive ? new Set(nodes.filter(n => n.cluster === filter).map(n => n.id)) : null;
  const connectedToFocus = focusActive ? new Set(
    synergies.filter(s => focusedIds.has(s.from) || focusedIds.has(s.to)).flatMap(s => [s.from, s.to]).filter(id => !focusedIds.has(id))
  ) : null;

  /* LOAD */
  useEffect(() => {
    (async () => {
      try {
        const mapState = await storageGet(STORAGE_KEYS.mapState);
        if (mapState) {
          if (mapState.nodes?.length) {
            const migratedNodes = mapState.nodes.map(n => {
              if (n.nextSteps) return n;
              if (n.nextMove) return { ...n, nextSteps: [{ id: "s_0", text: n.nextMove, done: false }], nextMove: undefined };
              return { ...n, nextSteps: [], nextMove: undefined };
            });
            setNodes(migratedNodes);
          }
          if (mapState.synergies) setSynergies(mapState.synergies);
          if (mapState.energyMap) setEnergyMap(mapState.energyMap);
          if (mapState.gravityMap) setGravityMap(mapState.gravityMap);
          else if (mapState.energySet) {
            const migrated = {};
            mapState.energySet.forEach(id => { migrated[id] = "high"; });
            setEnergyMap(migrated);
          }
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
        const savedSuggestions = await storageGet(STORAGE_KEYS.suggestions);
        if (savedSuggestions) {
          const refreshed = {};
          for (const [k, v] of Object.entries(savedSuggestions)) {
            if (v.dismissed) continue;
            refreshed[k] = v;
          }
          setSuggestions(refreshed);
        }
        const savedToday = await storageGet(STORAGE_KEYS.today);
        if (savedToday?.date === new Date().toISOString().slice(0, 10)) {
          if (savedToday.skipped) setTodaySkipped(savedToday.skipped);
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
      await storageSet(STORAGE_KEYS.mapState, { nodes, synergies, energyMap, gravityMap });
      await storageSet(STORAGE_KEYS.logs, { shipLog, activityLog });
      await storageSet(STORAGE_KEYS.chat, { messages: chatMessages });
      await storageSet(STORAGE_KEYS.suggestions, suggestions);
      await storageSet(STORAGE_KEYS.today, { skipped: todaySkipped, date: new Date().toISOString().slice(0, 10) });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch { setSaveStatus("error"); setTimeout(() => setSaveStatus(""), 3000); }
  }, [loaded, nodes, synergies, energyMap, gravityMap, shipLog, activityLog, chatMessages, suggestions, todaySkipped]);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveAll, 1200);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [nodes, synergies, energyMap, gravityMap, shipLog, activityLog, chatMessages, suggestions, saveAll]);

  /* AI NEXT MOVE SUGGESTIONS */
  const generateSuggestion = useCallback(async (nodeId) => {
    if (suggestionsGenerating.current.has(nodeId)) return;
    suggestionsGenerating.current.add(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (!node) { suggestionsGenerating.current.delete(nodeId); return; }
    const nodeShips = shipLog.filter(s => s.nodeId === nodeId).slice(-5);
    const lastShipDate = nodeShips.length ? nodeShips[nodeShips.length - 1].date : null;
    const daysSinceShip = lastShipDate ? Math.floor((Date.now() - new Date(lastShipDate).getTime()) / 86400000) : 999;
    const connectedNodes = synergies
      .filter(s => s.from === nodeId || s.to === nodeId)
      .map(s => {
        const otherId = s.from === nodeId ? s.to : s.from;
        const other = nodes.find(n => n.id === otherId);
        const otherShips = shipLog.filter(sl => sl.nodeId === otherId).slice(-3);
        return { title: other?.title, type: s.type, label: s.label, recentShips: otherShips.map(sl => sl.text) };
      });
    const prompt = `You are a next-move advisor for Anna's project landscape. Suggest ONE specific next action.

PROJECT: "${node.title}" [${node.cluster}] — Status: ${node.status}
DESCRIPTION: ${node.desc || "None"}
RECENT SHIPS: ${nodeShips.length ? nodeShips.map(s => `"${s.text}" (${s.date})`).join(", ") : "None yet"}
DAYS SINCE LAST SHIP: ${daysSinceShip === 999 ? "Never shipped" : daysSinceShip}
CONNECTED PROJECTS: ${connectedNodes.length ? connectedNodes.map(c => `"${c.title}" (${c.type}: ${c.label || "—"}) recent: ${c.recentShips.join(", ") || "none"}`).join(" | ") : "None"}

RULES:
- Start with a physical verb (open, write, send, sketch, read, list, review, draft, schedule, text, email)
- Maximum 15 words
- Must be completable in under 30 minutes
- ${daysSinceShip > 7 ? "Project dormant — suggest a TINY re-entry task (5 min)." : ""}
- ${connectedNodes.some(c => c.recentShips.length > 0) ? "A connected project shipped recently — consider cross-pollination." : ""}
- If status is "dormant", suggest minimal warmth touch
- If status is "shipped", suggest documentation or sharing

Reply with ONLY the suggestion text. No quotes, no explanation.`;
    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-opus-4-6", max_tokens: 60, messages: [{ role: "user", content: prompt }] }),
      });
      if (!response.ok) { suggestionsGenerating.current.delete(nodeId); return; }
      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text?.trim();
      if (text && text.length > 3 && text.length < 120) {
        setSuggestions(prev => ({ ...prev, [nodeId]: { text, dismissed: false, generatedAt: new Date().toISOString() } }));
      }
    } catch (err) { console.error("Suggestion failed:", err); }
    finally { suggestionsGenerating.current.delete(nodeId); }
  }, [nodes, shipLog, synergies]);

  useEffect(() => {
    if (!loaded) return;
    const needsSuggestion = nodes.filter(n => pendingSteps(n).length === 0 && n.status !== "shipped" && !suggestions[n.id]?.text && !suggestions[n.id]?.dismissed);
    needsSuggestion.forEach((n, i) => { setTimeout(() => generateSuggestion(n.id), i * 2000); });
  }, [loaded]);

  /* ACTIONS */
  const logAct = (t) => setActivityLog(p => [...p, { text: t, date: new Date().toISOString().slice(0, 10), time: new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }) }]);
  const updateNode = (id, ch) => setNodes(p => p.map(n => n.id === id ? { ...n, ...ch } : n));
  const changeStatus = (id, ns) => { const n = nodes.find(x => x.id === id); if (n) { updateNode(id, { status: ns }); logAct(`${n.title}: ${stl(n.status).label} → ${stl(ns).label}`); } };
  const cycleEnergy = (id) => setEnergyMap(p => { const cur = p[id]; const next = { undefined: "high", high: "medium", medium: "low", low: undefined }; const nv = next[cur]; const nm = { ...p }; if (nv) nm[id] = nv; else delete nm[id]; return nm; });

  /* SYNERGY HARVEST CHECK */
  const checkSynergyHarvest = useCallback((sourceNodeId, shipText) => {
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return;
    const conns = synergies.filter(s => s.from === sourceNodeId || s.to === sourceNodeId);
    if (!conns.length) return;
    const shipWords = shipText.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const typeWeight = { accelerates: 3, feeds: 2, shares: 1.5, lineage: 1 };
    let best = null;
    let bestScore = 0;
    for (const conn of conns) {
      const otherId = conn.from === sourceNodeId ? conn.to : conn.from;
      const other = nodes.find(n => n.id === otherId);
      if (!other || other.status === "shipped") continue;
      let score = typeWeight[conn.type] || 1;
      const titleWords = other.title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const labelWords = (conn.label || "").toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const clusterWords = other.cluster.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const targetWords = [...titleWords, ...labelWords, ...clusterWords];
      const overlap = shipWords.filter(w => targetWords.some(tw => tw.includes(w) || w.includes(tw))).length;
      score += overlap * 1.5;
      if (conn.type === "accelerates") score += 1;
      if (conn.label && shipWords.some(w => conn.label.toLowerCase().includes(w))) score += 2;
      if (score > bestScore && score >= 3) { bestScore = score; best = { targetId: otherId, targetTitle: other.title, synergyLabel: conn.label, synergyType: conn.type, targetCluster: other.cluster }; }
    }
    if (best) {
      if (harvestTimerRef.current) clearTimeout(harvestTimerRef.current);
      setHarvestPrompt({ shipText, sourceNodeId, sourceTitle: sourceNode.title, ...best });
      harvestTimerRef.current = setTimeout(() => setHarvestPrompt(null), 15000);
    }
  }, [nodes, synergies]);

  const acceptHarvest = () => {
    if (!harvestPrompt) return;
    const { shipText, sourceTitle, targetId, targetTitle } = harvestPrompt;
    setShipLog(p => [...p, { nodeId: targetId, text: `${shipText} (harvested from ${sourceTitle})`, date: new Date().toISOString().slice(0, 10), harvested: true }]);
    logAct(`Synergy harvest: "${shipText}" → ${targetTitle}`);
    setSuggestions(prev => { const next = { ...prev }; delete next[targetId]; return next; });
    if (harvestTimerRef.current) clearTimeout(harvestTimerRef.current);
    setHarvestPrompt(null);
    triggerCelebration(targetId, `${shipText} (harvested)`, true);
  };

  const dismissHarvest = () => {
    if (harvestTimerRef.current) clearTimeout(harvestTimerRef.current);
    setHarvestPrompt(null);
  };

  /* CELEBRATION LOGIC */
  const triggerMomentum = useCallback((nodeId) => {
    if (momentumTimer.current) clearTimeout(momentumTimer.current);
    setMomentumSource(nodeId);
    momentumTimer.current = setTimeout(() => setMomentumSource(null), isMobile ? 2000 : 1500);
  }, [isMobile]);

  const triggerCelebration = (nodeId, shipText, isHarvest) => {
    sessionShipCount.current += 1;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const lastShipForNode = shipLog.filter(s => s.nodeId === nodeId).slice(-1)[0];
    const daysSinceLastShip = lastShipForNode ? Math.floor((Date.now() - new Date(lastShipForNode.date).getTime()) / 86400000) : 999;
    const isFirstOfSession = sessionShipCount.current === 1;
    const isColdProject = daysSinceLastShip >= 3;
    const fullCelebration = isFirstOfSession || (isColdProject && !isHarvest);
    if (fullCelebration) {
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
      setCelebration({ nodeTitle: node.title, cluster: node.cluster, shipText, totalShips: shipLog.length + 1 });
      celebrationTimerRef.current = setTimeout(() => setCelebration(null), 3500);
    } else {
      setPulsingNode(nodeId);
      setTimeout(() => setPulsingNode(null), 1200);
    }
  };

  const addShip = (nid, txt) => {
    triggerCelebration(nid, txt, false);
    setShipLog(p => [...p, { nodeId: nid, text: txt, date: new Date().toISOString().slice(0, 10) }]);
    const n = nodes.find(x => x.id === nid);
    logAct(`Shipped: "${txt}" (${n?.title})`);
    setSuggestions(prev => { const next = { ...prev }; delete next[nid]; return next; });
    setTimeout(() => checkSynergyHarvest(nid, txt), 600);
  };
  const addNodeFn = (title, cluster) => { const cn = nodes.filter(n => n.cluster === cluster); const x = cn.length ? cn.reduce((s, n) => s + n.x, 0) / cn.length + (Math.random() - 0.5) * 80 : 400; const y = cn.length ? Math.max(...cn.map(n => n.y)) + 50 + Math.random() * 30 : 300; const nn = { id: `n_${Date.now()}`, title, cluster, status: "exploring", x, y, desc: "", nextSteps: [] }; setNodes(p => [...p, nn]); logAct(`Added: "${title}" to ${cluster}`); setSel(nn.id); setAddingNode(false); };
  const addConnectionFn = (from, to, type) => { if (from === to || synergies.some(s => (s.from === from && s.to === to) || (s.from === to && s.to === from))) return; setSynergies(p => [...p, { from, to, type, label: "" }]); const a = nodes.find(n => n.id === from); const b = nodes.find(n => n.id === to); logAct(`Connected: ${a?.title} ↔ ${b?.title}`); setAddingConn(null); };
  const removeNode = (id) => { const n = nodes.find(x => x.id === id); setNodes(p => p.filter(x => x.id !== id)); setSynergies(p => p.filter(s => s.from !== id && s.to !== id)); logAct(`Removed: "${n?.title}"`); setSel(null); };
  const removeConnection = (idx) => { const s = synergies[idx]; const a = nodes.find(n => n.id === s.from); const b = nodes.find(n => n.id === s.to); setSynergies(p => p.filter((_, i) => i !== idx)); logAct(`Disconnected: ${a?.title} ↔ ${b?.title}`); };
  const quickCapture = (txt, capturedDuring) => { const n = { id: `cap_${Date.now()}`, title: txt.length > 50 ? txt.slice(0, 50) + "…" : txt, cluster: "Intake Zone", status: "exploring", x: 1100 + Math.random() * 100, y: 680 + Math.random() * 60, desc: txt, nextSteps: [], capturedDuring: capturedDuring || null }; setNodes(p => [...p, n]); logAct(`Captured: "${n.title}"${capturedDuring ? ` (during ${capturedDuring} focus)` : ""}`); };
  const resetAll = async () => { if (!confirm("Reset everything?")) return; setNodes(DEFAULT_NODES); setSynergies(DEFAULT_SYNERGIES); setEnergyMap({}); setGravityMap({}); setShipLog([]); setActivityLog([]); setChatMessages([]); setSuggestions({}); setTodayList(null); setTodaySkipped([]); setTodayCompleted([]); await storageDel(STORAGE_KEYS.mapState); await storageDel(STORAGE_KEYS.logs); await storageDel(STORAGE_KEYS.chat); await storageDel(STORAGE_KEYS.suggestions); await storageDel(STORAGE_KEYS.today); };

  /* VOICE PIPELINE */
  const cancelVoice = useCallback(() => {
    if (voiceRecRef.current) { try { voiceRecRef.current.stop(); } catch {} voiceRecRef.current = null; }
    if (voiceCountdownRef.current) clearTimeout(voiceCountdownRef.current);
    if (voiceCountdownInterval.current) clearInterval(voiceCountdownInterval.current);
    setVoiceState("idle"); setVoiceTranscript(""); setVoiceResult(null); setVoiceCountdown(0);
  }, []);

  const acceptVoiceResult = useCallback(() => {
    if (!voiceResult) return;
    const { action, nodeId, text } = voiceResult;
    if (action === "ship" && nodeId) { addShip(nodeId, text); }
    else if (action === "capture") { quickCapture(text, focusActive ? filter : null); }
    else if (action === "nextMove" && nodeId) {
      const node = nodes.find(n => n.id === nodeId);
      const steps = getSteps(node || {});
      updateNode(nodeId, { nextSteps: [...steps, { id: `s_${Date.now()}`, text, done: false }] });
      logAct(`Voice: added step for ${node?.title}`);
    }
    if (voiceCountdownRef.current) clearTimeout(voiceCountdownRef.current);
    if (voiceCountdownInterval.current) clearInterval(voiceCountdownInterval.current);
    setVoiceState("idle"); setVoiceTranscript(""); setVoiceResult(null); setVoiceCountdown(0);
  }, [voiceResult, focusActive, filter, nodes]);

  const startCountdown = useCallback((result) => {
    setVoiceResult(result);
    setVoiceCountdown(30);
    setVoiceState("countdown");
    if (voiceCountdownInterval.current) clearInterval(voiceCountdownInterval.current);
    voiceCountdownInterval.current = setInterval(() => {
      setVoiceCountdown(prev => {
        if (prev <= 1) { clearInterval(voiceCountdownInterval.current); return 0; }
        return prev - 1;
      });
    }, 100);
    if (voiceCountdownRef.current) clearTimeout(voiceCountdownRef.current);
    voiceCountdownRef.current = setTimeout(() => {
      clearInterval(voiceCountdownInterval.current);
      setVoiceCountdown(0);
    }, 3000);
  }, []);

  useEffect(() => {
    if (voiceCountdown === 0 && voiceState === "countdown" && voiceResult) { acceptVoiceResult(); }
  }, [voiceCountdown, voiceState, voiceResult, acceptVoiceResult]);

  const classifyVoice = useCallback(async (transcript) => {
    setVoiceState("classifying");
    const projectList = nodes.filter(n => n.status !== "shipped").map(n =>
      `id:${n.id} title:"${n.title}" cluster:"${n.cluster}" status:${n.status} steps:"${pendingSteps(n).map(s=>s.text).join("; ") || "none"}"`
    ).join("\n");
    const prompt = `You classify voice input for a project management tool. Given the transcript and project list, determine the user's intent.

PROJECTS:\n${projectList}

VOICE TRANSCRIPT: "${transcript}"

Classify and return ONLY valid JSON (no markdown, no backticks):
{
  "action": "ship" | "capture" | "nextMove",
  "nodeId": "the project id if matched, or null for capture",
  "text": "cleaned up version of what to log (fix obvious speech-to-text errors, keep it concise)",
  "confidence": 0.0 to 1.0,
  "reasoning": "one sentence explaining your classification"
}

Rules:
- "ship" = user completed/delivered something for a specific project
- "nextMove" = user is setting what to do next on a project
- "capture" = general thought/idea not clearly tied to a project, or low confidence match
- If transcript mentions a project by name or close synonym, match it
- If intent is ambiguous, prefer "capture" with the full text
- Clean up speech artifacts but preserve meaning`;

    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-5-20250514", max_tokens: 300, messages: [{ role: "user", content: prompt }] }),
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text?.trim();
      if (!text) throw new Error("Empty response");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const matchedNode = parsed.nodeId ? nodes.find(n => n.id === parsed.nodeId) : null;
      const result = {
        action: parsed.action || "capture",
        nodeId: matchedNode ? parsed.nodeId : null,
        nodeTitle: matchedNode?.title || null,
        nodeCluster: matchedNode?.cluster || null,
        text: parsed.text || transcript,
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning || "",
      };
      if (result.confidence < 0.4) { result.action = "capture"; result.nodeId = null; result.nodeTitle = null; }
      startCountdown(result);
    } catch (err) {
      console.error("Voice classify error:", err);
      startCountdown({ action: "capture", nodeId: null, nodeTitle: null, nodeCluster: null, text: transcript, confidence: 0.3, reasoning: "Classification failed, capturing as-is" });
    }
  }, [nodes, startCountdown]);

  const startListening = useCallback(() => {
    if (!hasSpeechAPI) return;
    if (voiceState !== "idle") { cancelVoice(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    let finalTranscript = "";
    rec.onstart = () => { setVoiceState("listening"); setVoiceTranscript(""); };
    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) { finalTranscript += event.results[i][0].transcript; }
        else { interim += event.results[i][0].transcript; }
      }
      setVoiceTranscript(finalTranscript || interim);
    };
    rec.onend = () => {
      voiceRecRef.current = null;
      const t = finalTranscript.trim();
      if (t) { classifyVoice(t); }
      else { setVoiceState("idle"); setVoiceTranscript(""); }
    };
    rec.onerror = (e) => {
      console.error("Speech error:", e.error);
      voiceRecRef.current = null;
      if (e.error !== "aborted") { setVoiceState("idle"); setVoiceTranscript(""); }
    };
    voiceRecRef.current = rec;
    rec.start();
  }, [voiceState, hasSpeechAPI, cancelVoice, classifyVoice]);

  useEffect(() => { if (capOpen && capRef.current) capRef.current.focus(); }, [capOpen]);
  useEffect(() => { if (focusCapOpen && focusCapRef.current) focusCapRef.current.focus(); }, [focusCapOpen]);

  /* ESCAPE exits focus mode / cancels voice */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (voiceState !== "idle") { e.preventDefault(); cancelVoice(); }
        else if (focusCapOpen) { e.preventDefault(); setFocusCapOpen(false); setFocusCapText(""); }
        else if (focusActive) { e.preventDefault(); setFilter("All"); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusActive, focusCapOpen, voiceState, cancelVoice]);

  useEffect(() => { if (!focusActive) { setFocusCapOpen(false); setFocusCapText(""); } }, [focusActive]);

  /* Cleanup voice on unmount */
  useEffect(() => { return () => { if (voiceRecRef.current) try { voiceRecRef.current.stop(); } catch {} if (voiceCountdownRef.current) clearTimeout(voiceCountdownRef.current); if (voiceCountdownInterval.current) clearInterval(voiceCountdownInterval.current); }; }, []);

  /* Mobile detection */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Prevent browser zoom on double tap */
  useEffect(() => {
    let existing = document.querySelector('meta[name="viewport"]');
    if (existing) { existing.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"); }
    else { const meta = document.createElement("meta"); meta.name = "viewport"; meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"; document.head.appendChild(meta); }
  }, []);

  /* PAN + NODE DRAG + ZOOM */
  const getPointerPos = (e) => e.touches?.length ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : e.changedTouches?.length ? { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY } : e.clientX !== undefined ? { x: e.clientX, y: e.clientY } : null;
  const dragNodeRef = useRef(null);
  const dragNodeOffset = useRef({ x: 0, y: 0 });
  const dragNodeStart = useRef({ x: 0, y: 0 });
  const didDragNode = useRef(false);
  const panStartPos = useRef({ x: 0, y: 0 });
  const DRAG_THRESHOLD = 5;
  const onMD = useCallback((e) => { const pos = getPointerPos(e); panStartPos.current = pos; setDragging(true); setDragStart({ x: pos.x - pan.x, y: pos.y - pan.y }); }, [pan]);
  const onNodeMD = useCallback((e, nodeId) => {
    e.stopPropagation(); e.preventDefault();
    const pos = getPointerPos(e);
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    dragNodeRef.current = nodeId;
    dragNodeOffset.current = { x: pos.x - (node.x * zoom + pan.x), y: pos.y - (node.y * zoom + pan.y) };
    dragNodeStart.current = { x: pos.x, y: pos.y };
    didDragNode.current = false;
  }, [nodes, pan, zoom]);
  const onMM = useCallback((e) => {
    const pos = getPointerPos(e);
    if (dragNodeRef.current) {
      e.preventDefault();
      if (!didDragNode.current) {
        const dx = pos.x - dragNodeStart.current.x;
        const dy = pos.y - dragNodeStart.current.y;
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
        didDragNode.current = true;
      }
      const newX = (pos.x - dragNodeOffset.current.x - pan.x) / zoom;
      const newY = (pos.y - dragNodeOffset.current.y - pan.y) / zoom;
      setNodes(prev => prev.map(n => n.id === dragNodeRef.current ? { ...n, x: Math.round(newX), y: Math.round(newY) } : n));
    } else if (dragging) { e.preventDefault(); setPan({ x: pos.x - dragStart.x, y: pos.y - dragStart.y }); }
  }, [dragging, dragStart, pan, zoom]);
  const onMU = useCallback((e) => {
    if (dragNodeRef.current && !didDragNode.current) {
      if (addingConn) {
        const from = addingConn.from; const to = dragNodeRef.current;
        if (from !== to && !synergies.some(s => (s.from === from && s.to === to) || (s.from === to && s.to === from))) {
          setSynergies(p => [...p, { from, to, type: addingConn.type, label: "" }]);
          const a = nodes.find(n => n.id === from); const b = nodes.find(n => n.id === to);
          setActivityLog(p => [...p, { text: `Connected: ${a?.title} ↔ ${b?.title}`, date: new Date().toISOString().slice(0, 10), time: new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }) }]);
          setAddingConn(null);
        }
      } else { setSel(dragNodeRef.current); }
    } else if (!dragNodeRef.current && dragging) {
      const pos = getPointerPos(e);
      const dx = pos ? Math.abs(pos.x - panStartPos.current.x) : 999;
      const dy = pos ? Math.abs(pos.y - panStartPos.current.y) : 999;
      if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD && focusActive) { setFilter("All"); }
    }
    dragNodeRef.current = null; didDragNode.current = false; setDragging(false);
  }, [addingConn, synergies, nodes, dragging, focusActive]);
  const onWheel = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    const raw = -e.deltaY;
    const factor = Math.abs(raw) > 50 ? 0.08 : 0.02;
    const direction = raw > 0 ? 1 : -1;
    const newZoom = Math.min(3, Math.max(0.15, zoom * (1 + direction * factor)));
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const cx = e.clientX - rect.left; const cy = e.clientY - rect.top;
      const scale = newZoom / zoom;
      setPan(p => ({ x: cx - scale * (cx - p.x), y: cy - scale * (cy - p.y) }));
    }
    setZoom(newZoom);
  }, [zoom]);
  useEffect(() => {
    window.addEventListener("mousemove", onMM); window.addEventListener("mouseup", onMU);
    window.addEventListener("touchmove", onMM, { passive: false }); window.addEventListener("touchend", onMU);
    const canvas = canvasRef.current;
    if (canvas) canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("mousemove", onMM); window.removeEventListener("mouseup", onMU);
      window.removeEventListener("touchmove", onMM); window.removeEventListener("touchend", onMU);
      if (canvas) canvas.removeEventListener("wheel", onWheel);
    };
  }, [onMM, onMU, onWheel]);

  /* PINCH-TO-ZOOM */
  const lastPinchDist = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onTouchStart = (e) => {
      if (e.touches.length === 2) { lastPinchDist.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }
    };
    const onTouchMove = (e) => {
      if (e.touches.length === 2 && lastPinchDist.current) {
        e.preventDefault();
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const scale = dist / lastPinchDist.current;
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        setZoom(z => {
          const nz = Math.min(3, Math.max(0.15, z * scale));
          const s = nz / z;
          setPan(p => ({ x: cx - s * (cx - p.x), y: cy - s * (cy - p.y) }));
          return nz;
        });
        lastPinchDist.current = dist;
      }
    };
    const onTouchEnd = () => { lastPinchDist.current = null; };
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    return () => { canvas.removeEventListener("touchstart", onTouchStart); canvas.removeEventListener("touchmove", onTouchMove); canvas.removeEventListener("touchend", onTouchEnd); };
  }, []);

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
          const involvesFocus = !focusActive || focusedIds.has(s.from) || focusedIds.has(s.to);
          const x1 = a.x + 90, y1 = a.y + 25, x2 = b.x + 90, y2 = b.y + 25;
          const isH = hov && (s.from === hov || s.to === hov);
          const st = SYNERGY_TYPES[s.type] || SYNERGY_TYPES.feeds;
          const focusOpacity = focusActive ? (involvesFocus ? 0.5 : 0.03) : 0.3;
          const isMomentum = momentumSource && (s.from === momentumSource || s.to === momentumSource);
          const mColor = isMomentum ? clr(nm[momentumSource]?.cluster).main : st.color;
          const mOpacity = isMomentum ? 0.9 : hov ? (isH ? 1 : 0.05) : focusOpacity;
          const mWidth = isMomentum ? 2.5 : isH ? 3 : 1.5;
          const lineLen = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
          return (<g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isMomentum ? mColor : st.color} strokeWidth={mWidth} strokeDasharray={s.type === "lineage" ? "" : s.type === "accelerates" ? "8,4" : "5,4"} opacity={mOpacity} style={{ transition: "opacity 0.3s" }} />{isH && <><circle cx={x1} cy={y1} r={4} fill={st.color} opacity={0.8} /><circle cx={x2} cy={y2} r={4} fill={st.color} opacity={0.8} /></>}{isMomentum && <circle r={4} fill={mColor} opacity={0.9}><animateMotion dur="0.6s" repeatCount="1" fill="freeze" path={`M${x1},${y1} L${x2},${y2}`} /></circle>}</g>);
        })}
      </svg>
    );
  };

  const Node = ({ node }) => {
    const s = stl(node.status); const cl = clr(node.cluster); const isSel = sel === node.id; const en = nrg(node.id, energyMap);
    const grav = GRAVITY_LEVELS[gravityMap[node.id]] || GRAVITY_LEVELS.normal;
    const isConn = addingConn && addingConn.from !== node.id;
    const dimmed = hov && hov !== node.id && !synergies.some(sy => (sy.from === hov && sy.to === node.id) || (sy.to === hov && sy.from === node.id));
    const hasSuggestion = pendingSteps(node).length === 0 && suggestions[node.id]?.text && !suggestions[node.id]?.dismissed;
    const moveText = firstPending(node) || (hasSuggestion ? suggestions[node.id].text : "");
    const isMomentumTarget = momentumSource && momentumSource !== node.id && synergies.some(sy => (sy.from === momentumSource && sy.to === node.id) || (sy.to === momentumSource && sy.from === node.id));
    const isDormant = node.status === "dormant";
    const isFocused = !focusActive || focusedIds.has(node.id);
    const isConnToFocus = focusActive && connectedToFocus.has(node.id);
    const isFocusDimmed = focusActive && !isFocused && !isConnToFocus;
    const baseOpacity = isFocusDimmed ? 0.07 : isConnToFocus ? 0.45 : isDormant ? 0.55 : 1;
    const finalOpacity = dimmed ? Math.min(baseOpacity, 0.18) : baseOpacity;
    const blurAmount = isFocusDimmed ? "blur(2px)" : "none";
    const nodeBg = isSel ? `${cl.main}18` : isDormant ? DORMANT_STYLE.bg : en ? en.bg : `${C.bgLight}dd`;
    const nodeBorder = isSel ? cl.main : isDormant ? DORMANT_STYLE.border.slice(0, 7) : en ? en.border.slice(0, 7) : isConn ? "#fff" : `${cl.main}25`;
    const nodeGlow = isSel ? `0 0 20px ${cl.main}30` : isDormant ? DORMANT_STYLE.glow : en ? `0 0 16px ${en.glow}` : "0 2px 10px rgba(0,0,0,0.3)";
    const isPulsing = pulsingNode === node.id || isMomentumTarget;
    const pulseGlow = isPulsing ? `0 0 24px ${C.mint}50, 0 0 48px ${C.mint}20` : nodeGlow;
    return (
      <div onMouseEnter={() => !addingConn && !dragNodeRef.current && setHov(node.id)} onMouseLeave={() => setHov(null)}
        onMouseDown={e => onNodeMD(e, node.id)} onTouchStart={e => onNodeMD(e, node.id)}
        style={{ position: "absolute", left: node.x, top: node.y, zIndex: isSel ? 100 : isFocusDimmed ? 1 : 10, transform: `scale(${grav.scale})`, transformOrigin: "center center", opacity: finalOpacity, filter: blurAmount, cursor: isConn ? "crosshair" : "grab", transition: "opacity 0.4s, transform 0.3s ease, filter 0.4s", userSelect: "none", pointerEvents: isFocusDimmed ? "none" : "auto" }}>
        <div style={{ background: nodeBg, border: `1.5px solid ${isMomentumTarget ? clr(nodes.find(x => x.id === momentumSource)?.cluster).main : isPulsing ? C.mint : nodeBorder}`, borderRadius: 11, padding: "9px 13px", minWidth: 130, maxWidth: 195, boxShadow: pulseGlow, transition: "border-color 0.3s, box-shadow 0.3s, background 0.3s", animation: isMomentumTarget ? "momentumPulse 0.6s ease-out" : isPulsing ? "shipPulse 1.2s ease-out" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ color: isDormant ? C.dim : s.color, fontSize: 10 }}>{s.icon}</span><span style={{ color: isDormant ? C.dim : C.muted, fontSize: 9, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</span></div>
            {hasSuggestion && <span style={{ color: C.lavender, fontSize: 8, opacity: 0.7 }}>✦</span>}
          </div>
          <div style={{ color: isDormant ? C.faint : C.text, fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{node.title}</div>
          {moveText && (
            <div
              onMouseEnter={e => { e.stopPropagation(); if (!isMobile) triggerMomentum(node.id); }}
              onClick={e => { if (isMobile && moveText) { e.stopPropagation(); triggerMomentum(node.id); } }}
              style={{ color: hasSuggestion ? C.lavender : C.muted, fontSize: 9, marginTop: 4, opacity: hasSuggestion ? 0.5 : 0.7, fontStyle: hasSuggestion ? "italic" : "normal", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "default" }}>
              {hasSuggestion ? "\u2726 " : "\u2192 "}{moveText.length > 30 ? moveText.slice(0, 30) + "\u2026" : moveText}
            </div>
          )}
        </div>
      </div>
    );
  };

  const Blobs = () => {
    const vis = [...new Set(nodes.map(n => n.cluster))];
    return vis.map(c => {
      const cn = nodes.filter(n => n.cluster === c); const p = 50;
      const isFocusedCluster = !focusActive || c === filter;
      const hasConnected = focusActive && cn.some(n => connectedToFocus.has(n.id));
      const blobOpacity = isFocusedCluster ? 1 : hasConnected ? 0.3 : 0.05;
      const x1 = Math.min(...cn.map(n => n.x)) - p, y1 = Math.min(...cn.map(n => n.y)) - p;
      const x2 = Math.max(...cn.map(n => n.x)) + 200 + p, y2 = Math.max(...cn.map(n => n.y)) + 60 + p;
      const cc = clr(c);
      return (<div key={c} style={{ opacity: blobOpacity, transition: "opacity 0.4s" }}><div style={{ position: "absolute", left: x1, top: y1, width: x2 - x1, height: y2 - y1, background: `radial-gradient(ellipse at center, ${cc.bg} 0%, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }} /><div style={{ position: "absolute", left: cn.reduce((s, n) => s + n.x, 0) / cn.length - 30, top: Math.min(...cn.map(n => n.y)) - 36, color: `${cc.main}35`, fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", pointerEvents: "none", whiteSpace: "nowrap" }}>{c}</div></div>);
    });
  };

  const Detail = () => {
    const n = selNode; if (!n) return null;
    const cl = clr(n.cluster); const en = nrg(n.id, energyMap);
    const nodeShips = shipLog.filter(sl => sl.nodeId === n.id);
    const nodeConns = synergies.map((sy, i) => ({ ...sy, idx: i })).filter(sy => sy.from === n.id || sy.to === n.id);
    const suggestion = suggestions[n.id];
    const [editDesc, setEditDesc] = useState(false);
    const [descVal, setDescVal] = useState(n.desc);
    const [shipInput, setShipInput] = useState(""); const [showShip, setShowShip] = useState(false);
    const [newStepText, setNewStepText] = useState("");
    const [editingStepId, setEditingStepId] = useState(null);
    const [editStepVal, setEditStepVal] = useState("");
    const [advisorOpen, setAdvisorOpen] = useState(false);
    const [advisorLoading, setAdvisorLoading] = useState(false);
    const steps = getSteps(n);
    const pending = pendingSteps(n);
    useEffect(() => { setDescVal(n.desc); setEditDesc(false); setNewStepText(""); setEditingStepId(null); setAdvisorOpen(false); }, [n.id]);

    const advisorData = advisorCache[n.id];
    const advisorFresh = advisorData && (Date.now() - advisorData.time < 3600000);
    const fetchAdvisor = async () => {
      if (advisorFresh) { setAdvisorOpen(true); return; }
      setAdvisorOpen(true); setAdvisorLoading(true);
      const nodeShipsAll = shipLog.filter(s => s.nodeId === n.id);
      const lastShip = nodeShipsAll.slice(-1)[0];
      const daysSince = lastShip ? Math.floor((Date.now() - new Date(lastShip.date).getTime()) / 86400000) : 999;
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      const shipsThisWeek = nodeShipsAll.filter(s => s.date >= weekAgo).length;
      const conns = synergies.filter(s => s.from === n.id || s.to === n.id).map(s => {
        const oid = s.from === n.id ? s.to : s.from;
        const other = nodes.find(x => x.id === oid);
        return { title: other?.title || "?", type: s.type, label: s.label || "" };
      });
      const clusterShips = {};
      shipLog.filter(s => s.date >= weekAgo).forEach(s => {
        const nd = nodes.find(x => x.id === s.nodeId);
        if (nd) clusterShips[nd.cluster] = (clusterShips[nd.cluster] || 0) + 1;
      });
      const prompt = `You are a strategic advisor for Anna's project portfolio. Analyze this project and return ONLY valid JSON (no markdown, no backticks):

PROJECT: "${n.title}" [${n.cluster}]
Status: ${n.status} | Gravity: ${gravityMap[n.id] || "normal"} | Energy: ${energyMap[n.id] || "none"}
Days since last ship: ${daysSince} | Ships this week: ${shipsThisWeek}
Pending steps: ${pending.map(s => s.text).join("; ") || "none"}

SYNERGY CONNECTIONS:
${conns.map(c => `→ ${c.title} (${c.type}${c.label ? ": " + c.label : ""})`).join("\n") || "None"}

CLUSTER TEMPERATURES (ships this week): ${Object.entries(clusterShips).map(([c, n]) => `${c}: ${n}`).join(", ") || "all cold"}

Return this exact JSON structure:
{
  "downstream": "1-2 sentences: what happens if Anna works on this now? Which connected projects benefit and how?",
  "state": "Brief factual: days since last ship, ships this week, cluster temperature, gravity level",
  "advice": "One honest sentence of contextual advice based on the pattern"
}

Advice rules:
- High gravity but cold: nudge to do a small move
- Low gravity and user is considering it: gently ask if something heavier needs energy first
- Dormant by choice: reassure they don't need to think about it
- Getting all energy: suggest spreading to colder clusters
- Well-maintained: acknowledge and point to where energy might be needed more`;

      try {
        const response = await fetch("/api/claude", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-5-20250514", max_tokens: 300, messages: [{ role: "user", content: prompt }] }),
        });
        if (!response.ok) throw new Error("API error");
        const data = await response.json();
        const text = data.content?.find(b => b.type === "text")?.text?.trim();
        if (text) {
          const clean = text.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(clean);
          setAdvisorCache(prev => ({ ...prev, [n.id]: { ...parsed, time: Date.now() } }));
        }
      } catch (err) { console.error("Advisor error:", err); }
      finally { setAdvisorLoading(false); }
    };
    const toggleStep = (stepId) => { updateNode(n.id, { nextSteps: steps.map(s => s.id === stepId ? { ...s, done: !s.done } : s) }); };
    const removeStep = (stepId) => { updateNode(n.id, { nextSteps: steps.filter(s => s.id !== stepId) }); };
    const addStep = (text) => { if (!text.trim()) return; updateNode(n.id, { nextSteps: [...steps, { id: `s_${Date.now()}`, text: text.trim(), done: false }] }); setNewStepText(""); };
    const saveEditStep = (stepId) => { if (!editStepVal.trim()) return; updateNode(n.id, { nextSteps: steps.map(s => s.id === stepId ? { ...s, text: editStepVal.trim() } : s) }); setEditingStepId(null); };
    return (
      <div style={isMobile ? {} : { position: "fixed", right: 0, top: 0, bottom: 0, width: 390, background: C.bgLight, borderLeft: `1px solid ${C.border}`, padding: "24px 20px", zIndex: 200, overflowY: "auto", boxShadow: "-6px 0 30px rgba(0,0,0,0.5)" }}>
        <button onClick={() => setSel(null)} style={{ position: "absolute", top: 12, right: 14, background: "none", border: "none", color: C.muted, fontSize: 16, cursor: "pointer" }}>✕</button>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ padding: "3px 9px", borderRadius: 14, background: `${cl.main}15`, color: cl.main, fontSize: 10, fontWeight: 600 }}>{n.cluster}</span>
          {n.capturedDuring && <span style={{ padding: "3px 9px", borderRadius: 14, background: `${C.gold}12`, color: C.gold, fontSize: 9, fontWeight: 500 }}>captured during {n.capturedDuring}</span>}
          {Object.entries(ENERGY_LEVELS).map(([level, info]) => {
            const active = energyMap[n.id] === level;
            return (<button key={level} onClick={() => setEnergyMap(p => { const nm = { ...p }; if (active) delete nm[n.id]; else nm[n.id] = level; return nm; })} style={{ ...pill(active, info.color), padding: "3px 9px", display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: info.color, opacity: active ? 1 : 0.5 }} />{info.label}</button>);
          })}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, alignItems: "center" }}>
          <span style={{ color: C.faint, fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Gravity</span>
          {Object.entries(GRAVITY_LEVELS).map(([level, info]) => {
            const active = (gravityMap[n.id] || "normal") === level;
            return (<button key={level} onClick={() => setGravityMap(p => { const nm = { ...p }; if (level === "normal") delete nm[n.id]; else nm[n.id] = level; return nm; })} style={{ ...pill(active, C.text), padding: "3px 9px", display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: level === "heavy" ? 10 : level === "normal" ? 7 : 5, height: level === "heavy" ? 10 : level === "normal" ? 7 : 5, borderRadius: "50%", background: active ? C.text : C.faint, opacity: active ? 0.8 : 0.3 }} />{info.label}</button>);
          })}
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
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: n.status === "dormant" ? C.muted : C.warm, fontSize: 9, fontWeight: 600, textTransform: "uppercase" }}>{n.status === "dormant" ? "→ Keep warm" : `→ Next steps (${pending.length}/${steps.length})`}</span>
            </div>
            {steps.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                {steps.map(step => (
                  <div key={step.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0", borderBottom: `1px solid ${C.border}30` }}>
                    <button onClick={() => toggleStep(step.id)}
                      style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${step.done ? C.mint : C.faint}`, background: step.done ? `${C.mint}20` : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      {step.done && <span style={{ color: C.mint, fontSize: 10, fontWeight: 700 }}>✓</span>}
                    </button>
                    {editingStepId === step.id ? (
                      <div style={{ flex: 1, display: "flex", gap: 4 }}>
                        <input value={editStepVal} onChange={e => setEditStepVal(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") saveEditStep(step.id); if (e.key === "Escape") setEditingStepId(null); }}
                          style={{ ...inputStyle, flex: 1, padding: "3px 6px", fontSize: 11 }} autoFocus />
                        <button onClick={() => saveEditStep(step.id)} style={{ background: "none", border: "none", color: C.sky, fontSize: 10, cursor: "pointer" }}>✓</button>
                      </div>
                    ) : (
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                        <span onClick={() => { setEditingStepId(step.id); setEditStepVal(step.text); }}
                          style={{ color: step.done ? C.faint : C.text, fontSize: 12, lineHeight: 1.4, textDecoration: step.done ? "line-through" : "none", cursor: "text", flex: 1 }}>{step.text}</span>
                        <button onClick={() => removeStep(step.id)} style={{ background: "none", border: "none", color: C.faint, fontSize: 10, cursor: "pointer", opacity: 0.4, flexShrink: 0 }}>✕</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* Add step input */}
            <div style={{ display: "flex", gap: 4 }}>
              <input value={newStepText} onChange={e => setNewStepText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addStep(newStepText); }}
                placeholder="Add a step…" style={{ ...inputStyle, flex: 1, padding: "5px 8px", fontSize: 11 }} />
              <button onClick={() => addStep(newStepText)} style={{ ...btn(C.warm, newStepText.trim().length > 0), padding: "4px 10px", fontSize: 10 }}>+</button>
            </div>
            {/* AI suggestion */}
            {pending.length === 0 && suggestion && !suggestion.dismissed && (
              <div style={{ marginTop: 8, padding: "8px 10px", background: `${C.lavender}08`, borderRadius: 8, border: `1px solid ${C.lavender}15` }}>
                <p style={{ color: C.muted, fontSize: 11, lineHeight: 1.5, margin: "0 0 6px", fontStyle: "italic" }}>
                  <span style={{ color: C.lavender, fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontStyle: "normal", marginRight: 6 }}>AI suggests</span>
                  {suggestion.text}
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => { addStep(suggestion.text); logAct(`Accepted AI suggestion for ${n.title}`); }}
                    style={{ ...btn(C.mint, false), padding: "3px 10px", fontSize: 10 }}>✓ Add as step</button>
                  <button onClick={() => setSuggestions(prev => ({ ...prev, [n.id]: { ...prev[n.id], dismissed: true } }))}
                    style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "3px 10px", color: C.faint, fontSize: 10, cursor: "pointer" }}>Dismiss</button>
                </div>
              </div>
            )}
            {pending.length === 0 && !suggestion?.text && !suggestion?.dismissed && (
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ color: C.faint, fontSize: 11, margin: 0, fontStyle: "italic" }}>No pending steps.</p>
                <button onClick={() => generateSuggestion(n.id)}
                  style={{ background: `${C.lavender}12`, border: `1px solid ${C.lavender}30`, borderRadius: 8, padding: "3px 10px", color: C.lavender, fontSize: 10, cursor: "pointer", whiteSpace: "nowrap" }}>✦ Ask AI</button>
              </div>
            )}
          </div>
        )}
        {n.shippedAs && <div style={{ ...panelBox, borderColor: `${C.mint}25` }}><span style={{ color: C.mint, fontSize: 9, fontWeight: 600, textTransform: "uppercase" }}>Shipped as</span><p style={{ color: C.text, fontSize: 12, margin: "4px 0 0" }}>{n.shippedAs}</p></div>}
        {n.status === "ready" && <div style={{ ...panelBox, background: `${C.warm}08`, borderColor: `${C.warm}25`, borderStyle: "dashed" }}><div style={{ color: C.warm, fontSize: 11, fontWeight: 700 }}>🚩 Ready Line</div><div style={{ color: C.muted, fontSize: 11 }}>One move gets this out.</div></div>}
        {/* WHY THIS ADVISOR */}
        {n.status !== "shipped" && (
          <div style={{ marginBottom: 8 }}>
            {!advisorOpen ? (
              <button onClick={fetchAdvisor}
                style={{ background: `${C.sky}08`, border: `1px solid ${C.sky}20`, borderRadius: 10, padding: "8px 12px", color: C.sky, fontSize: 11, cursor: "pointer", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
                <span style={{ fontSize: 13 }}>?</span>
                <span style={{ fontWeight: 500 }}>Why this? What happens if I work on this now?</span>
              </button>
            ) : (
              <div style={{ ...panelBox, borderColor: `${C.sky}25`, background: `${C.sky}05` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: C.sky, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>? Why this</span>
                  <button onClick={() => setAdvisorOpen(false)} style={{ background: "none", border: "none", color: C.faint, fontSize: 10, cursor: "pointer" }}>close</button>
                </div>
                {advisorLoading && !advisorFresh && (
                  <div style={{ color: C.muted, fontSize: 11, fontStyle: "italic", padding: "8px 0" }}>Thinking about downstream effects...</div>
                )}
                {(advisorFresh || advisorData) && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <div style={{ color: C.warm, fontSize: 9, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>If you work on this now</div>
                      <p style={{ color: C.text, fontSize: 12, lineHeight: 1.5, margin: 0 }}>{advisorData?.downstream || "\u2014"}</p>
                    </div>
                    <div>
                      <div style={{ color: C.muted, fontSize: 9, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Current state</div>
                      <p style={{ color: C.muted, fontSize: 11, lineHeight: 1.5, margin: 0 }}>{advisorData?.state || "\u2014"}</p>
                    </div>
                    <div style={{ padding: "8px 10px", background: `${C.bgLight}`, borderRadius: 8, border: `1px solid ${C.border}` }}>
                      <div style={{ color: C.lavender, fontSize: 9, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Honest read</div>
                      <p style={{ color: C.text, fontSize: 12, lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>{advisorData?.advice || "\u2014"}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
          {nodeShips.map((sl, i) => (<div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: sl.harvested ? C.lavender : C.mint, fontSize: 10 }}>{sl.harvested ? "↗" : "✦"}</span><span style={{ color: C.text, fontSize: 11 }}>{sl.text}</span><span style={{ color: C.faint, fontSize: 10 }}>{sl.date}</span></div>))}
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
        {[...shipLog].reverse().map((s, i) => { const n = nodes.find(x => x.id === s.nodeId); return (<div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, padding: "8px 12px", background: C.surface, borderRadius: 8, border: `1px solid ${s.harvested ? `${C.lavender}20` : C.border}` }}><span style={{ color: s.harvested ? C.lavender : C.mint }}>{s.harvested ? "↗" : "✦"}</span><div><span style={{ color: C.text, fontSize: 12 }}>{s.text}</span><div style={{ display: "flex", gap: 8, marginTop: 3 }}><span style={{ color: clr(n?.cluster).main, fontSize: 10 }}>{n?.title}</span><span style={{ color: C.faint, fontSize: 10 }}>{s.date}</span></div></div></div>); })}
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
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 210, background: `${C.bg}ee`, backdropFilter: "blur(14px)", borderBottom: `1px solid ${C.border}`, padding: isMobile ? "8px 10px" : "10px 18px", display: "flex", alignItems: "center", gap: isMobile ? 4 : 8, flexWrap: isMobile ? "wrap" : "nowrap" }}>
        {!isMobile && <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: C.text, marginRight: 10, whiteSpace: "nowrap" }}>Anna's Living Map</div>}
        <div style={{ display: "flex", gap: 2, marginRight: isMobile ? 0 : 8, overflowX: isMobile ? "auto" : "visible", WebkitOverflowScrolling: "touch", flexShrink: 0 }}>
          {[["map", "Map"], ["today", "Today"], ["connections", "Conn"], ["log", "Log"], ["review", "Review"], ["claude", "Claude"]].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)} style={{ ...pill(view === v, v === "claude" ? C.lavender : v === "review" ? C.gold : v === "today" ? C.warm : C.text), ...(v === "claude" && view !== "claude" ? { borderColor: `${C.lavender}40` } : {}), ...(v === "review" && view !== "review" ? { borderColor: `${C.gold}30` } : {}), ...(v === "today" && view !== "today" ? { borderColor: `${C.warm}30` } : {}), whiteSpace: "nowrap", minHeight: isMobile ? 32 : "auto" }}>{v === "claude" ? "💬 " + l : v === "review" ? "📋 " + l : v === "today" ? "◎ " + l : l}</button>
          ))}
        </div>
        {view === "map" && <div style={{ display: "flex", gap: 2, flex: 1, flexWrap: isMobile ? "nowrap" : "wrap", alignItems: "center", overflowX: isMobile ? "auto" : "visible", WebkitOverflowScrolling: "touch" }}>
          {["All", ...Object.keys(CLUSTERS)].filter(c => c === "All" || nodes.some(n => n.cluster === c)).map(c => (<button key={c} onClick={() => setFilter(f => f === c ? "All" : c)} style={{ ...pill(filter === c, c === "All" ? C.text : CLUSTERS[c].main), whiteSpace: "nowrap", minHeight: isMobile ? 32 : "auto" }}>{c === "All" ? "All" : c.split(" ").slice(0, 2).join(" ")}</button>))}
          {focusActive && <span style={{ color: C.faint, fontSize: 9, marginLeft: 4, opacity: 0.7 }}>esc to exit</span>}
        </div>}
        {saveStatus && <span style={{ fontSize: 9, color: saveStatus === "saved" ? C.mint : saveStatus === "error" ? C.red : C.muted, whiteSpace: "nowrap" }}>{saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "✓ Saved" : "Save error"}</span>}
        <div style={{ display: "flex", gap: isMobile ? 4 : 6, marginLeft: "auto", alignItems: "center", flexShrink: 0 }}>
          {view === "map" && !isMobile && <button onClick={() => setAddingNode(true)} style={btn(C.sky, false)}>+ Node</button>}
          {hasSpeechAPI && <button onClick={startListening}
            style={{ background: voiceState === "listening" ? `${C.red}25` : "none", border: `1px solid ${voiceState === "listening" ? C.red : C.border}`, borderRadius: 8, width: isMobile ? 36 : 30, height: isMobile ? 36 : 30, color: voiceState === "listening" ? C.red : C.muted, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", transition: "all 0.2s" }}
            title="Voice input">
            🎤
            {voiceState === "listening" && <div style={{ position: "absolute", inset: -2, borderRadius: 10, border: `2px solid ${C.red}`, animation: "voicePulseRing 1.5s ease-out infinite", pointerEvents: "none" }} />}
          </button>}
          {!capOpen ? <button onClick={() => isMobile ? setCapOpen(true) : setCapOpen(true)} style={{ ...btn(C.dim, false), minHeight: isMobile ? 32 : "auto" }}>{isMobile ? "+" : "+ Capture"}</button> : (
            <div style={{ display: "flex", gap: 4 }}>
              <input ref={capRef} value={capText} onChange={e => setCapText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && capText.trim()) { quickCapture(capText.trim()); setCapText(""); setCapOpen(false); } if (e.key === "Escape") setCapOpen(false); }} placeholder="Quick capture…" style={{ ...inputStyle, width: 200, padding: "4px 8px", fontSize: 11 }} />
              <button onClick={() => { if (capText.trim()) { quickCapture(capText.trim()); setCapText(""); setCapOpen(false); } }} style={btn(C.dim, true)}>+</button>
            </div>
          )}
        </div>
      </div>

      {view === "map" && (
        <div ref={canvasRef} style={{ position: "absolute", inset: 0, overflow: "hidden", touchAction: "none" }}>
          <div onMouseDown={onMD} onTouchStart={onMD} style={{ position: "absolute", inset: 0, zIndex: 1, cursor: dragging ? "grabbing" : "grab" }} />
          <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0", position: "relative", width: "100%", height: "100%", zIndex: 2, pointerEvents: "none" }}>
            <Blobs />
            <SynergyCanvas />
            <div style={{ pointerEvents: "auto" }}>{nodes.map(n => <Node key={n.id} node={n} />)}</div>
          </div>
        </div>
      )}

      {view === "connections" && <ConnectionsView />}
      {view === "log" && <LogView />}
      {view === "today" && <TodayPanel nodes={nodes} synergies={synergies} shipLog={shipLog} energyMap={energyMap} gravityMap={gravityMap} suggestions={suggestions} todayList={todayList} setTodayList={setTodayList} todayLoading={todayLoading} setTodayLoading={setTodayLoading} todayCompleted={todayCompleted} setTodayCompleted={setTodayCompleted} todaySkipped={todaySkipped} setTodaySkipped={setTodaySkipped} todayCacheTime={todayCacheTime} addShip={addShip} logAct={logAct} />}
      {view === "review" && <ReviewPanel nodes={nodes} synergies={synergies} shipLog={shipLog} energyMap={energyMap} gravityMap={gravityMap} setGravityMap={setGravityMap} setNodes={setNodes} setView={setView} />}
      {view === "claude" && <ClaudePanel nodes={nodes} synergies={synergies} shipLog={shipLog} activityLog={activityLog} energyMap={energyMap} gravityMap={gravityMap} messages={chatMessages} setMessages={setChatMessages} />}

      {view === "map" && !isMobile && (
        <div style={{ position: "fixed", bottom: 14, right: 14, zIndex: 150, background: `${C.bgLight}f0`, backdropFilter: "blur(10px)", borderRadius: 11, padding: "12px 14px", border: `1px solid ${C.border}`, maxWidth: 260, maxHeight: 280, overflowY: "auto" }}>
          <div style={{ color: C.warm, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>→ Ready line</div>
          {readyItems.slice(0, 7).map(n => {
            const sug = pendingSteps(n).length === 0 && suggestions[n.id]?.text && !suggestions[n.id]?.dismissed ? suggestions[n.id].text : null;
            const moveText = firstPending(n) || sug;
            return (<div key={n.id} onClick={() => setSel(n.id)} style={{ marginBottom: 5, display: "flex", alignItems: "flex-start", gap: 5, cursor: "pointer", padding: "3px 4px", borderRadius: 5 }} onMouseEnter={e => e.currentTarget.style.background = C.surface} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ color: stl(n.status).color, fontSize: 9, marginTop: 3 }}>{stl(n.status).icon}</span>
              <div><div style={{ color: C.text, fontSize: 11, fontWeight: 500 }}>{n.title}</div>{moveText && <div style={{ color: sug ? C.lavender : C.muted, fontSize: 9, marginTop: 1, fontStyle: sug ? "italic" : "normal", opacity: sug ? 0.6 : 1 }}>{sug ? "✦ " : "→ "}{moveText.length > 40 ? moveText.slice(0, 40) + "…" : moveText}</div>}</div>
            </div>);
          })}
        </div>
      )}

      {view === "map" && focusActive && (
        <div style={{ position: "fixed", top: 60, right: 14, zIndex: 155 }}>
          {!focusCapOpen ? (
            <button onClick={() => setFocusCapOpen(true)}
              style={{ background: `${C.bgLight}ee`, backdropFilter: "blur(10px)", border: `1px solid ${C.border}`, borderRadius: 20, padding: "7px 14px", color: C.muted, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 12px rgba(0,0,0,0.3)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.gold}50`; e.currentTarget.style.color = C.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
              <span style={{ fontSize: 13 }}>+</span>
              <span>Capture</span>
              {(() => { const parkingCount = nodes.filter(n => n.cluster === "Intake Zone").length; return parkingCount > 0 ? <span style={{ background: `${C.gold}25`, color: C.gold, fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 8, marginLeft: 2 }}>{parkingCount}</span> : null; })()}
            </button>
          ) : (
            <div style={{ background: `${C.bgLight}f0`, backdropFilter: "blur(12px)", border: `1px solid ${C.gold}40`, borderRadius: 14, padding: "8px 10px", display: "flex", gap: 6, alignItems: "center", boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 12px ${C.gold}10`, animation: "fadeSlideUp 0.2s ease-out" }}>
              <input ref={focusCapRef} value={focusCapText} onChange={e => setFocusCapText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && focusCapText.trim()) { quickCapture(focusCapText.trim(), filter); setFocusCapText(""); setFocusCapOpen(false); }
                  if (e.key === "Escape") { setFocusCapOpen(false); setFocusCapText(""); }
                }}
                placeholder="Thought for later…"
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", color: C.text, fontSize: 11, outline: "none", fontFamily: "'DM Sans',sans-serif", width: 220 }} />
              <button onClick={() => { if (focusCapText.trim()) { quickCapture(focusCapText.trim(), filter); setFocusCapText(""); setFocusCapOpen(false); } }}
                style={{ background: C.gold, border: "none", borderRadius: 8, width: 28, height: 28, color: C.bg, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>+</button>
            </div>
          )}
        </div>
      )}

      {view === "map" && (
        <div style={{ position: "fixed", bottom: isMobile ? 8 : 14, left: isMobile ? 8 : 14, zIndex: 150, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: `${C.bgLight}e8`, backdropFilter: "blur(10px)", borderRadius: 11, padding: "6px 8px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={() => { const nz = Math.max(0.15, zoom * 0.8); const cx = window.innerWidth / 2; const cy = window.innerHeight / 2; const s = nz / zoom; setPan(p => ({ x: cx - s * (cx - p.x), y: cy - s * (cy - p.y) })); setZoom(nz); }} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, width: isMobile ? 36 : 26, height: isMobile ? 36 : 26, color: C.text, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <span style={{ color: C.muted, fontSize: 10, minWidth: 36, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => { const nz = Math.min(3, zoom * 1.25); const cx = window.innerWidth / 2; const cy = window.innerHeight / 2; const s = nz / zoom; setPan(p => ({ x: cx - s * (cx - p.x), y: cy - s * (cy - p.y) })); setZoom(nz); }} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, width: isMobile ? 36 : 26, height: isMobile ? 36 : 26, color: C.text, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            <button onClick={() => { setZoom(0.65); setPan({ x: 0, y: 0 }); }} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 8px", color: C.muted, fontSize: 9, cursor: "pointer", minHeight: isMobile ? 36 : "auto" }}>Fit</button>
            {isMobile && <button onClick={() => setAddingNode(true)} style={{ ...btn(C.sky, false), minHeight: 36 }}>+</button>}
          </div>
          {!isMobile && (
            <div style={{ background: `${C.bgLight}e8`, backdropFilter: "blur(10px)", borderRadius: 11, padding: "10px 12px", border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {Object.entries(STATUSES).map(([k, v]) => (<div key={k} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ color: v.color, fontSize: 10 }}>{v.icon}</span><span style={{ color: C.muted, fontSize: 9 }}>{v.label}</span></div>))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
                {Object.entries(SYNERGY_TYPES).map(([k, v]) => (<div key={k} style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 14, height: 2, background: v.color, borderRadius: 1 }} /><span style={{ color: C.muted, fontSize: 9 }}>{v.label}</span></div>))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
                {Object.entries(ENERGY_LEVELS).map(([k, v]) => (<div key={k} style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: v.color, opacity: 0.7 }} /><span style={{ color: C.muted, fontSize: 9 }}>{v.label}</span></div>))}
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: 8, borderRadius: "50%", border: `1px solid ${C.faint}`, opacity: 0.5 }} /><span style={{ color: C.muted, fontSize: 9 }}>None</span></div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 5, alignItems: "center" }}>
                <span style={{ color: C.faint, fontSize: 8, fontWeight: 600, textTransform: "uppercase" }}>Size</span>
                {Object.entries(GRAVITY_LEVELS).map(([k, v]) => (<div key={k} style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: k === "heavy" ? 10 : k === "normal" ? 7 : 5, height: k === "heavy" ? 10 : k === "normal" ? 7 : 5, borderRadius: 2, background: C.muted, opacity: 0.4 }} /><span style={{ color: C.muted, fontSize: 9 }}>{v.label}</span></div>))}
              </div>
            </div>
          )}
        </div>
      )}

      {selNode && view === "map" && (<><div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 195 }} />
        <div style={isMobile ? { position: "fixed", left: 0, right: 0, bottom: 0, maxHeight: "80vh", background: C.bgLight, borderTop: `1px solid ${C.border}`, padding: "20px 16px", zIndex: 200, overflowY: "auto", boxShadow: "0 -6px 30px rgba(0,0,0,0.5)", borderRadius: "16px 16px 0 0" } : {}}><Detail /></div></>)}
      {harvestPrompt && (
        <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", zIndex: 260, background: C.surface, border: `1px solid ${SYNERGY_TYPES[harvestPrompt.synergyType]?.color || C.lavender}40`, borderRadius: 14, padding: "14px 18px", maxWidth: 420, boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${SYNERGY_TYPES[harvestPrompt.synergyType]?.color || C.lavender}15`, backdropFilter: "blur(12px)", animation: "fadeSlideUp 0.35s ease-out" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <div style={{ width: 14, height: 2, background: SYNERGY_TYPES[harvestPrompt.synergyType]?.color || C.lavender, borderRadius: 1 }} />
            <span style={{ color: SYNERGY_TYPES[harvestPrompt.synergyType]?.color || C.lavender, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Synergy harvest</span>
          </div>
          <div style={{ color: C.text, fontSize: 12, lineHeight: 1.5, marginBottom: 4 }}>
            <span style={{ fontWeight: 600 }}>"{harvestPrompt.shipText}"</span>
          </div>
          <div style={{ color: C.muted, fontSize: 11, marginBottom: 10 }}>
            Also counts for <span style={{ color: clr(harvestPrompt.targetCluster).main, fontWeight: 600 }}>{harvestPrompt.targetTitle}</span>?
            {harvestPrompt.synergyLabel && <span style={{ color: C.faint, fontSize: 10 }}> — {harvestPrompt.synergyLabel}</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={acceptHarvest} style={{ background: `${C.mint}18`, border: `1px solid ${C.mint}45`, borderRadius: 8, padding: "6px 14px", color: C.mint, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✦ Yes, log it</button>
            <button onClick={dismissHarvest} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 14px", color: C.muted, fontSize: 11, cursor: "pointer" }}>Not this time</button>
          </div>
        </div>
      )}
      {celebration && (
        <div onClick={() => { if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current); setCelebration(null); }}
          style={{ position: "fixed", inset: 0, zIndex: 280, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", animation: "celebFadeIn 0.3s ease-out", cursor: "pointer" }}>
          <div style={{ textAlign: "center", animation: "celebScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            <div style={{ fontSize: 40, marginBottom: 12, animation: "celebBounce 0.6s ease-out 0.2s both" }}>✦</div>
            <div style={{ color: C.mint, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Shipped</div>
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, fontFamily: "'Playfair Display',serif", marginBottom: 6, maxWidth: 320 }}>{celebration.shipText}</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
              <span style={{ color: CLUSTERS[celebration.cluster]?.main || C.muted, fontSize: 11 }}>{celebration.nodeTitle}</span>
              <span style={{ color: C.faint, fontSize: 10 }}>·</span>
              <span style={{ color: C.faint, fontSize: 10 }}>#{celebration.totalShips}</span>
            </div>
          </div>
        </div>
      )}
      {voiceState !== "idle" && (
        <div style={{ position: "fixed", top: 56, left: "50%", transform: "translateX(-50%)", zIndex: 270, minWidth: 340, maxWidth: 480, animation: "fadeSlideDown 0.25s ease-out" }}>
          <div style={{ background: C.surface, border: `1px solid ${voiceState === "listening" ? `${C.red}40` : voiceState === "classifying" ? `${C.sky}30` : `${C.mint}40`}`, borderRadius: 14, padding: "16px 20px", boxShadow: `0 8px 36px rgba(0,0,0,0.5), 0 0 20px ${voiceState === "listening" ? `${C.red}10` : voiceState === "countdown" ? `${C.mint}10` : "transparent"}`, backdropFilter: "blur(12px)" }}>
            {/* LISTENING */}
            {voiceState === "listening" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                    {[0, 1, 2, 3, 4].map(i => (<div key={i} style={{ width: 3, height: 8 + Math.random() * 12, background: C.red, borderRadius: 2, opacity: 0.7, animation: `voiceBar 0.5s ease-in-out ${i * 0.1}s infinite alternate` }} />))}
                  </div>
                  <span style={{ color: C.red, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Listening…</span>
                </div>
                {voiceTranscript && <div style={{ color: C.text, fontSize: 14, lineHeight: 1.5, fontStyle: "italic" }}>{voiceTranscript}</div>}
                {!voiceTranscript && <div style={{ color: C.faint, fontSize: 12 }}>Say what you shipped, a next move, or a thought to capture…</div>}
                <button onClick={cancelVoice} style={{ marginTop: 10, background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 12px", color: C.muted, fontSize: 10, cursor: "pointer" }}>Cancel</button>
              </div>
            )}
            {/* CLASSIFYING */}
            {voiceState === "classifying" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map(i => (<div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.sky, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />))}</div>
                  <span style={{ color: C.sky, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Classifying…</span>
                </div>
                <div style={{ color: C.text, fontSize: 13, fontStyle: "italic" }}>"{voiceTranscript}"</div>
              </div>
            )}
            {/* COUNTDOWN */}
            {voiceState === "countdown" && voiceResult && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: voiceResult.action === "ship" ? C.mint : voiceResult.action === "nextMove" ? C.warm : C.gold, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {voiceResult.action === "ship" ? "✦ Ship" : voiceResult.action === "nextMove" ? "→ Next move" : "⬡ Capture"}
                    </span>
                    {voiceResult.confidence >= 0.7 && <span style={{ color: C.faint, fontSize: 9, opacity: 0.6 }}>high confidence</span>}
                    {voiceResult.confidence < 0.7 && voiceResult.confidence >= 0.4 && <span style={{ color: C.warm, fontSize: 9, opacity: 0.6 }}>medium confidence</span>}
                  </div>
                  {/* Countdown ring */}
                  <div style={{ position: "relative", width: 28, height: 28 }}>
                    <svg width="28" height="28" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="14" cy="14" r="11" fill="none" stroke={C.border} strokeWidth="2" />
                      <circle cx="14" cy="14" r="11" fill="none" stroke={C.mint} strokeWidth="2"
                        strokeDasharray={`${2 * Math.PI * 11}`}
                        strokeDashoffset={`${2 * Math.PI * 11 * (1 - voiceCountdown / 30)}`}
                        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.1s linear" }} />
                    </svg>
                    <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 9, fontWeight: 600 }}>{Math.ceil(voiceCountdown / 10)}</span>
                  </div>
                </div>
                <div style={{ color: C.text, fontSize: 14, fontWeight: 500, marginBottom: 4, lineHeight: 1.4 }}>"{voiceResult.text}"</div>
                {voiceResult.nodeTitle && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <span style={{ color: C.faint, fontSize: 10 }}>→</span>
                    <span style={{ color: CLUSTERS[voiceResult.nodeCluster]?.main || C.muted, fontSize: 11, fontWeight: 600 }}>{voiceResult.nodeTitle}</span>
                  </div>
                )}
                {!voiceResult.nodeTitle && voiceResult.action === "capture" && (
                  <div style={{ color: C.faint, fontSize: 10, marginBottom: 8 }}>→ Intake Zone</div>
                )}
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={acceptVoiceResult} style={{ background: `${C.mint}18`, border: `1px solid ${C.mint}45`, borderRadius: 8, padding: "5px 14px", color: C.mint, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Accept now</button>
                  <button onClick={cancelVoice} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 14px", color: C.muted, fontSize: 11, cursor: "pointer" }}>Cancel</button>
                  {voiceResult.nodeTitle && (
                    <button onClick={() => { startCountdown({ ...voiceResult, action: "capture", nodeId: null, nodeTitle: null, nodeCluster: null, reasoning: "Redirected to capture" }); }}
                      style={{ background: "none", border: `1px solid ${C.gold}30`, borderRadius: 8, padding: "5px 12px", color: C.gold, fontSize: 10, cursor: "pointer" }}>Capture instead</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <AddModal />
      {addingConn && (<div style={{ position: "fixed", top: 50, left: "50%", transform: "translateX(-50%)", zIndex: 250, background: C.surface, border: `1px solid ${C.lavender}40`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
        <span style={{ color: C.text, fontSize: 12 }}>Click a node to connect from <strong>{nodes.find(n => n.id === addingConn.from)?.title}</strong></span>
        <div style={{ display: "flex", gap: 3 }}>{Object.entries(SYNERGY_TYPES).map(([t, info]) => (<button key={t} onClick={() => setAddingConn({ ...addingConn, type: t })} style={pill(addingConn.type === t, info.color)}>{info.label}</button>))}</div>
        <button onClick={() => setAddingConn(null)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>✕</button>
      </div>)}
      <svg style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.02 }} width="100%" height="100%"><defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#g)" /></svg>
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes fadeSlideDown { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes shipPulse { 0% { box-shadow: 0 0 8px rgba(115,235,174,0.3); } 40% { box-shadow: 0 0 28px rgba(115,235,174,0.5), 0 0 56px rgba(115,235,174,0.15); } 100% { box-shadow: 0 0 8px rgba(115,235,174,0); } }
        @keyframes momentumPulse { 0% { transform: scale(1); } 40% { transform: scale(1.12); } 100% { transform: scale(1); } }
        @keyframes celebFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes celebScaleIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
        @keyframes celebBounce { 0% { opacity: 0; transform: scale(0.3) translateY(10px); } 60% { opacity: 1; transform: scale(1.15) translateY(-4px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes voicePulseRing { 0% { opacity: 0.8; transform: scale(1); } 100% { opacity: 0; transform: scale(1.6); } }
        @keyframes voiceBar { from { height: 6px; } to { height: 18px; } }
      `}</style>
    </div>
  );
}
