import React, { useState, useEffect, useRef } from 'react';
import {
  Clock, Plus, Trash2, CalendarDays, Flag, AlertTriangle,
  ChevronDown, X, Timer, Milestone, Target, Check,
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────
const STORAGE_KEY_DEADLINES = 'lockin_deadlines';
const STORAGE_KEY_DDAYS     = 'lockin_ddays';

// Palette options for D-Day cards (Merah, Kuning, Hijau, Pink, Oren, Biru)
const DDAY_COLORS = {
  green: {
    id: 'green',
    label: 'Hijau',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    border: '#bbf7d0',
    hoverBorder: '#86efac',
    textColor: '#ffffff',
  },
  blue: {
    id: 'blue',
    label: 'Biru',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    border: '#bfdbfe',
    hoverBorder: '#93c5fd',
    textColor: '#ffffff',
  },
  red: {
    id: 'red',
    label: 'Merah',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    border: '#fecaca',
    hoverBorder: '#fca5a5',
    textColor: '#ffffff',
  },
  yellow: {
    id: 'yellow',
    label: 'Kuning',
    gradient: 'linear-gradient(135deg, #eab308 0%, #a16207 100%)',
    border: '#fef08a',
    hoverBorder: '#fde047',
    textColor: '#ffffff',
  },
  pink: {
    id: 'pink',
    label: 'Pink',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    border: '#fbcfe8',
    hoverBorder: '#f472b6',
    textColor: '#ffffff',
  },
  orange: {
    id: 'orange',
    label: 'Oren',
    gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    border: '#fed7aa',
    hoverBorder: '#fdba74',
    textColor: '#ffffff',
  },
};

const MS = {
  minute: 60_000,
  hour:   3_600_000,
  day:    86_400_000,
};

function msUntil(dateStr) {
  return new Date(dateStr).getTime() - Date.now();
}

function formatCountdown(ms) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, overdue: true };
  const totalSec = Math.floor(ms / 1000);
  const days     = Math.floor(totalSec / 86400);
  const hours    = Math.floor((totalSec % 86400) / 3600);
  const minutes  = Math.floor((totalSec % 3600) / 60);
  const seconds  = totalSec % 60;
  return { days, hours, minutes, seconds, overdue: false };
}

function urgencyLevel(ms) {
  if (ms <= 0)          return { label: 'Overdue',   color: '#ef4444', bg: '#fef2f2', border: '#fecaca' };
  if (ms < MS.day)      return { label: 'Due today', color: '#f97316', bg: '#fff7ed', border: '#fed7aa' };
  if (ms < MS.day * 3)  return { label: 'Very soon', color: '#eab308', bg: '#fefce8', border: '#fef08a' };
  if (ms < MS.day * 7)  return { label: 'This week', color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' };
  return { label: 'Upcoming',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
}

const PRIORITY_CONFIG = {
  High:   { color: '#ef4444', bg: '#fef2f2', label: '🔴 High' },
  Medium: { color: '#f97316', bg: '#fff7ed', label: '🟠 Medium' },
  Low:    { color: '#16a34a', bg: '#f0fdf4', label: '🟢 Low' },
};

// ─── Countdown Clock component ─────────────────────────────────────────────
function CountdownClock({ targetDate }) {
  const [cd, setCd] = useState(() => formatCountdown(msUntil(targetDate)));

  useEffect(() => {
    const id = setInterval(() => setCd(formatCountdown(msUntil(targetDate))), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (cd.overdue) {
    return (
      <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
        <AlertTriangle style={{ width: 13, height: 13 }} /> Overdue
      </span>
    );
  }

  const parts = [];
  if (cd.days > 0)    parts.push(<span key="d"><b>{cd.days}</b><small>d</small></span>);
  if (cd.hours > 0)   parts.push(<span key="h"><b>{cd.hours}</b><small>h</small></span>);
  if (cd.minutes > 0) parts.push(<span key="m"><b>{cd.minutes}</b><small>m</small></span>);
  if (cd.days === 0)  parts.push(<span key="s"><b>{cd.seconds}</b><small>s</small></span>);

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, fontFamily: 'monospace', fontSize: 13, color: '#374151' }}>
      {parts}
    </div>
  );
}

// ─── D-Day counter component ───────────────────────────────────────────────
function DDayClock({ targetDate }) {
  const ms  = msUntil(targetDate);
  const total = Math.abs(Math.ceil(ms / MS.day));
  const over  = ms < 0;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: 44, fontWeight: 900, letterSpacing: -1.5,
        color: '#ffffff',
        lineHeight: 1,
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}>
        {over ? '+' : ''}{total}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {over ? 'hari lewat' : 'hari lagi'}
      </div>
    </div>
  );
}

