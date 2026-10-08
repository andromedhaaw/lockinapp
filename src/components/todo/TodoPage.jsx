import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Plus, CheckCircle2, Circle, Hash, Flame, ArrowRight,
  LayoutPanelLeft, // view mode (split)
  Columns2,        // fallback
  Leaf,            // zen
  Wind,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────
const todayDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const addDays = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
const fmt12 = (h) => {
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:00 ${ampm}`;
};

const FILTERS = ['Overdue', 'Today', 'Tomorrow', 'Upcoming'];
const FILTER_COLOR = {
  Overdue:  { bg: '#fff0f0', text: '#e53e3e', dot: '#e53e3e' },
  Today:    { bg: '#fff8ed', text: '#dd6b20', dot: '#ed8936' },
  Tomorrow: { bg: '#f0fdf4', text: '#276749', dot: '#48bb78' },
  Upcoming: { bg: '#eef2ff', text: '#3730a3', dot: '#6366f1' },
};
const PRIORITY_TAG = {
  High:   { color: '#e53e3e', bg: '#fff0f0', label: 'high' },
  Medium: { color: '#dd6b20', bg: '#fff8ed', label: 'medium' },
  Low:    { color: '#276749', bg: '#f0fdf4', label: 'low' },
  None:   null,
};
// Calendar event colors per tag
const TAG_COLORS = {
  work:          { bg: '#c7d2fe', text: '#3730a3' },
  product:       { bg: '#a7f3d0', text: '#065f46' },
  finance:       { bg: '#fde68a', text: '#92400e' },
  admin:         { bg: '#fbcfe8', text: '#9d174d' },
  'daily inboxes': { bg: '#bfdbfe', text: '#1e40af' },
  legal:         { bg: '#e9d5ff', text: '#6b21a8' },
};

const INITIAL_TASKS = [
  { id: 1,  title: 'Send Northwind the revised SOW',             due: todayDate(),             priority: 'High',   done: false, tag: 'work',          startHour: 8,  durationH: 1 },
  { id: 2,  title: 'Confirm the migration cutover weekend',      due: todayDate(),             priority: 'High',   done: false, tag: 'product',       startHour: 9,  durationH: 1 },
  { id: 3,  title: 'Get a fresh PO number from finance',         due: todayDate(),             priority: 'Medium', done: false, tag: 'finance',       startHour: 10, durationH: 1 },
  { id: 4,  title: 'Hold the offsite week in the team calendar', due: todayDate(),             priority: 'Low',    done: false, tag: 'admin',         startHour: 11, durationH: 2 },
  { id: 5,  title: 'Read the board brief before Thursday',       due: todayDate(),             priority: 'None',   done: false, tag: 'daily inboxes', startHour: 14, durationH: 1 },
  { id: 6,  title: 'Review Q3 budget spreadsheet',               due: addDays(todayDate(), 1), priority: 'High',   done: false, tag: 'finance',       startHour: 9,  durationH: 1 },
  { id: 7,  title: 'Send team survey link',                      due: addDays(todayDate(), 1), priority: 'Low',    done: false, tag: 'work',          startHour: 11, durationH: 1 },
  { id: 8,  title: 'Draft roadmap for next quarter',             due: addDays(todayDate(), 5), priority: 'Medium', done: false, tag: 'product',       startHour: 10, durationH: 2 },
  { id: 9,  title: 'Follow up on legal review',                  due: addDays(todayDate(),-1), priority: 'High',   done: false, tag: 'legal',         startHour: 13, durationH: 1 },
];

let nextId = 100;

function dueLabel(d) {
  const t = todayDate(); const tom = addDays(t, 1);
  if (d < t)                         return 'Overdue';
  if (d.getTime() === t.getTime())   return 'Today';
  if (d.getTime() === tom.getTime()) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── sub-components ───────────────────────────────────────────────────────────
function FilterPill({ label, count, active, onClick }) {
  const c = FILTER_COLOR[label];
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: active ? '7px 16px' : '7px 14px', borderRadius: 99,
      border: active ? `1.5px solid ${c.dot}` : '1.5px solid #e5e7eb',
      background: active ? c.bg : '#ffffff', color: active ? c.text : '#6b7280',
      fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer',
      transition: 'all .15s', whiteSpace: 'nowrap',
      boxShadow: active ? `0 2px 8px ${c.dot}33` : '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {active && <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />}
      {label}
      {count > 0 && (
        <span style={{
          minWidth: 20, height: 20, borderRadius: 99, padding: '0 6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: active ? c.dot : '#f3f4f6', color: active ? '#fff' : '#6b7280',
          fontSize: 11, fontWeight: 700,
        }}>{count}</span>
      )}
    </button>
  );
}

function TagChip({ tag }) {
  if (!tag) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      padding: '2px 8px', borderRadius: 99,
      background: '#f3f4f6', color: '#6366f1', fontSize: 11, fontWeight: 600,
    }}>
      <Hash style={{ width: 10, height: 10, strokeWidth: 2.5 }} />
      {tag}
    </span>
  );
}

function PriorityChip({ priority }) {
  const p = PRIORITY_TAG[priority];
  if (!p) return null;
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 99, background: p.bg, color: p.color,
      fontSize: 11, fontWeight: 700, border: `1px solid ${p.color}33`,
    }}>{p.label}</span>
  );
}

// Standard task card
function TaskCard({ task, isOverdue, onToggle, zen }) {
  const [hovered, setHovered] = useState(false);
  const [popping, setPopping] = useState(false);
  const handleToggle = () => {
    setPopping(true);
    setTimeout(() => { onToggle(); setPopping(false); }, 280);
  };

  if (zen) {
    // Zen: ultra-minimal row, no shadow, just clean list
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 0',
          borderBottom: '1px solid #f3f4f6',
          background: 'transparent',
          transition: 'opacity .15s',
          opacity: task.done ? 0.45 : 1,
        }}
      >
        <button onClick={handleToggle} style={{
          border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, flexShrink: 0,
          color: task.done ? '#48bb78' : '#d1d5db',
          transform: popping ? 'scale(1.3)' : 'scale(1)',
          transition: 'all .2s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {task.done
            ? <CheckCircle2 style={{ width: 20, height: 20, strokeWidth: 2 }} />
            : <Circle style={{ width: 20, height: 20, strokeWidth: 1.7 }} />
          }
        </button>
        <span style={{
          flex: 1, fontSize: 15, fontWeight: 500, color: task.done ? '#9ca3af' : '#111827',
          textDecoration: task.done ? 'line-through' : 'none',
        }}>{task.title}</span>
        <TagChip tag={task.tag} />
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: task.done ? '#fafafa' : '#ffffff', borderRadius: 16, padding: '14px 16px',
        boxShadow: hovered && !task.done ? '0 4px 20px rgba(0,0,0,0.10)' : '0 1px 6px rgba(0,0,0,0.06)',
        border: isOverdue && !task.done ? '1.5px solid #fed7d7'
          : hovered && !task.done ? '1.5px solid #e0e7ff' : '1.5px solid transparent',
        transition: 'all .18s ease', transform: hovered && !task.done ? 'translateY(-1px)' : 'none',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <button onClick={handleToggle} style={{
          marginTop: 2, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, flexShrink: 0,
          color: task.done ? '#48bb78' : isOverdue ? '#fc8181' : '#d1d5db',
          transform: popping ? 'scale(1.3)' : 'scale(1)',
          transition: 'all .2s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {task.done
            ? <CheckCircle2 style={{ width: 22, height: 22, strokeWidth: 2 }} />
            : <Circle style={{ width: 22, height: 22, strokeWidth: 1.7 }} />
          }
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: '0 0 8px', fontSize: 15, fontWeight: 600, lineHeight: 1.4,
            color: task.done ? '#9ca3af' : '#111827',
            textDecoration: task.done ? 'line-through' : 'none',
          }}>{task.title}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
            <TagChip tag={task.tag} />
            <PriorityChip priority={task.priority} />
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '2px 8px', borderRadius: 99,
              background: '#f3f4f6', color: '#6b7280', fontSize: 11, fontWeight: 700,
            }}>
              {Math.round((task.durationH || 1) * 60)} minutes
            </span>
            {isOverdue && !task.done && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '2px 8px', borderRadius: 99,
                background: '#fff0f0', color: '#e53e3e', fontSize: 11, fontWeight: 700,
              }}>
                <Flame style={{ width: 10, height: 10 }} />overdue
              </span>
            )}
          </div>
        </div>
        {hovered && !task.done && (
          <ArrowRight style={{ width: 14, height: 14, color: '#d1d5db', marginTop: 4, flexShrink: 0 }} />
        )}
      </div>
    </div>
  );
}

// ── Calendar Timeline panel ───────────────────────────────────────────────────
const CAL_HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7am–6pm
const CELL_H = 64; // px per hour

function CalendarPanel({ tasks, activeFilter, onReschedule, onResize }) {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const [offset, setOffset] = useState(0);

  // Which date to show
  const base = activeFilter === 'Tomorrow' ? addDays(todayDate(), 1)
    : activeFilter === 'Overdue' ? addDays(todayDate(), -1)
    : todayDate();
  const displayDate = addDays(base, offset);

  // Filter tasks for display date
  const dayTasks = tasks.filter(t => {
    const d = new Date(t.due); d.setHours(0,0,0,0);
    return d.getTime() === displayDate.getTime() && !t.done;
  });

  const overlaps = (task) => dayTasks.some(other => {
    if (other.id === task.id) return false;
    const a = Number(task.startHour || 8);
    const b = a + Number(task.durationH || 1);
    const c = Number(other.startHour || 8);
    const d = c + Number(other.durationH || 1);
    return a < d && c < b;
  });

  const dropAtHour = (event, hour) => {
    event.preventDefault();
    const id = Number(event.dataTransfer.getData('text/plain'));
    if (!id || !onReschedule) return;
    onReschedule(id, Math.max(7, Math.min(18, hour)));
  };

  const dayName = displayDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dayNum  = displayDate.getDate();
  const isToday = displayDate.getTime() === todayDate().getTime();

  return (
    <div style={{
      flex: 1, minWidth: 0, background: '#ffffff',
      borderRadius: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: 0,
    }}>
      {/* Cal header */}
      <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Calendar</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setOffset(o => o - 1)} style={calNavBtn}>
              <ChevronLeft style={{ width: 14, height: 14 }} />
            </button>
            <button onClick={() => setOffset(0)} style={{ ...calNavBtn, fontSize: 10, padding: '4px 8px', fontWeight: 700 }}>
              Today
            </button>
            <button onClick={() => setOffset(o => o + 1)} style={calNavBtn}>
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '1px' }}>{dayName}</span>
          <span style={{
            fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: '-1px',
            color: isToday ? '#ed8936' : '#111827',
          }}>{dayNum}</span>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative', padding: '0 0 12px' }}>
        {CAL_HOURS.map(h => {
          const eventsAtHour = dayTasks.filter(t => Number(t.startHour || 0) >= h && Number(t.startHour || 0) < h + 1);
          return (
            <div key={h} style={{ display: 'flex', minHeight: CELL_H, position: 'relative' }}
              onDragOver={e => e.preventDefault()} onDrop={e => dropAtHour(e, h)}>
              {/* Hour label */}
              <div style={{
                width: 52, flexShrink: 0, paddingTop: 8, paddingLeft: 16,
                fontSize: 11, fontWeight: 500, color: '#9ca3af',
                userSelect: 'none',
              }}>
                {fmt12(h)}
              </div>
              {/* Grid line + events */}
              <div style={{ flex: 1, borderTop: '1px solid #f3f4f6', position: 'relative', marginRight: 12 }}>
                {eventsAtHour.map(t => {
                  const tagC = TAG_COLORS[t.tag] || { bg: '#e5e7eb', text: '#374151' };
                  const hasConflict = overlaps(t);
                  return (
                    <div key={t.id} style={{
                      position: 'absolute', top: 4 + ((Number(t.startHour || h) - h) * CELL_H), left: 4,
                      right: 4,
                      height: (t.durationH || 1) * CELL_H - 8,
                      background: tagC.bg, color: tagC.text,
                      borderRadius: 10, padding: '6px 10px',
                      fontSize: 11, fontWeight: 700, lineHeight: 1.3,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      overflow: 'hidden', cursor: 'grab', outline: hasConflict ? '2px solid #ef4444' : 'none',
                    }} draggable onDragStart={e => e.dataTransfer.setData('text/plain', String(t.id))}
                      title={hasConflict ? 'Conflict: overlaps another task' : 'Drag to move this task'}>
                      <div style={{ fontWeight: 700, marginBottom: 2 }}>{t.title}</div>
                      <div style={{ fontWeight: 500, opacity: 0.75 }}>
                        {fmt12(Math.floor(Number(t.startHour || h)))} – {fmt12(Math.floor(Number(t.startHour || h) + (t.durationH || 1)))}
                      </div>
                      {hasConflict && <div style={{ color: '#b91c1c', fontSize: 9, fontWeight: 800, marginTop: 2 }}>CONFLICT</div>}
                      <div onPointerDown={e => {
                        e.stopPropagation();
                        const startY = e.clientY;
                        const startDuration = Number(t.durationH || 1);
                        const move = ev => {
                          const next = Math.max(0.25, Math.min(6, Math.round((startDuration + (ev.clientY - startY) / CELL_H) * 4) / 4));
                          onResize?.(t.id, next);
                        };
                        const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
                        window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
                      }} style={{ position: 'absolute', bottom: 0, left: 10, right: 10, height: 6, cursor: 'ns-resize', borderTop: '2px solid rgba(255,255,255,.65)' }} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {dayTasks.length === 0 && (
          <div style={{ position: 'absolute', top: 120, left: 62, right: 18, padding: 12, border: '1px dashed #d1d5db', borderRadius: 10, color: '#9ca3af', fontSize: 11, textAlign: 'center' }}>
            No scheduled tasks — drop a task here to time-block it.
          </div>
        )}

        {/* Current time indicator */}
        {isToday && currentHour >= 7 && currentHour <= 19 && (
          <div style={{
            position: 'absolute',
            top: (currentHour - 7) * CELL_H,
            left: 52, right: 12,
            height: 2,
            background: '#ed8936',
            borderRadius: 2,
            zIndex: 10,
          }}>
            <div style={{
              position: 'absolute', left: -5, top: -4,
              width: 10, height: 10, borderRadius: '50%', background: '#ed8936',
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function TodoPage() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('lockin_todos');
      if (saved) return JSON.parse(saved).map(t => ({ ...t, due: new Date(t.due) }));
    } catch (_) {}
    return INITIAL_TASKS;
  });

  const [activeFilter, setActiveFilter] = useState('Today');
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('None');
  const [newDue, setNewDue] = useState('today');
  const [newTag, setNewTag] = useState('work');

  // View modes: 'list' | 'split' | 'zen'
  const [viewMode, setViewMode] = useState('list');

  const inputRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem('lockin_todos', JSON.stringify(tasks)); } catch (_) {}
  }, [tasks]);

  useEffect(() => {
    if (showForm && inputRef.current) inputRef.current.focus();
  }, [showForm]);

  const counts = useMemo(() => FILTERS.reduce((acc, f) => {
    acc[f] = tasks.filter(t => {
      const d = new Date(t.due); d.setHours(0,0,0,0);
      const t0 = todayDate(); const t1 = addDays(t0,1);
      if (f === 'Overdue')  return d < t0 && !t.done;
      if (f === 'Today')    return d.getTime() === t0.getTime() && !t.done;
      if (f === 'Tomorrow') return d.getTime() === t1.getTime() && !t.done;
      if (f === 'Upcoming') return d > t1 && !t.done;
      return false;
    }).length;
    return acc;
  }, {}), [tasks]);

  const filtered = useMemo(() => tasks.filter(t => {
    const d = new Date(t.due); d.setHours(0,0,0,0);
    const t0 = todayDate(); const t1 = addDays(t0,1);
    if (activeFilter === 'Overdue')  return d < t0 && !t.done;
    if (activeFilter === 'Today')    return d.getTime() === t0.getTime() && !t.done;
    if (activeFilter === 'Tomorrow') return d.getTime() === t1.getTime() && !t.done;
    if (activeFilter === 'Upcoming') return d > t1 && !t.done;
    return true;
  }), [tasks, activeFilter]);

  const allInFilter = tasks.filter(t => {
    const d = new Date(t.due); d.setHours(0,0,0,0);
    const t0 = todayDate(); const t1 = addDays(t0,1);
    if (activeFilter === 'Overdue')  return d < t0;
    if (activeFilter === 'Today')    return d.getTime() === t0.getTime();
    if (activeFilter === 'Tomorrow') return d.getTime() === t1.getTime();
    if (activeFilter === 'Upcoming') return d > t1;
    return false;
  });
  const doneInFilter = allInFilter.filter(t => t.done).length;
  const progressPct  = allInFilter.length > 0 ? Math.round((doneInFilter / allInFilter.length) * 100) : 0;
  const filterColor  = FILTER_COLOR[activeFilter];

  const toggleDone = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const rescheduleTask = (id, startHour) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, startHour } : t));
  };

  const resizeTask = (id, durationH) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, durationH } : t));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const dueDate = newDue === 'today' ? todayDate()
      : newDue === 'tomorrow' ? addDays(todayDate(), 1)
      : addDays(todayDate(), 6);
    setTasks(prev => [...prev, {
      id: nextId++, title: newTitle.trim(), due: dueDate,
      priority: newPriority, done: false, tag: newTag,
      startHour: 9, durationH: 1,
    }]);
    setNewTitle(''); setNewPriority('None'); setNewDue('today'); setNewTag('work');
    setShowForm(false);
  };

  const subtitles = {
    Overdue: "These tasks need your attention",
    Today:   "Fill in your work for today",
    Tomorrow:"Plan ahead for tomorrow",
    Upcoming:"Tasks on the horizon",
  };

  const isZen  = viewMode === 'zen';
  const isSplit = viewMode === 'split';

  // ── ZEN MODE full render ──────────────────────────────────────────────────
  if (isZen) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#fafafa',
        fontFamily: "'Inter','Segoe UI',sans-serif",
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: 60, paddingBottom: 100,
      }}>
        <style>{`
          @keyframes tdFadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
          .td-fadein { animation: tdFadeUp .2s ease; }
        `}</style>
        <div style={{ width: '100%', maxWidth: 520, padding: '0 24px' }}>
          {/* Zen header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>
                {activeFilter}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#9ca3af' }}>{subtitles[activeFilter]}</p>
            </div>
            {/* Exit zen */}
            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 99,
                border: '1.5px solid #e5e7eb', background: '#fff',
                color: '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Wind style={{ width: 13, height: 13 }} />
              Exit Zen
            </button>
          </div>

          {/* Minimal progress */}
          <div style={{ height: 3, borderRadius: 99, background: '#e5e7eb', overflow: 'hidden', marginBottom: 28 }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: filterColor.dot,
              width: `${progressPct}%`,
              transition: 'width .5s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>

          {/* Pure task list */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
              All done!
            </div>
          ) : (
            <div>
              {filtered.map(task => {
                const d = new Date(task.due); d.setHours(0,0,0,0);
                return (
                  <TaskCard key={task.id} task={task} isOverdue={d < todayDate()} onToggle={() => toggleDone(task.id)} zen />
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── LIST / SPLIT modes ────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #f8f9ff 0%, #f3f4f6 100%)',
      fontFamily: "'Inter','Segoe UI',sans-serif",
      paddingBottom: 100,
    }}>
      <style>{`
        @keyframes tdFadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .td-fadein { animation: tdFadeUp .2s ease; }
      `}</style>

      <div style={{
        maxWidth: isSplit ? 1100 : 580,
        margin: '0 auto',
        padding: '32px 20px 0',
        transition: 'max-width .3s ease',
      }}>
        {/* ── Toolbar row ───────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>
              Tasks
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>
              {subtitles[activeFilter]}
            </p>
          </div>

          {/* Right action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Zen button */}
            <button
              title="Zen Mode — distraction-free list"
              onClick={() => setViewMode('zen')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '8px 14px', borderRadius: 99,
                border: '1.5px solid #e5e7eb', background: '#fff',
                color: '#6b7280', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='#f0fdf4'; e.currentTarget.style.borderColor='#48bb78'; e.currentTarget.style.color='#276749'; }}
              onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.color='#6b7280'; }}
            >
              <Leaf style={{ width: 13, height: 13 }} />
              Zen
            </button>

            {/* View Mode button */}
            <button
              title={isSplit ? "Switch to list view" : "Show calendar alongside"}
              onClick={() => setViewMode(isSplit ? 'list' : 'split')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '8px 14px', borderRadius: 99,
                border: isSplit ? '1.5px solid #6366f1' : '1.5px solid #e5e7eb',
                background: isSplit ? '#eef2ff' : '#fff',
                color: isSplit ? '#3730a3' : '#6b7280',
                fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={e => { if (!isSplit) { e.currentTarget.style.background='#eef2ff'; e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.color='#3730a3'; }}}
              onMouseLeave={e => { if (!isSplit) { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.color='#6b7280'; }}}
            >
              <CalendarDays style={{ width: 13, height: 13 }} />
              {isSplit ? 'List only' : 'View + Calendar'}
            </button>

            {/* New task */}
            <button
              id="todo-new-task-btn"
              onClick={() => setShowForm(v => !v)}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 14px rgba(17,24,39,0.28)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 2px 8px rgba(17,24,39,0.18)'; }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 99,
                background: '#111827', border: 'none',
                color: '#fff', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', transition: 'all .15s',
                boxShadow: '0 2px 8px rgba(17,24,39,0.18)',
              }}
            >
              <Plus style={{ width: 15, height: 15, strokeWidth: 2.5 }} />
              New task
            </button>
          </div>
        </div>

        {/* ── Progress Bar ─────────────────────────────────────── */}
        <div style={{ marginBottom: 24, marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Progress</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: filterColor.text }}>
              {doneInFilter}/{allInFilter.length} done · {progressPct}%
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: '#e5e7eb', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: `linear-gradient(90deg, ${filterColor.dot}, ${filterColor.dot}cc)`,
              width: `${progressPct}%`,
              transition: 'width .5s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: progressPct > 0 ? `0 0 8px ${filterColor.dot}66` : 'none',
            }} />
          </div>
        </div>

        {/* ── Filter Pills ─────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
          {FILTERS.map(f => (
            <FilterPill key={f} label={f} count={counts[f]} active={f === activeFilter} onClick={() => setActiveFilter(f)} />
          ))}
        </div>

        {/* ── Split layout ──────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* Task column */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* New Task Form */}
            {showForm && (
              <form onSubmit={addTask} className="td-fadein" style={{
                background: '#ffffff', borderRadius: 18, padding: '16px 18px', marginBottom: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)', border: `1.5px solid ${filterColor.dot}44`,
              }}>
                <input
                  ref={inputRef} value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  style={{
                    width: '100%', border: 'none', outline: 'none',
                    fontSize: 15, fontWeight: 600, color: '#111827',
                    background: 'transparent', marginBottom: 12, boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
                  <select value={newDue} onChange={e => setNewDue(e.target.value)} style={selStyle}>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                  <select value={newPriority} onChange={e => setNewPriority(e.target.value)} style={selStyle}>
                    <option value="None">No priority</option>
                    <option value="High">🔴 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">🟢 Low</option>
                  </select>
                  <select value={newTag} onChange={e => setNewTag(e.target.value)} style={selStyle}>
                    <option value="work">work</option>
                    <option value="product">product</option>
                    <option value="admin">admin</option>
                    <option value="finance">finance</option>
                    <option value="daily inboxes">daily inboxes</option>
                  </select>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => setShowForm(false)} style={btnGhost}>Cancel</button>
                    <button type="submit" style={btnDark}>Add task</button>
                  </div>
                </div>
              </form>
            )}

            {/* Task Cards */}
            {filtered.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '64px 20px',
                background: '#fff', borderRadius: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: 42, marginBottom: 14 }}>{activeFilter === 'Overdue' ? '🎉' : '✅'}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                  {activeFilter === 'Overdue' ? 'No overdue tasks!' : `All clear for ${activeFilter.toLowerCase()}!`}
                </div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>
                  {activeFilter === 'Overdue' ? 'Great job staying on top of things.' : 'Add a task to get started.'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map(task => {
                  const d = new Date(task.due); d.setHours(0,0,0,0);
                  return (
                    <div key={task.id} className="td-fadein">
                      <TaskCard task={task} isOverdue={d < todayDate()} onToggle={() => toggleDone(task.id)} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Completed section */}
            {(() => {
              const done = allInFilter.filter(t => t.done);
              if (!done.length) return null;
              return (
                <div style={{ marginTop: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.5px' }}>COMPLETED · {done.length}</span>
                    <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {done.map(task => (
                      <TaskCard key={task.id} task={task} isOverdue={false} onToggle={() => toggleDone(task.id)} />
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Calendar column (split mode only) */}
          {isSplit && (
            <div style={{ width: 320, flexShrink: 0, position: 'sticky', top: 0, marginTop: -72, maxHeight: 'calc(100vh - 120px)' }} className="td-fadein">
              <CalendarPanel tasks={tasks} activeFilter={activeFilter} onReschedule={rescheduleTask} onResize={resizeTask} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── style constants ──────────────────────────────────────────────────────────
const selStyle = {
  fontSize: 12, fontWeight: 600, color: '#374151',
  background: '#f9fafb', border: '1px solid #e5e7eb',
  borderRadius: 8, padding: '5px 10px', outline: 'none', cursor: 'pointer',
};
const btnGhost = {
  fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8,
  background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', cursor: 'pointer',
};
const btnDark = {
  fontSize: 12, fontWeight: 700, padding: '6px 16px', borderRadius: 8,
  background: '#111827', color: '#ffffff', border: 'none',
  cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
};
const calNavBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28, borderRadius: 8,
  border: '1px solid #e5e7eb', background: '#fff',
  color: '#6b7280', cursor: 'pointer',
};
