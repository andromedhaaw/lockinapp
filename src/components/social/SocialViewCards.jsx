import { Check, Radio, Sparkles, Trophy, Users } from 'lucide-react';

const views = [
  { id: 'leaderboard', title: 'Leaderboard', copy: 'See who showed up', icon: Trophy, surface: 'bg-[#fff4c7]', iconStyle: 'bg-[#f4c950] text-[#5f4b00]', border: 'border-[#ead16c]' },
  { id: 'activity', title: 'Live Feed', copy: '18 focusing right now', icon: Radio, surface: 'bg-[#e8f7ec]', iconStyle: 'bg-[#77d497] text-[#174b29]', border: 'border-[#9eddb3]' },
  { id: 'pods', title: 'My Pod', copy: '5 friends this week', icon: Users, surface: 'bg-[#eee9ff]', iconStyle: 'bg-[#a996ed] text-[#2e2266]', border: 'border-[#bdb0ef]' },
];

const SocialViewCards = ({ value, onChange }) => <div className="mx-auto max-w-4xl">
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{views.map((view, index) => {
    const Icon = view.icon;
    const active = value === view.id;
    return <button key={view.id} type="button" onClick={() => onChange(view.id)} className={`group relative overflow-hidden rounded-[22px] border p-4 text-left shadow-[0_5px_0_rgba(30,41,59,.07)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_9px_0_rgba(30,41,59,.08)] active:translate-y-0 active:shadow-[0_3px_0_rgba(30,41,59,.08)] ${view.surface} ${active ? `${view.border} ring-2 ring-white ring-offset-2` : 'border-white/80'}`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${view.iconStyle}`}><Icon className="h-5 w-5" /></span>
      <div className="mt-5 flex items-end justify-between gap-3"><div><p className="text-sm font-black text-slate-900">{view.title}</p><p className="mt-0.5 text-[11px] font-semibold text-slate-500">{view.copy}</p></div>{active ? <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-white"><Check className="h-3.5 w-3.5 stroke-[3]" /></span> : <span className="font-mono text-[10px] font-black text-slate-400">0{index + 1}</span>}</div>
      <span className="absolute -right-3 -top-3 h-12 w-12 rounded-full border-8 border-white/35 transition-transform duration-200 group-hover:scale-110" />
    </button>;
  })}</div>
  <button type="button" onClick={() => onChange('growth')} className={`mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition-colors ${value === 'growth' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:bg-white hover:text-slate-700'}`}><Sparkles className="h-4 w-4" />Growth & focus rooms</button>
</div>;

export default SocialViewCards;
