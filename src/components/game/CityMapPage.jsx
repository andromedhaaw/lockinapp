import { useMemo, useState } from 'react';
import { ArrowLeft, Building2, Crown, Map, MessageCircle, Share2 } from 'lucide-react';

const TITLES = ['Art Collector', 'Farm Baron', 'Studio Owner', 'Venture Capitalist', 'Property Mogul', 'Deep Work Founder'];
const REACTIONS = ['Impressive', 'Cozy', 'Keep going', 'Dream setup'];
const PLACES = [
  { name: 'Office Tower', icon: '\u{1F3E2}', value: 240000, className: 'col-span-1 row-span-2 bg-[#dce8ed]' },
  { name: 'Grand Hotel', icon: '\u{1F3E8}', value: 120000, className: 'bg-[#f2ddd1]' },
  { name: 'Smart Factory', icon: '\u{1F3ED}', value: 140000, className: 'bg-[#dde2e2]' },
  { name: 'Championship Stadium', icon: '\u{1F3DF}\u{FE0F}', value: 300000, className: 'col-span-2 bg-[#deedcf]' },
  { name: 'Finance District', icon: '\u{1F3E6}', value: 650000, className: 'bg-[#e8e0c8]' },
  { name: 'Private Island', icon: '\u{1F3DD}\u{FE0F}', value: 410000, className: 'bg-[#d9eff3]' },
];

const readSessions = () => { try { return JSON.parse(localStorage.getItem('lockin_focus_sessions') || '[]'); } catch { return []; } };
const readReactions = () => { try { return JSON.parse(localStorage.getItem('lockin_world_reactions') || '{}'); } catch { return {}; } };

