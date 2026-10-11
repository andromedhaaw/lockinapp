import { useEffect, useMemo, useState } from 'react';
import { Check, Coins, Heart, Play, ShoppingBag, Utensils } from 'lucide-react';
import { useGarden } from '../../context/GardenContext';
import './farm.css';

const ANIMALS = [
  { id: 'chicken', name: 'Chickie', kind: 'Chicken', emoji: '\u{1F414}', cost: 0, x: 18, y: 67, color: '#fff1a8' },
  { id: 'duck', name: 'Puddle', kind: 'Duck', emoji: '\u{1F986}', cost: 150, x: 38, y: 78, color: '#d9f1ff' },
  { id: 'goat', name: 'Milo', kind: 'Goat', emoji: '\u{1F410}', cost: 450, x: 67, y: 68, color: '#eee7ff' },
  { id: 'sheep', name: 'Cloud', kind: 'Sheep', emoji: '\u{1F411}', cost: 700, x: 81, y: 79, color: '#f6edff' },
  { id: 'pig', name: 'Peaches', kind: 'Pig', emoji: '\u{1F437}', cost: 1000, x: 51, y: 61, color: '#ffe0e8' },
  { id: 'cow', name: 'Moochi', kind: 'Cow', emoji: '\u{1F42E}', cost: 1500, x: 76, y: 47, color: '#e4f3e4' },
];

const readBlocks = () => { try { return JSON.parse(localStorage.getItem('lockin_focus_sessions') || '[]').length; } catch { return 0; } };
const readFarm = () => { try { return JSON.parse(localStorage.getItem('lockin_animal_farm') || '{}'); } catch { return {}; } };

