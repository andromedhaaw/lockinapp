import { useState } from 'react';
import { ArrowRight, Check, Coins, Leaf, Share2, Sparkles, X } from 'lucide-react';

const FocusCompletionMoment = ({ type, session, taskName, onContinue, onNewSession, onShare, onClose }) => {
  const [review, setReview] = useState(session?.review || '');
  const warmup = type === 'warmup';
  const minutes = session?.durationMinutes || (warmup ? 2 : 25);
  const actualMinutes = session?.actualMinutes || minutes;
  const plannedMinutes = session?.plannedMinutes || minutes;
  const petName = localStorage.getItem('lockin_pet_type') === 'penguin' ? 'Pip' : 'Mochi';
  const growth = Math.max(1, Math.min(8, Math.round(actualMinutes / 8)));
  const recommendation = review === 'hard'
    ? `Try ${Math.max(10, plannedMinutes - 5)} minutes next time and make the first step smaller.`
    : review === 'smooth'
      ? `This duration worked well. Keep your next block around ${plannedMinutes} minutes.`
      : `Keep ${plannedMinutes} minutes, then review again after your next block.`;

  const saveReview = (value) => {
    setReview(value);
    try {
      const sessions = JSON.parse(localStorage.getItem('lockin_focus_sessions') || '[]');
      localStorage.setItem('lockin_focus_sessions', JSON.stringify(sessions.map((item) => item.id === session?.id ? { ...item, review: value } : item)));
      localStorage.setItem('lockin_last_session_review', JSON.stringify({ sessionId: session?.id, feeling: value, createdAt: new Date().toISOString() }));
      window.dispatchEvent(new Event('local-data-updated'));
    } catch {}
  };

  return <section className="li-completion w-full overflow-hidden rounded-2xl border border-[#cfe9d7] bg-white shadow-[0_18px_55px_rgba(42,92,57,.10)]">
    <div className="relative min-h-[620px] p-6 text-center sm:min-h-[660px] sm:p-8">
      <button type="button" onClick={onClose} aria-label="Close completion" className="absolute right-4 top-4 rounded-lg p-2 text-[#748078] transition-colors duration-200 hover:bg-[#faf9f6] hover:text-[#17211b]"><X className="h-4 w-4" /></button>
      <div className="li-completion-ring mx-auto"><svg viewBox="0 0 52 52" className="h-16 w-16 -rotate-90"><circle cx="26" cy="26" r="22" fill="none" stroke="#edf5ef" strokeWidth="4" /><circle className="li-completion-ring-path" cx="26" cy="26" r="22" fill="none" stroke="#4dcd7d" strokeWidth="4" strokeLinecap="round" pathLength="100" /></svg><span className="li-completion-check"><Check className="h-6 w-6" strokeWidth={3} /></span></div>
      <div className="li-completion-copy"><p className="mt-4 text-[10px] font-black uppercase tracking-[.18em] text-[#249653]">{warmup ? 'Momentum unlocked' : 'Block complete'}</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-.035em] text-[#17211b] sm:text-3xl">{warmup ? 'The hardest part is behind you.' : (taskName || session?.taskName || 'Focus session')}</h2></div>

      <div className="li-completion-results mx-auto mt-5 flex max-w-md items-center justify-center gap-6 border-y border-[#efede8] py-3"><div><p className="text-[9px] font-black uppercase tracking-[.12em] text-[#748078]">Actual</p><p className="mt-1 font-mono text-base font-bold text-[#17211b]">{actualMinutes}m</p></div><div className="h-8 w-px bg-[#e9e7e1]" /><div><p className="text-[9px] font-black uppercase tracking-[.12em] text-[#748078]">Planned</p><p className="mt-1 font-mono text-base font-bold text-[#17211b]">{plannedMinutes}m</p></div><div className="h-8 w-px bg-[#e9e7e1]" /><div><p className="text-[9px] font-black uppercase tracking-[.12em] text-[#748078]">Reward</p><p className="mt-1 flex items-center gap-1 font-mono text-base font-bold text-[#b68a3a]"><Coins className="h-3.5 w-3.5" />+{session?.earnedCoins || 0}</p></div></div>

      {!warmup && <div className="li-completion-world relative z-10 mx-auto mt-5 grid min-h-[86px] w-full max-w-md grid-cols-1 divide-y divide-[#dceadf] rounded-2xl border border-[#cfe9d7] bg-[#f4fbf6] px-4 py-3 text-left sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-2"><div className="flex min-w-0 items-center gap-3 px-2 py-2.5 sm:px-3"><Leaf className="h-5 w-5 shrink-0 text-[#249653]" /><div className="min-w-0"><p className="text-xs font-extrabold leading-5 text-[#17211b]">Garden grew +{growth}%</p><p className="text-[10px] font-medium leading-4 text-[#748078]">Real work, visible growth.</p></div></div><div className="flex min-w-0 items-center gap-3 px-2 py-2.5 sm:px-3"><Sparkles className="h-5 w-5 shrink-0 text-[#8b6cd9]" /><div className="min-w-0"><p className="text-xs font-extrabold leading-5 text-[#17211b]">{petName} looks proud.</p><p className="text-[10px] font-medium leading-4 text-[#748078]">Your companion noticed.</p></div></div></div>}

      {!warmup && <div className="li-completion-review mx-auto mt-4 max-w-md"><div className="flex items-center justify-center gap-2"><p className="text-[10px] font-bold text-[#748078]">How did this block feel?</p>{[['smooth','Smooth'],['okay','Okay'],['hard','Hard']].map(([value, label]) => <button key={value} type="button" onClick={() => saveReview(value)} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-colors duration-200 ${review === value ? 'bg-[#8b6cd9] text-white' : 'bg-[#f0efeb] text-[#748078] hover:text-[#17211b]'}`}>{label}</button>)}</div>{review && <p className="mt-2 text-[11px] font-medium text-[#748078]">{recommendation}</p>}</div>}

      <div className="li-completion-actions mt-6 flex flex-wrap justify-center gap-2"><button type="button" onClick={onContinue} className="inline-flex items-center gap-2 rounded-xl bg-[#4dcd7d] px-4 py-3 text-sm font-black text-[#17211b] transition-transform duration-200 active:scale-95">{warmup ? 'Continue 15 minutes' : 'Start next step'} <ArrowRight className="h-4 w-4" /></button><button type="button" onClick={onNewSession} className="rounded-xl border border-[#e9e7e1] bg-white px-4 py-3 text-sm font-bold text-[#17211b] transition-colors duration-200 hover:bg-[#faf9f6]">Done for now</button>{!warmup && <button type="button" onClick={onShare} className="rounded-xl p-3 text-[#748078] transition-colors duration-200 hover:bg-[#faf9f6] hover:text-[#17211b]" aria-label="Share progress"><Share2 className="h-4 w-4" /></button>}</div>
    </div>
  </section>;
};

export default FocusCompletionMoment;
