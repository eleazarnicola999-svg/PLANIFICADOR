import { useState, useEffect } from "react";

/* ═══════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════ */
const MODES = [
  { id: "presencial", label: "Presencial", icon: "🏪", color: "#E74C3C", desc: "Reuniones, entregas, buscar cosas. Tiene hora fija." },
  { id: "deepwork", label: "Deep Work", icon: "🎯", color: "#8E44AD", desc: "Aislado, computadora, sin interrupciones." },
  { id: "quick", label: "Quick Task", icon: "⚡", color: "#F39C12", desc: "Teléfono, entre cosas, con gente alrededor." },
  { id: "delegar", label: "Delegar", icon: "📤", color: "#3498DB", desc: "Mandar a cumplir + hacerle seguimiento." },
  { id: "personal", label: "Personal", icon: "🧠", color: "#1ABC9C", desc: "Salud, estudio, reflexión." },
];

const CAFE_TYPES = { social: "Social", deepwork: "Deep Work", lightwork: "Light Work" };
const CUSTOM_COLORS = ["#E67E22", "#1ABC9C", "#9B59B6", "#F39C12", "#16A085", "#E91E63", "#00BCD4", "#FF5722"];

const DEFAULT_LOCATIONS = [
  { id: "n1", label: "N1", icon: "🛒", color: "#2ECC71", type: "negocio" },
  { id: "tc", label: "TodoColchón", icon: "🛏️", color: "#7B68EE", type: "negocio" },
  { id: "th", label: "TodoHogar", icon: "🏠", color: "#E8A838", type: "negocio" },
  { id: "deposito", label: "Depósito", icon: "🏭", color: "#95A5A6", type: "negocio" },
  { id: "onthego", label: "On The Go", icon: "🚗", color: "#E74C3C", type: "movil" },
  { id: "sara", label: "Sara", icon: "☕", color: "#E91E63", type: "cafe", cafeType: "social", note: "Va demasiada gente conocida" },
  { id: "vanesa", label: "Vanesa", icon: "☕", color: "#9B59B6", type: "cafe", cafeType: "deepwork", note: "Tranquilo, vacío, sin ruido. Sin enchufes confirmados" },
  { id: "1020", label: "1020", icon: "☕", color: "#FF5722", type: "cafe", cafeType: "lightwork", note: "Mucho ruido y personas aunque vayas solo" },
];

const TEAM = [
  { id: "alex", label: "Alex" }, { id: "jeancarlos", label: "Jean Carlos" },
  { id: "yoelis", label: "Yoelis" }, { id: "yon", label: "Yon" },
  { id: "carlos", label: "Carlos" }, { id: "otro", label: "Otro" },
];

const PRIORITIES = [
  { id: "critical", label: "Crítica", emoji: "🔴", color: "#E74C3C" },
  { id: "high", label: "Alta", emoji: "🟠", color: "#E8A838" },
  { id: "medium", label: "Media", emoji: "🟡", color: "#6B5540" },
  { id: "low", label: "Baja", emoji: "⚪", color: "rgba(0,0,0,0.4)" },
];

const LISTS = [
  { id: "th", label: "TodoHogar", icon: "🏠", color: "#E8A838" },
  { id: "tc", label: "TodoColchón", icon: "🛏️", color: "#7B68EE" },
  { id: "n1", label: "N1 Supermercado", icon: "🛒", color: "#2ECC71" },
  { id: "sistemas", label: "Sistemas", icon: "⚙️", color: "#3498DB" },
  { id: "finanzas", label: "Finanzas", icon: "📊", color: "#9B59B6" },
  { id: "personal", label: "Personal", icon: "🧠", color: "#1ABC9C" },
];