const FarmPage = ({ onStartFocus }) => {
  const { coins, spendCoins } = useGarden();
  const [blocks, setBlocks] = useState(readBlocks);
  const [farm, setFarm] = useState(readFarm);
  const [selectedId, setSelectedId] = useState('chicken');
  const [celebrating, setCelebrating] = useState(null);
  const [owned, setOwned] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lockin_farm_owned') || '["chicken"]'); }
    catch { return ['chicken']; }
  });
  const selected = ANIMALS.find((animal) => animal.id === selectedId);
  const feedUsed = Object.values(farm).reduce((sum, item) => sum + (item.feeds || 0), 0);
  const food = Math.max(0, blocks * 3 - feedUsed);
  const unlocked = owned.length;

  useEffect(() => {
    const sync = () => setBlocks(readBlocks());
    window.addEventListener('local-data-updated', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('local-data-updated', sync); window.removeEventListener('storage', sync); };
  }, []);

  const stats = useMemo(() => {
    const feeds = farm[selectedId]?.feeds || 0;
    const level = Math.floor(feeds / 4) + 1;
    return { feeds, level, progress: (feeds % 4) * 25 };
  }, [farm, selectedId]);

  const feedAnimal = () => {
    if (!selected || !owned.includes(selected.id) || food < 1) return;
    const next = { ...farm, [selected.id]: { feeds: (farm[selected.id]?.feeds || 0) + 1 } };
    setFarm(next);
    localStorage.setItem('lockin_animal_farm', JSON.stringify(next));
    setCelebrating(selected.id);
    window.setTimeout(() => setCelebrating(null), 900);
  };

  const buyAnimal = (animal) => {
    if (owned.includes(animal.id) || !spendCoins(animal.cost)) return;
    const next = [...owned, animal.id];
    setOwned(next);
    setSelectedId(animal.id);
    localStorage.setItem('lockin_farm_owned', JSON.stringify(next));
    setCelebrating(animal.id);
    window.setTimeout(() => setCelebrating(null), 900);
  };

  return (
    <div className="min-h-full bg-[#fffaf2] p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-[#5c974c]">Focus farm</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Raise your little farm family.</h1><p className="mt-2 text-sm text-slate-500">Pomodoros earn food. Feed your animals and watch them grow.</p></div>
          <div className="flex gap-2"><div className="farm-pill"><Utensils className="h-4 w-4 text-orange-500" />{food} food</div><div className="farm-pill"><Coins className="h-4 w-4 text-amber-500" />{coins.toLocaleString()}</div></div>
        </header>

        <section className="farm-world">
          <div className="farm-sky"><span className="farm-cloud cloud-one" /><span className="farm-cloud cloud-two" /><span className="farm-sun" /></div>
          <div className="farm-hills" />
          <div className="farm-barn"><div className="barn-roof" /><div className="barn-window">+</div><div className="barn-door"><span /></div></div>
          <div className="farm-silo"><span /></div>
          <div className="farm-pond" />
          <div className="farm-fence fence-back" />
          {ANIMALS.filter((animal) => owned.includes(animal.id)).map((animal, index) => {
            const isUnlocked = true;
            const feeds = farm[animal.id]?.feeds || 0;
            const scale = 0.82 + Math.min(0.24, Math.floor(feeds / 4) * 0.06);
            return <button key={animal.id} type="button" onClick={() => isUnlocked && setSelectedId(animal.id)} className={`farm-animal ${selectedId === animal.id ? 'is-selected' : ''} ${celebrating === animal.id ? 'is-happy' : ''} ${!isUnlocked ? 'is-locked' : ''}`} style={{ left: `${animal.x}%`, top: `${animal.y}%`, '--animal-scale': scale, '--delay': `${index * -0.45}s` }}>
              <span className="animal-shadow" /><span className="animal-sprite">{animal.emoji}</span><span className="animal-name">{animal.name}</span>{celebrating === animal.id && <span className="animal-hearts">+1 ❤</span>}
            </button>;
          })}
          <div className="farm-fence fence-front" />
          <div className="farm-status"><span>Farm level {Math.floor(blocks / 5) + 1}</span><strong>{unlocked}/{ANIMALS.length} animals owned</strong></div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="rounded-[26px] border border-[#ece8df] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4"><div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] text-6xl ${celebrating === selectedId ? 'animate-bounce' : ''}`} style={{ background: selected.color }}>{selected.emoji}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="text-2xl font-black text-slate-900">{selected.name}</p><p className="text-sm font-semibold text-slate-400">{selected.kind} · Level {stats.level}</p></div><Heart className="h-6 w-6 fill-rose-400 text-rose-400" /></div><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#42bd6b] transition-all duration-500" style={{ width: `${stats.progress}%` }} /></div><p className="mt-2 text-[11px] font-bold text-slate-400">{4 - (stats.feeds % 4)} more feeds to grow</p></div></div>
          </div>
          <div className="flex flex-col justify-center gap-2 rounded-[26px] border border-[#ece8df] bg-white p-5 shadow-sm"><button type="button" onClick={feedAnimal} disabled={food < 1} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#42bd6b] px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200"><Utensils className="h-4 w-4" />Feed {selected.name}</button><button type="button" onClick={() => onStartFocus?.()} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-black text-white transition active:scale-95"><Play className="h-4 w-4 fill-current" />Earn food with focus</button></div>
        </section>

        <section className="rounded-[28px] border border-[#ece8df] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between"><div><div className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-[#42bd6b]" /><h2 className="text-xl font-black text-slate-900">Animal Shop</h2></div><p className="mt-1 text-xs font-semibold text-slate-400">Use coins earned from focus sessions to grow your farm family.</p></div><div className="farm-pill"><Coins className="h-4 w-4 text-amber-500" />{coins.toLocaleString()}</div></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{ANIMALS.map((animal) => { const isOwned = owned.includes(animal.id); const canAfford = coins >= animal.cost; return <article key={animal.id} className={`rounded-[22px] border p-3 text-center transition ${isOwned ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-100 bg-[#faf9f6]'}`}><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] text-5xl" style={{ background: animal.color }}>{animal.emoji}</div><p className="mt-3 text-sm font-black text-slate-800">{animal.name}</p><p className="text-[10px] font-semibold text-slate-400">{animal.kind}</p><button type="button" disabled={isOwned || !canAfford} onClick={() => buyAnimal(animal)} className={`mt-3 inline-flex w-full items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-black transition active:scale-95 ${isOwned ? 'bg-white text-emerald-600' : canAfford ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>{isOwned ? <><Check className="h-3.5 w-3.5" />Owned</> : <><Coins className="h-3.5 w-3.5" />{animal.cost}</>}</button></article>; })}</div>
        </section>
      </div>
    </div>
  );
};

export default FarmPage;
