import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Clock3, Leaf, Play, Sparkles, Timer, Trophy } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfcfb] text-slate-900 selection:bg-[#4dcd7d]/25">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-[#fbfcfb]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-lg font-black tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#4dcd7d] text-white shadow-[3px_3px_0_#193c28]"><Sparkles className="h-4 w-4" /></span>
            Lock In Work
          </button>
          <div className="flex items-center gap-3 sm:gap-7">
            <button onClick={() => navigate('/pricing')} className="hidden text-sm font-semibold text-slate-500 hover:text-slate-900 sm:block">Pricing</button>
            <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-500 hover:text-slate-900">Login</button>
            <button onClick={() => navigate('/signup')} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5">Start free</button>
          </div>
        </div>
      </nav>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:pb-28 lg:pt-40">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4dcd7d]/30 bg-[#4dcd7d]/10 px-3 py-1.5 text-xs font-bold text-[#218e4c]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#4dcd7d]" /> Make deep work feel good</div>
            <h1 className="max-w-xl text-5xl font-black leading-[0.98] tracking-[-0.06em] text-slate-950 sm:text-7xl">Do your best work.<br /><span className="text-[#4dcd7d]">Enjoy getting there.</span></h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-slate-500 sm:text-xl">Lock In Work turns your next 4–8 hours into clear, satisfying deep work. Start a session, build momentum, and watch real progress take shape.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate('/signup')} className="flex items-center justify-center gap-2 rounded-2xl bg-[#4dcd7d] px-6 py-4 text-base font-black text-slate-950 shadow-[5px_5px_0_#193c28] transition hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none">Get more done today <ArrowRight className="h-5 w-5" /></button>
              <button onClick={() => navigate('/app')} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-bold text-slate-700 shadow-sm hover:border-[#4dcd7d]">See how it works</button>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-400"><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#4dcd7d]" /> Deep work sessions</span><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#4dcd7d]" /> Focus analytics</span><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#4dcd7d]" /> Progress you can feel</span></div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#4dcd7d]/20 blur-3xl" />
            <div className="relative rotate-1 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[14px_14px_0_#dcefe3] sm:p-6">
              <div className="mb-4 flex items-center justify-between"><div><div className="text-xs font-bold text-[#249653]">FOR YOU</div><div className="mt-1 text-2xl font-black">Good morning</div></div><div className="rounded-full bg-[#4dcd7d]/10 px-3 py-1 text-xs font-bold text-[#249653]">3 sessions today</div></div>
              <div className="rounded-2xl border border-slate-100 bg-[#f8fbf9] p-4"><div className="text-xs font-bold text-slate-400">WHAT ARE YOU STARTING?</div><div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-400">Write a task...</div><div className="mt-3 grid grid-cols-3 gap-2">{[2,10,25].map((m) => <div key={m} className="rounded-xl bg-[#4dcd7d] py-2.5 text-center text-xs font-black text-slate-950">Start {m}m</div>)}</div></div>
              <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-950 p-4 text-white"><div className="flex items-center gap-2 text-xs text-slate-400"><Timer className="h-3.5 w-3.5" /> Focus now</div><div className="mt-2 text-3xl font-black">24:18</div><div className="mt-1 text-xs text-[#4dcd7d]">Deep work · Work</div></div><div className="rounded-2xl bg-[#eaf8ee] p-4"><div className="flex items-center gap-2 text-xs font-bold text-[#249653]"><Leaf className="h-3.5 w-3.5" /> Garden reward</div><div className="mt-3 text-4xl">🌱 🌿</div><div className="mt-2 text-xs font-semibold text-slate-500">Your focus is growing.</div></div></div>
            </div>
            <div className="absolute -bottom-8 -left-8 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:block"><div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Clock3 className="h-4 w-4 text-[#4dcd7d]" /> I showed up today.</div><div className="mt-2 text-sm font-black">25 min locked in</div></div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-20"><div className="mx-auto max-w-6xl px-5 sm:px-8"><div className="max-w-xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#249653]">A better way to work</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Clarity in.<br />Great work out.</h2><p className="mt-5 text-lg leading-relaxed text-slate-500">Turn an open-ended day into a sequence of satisfying wins. Lock In Work keeps the next step obvious, makes focus rewarding, and shows you exactly where your hours went.</p></div><div className="mt-12 grid gap-4 md:grid-cols-3"><Feature icon={<Play />} number="01" title="Start without friction" text="Choose 2, 10, or 25 minutes and begin before the day gets noisy." /><Feature icon={<Leaf />} number="02" title="Make progress tangible" text="Every finished session grows your garden and gives your effort a visible reward." /><Feature icon={<Trophy />} number="03" title="Know what works" text="Use tags, trends, streaks, and session analytics to improve your best working hours." /></div></div></section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8"><div className="grid items-center gap-12 lg:grid-cols-2"><div className="order-2 grid grid-cols-2 gap-3 lg:order-1"><MiniCard image="/images/timer.png" title="Focus timer" /><MiniCard image="/images/graph.png" title="Your progress" /><MiniCard image="/images/history.png" title="Session history" /><MiniCard image="/images/leaderboard.png" title="Friendly accountability" /></div><div className="order-1 lg:order-2"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#249653]">Beautiful by default</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">A workspace you’ll want to return to.</h2><p className="mt-5 text-lg leading-relaxed text-slate-500">Quiet surfaces, clear choices, and playful rewards. No shame loops. No cluttered command center. Just enough structure to help you take the next step.</p><button onClick={() => navigate('/signup')} className="mt-7 flex items-center gap-2 font-black text-[#249653] hover:gap-3">Build your focus garden <ArrowRight className="h-4 w-4" /></button></div></div></section>

        <section className="bg-slate-950 px-5 py-20 text-center text-white sm:px-8"><div className="mx-auto max-w-2xl"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4dcd7d] text-slate-950"><Sparkles className="h-6 w-6" /></div><h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">Your next great workday starts here.</h2><p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-slate-400">Stop collecting plans. Start collecting finished work, growing plants, and hours you’re proud of.</p><button onClick={() => navigate('/signup')} className="mt-8 rounded-2xl bg-[#4dcd7d] px-7 py-4 font-black text-slate-950 shadow-[5px_5px_0_#d8f5e3] transition hover:-translate-y-1">Start your deep work habit <ArrowRight className="ml-2 inline h-4 w-4" /></button></div></section>
      </main>

      <footer className="border-t border-slate-200 bg-[#fbfcfb] px-5 py-8 sm:px-8"><div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span className="font-bold text-slate-600">Lock In Work</span><span>Focus gently. Grow steadily.</span><button onClick={() => navigate('/login')} className="text-left hover:text-slate-900 sm:text-right">Login</button></div></footer>
    </div>
  );
};

const Feature = ({ icon, number, title, text }) => <div className="rounded-3xl border border-slate-200 bg-[#fbfcfb] p-6 transition hover:-translate-y-1 hover:shadow-lg"><div className="flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4dcd7d]/15 text-[#249653]">{icon}</div><span className="text-xs font-black text-slate-300">{number}</span></div><h3 className="mt-8 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p></div>;

const MiniCard = ({ title }) => {
  const variants = {
    'Focus timer': { eyebrow: 'FOCUS NOW', title: '24:18', detail: 'Deep work · Work', accent: 'bg-slate-950 text-white', icon: '◷' },
    'Your progress': { eyebrow: 'TODAY’S PROGRESS', title: '3 sessions', detail: 'Small starts count.', accent: 'bg-white', icon: '↗' },
    'Session history': { eyebrow: 'GARDEN REWARD', title: '🌱  🌿  🪴', detail: 'Your focus is growing.', accent: 'bg-[#eaf8ee]', icon: '✦' },
    'Friendly accountability': { eyebrow: 'LOCK IN WORK', title: 'I showed up today.', detail: '25 min locked in', accent: 'bg-[#f8fbf9]', icon: '♡' },
  };
  const card = variants[title] || variants['Focus timer'];
  return <div className={`flex min-h-40 flex-col justify-between rounded-2xl border border-slate-200 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${card.accent}`}>
    <div className="flex items-center justify-between text-[10px] font-black tracking-[0.14em] opacity-65"><span>{card.eyebrow}</span><span className="text-base tracking-normal">{card.icon}</span></div>
    <div><div className="text-2xl font-black tracking-tight">{card.title}</div><div className="mt-1 text-xs font-semibold opacity-65">{card.detail}</div></div>
  </div>;
};

export default LandingPage;