function uid() { return Math.random().toString(36).substr(2, 9); }
function dateKey(d) { return d.toISOString().split("T")[0]; }
function todayKey() { return dateKey(new Date()); }
function fmtMin(m) { const h = Math.floor(m / 60); const mm = m % 60; return h > 0 ? `${h}h${mm > 0 ? mm + "m" : ""}` : `${mm}m`; }
function fmt12(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${m.toString().padStart(2, "0")}${ampm}`;
}

/* Storage */
async function load(k, fb) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : fb; } catch { return fb; } }
async function save(k, v) { try { await window.storage.set(k, JSON.stringify(v)); } catch (e) { console.error(e); } }

/* ═══════════════════════════════════════
   STYLES
   ═══════════════════════════════════════ */
const SS = {
  input: { padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.12)", background: "rgba(0,0,0,0.03)", color: "#1A1A1A", fontSize: "13px", fontFamily: "'DM Sans',sans-serif", outline: "none" },
  select: { padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.12)", background: "rgba(0,0,0,0.03)", color: "#1A1A1A", fontSize: "12px", fontFamily: "'DM Sans',sans-serif" },
  label: { fontSize: "10px", color: "rgba(0,0,0,0.4)", marginBottom: "4px", letterSpacing: "0.08em" },
  mono: { fontFamily: "'JetBrains Mono',monospace" },
};

function Btn({ children, onClick, primary, disabled, small, style = {} }) {
  return <button onClick={onClick} disabled={disabled} style={{
    padding: small ? "7px 14px" : "12px 24px", borderRadius: small ? "8px" : "10px",
    border: primary ? "none" : "1px solid rgba(0,0,0,0.1)",
    background: primary ? (disabled ? "rgba(139,115,85,0.2)" : "linear-gradient(135deg,#8B7355,#6B5540)") : "rgba(0,0,0,0.03)",
    color: primary ? (disabled ? "rgba(0,0,0,0.3)" : "#FFFFFF") : "rgba(0,0,0,0.5)",
    fontSize: small ? "11px" : "13px", fontWeight: "600", fontFamily: "'DM Sans',sans-serif",
    cursor: disabled ? "not-allowed" : "pointer", transition: "all .2s", ...style,
  }}>{children}</button>;
}

function Tab({ active, onClick, children, badge }) {
  return <div onClick={onClick} style={{
    padding: "8px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: active ? "600" : "400",
    cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", gap: "6px",
    background: active ? "rgba(139,115,85,0.1)" : "transparent",
    color: active ? "#6B5540" : "rgba(0,0,0,0.4)",
    border: active ? "1px solid rgba(139,115,85,0.25)" : "1px solid transparent",
  }}>{children}{badge != null && <span style={{ fontSize: "10px", ...SS.mono, opacity: 0.6 }}>({badge})</span>}</div>;
}

/* ═══════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════ */
export default function PlannerV5() {
  const [view, setView] = useState("day");
  const [backlog, setBacklog] = useState({});
  const [days, setDays] = useState({});
  const [customLocs, setCustomLocs] = useState([]);
  const [selDay, setSelDay] = useState(todayKey());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { (async () => {
    setBacklog(await load("p5-backlog", {}));
    setDays(await load("p5-days", {}));
    setCustomLocs(await load("p5-locs", []));
    setLoaded(true);
  })(); }, []);

  useEffect(() => { if (loaded) save("p5-backlog", backlog); }, [backlog, loaded]);
  useEffect(() => { if (loaded) save("p5-days", days); }, [days, loaded]);
  useEffect(() => { if (loaded) save("p5-locs", customLocs); }, [customLocs, loaded]);

  const allLocations = [...DEFAULT_LOCATIONS, ...customLocs];
  const dayData = days[selDay] || { tasks: [] };
  const setDayData = (d) => setDays({ ...days, [selDay]: d });

  const totalBacklog = (backlog._lists || []).reduce((s, l) => s + (backlog[l.id] || []).length, 0);

  if (!loaded) return <div style={{ minHeight: "100vh", background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B5540" }}>Cargando...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", color: "#1A1A1A", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        select option{background:#ffffff;color:#1a1a1a}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:2px}
        input::placeholder{color:rgba(0,0,0,.3)}
        input[type="time"]::-webkit-calendar-picker-indicator{filter:invert(0)}
      `}</style>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "20px 16px 80px" }}>
        <div style={{ fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "#6B5540", ...SS.mono, marginBottom: "14px" }}>Planificador</div>
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
          <Tab active={view === "day"} onClick={() => setView("day")}>🎯 Día</Tab>
          <Tab active={view === "week"} onClick={() => setView("week")}>📅 Semana</Tab>
          <Tab active={view === "backlog"} onClick={() => setView("backlog")} badge={totalBacklog}>📋 Backlog</Tab>
          <Tab active={view === "locations"} onClick={() => setView("locations")}>📍 Lugares</Tab>
        </div>

        {view === "day" && <DayView dk={selDay} setDk={setSelDay} data={dayData} setData={setDayData} locs={allLocations} backlog={backlog} setBacklog={setBacklog} />}
        {view === "week" && <WeekView days={days} setSelDay={(dk) => { setSelDay(dk); setView("day"); }} />}
        {view === "backlog" && <BacklogView backlog={backlog} setBacklog={setBacklog} locs={customLocs} />}
        {view === "locations" && <LocView locs={customLocs} setLocs={setCustomLocs} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   DAY VIEW — the main workflow
   ═══════════════════════════════════════ */
function DayView({ dk, setDk, data, setData, locs, backlog, setBacklog }) {
  const [phase, setPhase] = useState("input"); // input | summary | timeline | plan
  const tasks = data.tasks || [];

  const navDay = (off) => { const d = new Date(dk + "T12:00:00"); d.setDate(d.getDate() + off); setDk(dateKey(d)); };
  const d = new Date(dk + "T12:00:00");
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <Btn small onClick={() => navDay(-1)}>←</Btn>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: "700" }}>{dayNames[d.getDay()]} {d.getDate()} {months[d.getMonth()]}</div>
          <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.3)", ...SS.mono }}>{tasks.length} tareas</div>
        </div>
        <Btn small onClick={() => navDay(1)}>→</Btn>
      </div>

      {/* Phase tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {[
          { id: "input", label: "1. Tareas", icon: "✏️" },
          { id: "summary", label: "2. Resumen", icon: "📊" },
          { id: "plan", label: "3. Plan", icon: "🎯" },
        ].map((p) => <Tab key={p.id} active={phase === p.id} onClick={() => setPhase(p.id)}>{p.icon} {p.label}</Tab>)}
      </div>

      {phase === "input" && <TaskInput tasks={tasks} setTasks={(t) => setData({ ...data, tasks: t })} locs={locs} backlog={backlog} setBacklog={setBacklog} dk={dk} />}
      {phase === "summary" && <Summary tasks={tasks} setTasks={(t) => setData({ ...data, tasks: t })} />}
      {phase === "plan" && <Plan tasks={tasks} setTasks={(t) => setData({ ...data, tasks: t })} locs={locs} />}
    </div>
  );
}

/* --- Phase 1: Task Input --- */
function TaskInput({ tasks, setTasks, locs, backlog, setBacklog, dk }) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("quick");
  const [dur, setDur] = useState(30);
  const [priority, setPriority] = useState("medium");
  const [selLocs, setSelLocs] = useState([]);
  const [customLocs, setCustomLocs] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [delegateTo, setDelegateTo] = useState("");

  const toggleLoc = (id) => {
    setSelLocs(selLocs.includes(id) ? selLocs.filter((l) => l !== id) : [...selLocs, id]);
  };
  const addCustomLoc = () => {
    if (!customInput.trim()) return;
    setCustomLocs([...customLocs, customInput.trim()]);
    setCustomInput("");
  };
  const removeCustomLoc = (i) => setCustomLocs(customLocs.filter((_, idx) => idx !== i));

  const addTask = () => {
    if (!text.trim()) return;
    const t = {
      id: uid(), text: text.trim(), mode, duration: dur, priority,
      locations: selLocs, customLocations: customLocs.length > 0 ? customLocs : null,
      timeFrom: mode === "presencial" ? timeFrom : null,
      timeTo: mode === "presencial" ? timeTo : null,
      delegateTo: mode === "delegar" ? (delegateTo || null) : null,
      scheduled: false,
    };
    setTasks([...tasks, t]);
    setText(""); setSelLocs([]); setCustomLocs([]); setCustomInput(""); setTimeFrom(""); setTimeTo("");
  };

  const removeTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

  // All available locations (flat)
  const allLocs = locs;

  return (
    <div>
      <p style={{ color: "rgba(0,0,0,0.4)", fontSize: "12px", marginBottom: "14px" }}>
        Paso 1: Agrega TODO lo que tienes que hacer hoy. Después organizamos.
      </p>

      {/* Input form */}
      <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", padding: "14px", marginBottom: "16px" }}>
        {/* Task text */}
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="¿Qué hay que hacer?" style={{ ...SS.input, width: "100%", border: "none", borderBottom: "1px solid rgba(0,0,0,0.08)", borderRadius: 0, padding: "10px 0", marginBottom: "12px", fontSize: "15px" }} />

        {/* Mode selector - visual */}
        <div style={SS.label}>MODO</div>
        <div style={{ display: "flex", gap: "5px", marginBottom: "12px", flexWrap: "wrap" }}>
          {MODES.map((m) => (
            <div key={m.id} onClick={() => setMode(m.id)} style={{
              padding: "6px 12px", borderRadius: "16px", fontSize: "11px", cursor: "pointer", transition: "all .2s",
              background: mode === m.id ? `${m.color}20` : "rgba(0,0,0,0.02)",
              border: `1px solid ${mode === m.id ? m.color + "60" : "rgba(0,0,0,0.08)"}`,
              color: mode === m.id ? m.color : "rgba(0,0,0,0.45)", fontWeight: mode === m.id ? "600" : "400",
            }}>{m.icon} {m.label}</div>
          ))}
        </div>

        {/* Presencial: time range */}
        {mode === "presencial" && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center" }}>
            <span style={{ ...SS.label, marginBottom: 0 }}>HORA:</span>
            <input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} style={{ ...SS.input, width: "90px", ...SS.mono, fontSize: "12px", padding: "8px" }} />
            <span style={{ color: "rgba(0,0,0,0.25)", fontSize: "12px" }}>→</span>
            <input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} style={{ ...SS.input, width: "90px", ...SS.mono, fontSize: "12px", padding: "8px" }} />
          </div>
        )}

        {/* Delegar: to whom - free text */}
        {mode === "delegar" && (
          <div style={{ marginBottom: "12px" }}>
            <span style={SS.label}>DELEGAR A:</span>
            <input value={delegateTo} onChange={(e) => setDelegateTo(e.target.value)}
              placeholder="Nombre de la persona..."
              style={{ ...SS.input, marginLeft: "8px", width: "200px", fontSize: "12px" }} />
          </div>
        )}

        {/* Row: Duration + Priority */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
          <div>
            <div style={SS.label}>⏱️ TIEMPO</div>
            <select value={dur} onChange={(e) => setDur(parseInt(e.target.value))} style={SS.select}>
              {[10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 300, 360].map((d) => <option key={d} value={d}>{fmtMin(d)}</option>)}
            </select>
          </div>
          <div>
            <div style={SS.label}>🎯 PRIORIDAD</div>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={SS.select}>
              {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>)}
            </select>
          </div>
        </div>

        {/* Locations - multi select */}
        <div style={SS.label}>📍 LUGARES (toca para seleccionar varios)</div>
        <div style={{ marginBottom: "8px" }}>
          {/* Negocios */}
          <div style={{ fontSize: "9px", color: "rgba(0,0,0,0.25)", marginBottom: "4px", letterSpacing: "0.08em" }}>NEGOCIOS</div>
          <div style={{ display: "flex", gap: "5px", marginBottom: "8px", flexWrap: "wrap" }}>
            {allLocs.filter((l) => l.type === "negocio").map((l) => (
              <div key={l.id} onClick={() => toggleLoc(l.id)} style={{
                padding: "5px 11px", borderRadius: "14px", fontSize: "11px", cursor: "pointer", transition: "all .15s",
                background: selLocs.includes(l.id) ? `${l.color}20` : "rgba(0,0,0,0.02)",
                border: `1px solid ${selLocs.includes(l.id) ? l.color + "60" : "rgba(0,0,0,0.08)"}`,
                color: selLocs.includes(l.id) ? l.color : "rgba(0,0,0,0.45)",
                fontWeight: selLocs.includes(l.id) ? "600" : "400",
              }}>{l.icon} {l.label}</div>
            ))}
          </div>
          {/* Cafés */}
          <div style={{ fontSize: "9px", color: "rgba(0,0,0,0.25)", marginBottom: "4px", letterSpacing: "0.08em" }}>CAFÉS</div>
          <div style={{ display: "flex", gap: "5px", marginBottom: "8px", flexWrap: "wrap" }}>
            {allLocs.filter((l) => l.type === "cafe").map((l) => (
              <div key={l.id} onClick={() => toggleLoc(l.id)} style={{
                padding: "5px 11px", borderRadius: "14px", fontSize: "11px", cursor: "pointer", transition: "all .15s",
                background: selLocs.includes(l.id) ? `${l.color}20` : "rgba(0,0,0,0.02)",
                border: `1px solid ${selLocs.includes(l.id) ? l.color + "60" : "rgba(0,0,0,0.08)"}`,
                color: selLocs.includes(l.id) ? l.color : "rgba(0,0,0,0.45)",
                fontWeight: selLocs.includes(l.id) ? "600" : "400",
              }}>{l.icon} {l.label} <span style={{ fontSize: "9px", opacity: 0.6 }}>({CAFE_TYPES[l.cafeType]})</span></div>
            ))}
          </div>
          {/* Móvil + Custom */}
          <div style={{ display: "flex", gap: "5px", marginBottom: "8px", flexWrap: "wrap" }}>
            {allLocs.filter((l) => l.type === "movil" || l.type === "custom").map((l) => (
              <div key={l.id} onClick={() => toggleLoc(l.id)} style={{
                padding: "5px 11px", borderRadius: "14px", fontSize: "11px", cursor: "pointer", transition: "all .15s",
                background: selLocs.includes(l.id) ? `${l.color}20` : "rgba(0,0,0,0.02)",
                border: `1px solid ${selLocs.includes(l.id) ? l.color + "60" : "rgba(0,0,0,0.08)"}`,
                color: selLocs.includes(l.id) ? l.color : "rgba(0,0,0,0.45)",
                fontWeight: selLocs.includes(l.id) ? "600" : "400",
              }}>{l.icon} {l.label}</div>
            ))}
          </div>
        </div>

        {/* Custom one-off locations */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <input value={customInput} onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomLoc())}
            placeholder="📍 Agregar lugar puntual (ej: Concesionario Gonzalo)"
            style={{ ...SS.input, flex: "1 1 200px", fontSize: "11px" }} />
          <Btn small onClick={addCustomLoc} disabled={!customInput.trim()}>+</Btn>
        </div>
        {customLocs.length > 0 && (
          <div style={{ display: "flex", gap: "5px", marginBottom: "12px", flexWrap: "wrap" }}>
            {customLocs.map((cl, i) => (
              <span key={i} style={{
                padding: "4px 10px", borderRadius: "12px", fontSize: "11px", display: "flex", alignItems: "center", gap: "5px",
                background: "rgba(139,115,85,0.1)", border: "1px solid rgba(139,115,85,0.25)", color: "#6B5540",
              }}>
                📍 {cl}
                <span onClick={() => removeCustomLoc(i)} style={{ cursor: "pointer", fontSize: "13px", opacity: 0.6 }}>×</span>
              </span>
            ))}
          </div>
        )}

        <Btn primary onClick={addTask} disabled={!text.trim()} style={{ width: "100%" }}>+ Agregar tarea</Btn>
      </div>

      {/* Quick add from backlog */}
      {(() => {
        const bLists = backlog._lists || [];
        const hasItems = bLists.some((l) => (backlog[l.id] || []).length > 0);
        if (!hasItems) return null;
        return (
          <details style={{ marginBottom: "14px" }}>
            <summary style={{ fontSize: "11px", color: "#6B5540", cursor: "pointer", marginBottom: "8px" }}>📋 Jalar del backlog...</summary>
            <div style={{ maxHeight: "250px", overflowY: "auto" }}>
              {bLists.map((bl) => {
                const items = backlog[bl.id] || [];
                if (items.length === 0) return null;
                return (
                  <div key={bl.id}>
                    <div style={{ fontSize: "9px", color: "rgba(0,0,0,0.3)", letterSpacing: "0.08em", padding: "6px 0 3px", borderBottom: "1px solid rgba(0,0,0,0.03)" }}>{bl.name}</div>
                    {items.map((t) => {
                      const md = MODES.find((m) => m.id === t.mode);
                      const pri = PRIORITIES.find((p) => p.id === t.priority);
                      return (
                        <div key={t.id} onClick={() => {
                          setTasks([...tasks, { ...t, fromList: bl.id, scheduled: false }]);
                          setBacklog({ ...backlog, [bl.id]: (backlog[bl.id] || []).filter((x) => x.id !== t.id) });
                        }} style={{
                          padding: "7px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.01)",
                          border: "1px solid rgba(0,0,0,0.06)", cursor: "pointer", marginBottom: "3px",
                          display: "flex", alignItems: "center", gap: "8px",
                        }}>
                          <span style={{ fontSize: "9px" }}>{pri?.emoji}</span>
                          <span style={{ fontSize: "9px", color: md?.color }}>{md?.icon}</span>
                          <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.55)", flex: 1 }}>{t.text}</span>
                          <span style={{ fontSize: "9px", color: "rgba(0,0,0,0.25)" }}>{fmtMin(t.duration)}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </details>
        );
      })()}

      {/* Task list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {tasks.map((t) => {
          const md = MODES.find((m) => m.id === t.mode);
          const pri = PRIORITIES.find((p) => p.id === t.priority);
          const taskLocs = (t.locations || [t.location]).filter(Boolean).map((lid) => [...DEFAULT_LOCATIONS, ...locs].find((l) => l.id === lid)).filter(Boolean);
          const taskCustom = t.customLocations || (t.customLocation ? [t.customLocation] : []);
          return (
            <TaskCardWithSteps key={t.id} t={t} md={md} pri={pri} taskLocs={taskLocs} taskCustom={taskCustom} tasks={tasks} setTasks={setTasks} removeTask={removeTask} />
          );
        })}
      </div>
      {tasks.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "rgba(0,0,0,0.12)", fontSize: "12px" }}>Agrega tu primera tarea arriba</div>}
    </div>
  );
}

function TaskCardWithSteps({ t, md, pri, taskLocs, taskCustom, tasks, setTasks, removeTask }) {
  const [showSteps, setShowSteps] = useState(false);
  const [stepInput, setStepInput] = useState("");

  const steps = t.steps || [];
  const addStep = () => {
    if (!stepInput.trim()) return;
    const updated = tasks.map((x) => x.id === t.id ? { ...x, steps: [...steps, { id: uid(), text: stepInput.trim(), done: false }] } : x);
    setTasks(updated);
    setStepInput("");
  };
  const removeStep = (sid) => {
    setTasks(tasks.map((x) => x.id === t.id ? { ...x, steps: steps.filter((s) => s.id !== sid) } : x));
  };
  const toggleStep = (sid) => {
    setTasks(tasks.map((x) => x.id === t.id ? { ...x, steps: steps.map((s) => s.id === sid ? { ...s, done: !s.done } : s) } : x));
  };

  return (
    <div style={{
      padding: "10px 14px", borderRadius: "10px", background: "rgba(0,0,0,0.02)",
      border: "1px solid rgba(0,0,0,0.06)", borderLeft: `3px solid ${md?.color || "#555"}`,
      marginBottom: "4px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
            <span style={{ fontSize: "10px" }}>{pri?.emoji}</span>
            <span style={{ fontSize: "13px", color: "#1A1A1A", fontWeight: "500" }}>{t.text}</span>
          </div>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "8px", background: `${md?.color}15`, color: md?.color, border: `1px solid ${md?.color}30`, fontWeight: "600" }}>{md?.icon} {md?.label}</span>
            <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "8px", background: "rgba(0,0,0,0.03)", color: "rgba(0,0,0,0.4)" }}>{fmtMin(t.duration)}</span>
            {taskLocs.map((loc) => (
              <span key={loc.id} style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "8px", background: `${loc.color}10`, color: loc.color, border: `1px solid ${loc.color}25` }}>
                {loc.icon} {loc.label}
              </span>
            ))}
            {taskCustom.map((cl, i) => (
              <span key={i} style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "8px", background: "rgba(139,115,85,0.08)", color: "#6B5540", border: "1px solid rgba(200,176,122,0.2)" }}>
                📍 {cl}
              </span>
            ))}
            {t.timeFrom && <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "8px", background: "rgba(231,76,60,0.1)", color: "#E74C3C", ...SS.mono }}>{fmt12(t.timeFrom)}→{fmt12(t.timeTo)}</span>}
            {t.delegateTo && <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "8px", background: "rgba(52,152,219,0.1)", color: "#3498DB" }}>📤 {t.delegateTo}</span>}
          </div>
          {/* Develop task button - separate row */}
          <div onClick={(e) => { e.stopPropagation(); setShowSteps(!showSteps); }} style={{
            marginTop: "8px", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", transition: "all .15s",
            display: "flex", alignItems: "center", gap: "6px",
            background: steps.length > 0 ? "rgba(46,204,113,0.06)" : "rgba(0,0,0,0.02)",
            border: `1px solid ${steps.length > 0 ? "rgba(46,204,113,0.15)" : "rgba(0,0,0,0.08)"}`,
          }}>
            <span style={{ fontSize: "12px" }}>📝</span>
            <span style={{ fontSize: "11px", color: steps.length > 0 ? "#2ECC71" : "rgba(0,0,0,0.4)", fontWeight: "500" }}>
              {steps.length > 0 ? `Paso a paso (${steps.filter((s) => s.done).length}/${steps.length} completados)` : "Desarrollar tarea — agregar paso a paso"}
            </span>
            <span style={{ marginLeft: "auto", fontSize: "10px", color: "rgba(0,0,0,0.25)" }}>{showSteps ? "▾" : "▸"}</span>
          </div>
        </div>
        <span onClick={() => removeTask(t.id)} style={{ cursor: "pointer", color: "rgba(0,0,0,0.15)", fontSize: "14px", padding: "2px 4px" }}>×</span>
      </div>

      {/* Expandable steps */}
      {showSteps && (
        <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.35)", marginBottom: "6px" }}>
            Paso a paso: ¿cómo vas a cumplir esta tarea?
          </div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
            <input value={stepInput} onChange={(e) => setStepInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addStep()}
              placeholder="Describe un paso..."
              style={{ ...SS.input, flex: 1, fontSize: "11px", padding: "7px 10px" }} />
            <Btn small primary onClick={addStep} disabled={!stepInput.trim()}>+</Btn>
          </div>
          {steps.map((step, si) => (
            <div key={step.id} onClick={() => toggleStep(step.id)} style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "6px",
              background: step.done ? "rgba(46,204,113,0.04)" : "rgba(255,255,255,0.01)",
              border: `1px solid ${step.done ? "rgba(46,204,113,0.08)" : "rgba(0,0,0,0.03)"}`,
              marginBottom: "3px", cursor: "pointer", transition: "all .15s",
            }}>
              <span style={{ fontSize: "11px", width: "18px", flexShrink: 0, ...SS.mono, color: "rgba(0,0,0,0.25)" }}>{si + 1}.</span>
              <span style={{ fontSize: "12px", color: step.done ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.7)", flex: 1, textDecoration: step.done ? "line-through" : "none" }}>{step.done ? "✅" : "⬜"} {step.text}</span>
              <span onClick={(e) => { e.stopPropagation(); removeStep(step.id); }} style={{ fontSize: "12px", color: "rgba(0,0,0,0.1)", cursor: "pointer" }}>×</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --- Phase 2: Summary --- */
function Summary({ tasks, setTasks }) {
  const byMode = {};
  MODES.forEach((m) => { byMode[m.id] = { tasks: [], totalMin: 0 }; });
  tasks.forEach((t) => {
    if (!byMode[t.mode]) byMode[t.mode] = { tasks: [], totalMin: 0 };
    byMode[t.mode].tasks.push(t);
    byMode[t.mode].totalMin += t.duration;
  });

  const totalMin = tasks.reduce((s, t) => s + t.duration, 0);
  const scheduledTasks = tasks.filter((t) => t.timeFrom);
  const unscheduledTasks = tasks.filter((t) => !t.timeFrom);

  const hours = Array.from({ length: 17 }, (_, i) => i + 6);
  const timeToMin = (t) => { if (!t) return 0; const [h, m] = t.split(":").map(Number); return h * 60 + m; };

  const assignTime = (taskId, from, to) => {
    setTasks(tasks.map((t) => t.id === taskId ? { ...t, timeFrom: from, timeTo: to } : t));
  };
  const unassignTime = (taskId) => {
    setTasks(tasks.map((t) => t.id === taskId ? { ...t, timeFrom: null, timeTo: null } : t));
  };

  return (
    <div>
      <p style={{ color: "rgba(0,0,0,0.4)", fontSize: "12px", marginBottom: "16px" }}>
        Paso 2: Resumen de carga + asigna horarios a las tareas.
      </p>

      {/* Mode breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
        {MODES.map((m) => {
          const data = byMode[m.id];
          if (data.tasks.length === 0) return null;
          const pct = totalMin > 0 ? (data.totalMin / totalMin) * 100 : 0;
          return (
            <div key={m.id} style={{ padding: "12px 16px", borderRadius: "10px", background: `${m.color}08`, border: `1px solid ${m.color}18` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: m.color }}>{m.icon} {m.label}</span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: m.color, ...SS.mono }}>{fmtMin(data.totalMin)}</span>
              </div>
              <div style={{ height: "5px", borderRadius: "3px", background: "rgba(0,0,0,0.06)", marginBottom: "6px" }}>
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: "3px", background: m.color, transition: "width .3s" }} />
              </div>
              <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.35)" }}>
                {data.tasks.length} tarea{data.tasks.length > 1 ? "s" : ""}: {data.tasks.map((t) => t.text).join(", ")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(139,115,85,0.06)", border: "1px solid rgba(139,115,85,0.12)", marginBottom: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.35)", letterSpacing: "0.1em", marginBottom: "4px" }}>CARGA TOTAL DEL DÍA</div>
        <div style={{ fontSize: "28px", fontWeight: "700", color: "#6B5540", ...SS.mono }}>{fmtMin(totalMin)}</div>
        <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.3)", marginTop: "4px" }}>
          {tasks.length} tareas · {scheduledTasks.length} con horario · {unscheduledTasks.length} sin asignar
        </div>
      </div>

      {/* Visual timeline - proportional blocks */}
      <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.45)", marginBottom: "10px", fontWeight: "600", letterSpacing: "0.08em" }}>
        📅 LÍNEA DE TIEMPO
      </div>
      <TimelineGrid tasks={scheduledTasks} unassignTime={unassignTime} />

      {/* Unscheduled tasks - assign to timeline */}
      {unscheduledTasks.length > 0 && (
        <div>
          <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.45)", marginBottom: "10px", fontWeight: "600", letterSpacing: "0.08em" }}>
            ⏰ ASIGNAR HORARIO ({unscheduledTasks.length} tareas sin hora)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {unscheduledTasks.map((t) => {
              const md = MODES.find((m) => m.id === t.mode);
              const pri = PRIORITIES.find((p) => p.id === t.priority);
              return <UnscheduledTaskRow key={t.id} t={t} md={md} pri={pri} assignTime={assignTime} />;
            })}
          </div>
        </div>
      )}

      {tasks.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "rgba(0,0,0,0.12)", fontSize: "12px" }}>Agrega tareas en el Paso 1</div>}
    </div>
  );
}

function TimelineGrid({ tasks, unassignTime }) {
  const PX_PER_MIN = 1.2; // pixels per minute
  const timeToMin = (t) => { if (!t) return 0; const [h, m] = t.split(":").map(Number); return h * 60 + m; };

  if (tasks.length === 0) {
    return <div style={{ background: "rgba(0,0,0,0.02)", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.06)", padding: "30px", marginBottom: "20px", textAlign: "center", color: "rgba(0,0,0,0.15)", fontSize: "12px" }}>Asigna horarios para ver la línea de tiempo</div>;
  }

  // Find time range
  const allStarts = tasks.map((t) => timeToMin(t.timeFrom));
  const allEnds = tasks.map((t) => timeToMin(t.timeTo));
  const gridStart = Math.floor(Math.min(...allStarts) / 60) * 60; // round to hour
  const gridEnd = Math.ceil(Math.max(...allEnds) / 60) * 60;

  // Assign columns for overlapping tasks
  const sorted = [...tasks].sort((a, b) => timeToMin(a.timeFrom) - timeToMin(b.timeFrom));
  const columns = []; // array of { task, col, totalCols }
  const active = []; // track end times per column

  sorted.forEach((t) => {
    const start = timeToMin(t.timeFrom);
    const end = timeToMin(t.timeTo);
    // Find first free column
    let col = 0;
    while (col < active.length && active[col] > start) col++;
    if (col >= active.length) active.push(0);
    active[col] = end;
    columns.push({ task: t, col, start, end });
  });

  // Calculate max concurrent for each task
  const maxCol = active.length;

  // Hour labels
  const hourLabels = [];
  for (let m = gridStart; m < gridEnd; m += 60) hourLabels.push(m);

  const totalHeight = (gridEnd - gridStart) * PX_PER_MIN;

  return (
    <div style={{ background: "rgba(0,0,0,0.02)", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.06)", marginBottom: "20px", display: "flex", overflow: "hidden" }}>
      {/* Hour labels */}
      <div style={{ width: "42px", flexShrink: 0, position: "relative", borderRight: "1px solid rgba(0,0,0,0.04)" }}>
        {hourLabels.map((m) => (
          <div key={m} style={{
            position: "absolute", top: `${(m - gridStart) * PX_PER_MIN}px`,
            width: "100%", textAlign: "right", paddingRight: "8px",
            fontSize: "10px", color: "rgba(0,0,0,0.3)", ...SS.mono,
            transform: "translateY(-1px)",
          }}>
            {(() => { const hh = Math.floor(m / 60); const ampm = hh >= 12 ? "pm" : "am"; return (hh === 0 ? 12 : hh > 12 ? hh - 12 : hh) + ampm; })()}
          </div>
        ))}
      </div>

      {/* Grid area */}
      <div style={{ flex: 1, position: "relative", height: `${totalHeight}px`, minHeight: "120px" }}>
        {/* Hour lines */}
        {hourLabels.map((m) => (
          <div key={m} style={{
            position: "absolute", top: `${(m - gridStart) * PX_PER_MIN}px`,
            left: 0, right: 0, height: "1px", background: "rgba(0,0,0,0.05)",
          }} />
        ))}
        {/* Half hour lines */}
        {hourLabels.map((m) => (
          <div key={m + 30} style={{
            position: "absolute", top: `${(m + 30 - gridStart) * PX_PER_MIN}px`,
            left: 0, right: 0, height: "1px", background: "rgba(0,0,0,0.025)",
          }} />
        ))}

        {/* Task blocks */}
        {columns.map(({ task: t, col, start, end }) => {
          const md = MODES.find((m) => m.id === t.mode);
          const mColor = md?.color || "#E74C3C";
          const top = (start - gridStart) * PX_PER_MIN;
          const height = Math.max((end - start) * PX_PER_MIN, 28);
          const colWidth = 100 / maxCol;
          const left = col * colWidth;
          const isShort = height < 50;

          return (
            <div key={t.id} style={{
              position: "absolute",
              top: `${top}px`, left: `calc(${left}% + 2px)`, width: `calc(${colWidth}% - 4px)`,
              height: `${height}px`,
              background: `${mColor}15`, borderLeft: `3px solid ${mColor}`,
              borderRadius: "6px", padding: isShort ? "2px 8px" : "6px 8px",
              overflow: "hidden", cursor: "default", transition: "all .15s",
              display: "flex", flexDirection: isShort ? "row" : "column", gap: isShort ? "6px" : "2px",
              alignItems: isShort ? "center" : "flex-start",
            }}>
              <span style={{ fontSize: "9px", color: mColor, fontWeight: "700", ...SS.mono, flexShrink: 0 }}>
                {fmt12(t.timeFrom)}→{fmt12(t.timeTo)}
              </span>
              <span style={{
                fontSize: isShort ? "10px" : "11px", color: "rgba(0,0,0,0.75)", fontWeight: "500",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: isShort ? "nowrap" : "normal",
                lineHeight: "1.3", flex: 1,
              }}>
                {md?.icon} {t.text}
              </span>
              {!isShort && (
                <span style={{ fontSize: "9px", color: "rgba(0,0,0,0.3)", ...SS.mono }}>{fmtMin(t.duration)}</span>
              )}
              <span onClick={() => unassignTime(t.id)} style={{
                position: "absolute", top: "3px", right: "6px",
                fontSize: "10px", cursor: "pointer", color: "rgba(0,0,0,0.2)",
              }}>✕</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UnscheduledTaskRow({ t, md, pri, assignTime }) {
  const [from, setFrom] = useState("");

  const doAssign = () => {
    if (!from) return;
    const startMin = parseInt(from.split(":")[0]) * 60 + parseInt(from.split(":")[1]);
    const endMin = startMin + t.duration;
    const endH = Math.floor(endMin / 60).toString().padStart(2, "0");
    const endM = (endMin % 60).toString().padStart(2, "0");
    assignTime(t.id, from, `${endH}:${endM}`);
  };

  return (
    <div style={{
      padding: "8px 12px", borderRadius: "8px",
      background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(0,0,0,0.08)",
      display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap",
    }}>
      <span style={{ fontSize: "10px" }}>{pri?.emoji}</span>
      <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "6px", background: `${md?.color}12`, color: md?.color }}>{md?.icon}</span>
      <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.6)", flex: "1 1 120px", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.text}</span>
      <span style={{ fontSize: "9px", color: "rgba(0,0,0,0.25)", ...SS.mono }}>{fmtMin(t.duration)}</span>
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <span style={{ fontSize: "9px", color: "rgba(0,0,0,0.3)" }}>Inicio:</span>
        <input type="time" value={from} onChange={(e) => setFrom(e.target.value)}
          style={{ ...SS.input, width: "80px", padding: "4px 6px", fontSize: "11px", ...SS.mono }} />
        <Btn small primary onClick={doAssign} disabled={!from} style={{ padding: "4px 10px", fontSize: "10px" }}>✓</Btn>
      </div>
    </div>
  );
}

/* --- Phase 3: Plan --- */
function Plan({ tasks, setTasks, locs }) {
  const timeToMin = (t) => { if (!t) return 9999; const [h, m] = t.split(":").map(Number); return h * 60 + m; };

  const scheduled = [...tasks.filter((t) => t.timeFrom)].sort((a, b) => timeToMin(a.timeFrom) - timeToMin(b.timeFrom));
  const unscheduled = tasks.filter((t) => !t.timeFrom);

  const toggleDone = (id) => setTasks(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const toggleStep = (taskId, stepId) => {
    setTasks(tasks.map((t) => t.id === taskId ? { ...t, steps: (t.steps || []).map((s) => s.id === stepId ? { ...s, done: !s.done } : s) } : t));
  };

  const doneCount = tasks.filter((t) => t.done).length;
  const totalSteps = tasks.reduce((s, t) => s + (t.steps || []).length, 0);
  const doneSteps = tasks.reduce((s, t) => s + (t.steps || []).filter((st) => st.done).length, 0);

  const copyPlan = () => {
    let txt = `📋 PLAN DEL DÍA\n${"═".repeat(30)}\n\n`;
    if (scheduled.length > 0) {
      txt += "CRONOGRAMA\n" + "─".repeat(25) + "\n";
      scheduled.forEach((t) => {
        const pri = PRIORITIES.find((p) => p.id === t.priority);
        const md = MODES.find((m) => m.id === t.mode);
        txt += `  ${fmt12(t.timeFrom)}→${fmt12(t.timeTo)}  ${pri?.emoji} ${md?.icon} ${t.text} [${fmtMin(t.duration)}]\n`;
        (t.steps || []).forEach((s, i) => { txt += `    ${i + 1}. ${s.done ? "✅" : "⬜"} ${s.text}\n`; });
      });
      txt += "\n";
    }
    if (unscheduled.length > 0) {
      txt += "SIN HORARIO ASIGNADO\n" + "─".repeat(25) + "\n";
      unscheduled.forEach((t) => {
        const pri = PRIORITIES.find((p) => p.id === t.priority);
        const md = MODES.find((m) => m.id === t.mode);
        txt += `  ${pri?.emoji} ${md?.icon} ${t.text} [${fmtMin(t.duration)}]\n`;
      });
    }
    navigator.clipboard?.writeText(txt);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <p style={{ color: "rgba(0,0,0,0.4)", fontSize: "12px" }}>Paso 3: Ejecuta tu día en orden.</p>
        <Btn small onClick={copyPlan}>📋 Copiar</Btn>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(139,115,85,0.04)", border: "1px solid rgba(139,115,85,0.1)", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.45)" }}>Progreso</span>
            <span style={{ fontSize: "11px", color: "#6B5540", ...SS.mono }}>{doneCount}/{tasks.length} tareas{totalSteps > 0 ? ` · ${doneSteps}/${totalSteps} pasos` : ""}</span>
          </div>
          <div style={{ height: "6px", borderRadius: "3px", background: "rgba(0,0,0,0.06)" }}>
            <div style={{ height: "100%", width: `${tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0}%`, borderRadius: "3px", background: "linear-gradient(90deg, #6B5540, #2ECC71)", transition: "width .3s" }} />
          </div>
        </div>
      )}

      {/* Scheduled tasks - chronological */}
      {scheduled.map((t) => <PlanTaskCard key={t.id} t={t} locs={locs} toggleDone={toggleDone} toggleStep={toggleStep} />)}

      {/* Unscheduled */}
      {unscheduled.length > 0 && (
        <div style={{ marginTop: scheduled.length > 0 ? "16px" : "0" }}>
          <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.3)", letterSpacing: "0.08em", marginBottom: "8px", paddingBottom: "6px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            SIN HORARIO ASIGNADO ({unscheduled.length})
          </div>
          {unscheduled.map((t) => <PlanTaskCard key={t.id} t={t} locs={locs} toggleDone={toggleDone} toggleStep={toggleStep} />)}
        </div>
      )}

      {tasks.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "rgba(0,0,0,0.12)", fontSize: "12px" }}>Agrega tareas en el Paso 1</div>}
    </div>
  );
}

function PlanTaskCard({ t, locs, toggleDone, toggleStep }) {
  const [expanded, setExpanded] = useState(false);
  const md = MODES.find((m) => m.id === t.mode);
  const pri = PRIORITIES.find((p) => p.id === t.priority);
  const steps = t.steps || [];
  const stepsDone = steps.filter((s) => s.done).length;
  const mColor = md?.color || "#555";
  const allLocs = [...DEFAULT_LOCATIONS, ...(locs || [])];

  return (
    <div style={{
      borderRadius: "10px", marginBottom: "6px", overflow: "hidden", transition: "all .2s",
      background: t.done ? "rgba(46,204,113,0.03)" : "rgba(0,0,0,0.02)",
      border: `1px solid ${t.done ? "rgba(46,204,113,0.1)" : "rgba(0,0,0,0.06)"}`,
      borderLeft: `3px solid ${t.done ? "#2ECC71" : mColor}`,
      opacity: t.done ? 0.55 : 1,
    }}>
      {/* Main row */}
      <div style={{ padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          {/* Time column */}
          {t.timeFrom && (
            <div style={{ flexShrink: 0, textAlign: "center", minWidth: "48px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: mColor, ...SS.mono }}>{fmt12(t.timeFrom)}</div>
              <div style={{ fontSize: "9px", color: "rgba(0,0,0,0.25)", ...SS.mono }}>{fmt12(t.timeTo)}</div>
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <span onClick={(e) => { e.stopPropagation(); toggleDone(t.id); }} style={{ fontSize: "16px", cursor: "pointer", flexShrink: 0 }}>
                {t.done ? "✅" : "⬜"}
              </span>
              <span style={{ fontSize: "14px", color: "#1A1A1A", fontWeight: "500", textDecoration: t.done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.text}</span>
            </div>

            {/* Tags */}
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginLeft: "24px" }}>
              <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "8px", background: `${mColor}15`, color: mColor, fontWeight: "600" }}>{md?.icon} {md?.label}</span>
              <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "8px", background: "rgba(0,0,0,0.03)", color: "rgba(0,0,0,0.35)" }}>{fmtMin(t.duration)}</span>
              {(t.locations || [t.location]).filter(Boolean).map((lid) => {
                const loc = allLocs.find((l) => l.id === lid);
                return loc ? <span key={loc.id} style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "8px", background: `${loc.color}10`, color: loc.color }}>{loc.icon} {loc.label}</span> : null;
              })}
              {(t.customLocations || []).map((cl, i) => (
                <span key={i} style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "8px", background: "rgba(139,115,85,0.08)", color: "#6B5540" }}>📍 {cl}</span>
              ))}
              {t.delegateTo && <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "8px", background: "rgba(52,152,219,0.08)", color: "#3498DB" }}>📤 {t.delegateTo}</span>}
            </div>

            {/* Steps toggle */}
            {steps.length > 0 && (
              <div onClick={() => setExpanded(!expanded)} style={{
                marginTop: "8px", marginLeft: "24px", padding: "5px 10px", borderRadius: "6px", cursor: "pointer",
                background: "rgba(46,204,113,0.04)", border: "1px solid rgba(46,204,113,0.1)",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                <span style={{ fontSize: "11px" }}>📝</span>
                <span style={{ fontSize: "11px", color: "#2ECC71", flex: 1 }}>Paso a paso ({stepsDone}/{steps.length})</span>
                {/* Mini progress */}
                <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "rgba(0,0,0,0.08)" }}>
                  <div style={{ height: "100%", width: `${steps.length > 0 ? (stepsDone / steps.length) * 100 : 0}%`, borderRadius: "2px", background: "#2ECC71", transition: "width .2s" }} />
                </div>
                <span style={{ fontSize: "10px", color: "rgba(0,0,0,0.25)" }}>{expanded ? "▾" : "▸"}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded steps */}
      {expanded && steps.length > 0 && (
        <div style={{ padding: "0 14px 12px", paddingLeft: t.timeFrom ? "72px" : "38px" }}>
          {steps.map((step, si) => (
            <div key={step.id} onClick={() => toggleStep(t.id, step.id)} style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", borderRadius: "6px",
              background: step.done ? "rgba(46,204,113,0.04)" : "rgba(255,255,255,0.01)",
              border: `1px solid ${step.done ? "rgba(46,204,113,0.08)" : "rgba(0,0,0,0.03)"}`,
              marginBottom: "3px", cursor: "pointer", transition: "all .15s",
            }}>
              <span style={{ fontSize: "14px", flexShrink: 0 }}>{step.done ? "✅" : "⬜"}</span>
              <span style={{ fontSize: "12px", color: step.done ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.7)", flex: 1, textDecoration: step.done ? "line-through" : "none" }}>{step.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   WEEK VIEW
   ═══════════════════════════════════════ */
function WeekView({ days, setSelDay }) {
  const [off, setOff] = useState(0);
  const getWeek = () => {
    const now = new Date(); const mo = (now.getDay() + 6) % 7;
    const mon = new Date(now); mon.setDate(now.getDate() - mo + off * 7);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
  };
  const week = getWeek();
  const dayN = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const tk = todayKey();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <Btn small onClick={() => setOff(off - 1)}>←</Btn>
        <span style={{ fontSize: "14px", fontWeight: "600" }}>Semana</span>
        <div style={{ display: "flex", gap: "6px" }}>
          <Btn small onClick={() => setOff(0)}>Hoy</Btn>
          <Btn small onClick={() => setOff(off + 1)}>→</Btn>
        </div>
      </div>
      {week.map((date) => {
        const dk = dateKey(date);
        const data = days[dk] || { tasks: [] };
        const tasks = data.tasks || [];
        const totalMin = tasks.reduce((s, t) => s + (t.duration || 30), 0);
        const cap = Math.min(totalMin / 600, 1);
        const isToday = dk === tk;
        const capC = cap > 0.9 ? "#E74C3C" : cap > 0.7 ? "#E8A838" : cap > 0.4 ? "#6B5540" : "#2ECC71";
        const doneCount = tasks.filter((t) => t.done).length;

        return (
          <div key={dk} onClick={() => setSelDay(dk)} style={{
            padding: "12px 14px", borderRadius: "10px", cursor: "pointer", marginBottom: "5px", transition: "all .2s",
            background: isToday ? "rgba(139,115,85,0.06)" : "rgba(0,0,0,0.02)",
            border: isToday ? "1.5px solid rgba(139,115,85,0.2)" : "1px solid rgba(0,0,0,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "44px" }}>
                <div style={{ fontSize: "11px", color: isToday ? "#6B5540" : "rgba(0,0,0,0.4)", fontWeight: "600" }}>{dayN[date.getDay()]}</div>
                <div style={{ fontSize: "17px", fontWeight: "700", color: isToday ? "#6B5540" : "#FAFAFA", ...SS.mono }}>{date.getDate()}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "10px", color: "rgba(0,0,0,0.35)" }}>
                    {tasks.length} tareas{doneCount > 0 ? ` · ✓${doneCount}` : ""}
                  </span>
                  <span style={{ fontSize: "10px", color: capC, ...SS.mono }}>{fmtMin(totalMin)} / 10h</span>
                </div>
                <div style={{ height: "5px", borderRadius: "3px", background: "rgba(0,0,0,0.06)" }}>
                  <div style={{ height: "100%", width: `${cap * 100}%`, borderRadius: "3px", background: capC, transition: "width .3s" }} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════
   BACKLOG — custom lists, full task input
   ═══════════════════════════════════════ */
function BacklogView({ backlog, setBacklog, locs }) {
  // Lists management
  const lists = backlog._lists || [];
  const [activeList, setActiveList] = useState(lists[0]?.id || "");
  const [newListName, setNewListName] = useState("");
  const [showNewList, setShowNewList] = useState(false);

  // Task input state
  const [text, setText] = useState("");
  const [mode, setMode] = useState("quick");
  const [dur, setDur] = useState(30);
  const [pri, setPri] = useState("medium");
  const [selLocs, setSelLocs] = useState([]);
  const [customLocs, setCustomLocs] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [delegateTo, setDelegateTo] = useState("");

  const toggleLoc = (id) => setSelLocs(selLocs.includes(id) ? selLocs.filter((l) => l !== id) : [...selLocs, id]);
  const addCustomLoc = () => { if (customInput.trim()) { setCustomLocs([...customLocs, customInput.trim()]); setCustomInput(""); } };
  const removeCustomLoc = (i) => setCustomLocs(customLocs.filter((_, idx) => idx !== i));

  const allLocs = [...DEFAULT_LOCATIONS, ...locs];

  // List CRUD
  const addList = () => {
    if (!newListName.trim()) return;
    const id = uid();
    const updated = { ...backlog, _lists: [...lists, { id, name: newListName.trim(), color: CUSTOM_COLORS[lists.length % CUSTOM_COLORS.length] }] };
    updated[id] = [];
    setBacklog(updated);
    setActiveList(id);
    setNewListName(""); setShowNewList(false);
  };
  const removeList = (id) => {
    const { [id]: _, ...rest } = backlog;
    rest._lists = lists.filter((l) => l.id !== id);
    setBacklog(rest);
    if (activeList === id) setActiveList(rest._lists[0]?.id || "");
  };

  const items = backlog[activeList] || [];
  const activeListObj = lists.find((l) => l.id === activeList);

  // Add task
  const addTask = () => {
    if (!text.trim() || !activeList) return;
    const task = {
      id: uid(), text: text.trim(), mode, duration: dur, priority: pri,
      locations: selLocs, customLocations: customLocs.length > 0 ? customLocs : null,
      delegateTo: mode === "delegar" ? (delegateTo || null) : null,
      createdAt: new Date().toISOString(),
    };
    setBacklog({ ...backlog, [activeList]: [...items, task] });
    setText(""); setSelLocs([]); setCustomLocs([]); setCustomInput(""); setDelegateTo("");
  };
  const removeTask = (id) => setBacklog({ ...backlog, [activeList]: items.filter((t) => t.id !== id) });

  const priOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...items].sort((a, b) => (priOrder[a.priority] ?? 4) - (priOrder[b.priority] ?? 4));

  // Expand/collapse task input
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "4px" }}>Backlog</h2>
      <p style={{ color: "rgba(0,0,0,0.35)", fontSize: "12px", marginBottom: "14px" }}>Tu inventario de tareas pendientes. Desde aquí las programas a un día.</p>

      {/* List tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap", alignItems: "center" }}>
        {lists.map((l) => {
          const count = (backlog[l.id] || []).length;
          return (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "0" }}>
              <Tab active={activeList === l.id} onClick={() => setActiveList(l.id)}>
                {l.name} {count > 0 && <span style={{ opacity: 0.6, ...SS.mono, fontSize: "10px" }}>({count})</span>}
              </Tab>
              {activeList === l.id && (
                <span onClick={(e) => { e.stopPropagation(); removeList(l.id); }}
                  style={{ fontSize: "11px", color: "rgba(0,0,0,0.15)", cursor: "pointer", marginLeft: "-6px", padding: "0 4px" }}>×</span>
              )}
            </div>
          );
        })}
        {/* New list */}
        {showNewList ? (
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <input value={newListName} onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addList()}
              placeholder="Nombre de lista..."
              autoFocus
              style={{ ...SS.input, fontSize: "11px", padding: "6px 10px", width: "140px" }} />
            <Btn small primary onClick={addList} disabled={!newListName.trim()}>✓</Btn>
            <span onClick={() => { setShowNewList(false); setNewListName(""); }} style={{ cursor: "pointer", color: "rgba(0,0,0,0.25)", fontSize: "14px" }}>×</span>
          </div>
        ) : (
          <div onClick={() => setShowNewList(true)} style={{
            padding: "6px 14px", borderRadius: "18px", fontSize: "11px", cursor: "pointer",
            border: "1px dashed rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.35)",
          }}>+ Nueva lista</div>
        )}
      </div>

      {/* No lists state */}
      {lists.length === 0 && (
        <div style={{ textAlign: "center", padding: "50px 20px", color: "rgba(0,0,0,0.15)" }}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>📋</div>
          <div style={{ fontSize: "13px", marginBottom: "4px" }}>Crea tu primera lista</div>
          <div style={{ fontSize: "11px" }}>Ej: "Urgente", "Cobros", "Proyectos", "Ideas"</div>
        </div>
      )}

      {/* Active list content */}
      {activeList && activeListObj && (
        <div>
          {/* Add task toggle */}
          <div onClick={() => setShowForm(!showForm)} style={{
            padding: "10px 14px", borderRadius: "10px", cursor: "pointer", marginBottom: showForm ? "0" : "14px",
            background: showForm ? "rgba(139,115,85,0.06)" : "rgba(0,0,0,0.02)",
            border: showForm ? "1px solid rgba(139,115,85,0.12)" : "1px solid rgba(0,0,0,0.06)",
            borderBottomLeftRadius: showForm ? "0" : "10px", borderBottomRightRadius: showForm ? "0" : "10px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <span style={{ fontSize: "14px" }}>{showForm ? "▾" : "▸"}</span>
            <span style={{ fontSize: "12px", color: showForm ? "#6B5540" : "rgba(0,0,0,0.45)" }}>Agregar tarea a "{activeListObj.name}"</span>
          </div>

          {/* Task input form */}
          {showForm && (
            <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "14px", marginBottom: "14px" }}>
              {/* Text */}
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && text.trim() && addTask()}
                placeholder="¿Qué hay que hacer?" style={{ ...SS.input, width: "100%", border: "none", borderBottom: "1px solid rgba(0,0,0,0.08)", borderRadius: 0, padding: "8px 0", marginBottom: "12px", fontSize: "14px" }} />

              {/* Mode pills */}
              <div style={SS.label}>MODO</div>
              <div style={{ display: "flex", gap: "5px", marginBottom: "12px", flexWrap: "wrap" }}>
                {MODES.map((m) => (
                  <div key={m.id} onClick={() => setMode(m.id)} style={{
                    padding: "5px 11px", borderRadius: "14px", fontSize: "11px", cursor: "pointer", transition: "all .15s",
                    background: mode === m.id ? `${m.color}20` : "rgba(0,0,0,0.02)",
                    border: `1px solid ${mode === m.id ? m.color + "60" : "rgba(0,0,0,0.08)"}`,
                    color: mode === m.id ? m.color : "rgba(0,0,0,0.45)", fontWeight: mode === m.id ? "600" : "400",
                  }}>{m.icon} {m.label}</div>
                ))}
              </div>

              {/* Delegar name */}
              {mode === "delegar" && (
                <div style={{ marginBottom: "12px" }}>
                  <span style={SS.label}>DELEGAR A:</span>
                  <input value={delegateTo} onChange={(e) => setDelegateTo(e.target.value)}
                    placeholder="Nombre de la persona..." style={{ ...SS.input, marginLeft: "8px", width: "200px", fontSize: "12px" }} />
                </div>
              )}

              {/* Duration + Priority */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                <div>
                  <div style={SS.label}>⏱️ TIEMPO</div>
                  <select value={dur} onChange={(e) => setDur(parseInt(e.target.value))} style={SS.select}>
                    {[10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 300, 360].map((d) => <option key={d} value={d}>{fmtMin(d)}</option>)}
                  </select>
                </div>
                <div>
                  <div style={SS.label}>🎯 PRIORIDAD</div>
                  <select value={pri} onChange={(e) => setPri(e.target.value)} style={SS.select}>
                    {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Locations multi-select */}
              <div style={SS.label}>📍 LUGARES</div>
              <div style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", gap: "4px", marginBottom: "6px", flexWrap: "wrap" }}>
                  {allLocs.map((l) => (
                    <div key={l.id} onClick={() => toggleLoc(l.id)} style={{
                      padding: "4px 10px", borderRadius: "12px", fontSize: "10px", cursor: "pointer", transition: "all .15s",
                      background: selLocs.includes(l.id) ? `${l.color}20` : "rgba(0,0,0,0.02)",
                      border: `1px solid ${selLocs.includes(l.id) ? l.color + "50" : "rgba(0,0,0,0.08)"}`,
                      color: selLocs.includes(l.id) ? l.color : "rgba(0,0,0,0.4)",
                      fontWeight: selLocs.includes(l.id) ? "600" : "400",
                    }}>{l.icon} {l.label}{l.cafeType ? ` (${CAFE_TYPES[l.cafeType]})` : ""}</div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                  <input value={customInput} onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomLoc())}
                    placeholder="📍 Lugar puntual..." style={{ ...SS.input, flex: "1 1 160px", fontSize: "10px", padding: "6px 10px" }} />
                  <Btn small onClick={addCustomLoc} disabled={!customInput.trim()}>+</Btn>
                </div>
                {customLocs.length > 0 && (
                  <div style={{ display: "flex", gap: "4px", marginTop: "6px", flexWrap: "wrap" }}>
                    {customLocs.map((cl, i) => (
                      <span key={i} style={{ padding: "3px 8px", borderRadius: "10px", fontSize: "10px", background: "rgba(139,115,85,0.1)", border: "1px solid rgba(139,115,85,0.2)", color: "#6B5540", display: "flex", alignItems: "center", gap: "4px" }}>
                        📍 {cl} <span onClick={() => removeCustomLoc(i)} style={{ cursor: "pointer", opacity: 0.6 }}>×</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Btn primary onClick={addTask} disabled={!text.trim()} style={{ width: "100%", marginTop: "4px" }}>+ Agregar tarea</Btn>
            </div>
          )}

          {/* Task list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {sorted.map((t) => {
              const md = MODES.find((m) => m.id === t.mode);
              const p = PRIORITIES.find((x) => x.id === t.priority);
              const taskLocs = (t.locations || []).map((lid) => allLocs.find((l) => l.id === lid)).filter(Boolean);
              const taskCustom = t.customLocations || [];
              return (
                <div key={t.id} style={{
                  padding: "10px 12px", borderRadius: "10px", background: "rgba(0,0,0,0.02)",
                  border: "1px solid rgba(0,0,0,0.06)", borderLeft: `3px solid ${md?.color || "#555"}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                        <span style={{ fontSize: "10px" }}>{p?.emoji}</span>
                        <span style={{ fontSize: "13px", color: "#1A1A1A", fontWeight: "500" }}>{t.text}</span>
                      </div>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "8px", background: `${md?.color}15`, color: md?.color, border: `1px solid ${md?.color}30`, fontWeight: "600" }}>{md?.icon} {md?.label}</span>
                        <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "8px", background: "rgba(0,0,0,0.03)", color: "rgba(0,0,0,0.4)" }}>{fmtMin(t.duration)}</span>
                        {taskLocs.map((loc) => (
                          <span key={loc.id} style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "8px", background: `${loc.color}10`, color: loc.color, border: `1px solid ${loc.color}20` }}>{loc.icon} {loc.label}</span>
                        ))}
                        {taskCustom.map((cl, i) => (
                          <span key={i} style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "8px", background: "rgba(139,115,85,0.08)", color: "#6B5540" }}>📍 {cl}</span>
                        ))}
                        {t.delegateTo && <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "8px", background: "rgba(52,152,219,0.08)", color: "#3498DB" }}>📤 {t.delegateTo}</span>}
                      </div>
                    </div>
                    <span onClick={() => removeTask(t.id)} style={{ cursor: "pointer", color: "rgba(0,0,0,0.15)", fontSize: "14px", padding: "2px 4px" }}>×</span>
                  </div>
                </div>
              );
            })}
          </div>

          {items.length === 0 && <div style={{ textAlign: "center", padding: "30px", color: "rgba(0,0,0,0.12)", fontSize: "12px" }}>Lista vacía — agrega tareas arriba</div>}

          {/* Stats */}
          {items.length > 0 && (
            <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.01)", fontSize: "11px", color: "rgba(0,0,0,0.25)", display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <span>{items.length} tareas</span>
              <span>{fmtMin(items.reduce((s, t) => s + t.duration, 0))} total</span>
              <span>{items.filter((t) => t.priority === "critical").length} críticas</span>
              {Object.entries(items.reduce((acc, t) => { acc[t.mode] = (acc[t.mode] || 0) + 1; return acc; }, {})).map(([m, c]) => {
                const md = MODES.find((x) => x.id === m);
                return <span key={m} style={{ color: md?.color }}>{md?.icon} {c}</span>;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   LOCATIONS MANAGER
   ═══════════════════════════════════════ */
function LocView({ locs, setLocs }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📍");
  const [type, setType] = useState("custom");
  const [cafeType, setCafeType] = useState("deepwork");
  const [note, setNote] = useState("");
  const colors = ["#E67E22", "#1ABC9C", "#9B59B6", "#F39C12", "#16A085", "#E91E63", "#00BCD4"];
  const [color, setColor] = useState(colors[0]);

  const add = () => {
    if (!name.trim()) return;
    setLocs([...locs, { id: uid(), label: name.trim(), icon, color, type, cafeType: type === "cafe" ? cafeType : undefined, note: note || undefined }]);
    setName(""); setNote("");
  };

  return (
    <div>
      <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px" }}>Lugares</h2>
      <p style={{ color: "rgba(0,0,0,0.35)", fontSize: "12px", marginBottom: "14px" }}>Lugares fijos + tus personalizados</p>

      {/* Default locations */}
      <div style={{ marginBottom: "16px" }}>
        {DEFAULT_LOCATIONS.map((l) => (
          <div key={l.id} style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "3px", background: `${l.color}06`, border: `1px solid ${l.color}15`, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>{l.icon}</span>
            <span style={{ fontSize: "13px", color: "#1A1A1A", flex: 1 }}>{l.label}</span>
            {l.cafeType && <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "8px", background: `${l.color}15`, color: l.color }}>{CAFE_TYPES[l.cafeType]}</span>}
            {l.note && <span style={{ fontSize: "9px", color: "rgba(0,0,0,0.25)", fontStyle: "italic", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.note}</span>}
            <span style={{ fontSize: "9px", color: "rgba(0,0,0,0.15)" }}>fijo</span>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "10px", padding: "12px", marginBottom: "14px" }}>
        <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
          <input value={icon} onChange={(e) => setIcon(e.target.value)} style={{ ...SS.input, width: "45px", textAlign: "center", fontSize: "16px" }} />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del lugar" style={{ ...SS.input, flex: "1 1 150px" }} />
          <select value={type} onChange={(e) => setType(e.target.value)} style={SS.select}>
            <option value="custom">Lugar</option>
            <option value="cafe">Café</option>
          </select>
          {type === "cafe" && (
            <select value={cafeType} onChange={(e) => setCafeType(e.target.value)} style={SS.select}>
              {Object.entries(CAFE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          )}
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
          {colors.map((c) => <div key={c} onClick={() => setColor(c)} style={{ width: "20px", height: "20px", borderRadius: "50%", background: c, cursor: "pointer", border: color === c ? "2px solid #fff" : "2px solid transparent" }} />)}
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota (opcional)" style={{ ...SS.input, flex: "1 1 120px", fontSize: "11px" }} />
          <Btn primary onClick={add} disabled={!name.trim()} small>+</Btn>
        </div>
      </div>

      {/* Custom locations */}
      {locs.map((l) => (
        <div key={l.id} style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "3px", background: `${l.color}06`, border: `1px solid ${l.color}15`, display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>{l.icon}</span>
          <span style={{ fontSize: "13px", color: "#1A1A1A", flex: 1 }}>{l.label}</span>
          {l.cafeType && <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "8px", background: `${l.color}15`, color: l.color }}>{CAFE_TYPES[l.cafeType]}</span>}
          {l.note && <span style={{ fontSize: "9px", color: "rgba(0,0,0,0.25)", fontStyle: "italic" }}>{l.note}</span>}
          <span onClick={() => setLocs(locs.filter((x) => x.id !== l.id))} style={{ cursor: "pointer", color: "rgba(0,0,0,0.15)", fontSize: "14px" }}>×</span>
        </div>
      ))}
    </div>
  );
}