const CityMapPage = ({ onBack }) => {
  const sessions = useMemo(readSessions, []);
  const [title, setTitle] = useState(() => localStorage.getItem('lockin_ownership_title') || TITLES[5]);
  const [visit, setVisit] = useState('City');
  const [reactions, setReactions] = useState(readReactions);
  const cityValue = PLACES.reduce((sum, place) => sum + place.value, 0);
  const dates = new Set(sessions.map((session) => (session.completedAt || session.startTime || '').slice(0, 10)).filter(Boolean));
  let streak = 0;
  for (let day = 0; day < 365; day += 1) { const date = new Date(); date.setDate(date.getDate() - day); if (!dates.has(date.toISOString().slice(0, 10))) break; streak += 1; }
  const flexText = `${streak || 1}-day focus streak · My city reached $${(cityValue / 1000000).toFixed(2)}M · ${sessions.length} focus blocks`;

  const chooseTitle = (next) => { setTitle(next); localStorage.setItem('lockin_ownership_title', next); window.dispatchEvent(new Event('local-data-updated')); };
  const react = (reaction) => { const key = `${visit}-${reaction}`; const next = { ...reactions, [key]: (reactions[key] || 0) + 1 }; setReactions(next); localStorage.setItem('lockin_world_reactions', JSON.stringify(next)); };
  const share = async () => { try { if (navigator.share) await navigator.share({ title: `${title} · Lock In Work`, text: flexText }); else await navigator.clipboard.writeText(flexText); } catch {} };

  return <div className="min-h-full bg-[#f4f2ec] p-4 sm:p-8"><div className="mx-auto max-w-6xl space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-600 shadow-sm"><ArrowLeft className="h-4 w-4" />Back to game</button><p className="text-xs font-black uppercase tracking-[.18em] text-[#80672f]">Your business world</p><h1 className="mt-1 text-4xl font-black tracking-tight text-slate-950">City Map</h1><p className="mt-2 text-sm text-slate-500">Every asset has a place. Every focus block builds the world.</p></div><div className="rounded-2xl bg-slate-950 px-5 py-3 text-white"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">City value</p><p className="font-mono text-xl font-black">${(cityValue / 1000000).toFixed(2)}M</p></div></header>

    <section className="overflow-hidden rounded-[34px] border-[8px] border-white bg-[#bee1f2] shadow-[0_24px_70px_rgba(57,73,55,.15)]"><div className="relative min-h-[540px] p-5 sm:p-8"><div className="absolute inset-x-0 bottom-0 h-[72%] bg-[#9dcc74]" /><div className="absolute inset-y-[28%] left-[46%] w-16 bg-[#d8d5ca]" /><div className="absolute inset-x-0 top-[55%] h-16 bg-[#d8d5ca]" /><div className="absolute inset-y-[28%] left-[calc(46%+29px)] w-1 bg-white/80" /><div className="absolute inset-x-0 top-[calc(55%+29px)] h-1 bg-white/80" /><div className="relative grid min-h-[470px] grid-cols-2 grid-rows-3 gap-5 sm:grid-cols-3">{PLACES.map((place) => <article key={place.name} className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-[28px] border-4 border-white/80 p-4 text-center shadow-lg transition hover:-translate-y-1 ${place.className}`}><span className="text-6xl drop-shadow-md transition group-hover:scale-110 sm:text-7xl">{place.icon}</span><p className="mt-3 text-sm font-black text-slate-800">{place.name}</p><p className="font-mono text-[10px] font-bold text-slate-500">${place.value.toLocaleString()}</p></article>)}</div></div></section>

    <div className="grid gap-5 lg:grid-cols-2"><section className="rounded-[28px] bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Crown className="h-5 w-5 text-amber-500" /><h2 className="font-black text-slate-900">Ownership identity</h2></div><p className="mt-1 text-xs text-slate-400">Your active title appears in Focus Room and Social Profile.</p><div className="mt-4 flex flex-wrap gap-2">{TITLES.map((item) => <button type="button" key={item} onClick={() => chooseTitle(item)} className={`rounded-full px-3 py-2 text-xs font-black ${title === item ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-500'}`}>{item}</button>)}</div><div className="mt-5 rounded-2xl bg-[#f6f2e8] p-4"><p className="text-[9px] font-black uppercase tracking-widest text-[#91773c]">Equipped title</p><p className="mt-1 text-xl font-black text-slate-900">{title}</p></div></section>
      <section className="rounded-[28px] bg-slate-950 p-5 text-white shadow-sm"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Share2 className="h-5 w-5 text-[#4dcd7d]" /><h2 className="font-black">Shareable flex card</h2></div><span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Lock In Work</span></div><p className="mt-8 text-2xl font-black leading-tight">{flexText}</p><p className="mt-3 text-xs text-slate-400">{title} · built through real focused work</p><button type="button" onClick={share} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#4dcd7d] px-4 py-3 text-xs font-black text-slate-950"><Share2 className="h-4 w-4" />Share my city</button></section>
    </div>

    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-[#249653]" /><h2 className="font-black text-slate-900">Visit & react</h2></div><p className="mt-1 text-xs text-slate-400">Visit a friend's world and leave one encouraging signal.</p></div><div className="flex rounded-xl bg-slate-100 p-1">{['Room', 'Farm', 'City'].map((place) => <button type="button" key={place} onClick={() => setVisit(place)} className={`rounded-lg px-4 py-2 text-xs font-black ${visit === place ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>{place}</button>)}</div></div><div className="mt-5 rounded-2xl bg-[#f6f8f6] p-5"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dff3e5]"><Map className="h-6 w-6 text-[#249653]" /></span><div><p className="text-sm font-black text-slate-900">Maya's {visit}</p><p className="text-xs text-slate-400">Visiting now · {title}</p></div></div><div className="mt-4 flex flex-wrap gap-2">{REACTIONS.map((reaction) => <button type="button" key={reaction} onClick={() => react(reaction)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:border-[#4dcd7d] hover:text-[#249653]">{reaction} <span className="ml-1 text-slate-400">{reactions[`${visit}-${reaction}`] || 0}</span></button>)}</div></div></section>
  </div></div>;
};

export default CityMapPage;
