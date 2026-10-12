import { useEffect, useState } from 'react';
import { Check, Clock3, DoorOpen, Flame, Radio, Send, Users } from 'lucide-react';

const seedEvents = [
  { type: 'start', user: 'Marc Lou', initials: 'ML', action: 'started a deep-work block', detail: 'Build launch page · 2h planned', time: '2m', color: '#ffe28a' },
  { type: 'milestone', user: 'Pieter Levels', initials: 'PL', action: 'crossed 4 focused hours', detail: 'Daily target reached · 4 of 4 blocks', time: '5m', color: '#aee4bf' },
  { type: 'complete', user: 'Builder Bob', initials: 'BB', action: 'finished a 90 minute session', detail: 'Product strategy · block complete', time: '12m', color: '#c8bcf2' },
  { type: 'streak', user: 'Sarah Ships', initials: 'SS', action: 'kept a 14-day streak alive', detail: 'One focused block every day', time: '18m', color: '#ffbdad' },
];

const RivalActivityFeed = ({ userEvents = [] }) => {
  const [events, setEvents] = useState(seedEvents.slice(0, 3).map((event, index) => ({ ...event, id: index + 1 })));
  const [reactions, setReactions] = useState(new Set());

  useEffect(() => {
    const interval = window.setInterval(() => {
      const event = seedEvents[Math.floor(Math.random() * seedEvents.length)];
      setEvents((current) => [{ ...event, id: Date.now(), time: 'now' }, ...current.slice(0, 4)]);
    }, 8000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!userEvents.length) return;
    const event = userEvents[userEvents.length - 1];
    setEvents((current) => [{ ...seedEvents[2], ...event, id: Date.now(), time: 'now' }, ...current.slice(0, 4)]);
  }, [userEvents]);

  const react = (id) => setReactions((current) => new Set([...current, id]));

  return <section className="mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-[#e7e3da] bg-[#fffdf9] shadow-[0_14px_45px_rgba(45,55,48,.07)]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ebe7df] px-5 py-5 sm:px-6"><div><div className="flex items-center gap-2"><span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4dcd7d] opacity-40" /><span className="relative m-0.5 inline-flex h-2 w-2 rounded-full bg-[#35b865]" /></span><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#249653]">Happening now</p></div><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Your people are showing up.</h2></div><div className="flex -space-x-2">{seedEvents.slice(0, 4).map((person) => <span key={person.initials} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#fffdf9] text-[9px] font-black text-slate-700" style={{ background: person.color }}>{person.initials}</span>)}</div></header>

    <div className="grid md:grid-cols-[1fr_230px]">
      <div className="relative px-5 py-2 sm:px-6"><span className="absolute bottom-8 left-[42px] top-8 w-px bg-[#e5e1d8] sm:left-[46px]" />{events.map((event, index) => {
        const sent = reactions.has(event.id);
        return <article key={event.id} className={`relative flex gap-4 py-4 ${index > 0 ? 'border-t border-[#efebe4]' : ''} ${index === 0 ? 'animate-in fade-in slide-in-from-top-1 duration-200' : ''}`}><div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-4 border-[#fffdf9] text-[10px] font-black text-slate-700 shadow-sm" style={{ background: event.color }}>{event.initials}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="text-sm leading-relaxed text-slate-600"><span className="font-black text-slate-950">{event.user}</span> {event.action}</p><span className="shrink-0 font-mono text-[10px] font-bold text-slate-400">{event.time}</span></div><div className="mt-2 flex flex-wrap items-center justify-between gap-2"><span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-500 shadow-[inset_0_0_0_1px_#ebe7df]"><Clock3 className="h-3 w-3" />{event.detail}</span><button type="button" disabled={sent} onClick={() => react(event.id)} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-black transition-all duration-200 ${sent ? 'bg-[#e7f7ec] text-[#249653]' : 'bg-slate-950 text-white hover:-translate-y-0.5 hover:bg-[#304d36] active:scale-95'}`}>{sent ? <Check className="h-3 w-3 stroke-[3]" /> : <Send className="h-3 w-3" />}{sent ? 'Sent' : 'Keep going'}</button></div></div></article>;
      })}</div>

      <aside className="border-t border-[#e7e3da] bg-[#eef8f1] p-5 md:border-l md:border-t-0"><div className="flex h-full min-h-52 flex-col"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#75d295] text-[#174b29]"><Radio className="h-5 w-5" /></span><p className="mt-5 text-[10px] font-black uppercase tracking-[.16em] text-[#3f7550]">Open focus room</p><h3 className="mt-1 text-xl font-black leading-tight text-[#183522]">18 people are locking in.</h3><div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#50765c]"><Users className="h-4 w-4" />Quiet company, zero chat pressure.</div><div className="mt-auto pt-6"><div className="mb-3 flex items-center gap-2 text-[10px] font-bold text-[#50765c]"><Flame className="h-3.5 w-3.5 text-orange-500" />Most active room · 42m</div><button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#183522] px-4 py-3 text-xs font-black text-white shadow-[0_4px_0_#9bcbaa] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"><DoorOpen className="h-4 w-4" />Join focus room</button></div></div></aside>
    </div>
  </section>;
};

export default RivalActivityFeed;