// ─── Deadline Card ─────────────────────────────────────────────────────────
function DeadlineCard({ item, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const ms  = msUntil(item.deadline);
  const urg = urgencyLevel(ms);
  const pri = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.Medium;

  const deadlineFmt = new Date(item.deadline).toLocaleDateString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: 16, padding: '16px 18px',
        border: `1.5px solid ${hovered ? urg.border : '#e5e7eb'}`,
        boxShadow: hovered ? `0 6px 24px rgba(0,0,0,0.09)` : '0 1px 6px rgba(0,0,0,0.05)',
        transition: 'all .18s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
              background: urg.bg, color: urg.color, border: `1px solid ${urg.border}`,
            }}>
              {urg.label}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
              background: pri.bg, color: pri.color,
            }}>
              {pri.label}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
            {item.title}
          </p>
          {item.notes && (
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>
              {item.notes}
            </p>
          )}
        </div>
        <button
          onClick={() => onDelete(item.id)}
          style={{
            border: 'none', background: 'transparent', cursor: 'pointer', padding: 4,
            color: '#d1d5db', borderRadius: 8,
            transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#d1d5db'; e.currentTarget.style.background = 'transparent'; }}
        >
          <Trash2 style={{ width: 15, height: 15 }} />
        </button>
      </div>

      {/* Countdown + Date */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderRadius: 12,
        background: urg.bg, border: `1px solid ${urg.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
          <CalendarDays style={{ width: 13, height: 13 }} />
          {deadlineFmt}
        </div>
        <CountdownClock targetDate={item.deadline} />
      </div>
    </div>
  );
}

// ─── D-Day Event Card ───────────────────────────────────────────────────────
function DDayCard({ item, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const ms   = msUntil(item.targetDate);
  const over = ms < 0;

  const colorConfig = DDAY_COLORS[item.color] || DDAY_COLORS.green;

  const dateFmt = new Date(item.targetDate).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: 20, overflow: 'hidden',
        border: `1.5px solid ${hovered ? colorConfig.hoverBorder : '#e5e7eb'}`,
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.08)' : '0 1px 6px rgba(0,0,0,0.04)',
        transition: 'all .18s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Gradient header using selected card color */}
      <div style={{
        background: colorConfig.gradient,
        padding: '20px 22px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <span style={{
            fontSize: 10, fontWeight: 800, color: '#fff', background: 'rgba(0,0,0,0.18)',
            padding: '2px 8px', borderRadius: 99, letterSpacing: '0.5px', textTransform: 'uppercase',
            display: 'inline-block', marginBottom: 5,
          }}>
            {over ? 'D + Day (Lewat)' : 'D - Day'}
          </span>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.25 }}>
            {item.title}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <DDayClock targetDate={item.targetDate} />
          <button
            onClick={() => onDelete(item.id)}
            style={{
              border: 'none', background: 'rgba(255,255,255,0.22)', cursor: 'pointer', padding: 6,
              borderRadius: 8, color: '#fff', display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.38)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
            title="Hapus event"
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      {/* Date footer */}
      <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
        <CalendarDays style={{ width: 13, height: 13, color: '#16a34a' }} />
        {dateFmt}
        {item.notes && (
          <span style={{ marginLeft: 8, color: '#9ca3af' }}>· {item.notes}</span>
        )}
      </div>
    </div>
  );
}

// ─── Add Deadline Form ──────────────────────────────────────────────────────
function AddDeadlineForm({ onAdd, onClose }) {
  const [title,    setTitle]    = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [notes,    setNotes]    = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;
    onAdd({ id: Date.now(), title: title.trim(), deadline, priority, notes: notes.trim(), createdAt: new Date().toISOString() });
    onClose();
  };

  const fieldStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit',
    outline: 'none', transition: 'border .15s',
    background: '#f9fafb', color: '#111827', boxSizing: 'border-box',
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: '#fff', borderRadius: 18, padding: '20px 22px',
      border: '1.5px solid #bbf7d0', boxShadow: '0 4px 24px rgba(34,197,94,0.12)',
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>
          Add Deadline Task
        </p>
        <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af', fontSize: 16, padding: 0 }}>
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input ref={inputRef} type="text" placeholder="Task name..." value={title} onChange={e => setTitle(e.target.value)} style={fieldStyle}
          onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4, display: 'block' }}>Deadline</label>
            <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} style={fieldStyle}
              onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} required />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4, display: 'block' }}>Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} style={fieldStyle}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>
        <input type="text" placeholder="Notes (optional)..." value={notes} onChange={e => setNotes(e.target.value)} style={fieldStyle}
          onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
          <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#6b7280' }}>
            Cancel
          </button>
          <button type="submit" style={{ padding: '9px 22px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 10px rgba(34,197,94,0.3)' }}>
            Add Task
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Add D-Day Form ──────────────────────────────────────────────────────────
function AddDDayForm({ onAdd, onClose }) {
  const [title,  setTitle]  = useState('');
  const [date,   setDate]   = useState('');
  const [color,  setColor]  = useState('green'); // default color
  const [notes,  setNotes]  = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onAdd({
      id: Date.now(),
      title: title.trim(),
      targetDate: date,
      color,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  const fieldStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit',
    outline: 'none', transition: 'border .15s',
    background: '#f9fafb', color: '#111827', boxSizing: 'border-box',
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: '#fff', borderRadius: 18, padding: '20px 22px',
      border: '1.5px solid #bbf7d0', boxShadow: '0 4px 24px rgba(34,197,94,0.12)',
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Add D-Day Event</p>
        <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input ref={inputRef} type="text" placeholder="Event name (e.g. Tes JLPT N1)..." value={title} onChange={e => setTitle(e.target.value)} style={fieldStyle}
          onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} required />
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4, display: 'block' }}>Tanggal Event</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={fieldStyle}
            onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} required />
        </div>

        {/* Color Picker: Merah, Kuning, Hijau, Pink, Oren, Biru */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 6, display: 'block' }}>
            Pilih Warna Card
          </label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {Object.entries(DDAY_COLORS).map(([cKey, cCfg]) => {
              const isSelected = color === cKey;
              return (
                <button
                  key={cKey}
                  type="button"
                  onClick={() => setColor(cKey)}
                  title={cCfg.label}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: cCfg.gradient,
                    border: isSelected ? '2.5px solid #111827' : '2px solid transparent',
                    boxShadow: isSelected ? '0 0 0 2px #fff, 0 4px 10px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.12)',
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  {isSelected && <Check style={{ width: 14, height: 14, strokeWidth: 3 }} />}
                </button>
              );
            })}
          </div>
        </div>

        <input type="text" placeholder="Catatan (opsional)..." value={notes} onChange={e => setNotes(e.target.value)} style={fieldStyle}
          onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
          <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#6b7280' }}>
            Cancel
          </button>
          <button type="submit" style={{ padding: '9px 22px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 10px rgba(34,197,94,0.3)' }}>
            Save Event
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function DeadlinePage({ tasks = [] }) {
  const [mode, setMode] = useState('deadline'); // 'deadline' | 'dday'

  // Deadline tasks
  const [deadlines, setDeadlines] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEADLINES);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // D-Day events
  const [ddays, setDdays] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DDAYS);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [showDeadlineForm, setShowDeadlineForm] = useState(false);
  const [showDDayForm,     setShowDDayForm]     = useState(false);

  // Persist
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_DEADLINES, JSON.stringify(deadlines)); } catch {}
  }, [deadlines]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_DDAYS, JSON.stringify(ddays)); } catch {}
  }, [ddays]);

  const addDeadline = (item) => setDeadlines(prev => [...prev, item]);
  const delDeadline = (id)   => setDeadlines(prev => prev.filter(d => d.id !== id));
  const addDDay     = (item) => setDdays(prev => [...prev, item]);
  const delDDay     = (id)   => setDdays(prev => prev.filter(d => d.id !== id));

  // Sort deadlines soonest first
  const sortedDeadlines = [...deadlines].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const sortedDDays     = [...ddays].sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      fontFamily: "'Inter','Segoe UI',sans-serif",
      paddingBottom: 100,
    }}>
      <style>{`
        @keyframes dlFadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .dl-card { animation: dlFadeUp .22s ease; }
      `}</style>

      <div style={{ maxWidth: 660, margin: '0 auto', padding: '32px 20px 0' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
              {mode === 'deadline' ? 'Deadline' : 'D-Day'}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>
              {mode === 'deadline'
                ? 'Pantau deadline tugas & berapa sisa waktunya'
                : 'Countdown menuju event penting kamu'}
            </p>
          </div>

          {/* + Add button */}
          <button
            onClick={() => mode === 'deadline' ? setShowDeadlineForm(v => !v) : setShowDDayForm(v => !v)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(34,197,94,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(34,197,94,0.25)'; }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', borderRadius: 99,
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all .15s',
              boxShadow: '0 2px 10px rgba(34,197,94,0.25)',
            }}
          >
            <Plus style={{ width: 15, height: 15, strokeWidth: 2.5 }} />
            {mode === 'deadline' ? 'Add deadline' : 'Add event'}
          </button>
        </div>

        {/* ── Toggle buttons ──────────────────────────────────────── */}
        <div style={{
          display: 'inline-flex', background: '#fff', borderRadius: 12,
          border: '1.5px solid #e5e7eb', padding: 4, gap: 4, marginBottom: 24,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {[
            { key: 'deadline', icon: Flag,      label: 'Deadline' },
            { key: 'dday',     icon: Milestone, label: 'D-Day'    },
          ].map(({ key, icon: Icon, label }) => {
            const active = mode === key;
            return (
              <button
                key={key}
                onClick={() => setMode(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 18px', borderRadius: 9, border: 'none',
                  background: active ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'transparent',
                  color: active ? '#fff' : '#6b7280',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  transition: 'all .18s ease',
                  boxShadow: active ? '0 2px 10px rgba(34,197,94,0.25)' : 'none',
                }}
              >
                <Icon style={{ width: 14, height: 14 }} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Forms ───────────────────────────────────────────────── */}
        {showDeadlineForm && mode === 'deadline' && (
          <div className="dl-card">
            <AddDeadlineForm onAdd={addDeadline} onClose={() => setShowDeadlineForm(false)} />
          </div>
        )}
        {showDDayForm && mode === 'dday' && (
          <div className="dl-card">
            <AddDDayForm onAdd={addDDay} onClose={() => setShowDDayForm(false)} />
          </div>
        )}

        {/* ── Deadline List ────────────────────────────────────────── */}
        {mode === 'deadline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sortedDeadlines.length === 0 ? (
              <EmptyState
                icon={<Flag style={{ width: 32, height: 32, color: '#d1d5db' }} />}
                title="Belum ada deadline"
                desc="Tambahkan deadline task kamu agar tidak ketinggalan!"
              />
            ) : sortedDeadlines.map(item => (
              <div key={item.id} className="dl-card">
                <DeadlineCard item={item} onDelete={delDeadline} />
              </div>
            ))}
          </div>
        )}

        {/* ── D-Day List ──────────────────────────────────────────── */}
        {mode === 'dday' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sortedDDays.length === 0 ? (
              <EmptyState
                icon={<Milestone style={{ width: 32, height: 32, color: '#d1d5db' }} />}
                title="Belum ada event"
                desc='Contoh: Tes JLPT N1 pada 7 Juli 2027 → "kurang 60 hari lagi"'
              />
            ) : sortedDDays.map(item => (
              <div key={item.id} className="dl-card">
                <DDayCard item={item} onDelete={delDDay} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────
function EmptyState({ icon, title, desc }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 20px',
      background: '#fff', borderRadius: 20,
      border: '1.5px dashed #e5e7eb',
    }}>
      <div style={{ marginBottom: 12 }}>{icon}</div>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#374151' }}>{title}</p>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#9ca3af', maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>{desc}</p>
    </div>
  );
}
