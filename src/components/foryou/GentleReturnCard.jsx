import { Heart, Play, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';

const GentleReturnCard = ({ status, onRestart }) => {
  const [visible, setVisible] = useState(true);
  if (!visible || (!status.returning && !status.freezeApplied)) return null;

  return <section className="relative overflow-hidden rounded-[26px] border border-[#ddd5fa] bg-[#f7f4ff] p-5 shadow-[0_8px_28px_rgba(96,77,176,.08)] sm:p-6">
    <button type="button" onClick={() => setVisible(false)} aria-label="Dismiss" className="absolute right-4 top-4 rounded-lg p-1.5 text-[#8d82b5] transition hover:bg-white/70"><X className="h-4 w-4" /></button>
    <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#d9cffb] text-[#604db0]"><Heart className="h-5 w-5 fill-current" /></span><div className="pr-6"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#765cc8]">Welcome back</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">Nothing you built was lost.</h2><p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{status.returning ? `You were away for ${status.daysAway} days. Your garden, rewards, and ${status.activeDays} active days are still here.` : 'Yesterday was covered by a streak freeze. Your rhythm is protected.'}</p></div></div>
    <div className="mt-5 flex flex-wrap items-center gap-2"><button type="button" onClick={onRestart} className="inline-flex items-center gap-2 rounded-xl bg-[#604db0] px-4 py-3 text-xs font-black text-white shadow-[0_4px_0_#c9bdf1] transition active:translate-y-0.5 active:shadow-none"><Play className="h-3.5 w-3.5 fill-current" />Let’s restart with two minutes</button>{status.freezeApplied && <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/70 px-3 py-2.5 text-[10px] font-black text-[#604db0]"><ShieldCheck className="h-4 w-4" />Streak freeze used</span>}<span className="text-[10px] font-bold text-[#8d82b5]">Best streak {status.bestStreak}d · lifetime progress safe</span></div>
  </section>;
};

export default GentleReturnCard;
