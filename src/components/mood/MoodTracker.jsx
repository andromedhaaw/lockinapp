import { useMemo, useState } from 'react';
import { Heart, Send } from 'lucide-react';

const moods = [
  { value: 1, label: 'Very unpleasant', emoji: '😣', color: '#9bdbea', bg: '#eefbfe' },
  { value: 2, label: 'Unpleasant', emoji: '😕', color: '#b9e6ef', bg: '#f2fbfd' },
  { value: 3, label: 'Neutral', emoji: '😐', color: '#8bd9e9', bg: '#effbfe' },
  { value: 4, label: 'Pleasant', emoji: '🙂', color: '#f7d66c', bg: '#fff9e8' },
  { value: 5, label: 'Very pleasant', emoji: '😄', color: '#f6c94f', bg: '#fff8dc' },
];

const MoodTracker = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [value, setValue] = useState(() => Number(localStorage.getItem(`lockin_mood_${today}`) || 4));
  const [note, setNote] = useState(() => localStorage.getItem(`lockin_mood_note_${today}`) || '');
  const [saved, setSaved] = useState(() => Boolean(localStorage.getItem(`lockin_mood_note_${today}`)));
  const mood = useMemo(() => moods[value - 1], [value]);
  const save = (next) => { setValue(next); localStorage.setItem(`lockin_mood_${today}`, String(next)); };
  const saveNote = () => { localStorage.setItem(`lockin_mood_note_${today}`, note.trim()); setSaved(true); };

  return <div className="min-h-[calc(100vh-2rem)] p-4 sm:p-8" style={{ background: mood.bg }}>
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500"><Heart className="h-4 w-4 text-rose-400" /> Mood check-in</div>
      <h1 className="mt-10 max-w-lg font-serif text-4xl font-medium leading-tight tracking-tight text-slate-900 sm:text-5xl">How have you felt overall today?</h1>
      <div className="mt-12 flex h-36 w-36 items-center justify-center rounded-full text-7xl shadow-[0_12px_35px_rgba(0,0,0,.08)] transition-all duration-500" style={{ background: `${mood.color}99` }}>{mood.emoji}</div>
      <h2 className="mt-10 font-serif text-3xl text-slate-900">{mood.label}</h2>
      <div className="mt-8 w-full max-w-md"><input aria-label="Mood" type="range" min="1" max="5" step="1" value={value} onChange={(event) => save(Number(event.target.value))} className="mood-range w-full" style={{ '--mood-color': mood.color }} /><div className="mt-3 flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400"><span>Very unpleasant</span><span>Very pleasant</span></div></div>
      <div className="mt-10 w-full max-w-md rounded-3xl border border-white/80 bg-white/80 p-5 text-left shadow-sm backdrop-blur-sm">
        <label htmlFor="mood-note" className="text-sm font-black text-slate-800">What do you feel today?</label>
        <textarea id="mood-note" value={note} onChange={(event) => { setNote(event.target.value); setSaved(false); }} placeholder="A few words about today..." rows="3" className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" />
        <button type="button" onClick={saveNote} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-600 active:scale-[.98]"><Send className="h-4 w-4" />{saved ? 'Saved for today' : 'Save reflection'}</button>
      </div>
    </div>
    <style>{`.mood-range{appearance:none;height:12px;border-radius:999px;background:linear-gradient(90deg,#b9e6ef 0%,var(--mood-color) 100%);outline:none}.mood-range::-webkit-slider-thumb{appearance:none;width:58px;height:42px;border-radius:999px;background:#fff;box-shadow:0 5px 18px rgba(0,0,0,.14);cursor:pointer}.mood-range::-moz-range-thumb{width:58px;height:42px;border:0;border-radius:999px;background:#fff;box-shadow:0 5px 18px rgba(0,0,0,.14);cursor:pointer}`}</style>
  </div>;
};

export default MoodTracker;
